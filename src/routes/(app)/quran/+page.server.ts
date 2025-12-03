/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { quranProgress, hafalanProgress, user } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

	// Fetch current day's progress
	const progress = await db.query.quranProgress.findFirst({
		where: and(
			eq(quranProgress.userId, locals.user.id),
			eq(quranProgress.date, dateStr)
		)
	});

	const hafalan = await db.query.hafalanProgress.findFirst({
		where: and(
			eq(hafalanProgress.userId, locals.user.id),
			eq(hafalanProgress.date, dateStr)
		)
	});

	// Combine progress
	const combinedProgress = {
		...progress,
		hafalanSurah: hafalan?.surahName,
		hafalanAyahStart: hafalan?.ayahStart,
		hafalanAyahEnd: hafalan?.ayahEnd,
		hafalanProgress: hafalan?.progress
	};

	// Fetch user settings for target
	const userData = await db.query.user.findFirst({
		where: eq(user.id, locals.user.id),
		columns: {
			settings: true
		}
	});

	const quranTarget = (userData?.settings as any)?.quranTarget || 10;

	// Calculate Stats
	const allProgress = await db.query.quranProgress.findMany({
		where: eq(quranProgress.userId, locals.user.id)
	});

	const allHafalan = await db.query.hafalanProgress.findMany({
		where: eq(hafalanProgress.userId, locals.user.id)
	});

	const totalPages = allProgress.reduce((sum, p) => sum + (p.pagesRead || 0), 0);
	const totalKhatam = allProgress.reduce((sum, p) => sum + (p.khatamCount || 0), 0);
	
	const ayahsMemorized = allHafalan.reduce((sum, p) => {
		const count = Array.isArray(p.progress) ? p.progress.length : 0;
		return sum + count;
	}, 0);

	// Calculate Streak
	// Sort by date desc
	const sortedProgress = allProgress
		.filter(p => (p.pagesRead || 0) > 0) // Only count days with reading
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	let currentStreak = 0;
	if (sortedProgress.length > 0) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const lastLogDate = new Date(sortedProgress[0].date);
		lastLogDate.setHours(0, 0, 0, 0);

		// If last log was today or yesterday, streak is alive
		const diffDays = (today.getTime() - lastLogDate.getTime()) / (1000 * 3600 * 24);
		
		if (diffDays <= 1) {
			currentStreak = 1;
			let currentDateToCheck = lastLogDate;

			for (let i = 1; i < sortedProgress.length; i++) {
				const prevDate = new Date(sortedProgress[i].date);
				prevDate.setHours(0, 0, 0, 0);
				
				const gap = (currentDateToCheck.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
				
				if (gap === 1) {
					currentStreak++;
					currentDateToCheck = prevDate;
				} else if (gap === 0) {
					// Same day, continue
					continue;
				} else {
					// Break in streak
					break;
				}
			}
		}
	}

	return {
		quranProgress: combinedProgress,
		date: dateStr,
		stats: {
			totalPages,
			totalKhatam,
			ayahsMemorized,
			currentStreak
		},
		userSettings: {
			quranTarget
		}
	};
};

export const actions: Actions = {
	update: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = locals.user.id;

		const formData = await request.formData();
		const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
		
		const tilawahProgress = formData.get('tilawahProgress');
		const hafalanSurah = formData.get('hafalanSurah');
		const hafalanAyahStart = formData.get('hafalanAyahStart');
		const hafalanAyahEnd = formData.get('hafalanAyahEnd');
		const hafalanProgressStr = formData.get('hafalanProgress');
		

		try {
			await db.transaction(async (tx) => {
				// 1. Update Quran Progress (Tilawah)
				if (tilawahProgress !== null) {
					const existingQuran = await tx.query.quranProgress.findFirst({
						where: and(
							eq(quranProgress.userId, userId),
							eq(quranProgress.date, dateStr)
						)
					});

					const quranData: any = {
						userId: userId,
						date: dateStr,
						pagesRead: parseInt(tilawahProgress.toString())
					};

					if (existingQuran) {
						await tx.update(quranProgress)
							.set(quranData)
							.where(eq(quranProgress.id, existingQuran.id));
					} else {
						await tx.insert(quranProgress).values({
							id: crypto.randomUUID(),
							...quranData
						});
					}
				}

				// 2. Update Hafalan Progress
				if (hafalanSurah !== null || hafalanAyahStart !== null || hafalanAyahEnd !== null || hafalanProgressStr !== null) {
					const existingHafalan = await tx.query.hafalanProgress.findFirst({
						where: and(
							eq(hafalanProgress.userId, userId),
							eq(hafalanProgress.date, dateStr)
						)
					});

					const hafalanData: any = {
						userId: userId,
						date: dateStr,
					};

					if (hafalanSurah !== null) hafalanData.surahName = hafalanSurah.toString();
					if (hafalanAyahStart !== null) hafalanData.ayahStart = parseInt(hafalanAyahStart.toString());
					if (hafalanAyahEnd !== null) hafalanData.ayahEnd = parseInt(hafalanAyahEnd.toString());
					if (hafalanProgressStr !== null) hafalanData.progress = JSON.parse(hafalanProgressStr.toString());

					if (existingHafalan) {
						await tx.update(hafalanProgress)
							.set(hafalanData)
							.where(eq(hafalanProgress.id, existingHafalan.id));
					} else {
						// Ensure required fields are present for insert if not provided in update
						// (Frontend should send all fields ideally, or we default)
						// For now assuming frontend sends current state which includes all
						await tx.insert(hafalanProgress).values({
							id: crypto.randomUUID(),
							surahName: 'Al-Fatihah', // Default if missing
							ayahStart: 1,
							ayahEnd: 7,
							...hafalanData
						});
					}
				}
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to update progress' });
		}
	},

	updateTarget: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const target = parseInt(formData.get('target')?.toString() || '10');

		try {
			const userData = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id),
				columns: { settings: true }
			});

			const currentSettings = userData?.settings || {};
			
			await db.update(user)
				.set({
					settings: {
						...currentSettings,
						quranTarget: target
					}
				})
				.where(eq(user.id, locals.user.id));

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to update target' });
		}
	}
};

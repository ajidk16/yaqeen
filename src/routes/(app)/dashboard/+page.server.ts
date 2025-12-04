import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { prayerLogs, habits, habitLogs, quranProgress } from '$lib/server/db/schema';
import { eq, and, desc} from 'drizzle-orm';
import { lucia } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;
	const todayStr = new Date().toISOString().split('T')[0];

	// Fetch data in parallel
	const [
		todaysPrayerLogs,
		activeHabits,
		todaysHabitLogs,
		todaysQuranProgress,
		recentPrayers,
		recentHabits,
		recentQuran,
		allPrayerDates
	] = await Promise.all([
		// 1. Ibadah Progress
		db.query.prayerLogs.findMany({
			where: and(eq(prayerLogs.userId, userId), eq(prayerLogs.date, todayStr))
		}),
		// 2. Habits Progress (Active habits)
		db.query.habits.findMany({
			where: and(eq(habits.userId, userId), eq(habits.archived, false))
		}),
		// 3. Habits Logs
		db.query.habitLogs.findMany({
			where: and(eq(habitLogs.userId, userId), eq(habitLogs.date, todayStr))
		}),
		// 4. Quran Progress
		db.query.quranProgress.findFirst({
			where: and(eq(quranProgress.userId, userId), eq(quranProgress.date, todayStr))
		}),
		// 5. Recent Activity - Prayers
		db.query.prayerLogs.findMany({
			where: eq(prayerLogs.userId, userId),
			orderBy: [desc(prayerLogs.createdAt)],
			limit: 5
		}),
		// 6. Recent Activity - Habits
		db.query.habitLogs.findMany({
			with: { habit: true },
			where: eq(habitLogs.userId, userId),
			orderBy: [desc(habitLogs.createdAt)],
			limit: 5
		}),
		// 7. Recent Activity - Quran
		db.query.quranProgress.findMany({
			where: eq(quranProgress.userId, userId),
			orderBy: [desc(quranProgress.createdAt)],
			limit: 5
		}),
		// 8. Streak Data
		db.selectDistinct({ date: prayerLogs.date })
			.from(prayerLogs)
			.where(eq(prayerLogs.userId, userId))
			.orderBy(desc(prayerLogs.date))
	]);

	// --- Calculate Stats ---

	// Ibadah (Fardhu)
	const completedPrayers = todaysPrayerLogs.filter(p => p.status === 'jamaah' || p.status === 'munfarid').length;
	const ibadahProgress = Math.round((completedPrayers / 5) * 100);

	// Habits
	const totalHabits = activeHabits.length;
	const completedHabits = todaysHabitLogs.filter(l => l.status === 'completed').length;
	const habitsProgress = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

	// Quran
	const pagesRead = todaysQuranProgress?.pagesRead || 0;
	const quranTarget = locals.user.settings.quranTarget;
	const quranProgressVal = Math.min(Math.round((pagesRead / quranTarget) * 100), 100);

	// --- Process Recent Activity ---
	
	const activities = [
		...recentPrayers.map(p => ({
			id: p.id,
			type: 'prayer',
			title: `Completed ${p.prayerName}`,
			time: p.createdAt,
			originalTime: p.createdAt
		})),
		...recentHabits.map(h => ({
			id: h.id,
			type: 'habit',
			title: h.habit.title,
			time: h.createdAt,
			originalTime: h.createdAt
		})),
		...recentQuran.map(q => ({
			id: q.id,
			type: 'quran',
			title: `Read ${q.pagesRead} Pages`,
			time: q.createdAt,
			originalTime: q.createdAt
		}))
	];

	// Sort by time descending and take top 5
	const sortedActivity = activities
		.sort((a, b) => {
			const dateA = new Date(a.originalTime || 0).getTime();
			const dateB = new Date(b.originalTime || 0).getTime();
			return dateB - dateA;
		})
		.slice(0, 5)
		.map(a => ({
			...a,
			time: new Date(a.originalTime || 0).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true })
		}));
	
	// --- Calculate Streak ---
	let streakCount = 0;
	if (allPrayerDates.length > 0) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		let expectedDate = new Date(today);
		let hasLogToday = false;

		// Check if the most recent log is today
		const latestLogDate = new Date(allPrayerDates[0].date);
		latestLogDate.setHours(0, 0, 0, 0);

		if (latestLogDate.getTime() === today.getTime()) {
			hasLogToday = true;
		} else {
			// Check if it was yesterday
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			if (latestLogDate.getTime() === yesterday.getTime()) {
				expectedDate = yesterday;
			}
		}

		console.log('Has log today:', hasLogToday);	

		if (expectedDate) {
			for (const logDateObj of allPrayerDates) {
				const logDate = new Date(logDateObj.date);
				logDate.setHours(0, 0, 0, 0);

				if (logDate.getTime() === expectedDate.getTime()) {
					streakCount++;
					expectedDate.setDate(expectedDate.getDate() - 1);
				} else if (logDate.getTime() < expectedDate.getTime()) {
					break;
				}
			}
		}
	}

	return {
		user: {
			name: locals.user.name,
			streak: streakCount,
			progress: {
				ibadah: ibadahProgress,
				habits: habitsProgress,
				quran: quranProgressVal
			},
			recentActivity: sortedActivity
		}
	};
};


export const actions ={
	logout:async ({ locals, cookies }) => {
		if (locals.session) {
			await lucia.invalidateSession(locals.session.id);
		}

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: "/",
			...sessionCookie.attributes
		});

		redirect(302, "/");
	}
}
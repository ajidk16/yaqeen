import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { almatsuratLogs } from '$lib/server/db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
// Import JSON directly
import rawAlmatsuratData from '$lib/utils/almatsurat-sugro.json';
import type { DzikrItem } from '$lib/data/almatsurat';

// Helper functions for parsing
function parseRepetition(name: string, note?: string): number {
	const nameMatch = name.match(/\((\d+)x\)/i);
	if (nameMatch) return parseInt(nameMatch[1], 10);
	if (note) {
		const noteMatch = note.match(/Dibaca\s+(\d+)\s+Kali/i);
		if (noteMatch) return parseInt(noteMatch[1], 10);
	}
	return 1;
}

function cleanName(name: string): string {
	return name.replace(/\s*-\s*\(\d+x\)/i, '').trim();
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;
	const dateParam = url.searchParams.get('date');
	const today = dateParam || new Date().toISOString().split('T')[0];

	// Transform JSON data to DzikrItem[]
	const almatsuratData: DzikrItem[] = rawAlmatsuratData.map((item, index) => {
		const firstNote = item.dzikr_list[0]?.note || '';
		return {
			index,
			name: cleanName(item.dzikr_name),
			verses: item.dzikr_list.map((v) => ({
				note: v.note || '',
				arabic: v.text || '',
				translation: v.trans || ''
			})),
			repetition: parseRepetition(item.dzikr_name, firstNote)
		};
	});

	const totalRepetitions = almatsuratData.reduce((sum, item) => sum + item.repetition, 0);

	// Get today's session
	const currentSession = await db
		.select()
		.from(almatsuratLogs)
		.where(and(eq(almatsuratLogs.userId, userId), eq(almatsuratLogs.date, today)))
		.limit(1);

	// Get stats
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

	// Total completed sessions
	const totalSessions = await db
		.select({ count: sql<number>`count(*)` })
		.from(almatsuratLogs)
		.where(and(eq(almatsuratLogs.userId, userId), eq(almatsuratLogs.status, 'completed')));

	// This month sessions
	const thisMonthSessions = await db
		.select({ count: sql<number>`count(*)` })
		.from(almatsuratLogs)
		.where(
			and(
				eq(almatsuratLogs.userId, userId),
				eq(almatsuratLogs.status, 'completed'),
				gte(almatsuratLogs.date, startOfMonth)
			)
		);

	// Calculate streak (consecutive days with completed sessions)
	const recentSessions = await db
		.select({ date: almatsuratLogs.date })
		.from(almatsuratLogs)
		.where(and(eq(almatsuratLogs.userId, userId), eq(almatsuratLogs.status, 'completed')))
		.orderBy(desc(almatsuratLogs.date))
		.limit(30);

	let streak = 0;
	const todayDate = new Date();
	todayDate.setHours(0, 0, 0, 0);

	for (let i = 0; i < 30; i++) {
		const checkDate = new Date(todayDate);
		checkDate.setDate(checkDate.getDate() - i);
		const dateStr = checkDate.toISOString().split('T')[0];

		if (recentSessions.some((s) => s.date === dateStr)) {
			streak++;
		} else if (i > 0) {
			// Allow today to be incomplete
			break;
		}
	}

	return {
		session: currentSession[0] || null,
		almatsuratData,
		totalRepetitions,
		stats: {
			streak,
			totalSessions: Number(totalSessions[0]?.count || 0),
			thisMonth: Number(thisMonthSessions[0]?.count || 0)
		}
	};
};

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = locals.user.id;
		const dateParam = url.searchParams.get('date');
		const today = dateParam || new Date().toISOString().split('T')[0];

		const formData = await request.formData();
		const sessionType = formData.get('sessionType') as 'morning' | 'evening';
		const completedItems = JSON.parse(formData.get('completedItems') as string);
		const status = formData.get('status') as 'in_progress' | 'completed';

		try {
			// Check if session exists
			const existing = await db
				.select()
				.from(almatsuratLogs)
				.where(and(eq(almatsuratLogs.userId, userId), eq(almatsuratLogs.date, today)))
				.limit(1);

			if (existing.length > 0) {
				// Update existing
				await db
					.update(almatsuratLogs)
					.set({
						sessionType,
						completedItems,
						status,
						completedAt: status === 'completed' ? new Date() : null
					})
					.where(eq(almatsuratLogs.id, existing[0].id));
			} else {
				// Create new
				await db.insert(almatsuratLogs).values({
					id: nanoid(),
					userId,
					date: today,
					sessionType,
					completedItems,
					status,
					startedAt: new Date(),
					completedAt: status === 'completed' ? new Date() : null
				});
			}

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to save progress' });
		}
	},

	reset: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = locals.user.id;
		const dateParam = url.searchParams.get('date');
		const today = dateParam || new Date().toISOString().split('T')[0];

		try {
			await db
				.delete(almatsuratLogs)
				.where(and(eq(almatsuratLogs.userId, userId), eq(almatsuratLogs.date, today)));

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to reset session' });
		}
	}
};

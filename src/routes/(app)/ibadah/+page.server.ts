import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { prayerLogs, habits, habitLogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { formatDateShort } from '$lib/utils/format';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const dateStr = url.searchParams.get('date') || formatDateShort(new Date());

	// Fetch prayer logs for the selected date
	const logs = await db.query.prayerLogs.findMany({
		where: and(
			eq(prayerLogs.userId, locals.user.id),
			eq(prayerLogs.date, dateStr)
		)
	});

	// Fetch Sunnah Prayers (Habits of type 'ibadah')
	const ibadahHabits = await db.query.habits.findMany({
		where: and(
			eq(habits.userId, locals.user.id),
		)
	});

	// Fetch logs for these habits on the selected date
	const ibadahLogs = await db.query.habitLogs.findMany({
		with: {
			habit: true
		},
		where: and(
			eq(habitLogs.userId, locals.user.id),
			eq(habitLogs.date, dateStr)
		)
	});

	// Combine habits with their status
	const sunnahPrayers = ibadahHabits.map(habit => {
		const log = ibadahLogs.find(l => l.habitId === habit.id);
		return {
			...habit,
			completed: log?.status,
			logId: log?.id
		};
	});

	return {
		prayerLogs: logs,
		sunnahPrayers,
		date: dateStr
	};
};

export const actions: Actions = {
	updatePrayer: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
		const prayerName = formData.get('prayerName')?.toString();
		const status = formData.get('status')?.toString();

		if (!prayerName || !status) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			const existingLog = await db.query.prayerLogs.findFirst({
				where: and(
					eq(prayerLogs.userId, locals.user.id),
					eq(prayerLogs.date, dateStr),
					eq(prayerLogs.prayerName, prayerName)
				)
			});

			if (existingLog) {
				await db.update(prayerLogs)
					.set({ status })
					.where(eq(prayerLogs.id, existingLog.id));
			} else {
				await db.insert(prayerLogs).values({
					id: crypto.randomUUID(),
					userId: locals.user.id,
					date: dateStr,
					prayerName,
					status
				});
			}

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to update prayer status' });
		}
	},

	toggleHabit: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401);
		const userId = locals.user.id;
		const data = await request.formData();
		const habitId = data.get('habitId') as string;
		const dateStr = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

		if (!habitId) return fail(400, { missing: true });

		try {
			const existingLog = await db.query.habitLogs.findFirst({
				where: and(
					eq(habitLogs.habitId, habitId),
					eq(habitLogs.date, dateStr),
					eq(habitLogs.userId, userId)
				)
			});

			if (existingLog) {
				// Toggle off -> delete log
				await db.delete(habitLogs).where(eq(habitLogs.id, existingLog.id));
			} else {
				// Toggle on -> create log
				await db.insert(habitLogs).values({
					id: crypto.randomUUID(),
					habitId,
					userId,
					date: dateStr,
					status: 'completed',
					value: 1 // Default value
				});
			}
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: 'Failed to toggle habit' });
		}
	}
};

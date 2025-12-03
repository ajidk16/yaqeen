import { db } from "$lib/server/db";
import { habits, habitLogs } from "$lib/server/db/schema";
import { eq, and } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import { nanoid } from 'nanoid';

export const load = async ({ locals }) => {
	// Check if user is logged in using locals.user (populated by hooks)
    if (!locals.user) {
        return { habits: [] };
    }
    
    const userId = locals.user.id;
    if (!userId) return { habits: [] };

    // Fetch habits
    const userHabits = await db.query.habits.findMany({
        where: eq(habits.userId, userId),
        orderBy: (habits, { desc }) => [desc(habits.createdAt)]
    });

    // Fetch today's logs
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = await db.query.habitLogs.findMany({
        where: and(
            eq(habitLogs.userId, userId),
            eq(habitLogs.date, today)
        )
    });

    // Combine data
    const habitsWithStatus = userHabits.map(habit => {
        const log = todaysLogs.find(l => l.habitId === habit.id);
        return {
            ...habit,
            completed: !!log && log.status === 'completed',
            currentValue: log?.value || 0,
            logId: log?.id
        };
    });

	return {
		habits: habitsWithStatus
	};
};

export const actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const userId = locals.user.id;
        const data = await request.formData();
        
        const title = data.get('title') as string;
        const type = data.get('type') as string;
        const category = data.get('category') as string;
        const time = data.get('time') as string;
        const targetValue = parseInt(data.get('targetValue') as string) || 0;
        const unit = data.get('unit') as string;
        const icon = data.get('icon') as string;
        
        
        if (!title) return fail(400, { missing: true });

        try {
            await db.insert(habits).values({
                id: nanoid(),
                userId,
                title,
                type,
                category,
                time,
                targetValue,
                unit,
                icon,
                frequency: { type: 'daily' }, // Default for now
                createdAt: new Date()
            });
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to create habit' });
        }
    },

    update: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id') as string;
        
        if (!id) return fail(400, { missing: true });

        const title = data.get('title') as string;
        const type = data.get('type') as string;
        const category = data.get('category') as string;
        const time = data.get('time') as string;
        const icon = data.get('icon') as string;
        
        try {
            await db.update(habits)
                .set({ title, type, category, time, icon })
                .where(and(eq(habits.id, id), eq(habits.userId, locals.user.id)));
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to update habit' });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const data = await request.formData();
        const id = data.get('id') as string;

        if (!id) return fail(400, { missing: true });

        try {
            // First delete logs (cascade usually handles this but let's be explicit if needed, 
            // or assume DB cascade is set. Drizzle schema didn't specify cascade, so manual delete might be safer)
            await db.delete(habitLogs).where(eq(habitLogs.habitId, id));
            await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, locals.user.id)));
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to delete habit' });
        }
    },

    toggle: async ({ request, locals }) => {
        if (!locals.user) return fail(401);
        const userId = locals.user.id;
        const data = await request.formData();
        const habitId = data.get('habitId') as string;
        const dateStr = new Date().toISOString().split('T')[0];

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
                    id: nanoid(),
                    habitId,
                    userId,
                    date: dateStr,
                    status: 'completed',
                    value: 1 // Default value
                });
            }
        } catch (err) {
            console.error(err);
            return fail(500, { message: 'Failed to toggle habit' });
        }
    }
};
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { menstruationLogs } from '$lib/server/db/schema';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/login');

	const logs = await db.query.menstruationLogs.findMany({
		where: eq(menstruationLogs.userId, locals.user.id),
		orderBy: [desc(menstruationLogs.startDate)]
	});

	// Check if currently menstruating (latest log has no end date)
    // Note: This logic might eventually move to layout or shared helper
    // For now we just return logs
    
	return {
		menstruationLogs: logs
	};
};

export const actions: Actions = {
	logPeriod: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/login');
		
		const formData = await request.formData();
		const type = formData.get('type') as string; // 'start' | 'end'
		const date = formData.get('date') as string; // 'YYYY-MM-DD'

        if (!date) return fail(400, { message: "Date is required" });

		try {
			if (type === 'start') {
                // Check if already active? 
                // We'll trust user for now or add validation later
				await db.insert(menstruationLogs).values({
					id: generateIdFromEntropySize(10),
					userId: locals.user.id,
					startDate: date
				});
			} else if (type === 'end') {
				// Find the latest open log
				// We look for a log where endDate is null
                // Querying with isNull
                const openLogs = await db.select().from(menstruationLogs).where(
                    and(
                        eq(menstruationLogs.userId, locals.user.id),
                        isNull(menstruationLogs.endDate)
                    )
                );

                if (openLogs.length > 0) {
                    const log = openLogs[0];
                    // Update the found log with the endDate
                    // Constraint: endDate must be >= startDate
                    if (new Date(date) < new Date(log.startDate)) {
                        return fail(400, { message: "End date cannot be before start date" });
                    }

                    await db.update(menstruationLogs)
                        .set({ endDate: date })
                        .where(eq(menstruationLogs.id, log.id));
                } else {
                    return fail(400, { message: "No active period to end" });
                }
			}
		} catch (err) {
			console.error(err);
			return fail(500, { message: "Failed to update period log" });
		}
        
        return { success: true };
	},
    
    deleteLog: async({ request, locals }) => {
        if (!locals.user) throw redirect(302, '/login');
        const formData = await request.formData();
        const id = formData.get('id') as string;
        
        if(!id) return fail(400, { message: "Log ID required" });
        
        await db.delete(menstruationLogs)
            .where(and(eq(menstruationLogs.id, id), eq(menstruationLogs.userId, locals.user.id)));
            
        return { success: true };
    }
};

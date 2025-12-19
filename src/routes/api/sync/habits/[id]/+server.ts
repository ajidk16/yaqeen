import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { habits } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT - Update a habit
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await request.json();
	const habitId = params.id;

	// Check ownership
	const existing = await db.query.habits.findFirst({
		where: and(eq(habits.id, habitId), eq(habits.userId, locals.user.id))
	});

	if (!existing) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	// Check for conflict (server has newer data)
	if (data.updatedAt && existing.createdAt) {
		const clientTime = new Date(data.updatedAt).getTime();
		const serverTime = new Date(existing.createdAt).getTime();
		
		if (serverTime > clientTime) {
			return json({ 
				error: 'Conflict', 
				serverData: existing 
			}, { status: 409 });
		}
	}

	await db.update(habits)
		.set(data)
		.where(eq(habits.id, habitId));

	const updated = await db.query.habits.findFirst({
		where: eq(habits.id, habitId)
	});

	return json(updated);
};

// DELETE - Delete a habit
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const habitId = params.id;

	await db.delete(habits)
		.where(and(eq(habits.id, habitId), eq(habits.userId, locals.user.id)));

	return json({ success: true });
};

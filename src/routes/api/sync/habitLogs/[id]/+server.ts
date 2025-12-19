import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { habitLogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT - Update a habit log
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await request.json();
	const logId = params.id;

	// Check ownership
	const existing = await db.query.habitLogs.findFirst({
		where: and(eq(habitLogs.id, logId), eq(habitLogs.userId, locals.user.id))
	});

	if (!existing) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	await db.update(habitLogs)
		.set(data)
		.where(eq(habitLogs.id, logId));

	const updated = await db.query.habitLogs.findFirst({
		where: eq(habitLogs.id, logId)
	});

	return json(updated);
};

// DELETE - Delete a habit log
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const logId = params.id;

	await db.delete(habitLogs)
		.where(and(eq(habitLogs.id, logId), eq(habitLogs.userId, locals.user.id)));

	return json({ success: true });
};

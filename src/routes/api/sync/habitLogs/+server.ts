import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { habitLogs } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch habit logs for a date
export const GET: RequestHandler = async ({ url, locals }) => {
	const userId = url.searchParams.get('userId') || locals.user?.id;
	const date = url.searchParams.get('date');
	
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const logs = await db.query.habitLogs.findMany({
		where: and(
			eq(habitLogs.userId, userId),
			date ? eq(habitLogs.date, date) : undefined
		)
	});

	return json(logs);
};

// POST - Create a new habit log
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await request.json();
	
	await db.insert(habitLogs).values({
		...data,
		userId: locals.user.id
	});

	return json({ success: true });
};

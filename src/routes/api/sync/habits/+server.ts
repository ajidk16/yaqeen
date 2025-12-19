import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { habits } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch all habits for a user
export const GET: RequestHandler = async ({ url, locals }) => {
	const userId = url.searchParams.get('userId') || locals.user?.id;
	
	if (!userId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const userHabits = await db.query.habits.findMany({
		where: eq(habits.userId, userId)
	});

	return json(userHabits);
};

// POST - Create a new habit
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const data = await request.json();
	
	await db.insert(habits).values({
		...data,
		userId: locals.user.id
	});

	return json({ success: true });
};

import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
    	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, locals.user.id)
	});

	if (!currentUser) {
		throw redirect(302, "/login");
	}

    return {
        user: currentUser
    };
};
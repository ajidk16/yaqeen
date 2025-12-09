import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { verifyVerificationCode } from '$lib/server/verification';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	if (locals.user.emailVerified) {
		redirect(302, '/dashboard');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	verify: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const code = formData.get('code');


		if (!code || typeof code !== 'string') {
			return fail(400, { message: 'Kode tidak valid' });
		}

		const isValid = await verifyVerificationCode(locals.user.email, code);


		if (!isValid) {
			return fail(400, { message: 'Kode verifikasi salah atau sudah kadaluarsa.' });
		}

		await lucia.invalidateUserSessions(locals.user.id);
		await db.update(user).set({ emailVerified: true }).where(eq(user.id, locals.user.id));

		const session = await lucia.createSession(locals.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
        
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/dashboard');
	},
    
    resend: async ({ locals }) => {
        if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}
        
        // Logic to resend email is likely better handled by redirecting back to email-send or calling the logic here.
        // For simplicity, redirecting to email-send's default action is tricky without fetch. 
        // We will just redirect to /email-send?resend=true or handle it on client.
        // Actually, user can just visit /email-send again.
        
        redirect(302, '/email-send');
    }
};

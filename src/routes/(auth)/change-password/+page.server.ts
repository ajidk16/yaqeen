import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { user, account } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const email = cookies.get('verify_email');
	const otpVerified = cookies.get('otp_verified');
	
	if (!email) {
		redirect(303, '/forgot-password');
	}

	// Check if OTP was verified
	if (!otpVerified) {
		redirect(303, '/verify');
	}

	return {
		email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const email = cookies.get('verify_email');

		// Validate session
		if (!email) {
			return fail(400, { message: 'Sesi telah berakhir. Silakan mulai ulang.' });
		}

		// Validate password
		if (typeof password !== 'string' || password.length < 8) {
			return fail(400, { message: 'Password minimal 8 karakter' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Password tidak cocok' });
		}

		// Find user
		const existingUser = await db.query.user.findFirst({
			where: eq(user.email, email)
		});

		if (!existingUser) {
			return fail(400, { message: 'User tidak ditemukan' });
		}

		// Hash new password
		const passwordHash = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		// Update password in account table
		await db.update(account)
			.set({ 
				password: passwordHash,
				updatedAt: new Date()
			})
			.where(eq(account.userId, existingUser.id));

		// Clear verification cookies
		cookies.delete('verify_email', { path: '/' });
		cookies.delete('otp_verified', { path: '/' });

		return { success: true };
	}
};

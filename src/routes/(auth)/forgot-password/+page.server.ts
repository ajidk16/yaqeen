import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		// Simulate delay
		await new Promise(resolve => setTimeout(resolve, 1000));

		if (!email) {
			return fail(400, { error: 'Email wajib diisi' });
		}

		// TODO: Implement actual password reset logic here (e.g., call API or DB)
		console.log('Reset password requested for:', email);

		return { success: 'Jika email terdaftar, kami telah mengirimkan link reset password.' };
	}
} satisfies Actions;

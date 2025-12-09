import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { sendVerificationEmail } from '$lib/server/email';
import { generateVerificationCodeString, saveVerificationCode } from '$lib/server/verification';
import { checkEmailAddress } from '$lib/server/cek-email-address';

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
	default: async ({ locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			// check email address
			const emailCheck = await checkEmailAddress(locals.user.email);
			if (!emailCheck.isValidFormat || !emailCheck.hasMxRecord || emailCheck.isDisposable) {
				return fail(400, { message: 'Alamat email tidak valid untuk pengiriman verifikasi.' });
			}
	
            // 1. Generate code locally
			const code = generateVerificationCodeString();
            
            // 2. Try to send email FIRST (Verification Check)
			await sendVerificationEmail(locals.user.email, code);
			// console.log('Verification email sent successfully',code);

            
            // 3. Only if successful, save to DB
            await saveVerificationCode(locals.user.id, locals.user.email, code);
            
		} catch (error: any) {
			console.error('Failed to send verification email:', error);
            
            // Check for specific error messages that indicate invalid email
            const failure = error?.response?.response || '';
            const msg = error?.message || '';
            
            if (msg.includes('Gagal mengirim email') || failure.includes('5.1.1') || failure.includes('does not exist')) {
                 return fail(400, { message: 'Alamat email tidak terdaftar di Gmail atau tidak valid. Harap periksa kembali.' });
            }
            
			return fail(500, { message: 'Gagal mengirim email verifikasi. Silakan coba lagi nanti.' });
		}

        if (url.searchParams.get('noredirect') === 'true') {
            return { success: true, message: 'Email verifikasi berhasil dikirim.' };
        }

		redirect(302, '/email-verify');
	}
};

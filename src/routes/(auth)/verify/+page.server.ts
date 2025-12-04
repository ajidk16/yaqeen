import { fail, redirect } from '@sveltejs/kit';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { user, verification } from '$lib/server/db/schema';
import { verifyOtp, generateOtp, hashOtp, getOtpExpiration, generateVerificationId } from '$lib/server/otp';
import { render } from 'svelte/server';
import nodemailer from 'nodemailer';
import Otp from '$lib/email/otp.svelte';
import { GMAIL_PASS, GMAIL_USER } from '$env/static/private';
import type { Actions, PageServerLoad } from './$types';

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_PASS,
	},
});

export const load: PageServerLoad = async ({ cookies }) => {
	const email = cookies.get('verify_email');
	
	if (!email) {
		redirect(303, '/forgot-password');
	}

	return {
		email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Mask email for display
	};
};

export const actions: Actions = {
	confirm: async ({ request, cookies }) => {
		const formData = await request.formData();
		const otp = formData.get('otp');
		const email = cookies.get('verify_email');

		// Validate inputs
		if (!email) {
			return fail(400, { message: 'Sesi verifikasi telah berakhir. Silakan minta kode baru.' });
		}

		if (typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
			return fail(400, { message: 'Kode OTP tidak valid' });
		}

		// Find verification record
		const verificationRecord = await db.query.verification.findFirst({
			where: and(
				eq(verification.identifier, email),
				gt(verification.expiresAt, new Date())
			)
		});

		if (!verificationRecord) {
			return fail(400, { message: 'Kode OTP tidak ditemukan atau sudah kadaluarsa' });
		}

		// Verify OTP using secure comparison
		const isValid = verifyOtp(otp, verificationRecord.value);

		if (!isValid) {
			return fail(400, { message: 'Kode OTP tidak valid' });
		}

		// OTP verified successfully - delete the verification record
		await db.delete(verification).where(eq(verification.id, verificationRecord.id));

		// Mark user as email verified
		await db.update(user)
			.set({ emailVerified: true, updatedAt: new Date() })
			.where(eq(user.email, email));

		// Set verified flag cookie (keep verify_email for change-password page)
		cookies.set('otp_verified', 'true', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 10 // 10 minutes
		});

		return { success: true };
	},

	resend: async ({ cookies }) => {
		const email = cookies.get('verify_email');

		if (!email) {
			return fail(400, { message: 'Sesi verifikasi telah berakhir' });
		}

		// Generate new OTP
		const otp = generateOtp();
		const hashedOtp = hashOtp(otp);
		const expiresAt = getOtpExpiration(10);
		const verificationId = generateVerificationId();

		// Delete existing OTP
		await db.delete(verification).where(eq(verification.identifier, email));

		// Store new OTP
		await db.insert(verification).values({
			id: verificationId,
			identifier: email,
			value: hashedOtp,
			expiresAt,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		// Send email
		const otpResult = render(Otp, {
			props: { otp, appName: 'Yaa Qeen' }
		});

		try {
			await transporter.sendMail({
				from: `Yaa Qeen <${GMAIL_USER}>`,
				to: email,
				subject: 'Kode Verifikasi Baru Yaa Qeen',
				html: otpResult.body
			});
		} catch (error) {
			console.error('Failed to send email:', error);
			return fail(500, { message: 'Gagal mengirim email' });
		}

		return { resent: true };
	}
};

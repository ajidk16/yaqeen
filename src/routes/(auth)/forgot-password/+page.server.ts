/* eslint-disable @typescript-eslint/no-explicit-any */
import { fail, redirect } from '@sveltejs/kit';
import { render } from 'svelte/server';
import nodemailer from 'nodemailer';
import { eq } from 'drizzle-orm';
import Otp from '$lib/email/otp.svelte';
import { GMAIL_PASS, GMAIL_USER } from '$env/static/private';
import { db } from '$lib/server/db';
import { user, verification } from '$lib/server/db/schema';
import { generateOtp, hashOtp, getOtpExpiration, generateVerificationId } from '$lib/server/otp';

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_PASS,
	},
});

export const actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email');


		// Validate email
		if (typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { message: 'Email tidak valid' });
		}

		// Check if user exists
		const existingUser = await db.query.user.findFirst({
			where: eq(user.email, email)
		});


		if (!existingUser) {
			// Return success even if user doesn't exist to prevent email enumeration
			return fail(400, { message: 'Email tidak ditemukan' });
		}

		// Generate secure OTP
		const otp = generateOtp();
		const hashedOtp = hashOtp(otp);
		const expiresAt = getOtpExpiration(10); // 10 minutes
		const verificationId = generateVerificationId();

		// Delete any existing OTP for this email
		await db.delete(verification).where(eq(verification.identifier, email));

		// Store hashed OTP in database
		await db.insert(verification).values({
			id: verificationId,
			identifier: email,
			value: hashedOtp,
			expiresAt,
			createdAt: new Date(),
			updatedAt: new Date()
		});


		// Store email in cookie for verify page
		cookies.set('verify_email', email, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 10 // 10 minutes
		});

		// Render email template
		const otpResult = render(Otp, {
			props: {
				otp: otp, // Send plain OTP via email
				appName: 'Yaa Qeen'
			}
		});


		// Send email
		try {
			await transporter.sendMail({
				from: `Yaa Qeen <${GMAIL_USER}>`,
				to: email,
				subject: 'Kode Verifikasi Yaa Qeen Anda',
				html: otpResult.body
			});
		} catch (error) {
			console.error('Failed to send email:', error);
			return fail(500, { message: 'Gagal mengirim email. Silakan coba lagi.' });
		}

		// Redirect to verify page
		redirect(303, '/verify');
	}
};

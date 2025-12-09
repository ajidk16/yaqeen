import nodemailer from 'nodemailer';
import { GMAIL_USER, GMAIL_PASS } from '$env/static/private';
import { render } from 'svelte/server';
import Otp from '$lib/email/otp.svelte';

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_PASS
	}
});

export async function sendVerificationEmail(email: string, otp: string) {
	const otpResult = render(Otp, {
		props: { otp, appName: 'Yaa Qeen' }
	});

	try {
		const result = await transporter.sendMail({
			from: `Yaa Qeen <${GMAIL_USER}>`,
			to: email,
			subject: 'Kode Verifikasi Baru Yaa Qeen',
			html: otpResult.body
		});
		return { success: true, result };
	} catch (error) {
		console.error('Failed to send email:', error);
		throw new Error('Gagal mengirim email');
	}
}

import { fail, redirect } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { hash } from "@node-rs/argon2";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user, account, verification } from "$lib/server/db/schema";
import { generateOtp, hashOtp, getOtpExpiration, generateVerificationId } from '$lib/server/otp';
import { sendVerificationEmail } from '$lib/server/email';
import { eq } from "drizzle-orm";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const formData = await request.formData();
		const email = formData.get("email");
		const password = formData.get("password");
		const name = formData.get("name");
		const gender = formData.get("gender");
		// const agreeTerms = formData.get("agreeTerms"); // Checkbox might be "on" or null
		const userAgent = request.headers.get('user-agent');
		const ipAddress = getClientAddress();
		// Basic validation
		if (
			typeof email !== "string" ||
			email.length < 3 ||
			email.length > 255 ||
			!/.+@.+/.test(email)
		) {
			return fail(400, {
				message: "Invalid email"
			});
		}
		if (typeof password !== "string" || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: "Invalid password"
			});
		}
		if (typeof name !== "string" || name.length < 1) {
			return fail(400, {
				message: "Invalid name"
			});
		}
		if (typeof gender !== "string" || (gender !== 'male' && gender !== 'female')) {
			return fail(400, {
				message: "Invalid gender"
			});
		}

		// Check if user already exists
		const existingUser = await db.query.user.findFirst({
			where: eq(user.email, email)
		});

		if (existingUser) {
			return fail(400, {
				message: "Email already in use"
			});
		}

		const userId = generateIdFromEntropySize(10); // 16 characters long
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

	// Create user
		try {
			await db.insert(user).values({
				id: userId,
				email: email,
				name: name,
				emailVerified: false,
				gender: gender as 'male' | 'female',
				createdAt: new Date(),
				updatedAt: new Date(),
			});
            
            await db.insert(account).values({
                id: generateIdFromEntropySize(10),
                userId: userId,
                accountId: email, // Using email as accountId for email/password provider
                providerId: "email", // or "credential"
                password: passwordHash,
                createdAt: new Date(),
                updatedAt: new Date()
            });

			const session = await lucia.createSession(userId, {
				idlePeriod: 1000 * 60 * 60 * 24 * 7, // 7 days
				activePeriod: 1000 * 60 * 60 * 24 * 30, // 30 days
				ipAddress: ipAddress,
				userAgent: userAgent
			});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: ".",
				...sessionCookie.attributes
			});

			// Generate and send OTP
			const otp = generateOtp();
			const hashedOtp = hashOtp(otp);
			const expiresAt = getOtpExpiration(10);
			const verificationId = generateVerificationId();

			await db.insert(verification).values({
				id: verificationId,
				identifier: email,
				value: hashedOtp,
				expiresAt,
				createdAt: new Date(),
				updatedAt: new Date()
			});

			try {
				await sendVerificationEmail(email, otp);
			} catch (error) {
				console.error('Failed to send verification email during registration:', error);
				// Still redirect to verify, user can request resend there
			}

			// Set verify_email cookie for the verify page
			cookies.set('verify_email', email, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 10 // 10 minutes
			});

		} catch (e) {
            console.error(e);
			return fail(500, {
				message: "An unknown error occurred"
			});
		}

		redirect(302, "/verify");
	}
};

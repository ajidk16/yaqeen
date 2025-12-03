import { fail, redirect } from "@sveltejs/kit";
import { verify } from "@node-rs/argon2";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user, account } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get("email");
		const password = formData.get("password");

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

		const existingUser = await db.query.user.findFirst({
			where: eq(user.email, email)
		});

		if (!existingUser) {
			// NOTE:
			// Returning immediately allows malicious actors to figure out valid emails from response times,
			// allowing them to only focus on guessing passwords in brute-force attacks.
			// As a preventive measure, you may want to hash passwords even for invalid emails.
			// However, valid emails can be already be revealed with the signup page
			// and a similar timing issue can likely be found in password verification logic
			// so placing a fake hash here may be fruitless but costy.
			return fail(400, {
				message: "Incorrect email or password"
			});
		}

        // Find the account associated with the user for password verification
        const existingAccount = await db.query.account.findFirst({
            where: eq(account.userId, existingUser.id)
        });

        if (!existingAccount || !existingAccount.password) {
            return fail(400, {
                message: "Incorrect email or password"
            });
        }

		const validPassword = await verify(existingAccount.password, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		if (!validPassword) {
			return fail(400, {
				message: "Incorrect email or password"
			});
		}

		const session = await lucia.createSession(existingUser.id, {
			idlePeriod: 1000 * 60 * 60 * 24 * 7, // 7 days
			activePeriod: 1000 * 60 * 60 * 24 * 30 // 30 days
		});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});

		redirect(302, "/");
	}
};

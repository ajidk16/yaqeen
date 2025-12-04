import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user, session } from "$lib/server/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { hash, verify } from "@node-rs/argon2";
import { lucia } from "$lib/server/auth";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	// Fetch active sessions for this user
	const userSessions = await db.query.session.findMany({
		where: eq(session.userId, locals.user.id),
		orderBy: (session, { desc }) => [desc(session.updatedAt)]
	});

	// Map sessions to UI friendly format
	// Note: Lucia sessions might not have device info unless we store it.
	// The schema has `userAgent` and `ipAddress`.
	const formattedSessions = userSessions.map(s => ({
		id: s.id,
		device: s.userAgent || 'Unknown Device',
		location: s.ipAddress || 'Unknown Location',
		active: s.id === locals.session?.id,
		lastActive: s.updatedAt.toLocaleDateString() + ' ' + s.updatedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: true })
	}));

	return {
		sessions: formattedSessions
	};
};

export const actions: Actions = {
	updatePassword: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const currentPassword = formData.get("currentPassword") as string;
		const newPassword = formData.get("newPassword") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { message: "All fields are required" });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: "New passwords do not match" });
		}

		if (newPassword.length < 6) {
			return fail(400, { message: "Password must be at least 6 characters" });
		}

		try {
			// Get user's current password hash from account table
			// Assuming email/password provider is used and stored in account table
			// We need to find the account linked to this user with password
			const userAccount = await db.query.account.findFirst({
				where: eq(user.id, locals.user.id) // This might need refinement if multiple accounts exist
			});

			if (!userAccount || !userAccount.password) {
				return fail(400, { message: "No password set for this account" });
			}

			const validPassword = await verify(userAccount.password, currentPassword, {
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			if (!validPassword) {
				return fail(400, { message: "Incorrect current password" });
			}

			const passwordHash = await hash(newPassword, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});

			// Update password in account table
			// We need to update the specific account entry
			// Assuming we update the one we found
			await db.update(db.query.account.table) // Using table reference from query builder or schema
				.set({
					password: passwordHash,
					updatedAt: new Date()
				})
				.where(eq(db.query.account.table.id, userAccount.id)); // Use schema export if possible, but here using query result id

		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update password" });
		}

		return { success: true };
	},

	revokeSession: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}
		const formData = await request.formData();
		const sessionId = formData.get("sessionId") as string;

		if (!sessionId) {
			return fail(400, { message: "Session ID required" });
		}

		try {
			await lucia.invalidateSession(sessionId);
		} catch (e) {
			return fail(500, { message: "Failed to revoke session" });
		}

		return { success: true };
	},

	deleteAccount: async ({ locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		try {
			// Delete user and all related data
			// Drizzle doesn't cascade automatically unless defined in DB
			// We should delete related records first or rely on DB cascade
			// Let's assume DB cascade is set up or we delete user which cascades
			
			// Invalidate all sessions first
			await lucia.invalidateUserSessions(locals.user.id);
			
			// Delete user from DB
			await db.delete(user).where(eq(user.id, locals.user.id));
			
			// Redirect to home or login
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to delete account" });
		}
		
		throw redirect(302, "/");
	}
};

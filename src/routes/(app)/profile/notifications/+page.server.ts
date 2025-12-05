import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const currentUser = await db.query.user.findFirst({
		where: eq(user.id, locals.user.id)
	});

	if (!currentUser) {
		throw redirect(302, "/login");
	}

	return {
		user: currentUser
	};
};

export const actions: Actions = {
	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const pushEnabled = formData.get("pushEnabled") === 'on';
		const fajr = formData.get("fajr") === 'on';
		const dhuhr = formData.get("dhuhr") === 'on';
		const asr = formData.get("asr") === 'on';
		const maghrib = formData.get("maghrib") === 'on';
		const isha = formData.get("isha") === 'on';
		const habits = formData.get("habits") === 'on';
		const sound = formData.get("sound");

		try {
			const currentUser = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id)
			});

			if (!currentUser) {
				return fail(404, { message: "User not found" });
			}

			const currentPreferences = currentUser.preferences as Record<string, string> || {};

			await db.update(user)
				.set({
					preferences: {
						...currentPreferences,
						notifications: pushEnabled, // Global toggle
						notificationSettings: {
							prayers: {
								fajr,
								dhuhr,
								asr,
								maghrib,
								isha
							},
							habits,
							sound
						}
					},
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update notification settings" });
		}

		return { success: true };
	}
};

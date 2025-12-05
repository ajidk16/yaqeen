import { fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { UserPreferences } from "$lib/utils/global";




export const actions = {
	toggle: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const prayerId = formData.get("prayerId") as string;

		if (!prayerId) {
			return fail(400, { message: "Prayer ID is required" });
		}

		try {
			const currentUser = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id)
			});

			if (!currentUser) {
				return fail(404, { message: "User not found" });
			}

			const currentPreferences = (currentUser.preferences as UserPreferences) || {};
			const notificationSettings = currentPreferences.notificationSettings || {
				prayers: { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false },
				habits: false,
				sound: 'notification'
			};

			// Toggle the specific prayer
			const currentStatus = notificationSettings.prayers[prayerId];
			notificationSettings.prayers[prayerId] = !currentStatus;

			await db.update(user)
				.set({
					preferences: {
						...currentPreferences,
						notificationSettings
					},
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));


			return { success: true, prayerId, enabled: !currentStatus };
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update notification settings" });
		}
	}
};

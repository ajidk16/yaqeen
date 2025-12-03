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
		const language = formData.get("language") as string;
		const dataSaver = formData.get("dataSaver") === 'on';
		const mazhab = formData.get("mazhab") as string;
		const locationMethod = formData.get("locationMethod") as string;
		const manualLocation = formData.get("manualLocation") as string;

		try {
			// Fetch current user to merge jsonb fields if needed, 
			// but for now we might just overwrite or merge carefully.
			// Drizzle's update for jsonb usually overwrites the whole object if we pass a new object.
			// So we should probably fetch first or use sql operators if we want partial updates.
			// For simplicity, let's fetch current user first to preserve other keys if any.
			
			const currentUser = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id)
			});

			if (!currentUser) {
				return fail(404, { message: "User not found" });
			}

			const currentPreferences = currentUser.preferences as Record<string, any> || {};
			const currentSettings = currentUser.settings as Record<string, any> || {};
			const currentLocation = currentUser.location as Record<string, any> || {};

			await db.update(user)
				.set({
					mazhab,
					preferences: {
						...currentPreferences,
						language
					},
					settings: {
						...currentSettings,
						dataSaver
					},
					location: {
						...currentLocation,
						method: locationMethod,
						city: manualLocation
					},
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update settings" });
		}

		return { success: true };
	}
};

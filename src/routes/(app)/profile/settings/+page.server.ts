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
		const longitude = formData.get("longitude") as string;
		const latitude = formData.get("latitude") as string;

		try {

			const openStreet = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`)
			const openStreetData = await openStreet.json()
			console.log(openStreetData)

			const currentUser = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id)
			});

			if (!currentUser) {
				return fail(404, { message: "User not found" });
			}

			const currentPreferences = currentUser.preferences as Record<string, string> || {};
			const currentSettings = currentUser.settings as Record<string, string> || {};
			const currentLocation = currentUser.location as Record<string, string> || {};

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
						city: manualLocation ? manualLocation : openStreetData.address.city || openStreetData.address.town || openStreetData.address.village || '',
						lat: latitude,
						lng: longitude,
						displayName: openStreetData.display_name
					},
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update settings" });
		}

		return { success: true };
	},
	updateLatLong: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const longitude = formData.get("longitude") as string;
		const latitude = formData.get("latitude") as string;

		try {
			const currentUser = await db.query.user.findFirst({
				where: eq(user.id, locals.user.id)
			});

			if (!currentUser) {
				return fail(404, { message: "User not found" });
			}

			const currentLocation = currentUser.location as Record<string, string> || {};

			await db.update(user)
				.set({
					location: {
						...currentLocation,
						lat: latitude,
						lng: longitude
					},
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update location" });
		}

		return { success: true };
	}
};

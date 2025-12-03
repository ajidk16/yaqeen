import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { moodLogs } from "$lib/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const logs = await db.query.moodLogs.findMany({
		where: eq(moodLogs.userId, locals.user.id),
		orderBy: [desc(moodLogs.date), desc(moodLogs.createdAt)]
	});

	return {
		logs
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const mood = formData.get("mood") as string;
		const gratitude = formData.get("gratitude") as string;
		const dateStr = formData.get("date") as string;

		if (!mood || !gratitude || !dateStr) {
			return fail(400, { message: "Missing required fields" });
		}

		try {
			await db.insert(moodLogs).values({
				id: generateIdFromEntropySize(10),
				userId: locals.user.id,
				date: new Date(dateStr).toISOString().split('T')[0], // Ensure YYYY-MM-DD
				mood,
				gratitude,
				createdAt: new Date()
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to create entry" });
		}

		return { success: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const id = formData.get("id") as string;
		const mood = formData.get("mood") as string;
		const gratitude = formData.get("gratitude") as string;

		if (!id || !mood || !gratitude) {
			return fail(400, { message: "Missing required fields" });
		}

		try {
			await db.update(moodLogs)
				.set({ mood, gratitude })
				.where(and(eq(moodLogs.id, id), eq(moodLogs.userId, locals.user.id)));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to update entry" });
		}

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const id = formData.get("id") as string;

		if (!id) {
			return fail(400, { message: "Missing ID" });
		}

		try {
			await db.delete(moodLogs)
				.where(and(eq(moodLogs.id, id), eq(moodLogs.userId, locals.user.id)));
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to delete entry" });
		}

		return { success: true };
	}
};

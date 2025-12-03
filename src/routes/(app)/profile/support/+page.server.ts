import { fail } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { supportTickets } from "$lib/server/db/schema";
import type { Actions } from "./$types";


export const actions: Actions = {
	submitTicket: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401);
		}

		const formData = await request.formData();
		const subject = formData.get("subject") as string;
		const message = formData.get("message") as string;

		if (!subject || !message) {
			return fail(400, { message: "Subject and message are required" });
		}

		try {
			await db.insert(supportTickets).values({
				id: crypto.randomUUID(),
				userId: locals.user.id,
				subject,
				message,
				status: 'open'
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: "Failed to submit ticket" });
		}

		return { success: true };
	}
};

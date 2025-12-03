import {  redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import type { Actions } from "./$types";

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.session) {
			await lucia.invalidateSession(locals.session.id);
		}

		const allCookies = cookies.getAll();
		for (const cookie of allCookies) {
			cookies.delete(cookie.name, { path: "/" });
		}

		redirect(302, "/");
	}
};

import { lucia } from "$lib/server/auth";
import { redirect, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		if (event.route.id && event.route.id.startsWith('/(app)')) {
			return redirect(303, '/login');
		}
		return resolve(event);
	}
	
	const { session, user } = await lucia.validateSession(sessionId);

	if (session && (event.route.id?.startsWith('/(auth)'))) {
		throw redirect(302, '/');
	}

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		// sveltekit types deviates from the cookie api
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: ".",
			...sessionCookie.attributes
		});
	}


	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

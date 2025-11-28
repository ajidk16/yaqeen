import { auth } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	} else {
		event.locals.user = null;
		event.locals.session = null;
	}

	const protectedRoutes = ['/dashboard', '/journal', '/stats', '/profile', '/habits'];
	const isProtectedRoute = protectedRoutes.some(route => event.url.pathname.startsWith(route));
	const isAuthRoute = ['/login', '/register'].some(route => event.url.pathname.startsWith(route));

	if (isProtectedRoute && !session) {
		return new Response(null, {
			status: 303,
			headers: { Location: '/login' }
		});
	}

	if (isAuthRoute && session) {
		return new Response(null, {
			status: 303,
			headers: { Location: '/dashboard' }
		});
	}

	return resolve(event);
};

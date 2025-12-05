import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { lucia } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

const originalHandle: Handle = async ({ event, resolve }) => {
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

	if (session && event.route.id?.startsWith('/(auth)')) {
		throw redirect(302, '/dashboard');
	}

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);

		// sveltekit types deviates from the cookie api
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

export const handle = sequence(originalHandle, handleParaglide);

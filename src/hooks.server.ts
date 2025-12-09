import { sequence } from '@sveltejs/kit/hooks';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { lucia } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

const originalHandle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;

		// 2. Apabila belum ada akun redirect ke marketing / (for protected app routes)
		if (event.route.id?.startsWith('/(app)')) {
			return redirect(303, '/');
		}

		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);

	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
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
        
         // Handle invalid session acting like no session
        if (event.route.id?.startsWith('/(app)')) {
			return redirect(303, '/');
		}
	}

	event.locals.user = user;
	event.locals.session = session;
    
    // Auth Logic
    if (user) {
        if (!user.emailVerified) {
             // 1. Apabila ada akun dengan status emailVerified false
             // Tidak boleh akses routes (app)
            if (event.route.id?.startsWith('/(app)')) {
                throw redirect(303, '/email-verify');
            }
            
            // Allow access to /email-send, /email-verify, /marketing (implied non-app routes)
            // But if they try to access login/register while logged in but unverified, redirect to verification?
            // Usually, yes.
             if (event.route.id?.startsWith('/(auth)/login') || event.route.id?.startsWith('/(auth)/register')) {
                throw redirect(303, '/email-verify');
            }

        } else {
             // 3. Apabila akun dengan status emailVerified true
             // Redirect auth pages to dashboard
             if (event.route.id?.startsWith('/(auth)')) {
                 // But likely want to allow logout. Logout is usually an action or a specific route.
                 // Assuming logout is handle by generic route or specific check.
                 // If /logout is in (auth), we need exception. 
                 // Based on file list, (auth) has +page.svelte? No, likely subfolders.
                 // If path is /login or /register
                 if (event.url.pathname !== '/logout') {
                     throw redirect(303, '/dashboard');
                 }
             }
        }
    }

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

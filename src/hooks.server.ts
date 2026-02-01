import type { Handle } from '@sveltejs/kit';
import { paraglideMiddleware } from '$lib/paraglide/server.js';
import * as schema from '$lib/server/db/schema.js';
import { drizzle } from 'drizzle-orm/d1';
import { sequence } from '@sveltejs/kit/hooks';
import {
	validateSession,
	SESSION_COOKIE_NAME,
	CSRF_COOKIE_NAME,
	generateCsrfToken,
	getCsrfCookieOptions
} from '$lib/server/auth.js';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
		});
	});

const handleDB: Handle = async ({ event, resolve }) => {
	if (event.platform?.env.DB) {
		event.locals.db = drizzle(event.platform.env.DB, { schema });
	} else {
		throw new Error('D1 Database binding "DB" is not found in the environment.');
	}

	const response = await resolve(event);
	return response;
};

const handleAuth: Handle = async ({ event, resolve }) => {
	// Initialize user as null
	event.locals.user = null;
	event.locals.sessionId = null;

	// Get session from cookie
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (sessionId && event.locals.db) {
		const session = await validateSession(event.locals.db, sessionId);

		if (session && session.user) {
			event.locals.user = session.user;
			event.locals.sessionId = sessionId;
		}
	}

	// Ensure CSRF token exists
	if (!event.cookies.get(CSRF_COOKIE_NAME)) {
		event.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), getCsrfCookieOptions());
	}

	const response = await resolve(event);
	return response;
};

export const handle: Handle = sequence(handleDB, handleAuth, handleParaglide);

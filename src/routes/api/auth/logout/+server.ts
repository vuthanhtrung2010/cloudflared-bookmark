import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { invalidateSession, SESSION_COOKIE_NAME } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	try {
		if (locals.sessionId) {
			await invalidateSession(locals.db, locals.sessionId);
		}

		// Clear session cookie
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

		return json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ message: 'An error occurred during logout' }, { status: 500 });
	}
};

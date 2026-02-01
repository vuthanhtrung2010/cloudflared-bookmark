import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import {
	authenticateUser,
	createUserSession,
	SESSION_COOKIE_NAME,
	getSessionCookieOptions
} from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const { username, password } = (await request.json()) as {
			username?: string;
			password?: string;
		};

		if (!username || !password) {
			return json({ message: 'Username and password are required' }, { status: 400 });
		}

		const user = await authenticateUser(locals.db, username, password);

		if (!user) {
			return json({ message: 'Invalid username or password' }, { status: 401 });
		}

		// Create session
		const sessionId = await createUserSession(locals.db, user.id);

		// Set session cookie
		cookies.set(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());

		return json({
			message: 'Login successful',
			data: {
				user: {
					id: user.id,
					username: user.username
				}
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ message: 'An error occurred during login' }, { status: 500 });
	}
};

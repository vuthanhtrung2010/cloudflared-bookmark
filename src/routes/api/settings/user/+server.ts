import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';
import {
	registerUser,
	createUserSession,
	SESSION_COOKIE_NAME,
	getSessionCookieOptions
} from '$lib/server/auth.js';

interface CreateUserData {
	username?: string;
	password?: string;
	confirm_password?: string;
}

// GET - Get current user
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	return json({
		data: {
			user: {
				id: locals.user.id,
				username: locals.user.username
			}
		}
	});
};

// POST - Create new user (registration)
export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const { username, password, confirm_password } = (await request.json()) as CreateUserData;

		if (!username || !password) {
			return json({ message: 'Username and password are required' }, { status: 400 });
		}

		if (password !== confirm_password) {
			return json({ message: 'Passwords do not match' }, { status: 400 });
		}

		if (username.length < 3) {
			return json({ message: 'Username must be at least 3 characters' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ message: 'Password must be at least 6 characters' }, { status: 400 });
		}

		// Check if username already exists
		const existingUser = await repo.getUserByUsername(locals.db, username);
		if (existingUser) {
			return json({ message: 'Username already exists' }, { status: 400 });
		}

		// Register user (first user becomes admin)
		const user = await registerUser(locals.db, username, password);

		// Create session
		const sessionId = await createUserSession(locals.db, user.id);

		// Set session cookie
		cookies.set(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());

		return json({
			message: 'User created successfully',
			data: {
				user: {
					id: user.id,
					username: user.username
				}
			}
		});
	} catch (error) {
		console.error('User creation error:', error);
		return json({ message: 'An error occurred during user creation' }, { status: 500 });
	}
};

// DELETE - Delete user
export const DELETE: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		await repo.deleteUser(locals.db, locals.user.id);

		// Clear session cookie
		cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

		return json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('User deletion error:', error);
		return json({ message: 'An error occurred during user deletion' }, { status: 500 });
	}
};

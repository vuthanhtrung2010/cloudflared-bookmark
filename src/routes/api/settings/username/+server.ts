import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { username } = (await request.json()) as { username?: string };

		if (!username || username.length < 3) {
			return json({ message: 'Username must be at least 3 characters' }, { status: 400 });
		}

		// Check if username already exists
		const existingUser = await repo.getUserByUsername(locals.db, username);
		if (existingUser && existingUser.id !== locals.user.id) {
			return json({ message: 'Username already exists' }, { status: 400 });
		}

		await repo.updateUsername(locals.db, locals.user.id, username);

		return json({ message: 'Username updated successfully' });
	} catch (error) {
		console.error('Username update error:', error);
		return json({ message: 'An error occurred during username update' }, { status: 500 });
	}
};

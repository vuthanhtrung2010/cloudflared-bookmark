import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';
import { hashPassword } from '$lib/server/auth.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { password, confirm_password } = (await request.json()) as {
			password?: string;
			confirm_password?: string;
		};

		if (!password || password.length < 6) {
			return json({ message: 'Password must be at least 6 characters' }, { status: 400 });
		}

		if (password !== confirm_password) {
			return json({ message: 'Passwords do not match' }, { status: 400 });
		}

		const passwordHash = await hashPassword(password);
		await repo.updatePasswordHash(locals.db, locals.user.id, passwordHash);

		return json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Password update error:', error);
		return json({ message: 'An error occurred during password update' }, { status: 500 });
	}
};

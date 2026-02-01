import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { tag_id, color } = (await request.json()) as { tag_id?: number; color?: string };

		if (!tag_id) {
			return json({ message: 'Tag ID is required' }, { status: 400 });
		}

		await repo.updateTagColor(locals.db, tag_id, color || '');

		return json({ message: 'Tag color updated successfully' });
	} catch (error) {
		console.error('Update tag color error:', error);
		return json({ message: 'An error occurred while updating tag color' }, { status: 500 });
	}
};

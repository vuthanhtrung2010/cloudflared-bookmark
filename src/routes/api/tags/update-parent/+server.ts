import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { tag_id, parent } = (await request.json()) as { tag_id: number; parent: number };

		if (tag_id === undefined || parent === undefined) {
			return json({ message: 'Tag ID and Parent ID are required' }, { status: 400 });
		}

		await repo.updateTagParent(locals.db, tag_id, parent);

		return json({ message: 'Tag parent updated successfully' });
	} catch (error) {
		console.error('Update tag parent error:', error);
		return json({ message: 'An error occurred while updating tag parent' }, { status: 500 });
	}
};

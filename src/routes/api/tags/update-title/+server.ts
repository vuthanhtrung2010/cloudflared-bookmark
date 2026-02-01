import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { tag_id, title } = (await request.json()) as { tag_id?: number; title?: string };

		if (!tag_id) {
			return json({ message: 'Tag ID is required' }, { status: 400 });
		}

		if (!title) {
			return json({ message: 'Title is required' }, { status: 400 });
		}

		await repo.updateTagTitle(locals.db, tag_id, title);

		return json({ message: 'Tag title updated successfully' });
	} catch (error) {
		console.error('Update tag title error:', error);
		return json({ message: 'An error occurred while updating tag title' }, { status: 500 });
	}
};

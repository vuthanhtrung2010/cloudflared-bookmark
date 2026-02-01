import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { tag_id, pinned } = (await request.json()) as { tag_id?: number; pinned?: boolean };

		if (tag_id === undefined) {
			return json({ message: 'Tag ID is required' }, { status: 400 });
		}

		await repo.updateTagPinned(locals.db, tag_id, Boolean(pinned));

		return json({ message: 'Tag pinned status updated successfully' });
	} catch (error) {
		console.error('Update tag pinned error:', error);
		return json({ message: 'An error occurred while updating tag pinned status' }, { status: 500 });
	}
};

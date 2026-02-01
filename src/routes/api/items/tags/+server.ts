import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const data = (await request.json()) as {
			'item-ids'?: number[];
			'tag-ids-all'?: number[];
			'tag-ids-some'?: number[];
		};
		const itemIds: number[] = data['item-ids'] || [];
		const tagIdsAll: number[] = data['tag-ids-all'] || [];
		const tagIdsSome: number[] = data['tag-ids-some'] || [];

		if (itemIds.length === 0) {
			return json({ message: 'Item IDs are required' }, { status: 400 });
		}

		// Remove all existing tags except those in tagIdsSome (partial selection)
		const exceptTagIds = [...tagIdsSome];
		await repo.deleteItemsTags(locals.db, itemIds, exceptTagIds);

		// Attach the "all" tags to all items
		if (tagIdsAll.length > 0) {
			await repo.attachItemsTags(locals.db, itemIds, tagIdsAll);
		}

		return json({ message: 'Item tags updated successfully' });
	} catch (error) {
		console.error('Update item tags error:', error);
		return json({ message: 'An error occurred while updating item tags' }, { status: 500 });
	}
};

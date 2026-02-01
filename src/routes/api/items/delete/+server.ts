import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { 'item-ids': itemIds } = (await request.json()) as { 'item-ids'?: number[] };

		if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
			return json({ message: 'Item IDs are required' }, { status: 400 });
		}

		await repo.deleteItems(locals.db, itemIds);

		return json({ message: 'Items deleted successfully' });
	} catch (error) {
		console.error('Delete items error:', error);
		return json({ message: 'An error occurred while deleting items' }, { status: 500 });
	}
};

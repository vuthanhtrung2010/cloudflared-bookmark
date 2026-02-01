import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';
import { fetchUrlMetadata } from '$lib/server/metadata.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { 'item-ids': itemIds } = (await request.json()) as { 'item-ids'?: number[] };

		if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
			return json({ message: 'Item IDs are required' }, { status: 400 });
		}

		// Get URLs for the items
		const itemsUrls = await repo.getItemsUrls(locals.db, itemIds);

		// Fetch metadata for each URL and update
		const results: { id: number; success: boolean }[] = [];

		for (const [idStr, url] of Object.entries(itemsUrls)) {
			const id = parseInt(idStr, 10);
			const metadata = await fetchUrlMetadata(url);

			if (metadata) {
				await repo.updateItemsMetadata(locals.db, [id], {
					title: metadata.title,
					description: metadata.description,
					image: metadata.image
				});
				results.push({ id, success: true });
			} else {
				results.push({ id, success: false });
			}
		}

		return json({
			message: 'Metadata fetched successfully',
			data: { results }
		});
	} catch (error) {
		console.error('Fetch metadata error:', error);
		return json({ message: 'An error occurred while fetching metadata' }, { status: 500 });
	}
};

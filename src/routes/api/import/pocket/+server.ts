import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

interface PocketItem {
	resolved_title?: string;
	given_title?: string;
	resolved_url?: string;
	given_url?: string;
	excerpt?: string;
	time_added?: string;
	tags?: Record<string, { tag: string }>;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('pocket-zip') as File;

		if (!file) {
			return json({ message: 'Pocket export file is required' }, { status: 400 });
		}

		// Note: In a real implementation, you would unzip the file and parse the JSON
		// For Cloudflare Workers, we'll assume the file is just the JSON export
		const text = await file.text();

		let pocketData: { list?: Record<string, PocketItem> };
		try {
			pocketData = JSON.parse(text);
		} catch {
			return json({ message: 'Invalid Pocket export format' }, { status: 400 });
		}

		if (!pocketData.list) {
			return json({ message: 'No items found in Pocket export' }, { status: 400 });
		}

		// Create a map to track created tags
		const tagCache = new Map<string, number>();

		let importedCount = 0;

		for (const pocketItem of Object.values(pocketData.list)) {
			const title = pocketItem.resolved_title || pocketItem.given_title || '';
			const url = pocketItem.resolved_url || pocketItem.given_url;

			if (!url) continue;

			const createdAt = pocketItem.time_added
				? new Date(parseInt(pocketItem.time_added, 10) * 1000)
						.toISOString()
						.slice(0, 19)
						.replace('T', ' ')
				: undefined;

			const item = await repo.createItem(locals.db, {
				title: title || url,
				url,
				description: pocketItem.excerpt || '',
				comments: '',
				image: '',
				createdAt
			});

			// Handle tags
			if (pocketItem.tags) {
				const tagIds: number[] = [];

				for (const tagData of Object.values(pocketItem.tags)) {
					const tagName = tagData.tag;

					if (!tagCache.has(tagName)) {
						const tag = await repo.createTag(locals.db, tagName);
						tagCache.set(tagName, tag.id);
					}

					tagIds.push(tagCache.get(tagName)!);
				}

				if (tagIds.length > 0) {
					await repo.setItemTags(locals.db, item.id, tagIds);
				}
			}

			importedCount++;
		}

		return json({
			message: `Successfully imported ${importedCount} bookmarks from Pocket`
		});
	} catch (error) {
		console.error('Import Pocket error:', error);
		return json({ message: 'An error occurred while importing from Pocket' }, { status: 500 });
	}
};

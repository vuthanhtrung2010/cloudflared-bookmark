import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

// Fetch metadata for a URL
async function fetchUrlMetadata(url: string) {
	try {
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; Faved/1.0; +https://faved.dev)'
			}
		});

		if (!response.ok) {
			return null;
		}

		const html = await response.text();

		// Parse title - prefer og:title over regular title
		const ogTitleMatch =
			html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		const title = ogTitleMatch ? ogTitleMatch[1].trim() : titleMatch ? titleMatch[1].trim() : '';

		// Parse description from meta tags
		const descMatch =
			html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
		const description = descMatch ? descMatch[1].trim() : '';

		// Parse og:image
		const imageMatch =
			html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
		const image = imageMatch ? imageMatch[1].trim() : '';

		return { title, description, image };
	} catch (error) {
		console.error('Error fetching URL metadata:', error);
		return null;
	}
}

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

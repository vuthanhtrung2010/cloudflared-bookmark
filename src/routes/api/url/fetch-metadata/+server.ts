import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { fetchUrlMetadata } from '$lib/server/metadata.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { url } = (await request.json()) as { url?: string };

		if (!url) {
			return json({ message: 'URL is required' }, { status: 400 });
		}

		const metadata = await fetchUrlMetadata(decodeURIComponent(url));

		if (!metadata) {
			return json({ message: 'Could not fetch metadata for URL' }, { status: 400 });
		}

		return json({
			data: {
				title: metadata.title,
				description: metadata.description,
				image: metadata.image
			}
		});
	} catch (error) {
		console.error('Fetch URL metadata error:', error);
		return json({ message: 'An error occurred while fetching metadata' }, { status: 500 });
	}
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

// Fetch metadata for a single URL
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

		// Parse title
		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		const title = titleMatch ? titleMatch[1].trim() : '';

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

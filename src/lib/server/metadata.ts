/**
 * Metadata fetching and parsing utility
 */

export interface Metadata {
	title: string;
	description: string;
	image: string;
}

/**
 * Fetch and parse metadata for a single URL
 */
export async function fetchUrlMetadata(url: string): Promise<Metadata | null> {
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

		// Helper to resolve relative URLs
		const resolveUrl = (path: string | undefined): string => {
			if (!path) return '';
			try {
				// If it's already an absolute URL, return it
				if (path.startsWith('http')) return path;
				// Otherwise resolve against the original URL
				return new URL(path, url).href;
			} catch (e) {
				return path;
			}
		};

		// Parse title - prefer og:title
		const ogTitleMatch =
			html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
			html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:title["']/i);

		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		const title = (
			ogTitleMatch ? ogTitleMatch[1].trim() : titleMatch ? titleMatch[1].trim() : ''
		).trim();

		// Parse description
		const descMatch =
			html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
			html.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:description["']/i) ||
			html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);

		const description = (descMatch ? descMatch[1].trim() : '').trim();

		// Parse image
		const imageMatch =
			html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
			html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
			html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

		const image = resolveUrl(imageMatch ? imageMatch[1].trim() : '');

		return { title, description, image };
	} catch (error) {
		console.error('Error fetching URL metadata:', error);
		return null;
	}
}

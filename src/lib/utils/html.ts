/**
 * Decode HTML entities in a string
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
	if (!text) return '';

	const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
	if (textarea) {
		textarea.innerHTML = text;
		return textarea.value;
	}

	// Fallback for SSR - decode common entities
	return text
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&#x2F;/g, '/')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, ' ');
}

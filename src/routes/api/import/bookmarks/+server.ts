import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

interface BookmarkFolder {
	title: string;
	bookmarks: { title: string; url: string; addDate?: string }[];
	children: BookmarkFolder[];
}

function parseBookmarkHtml(html: string): BookmarkFolder {
	const root: BookmarkFolder = { title: 'Root', bookmarks: [], children: [] };
	const folderStack: BookmarkFolder[] = [root];

	// Simple regex-based parser for bookmark HTML
	const lines = html.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();

		// Folder title
		const folderMatch = trimmed.match(/<H3[^>]*>([^<]+)<\/H3>/i);
		if (folderMatch) {
			const newFolder: BookmarkFolder = {
				title: folderMatch[1],
				bookmarks: [],
				children: []
			};
			folderStack[folderStack.length - 1].children.push(newFolder);
			folderStack.push(newFolder);
			continue;
		}

		// Bookmark link
		const linkMatch = trimmed.match(
			/<A[^>]*HREF=["']([^"']+)["'][^>]*(?:ADD_DATE=["'](\d+)["'])?[^>]*>([^<]+)<\/A>/i
		);
		if (linkMatch) {
			const currentFolder = folderStack[folderStack.length - 1];
			currentFolder.bookmarks.push({
				url: linkMatch[1],
				addDate: linkMatch[2],
				title: linkMatch[3]
			});
			continue;
		}

		// End of folder
		if (trimmed.match(/<\/DL>/i) && folderStack.length > 1) {
			folderStack.pop();
		}
	}

	return root;
}

async function importFolder(
	db: Parameters<typeof repo.createItem>[0],
	folder: BookmarkFolder,
	parentTagId: number = 0
) {
	let imported = 0;

	// Create tag for this folder if it has a title
	let tagId = parentTagId;
	if (folder.title && folder.title !== 'Root') {
		const tag = await repo.createTag(db, folder.title, parentTagId);
		tagId = tag.id;
	}

	// Import bookmarks in this folder
	for (const bookmark of folder.bookmarks) {
		const createdAt = bookmark.addDate
			? new Date(parseInt(bookmark.addDate, 10) * 1000).toISOString().slice(0, 19).replace('T', ' ')
			: undefined;

		const item = await repo.createItem(db, {
			title: bookmark.title || bookmark.url,
			url: bookmark.url,
			description: '',
			comments: '',
			image: '',
			createdAt
		});

		// Apply tag if we have one
		if (tagId > 0) {
			await repo.setItemTags(db, item.id, [tagId]);
		}

		imported++;
	}

	// Recursively import child folders
	for (const child of folder.children) {
		imported += await importFolder(db, child, tagId);
	}

	return imported;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('browser-html') as File;

		if (!file) {
			return json({ message: 'Bookmark HTML file is required' }, { status: 400 });
		}

		const html = await file.text();
		const rootFolder = parseBookmarkHtml(html);
		const importedCount = await importFolder(locals.db, rootFolder);

		return json({
			message: `Successfully imported ${importedCount} bookmarks`
		});
	} catch (error) {
		console.error('Import bookmarks error:', error);
		return json({ message: 'An error occurred while importing bookmarks' }, { status: 500 });
	}
};

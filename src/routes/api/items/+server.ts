import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

interface ItemData {
	id?: number;
	title?: string;
	description?: string;
	url?: string;
	comments?: string;
	image?: string;
	tags?: number[];
	created_at?: string;
}

// GET - Get all items
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const items = await repo.getItems(locals.db);
		return json(items);
	} catch (error) {
		console.error('Get items error:', error);
		return json({ message: 'An error occurred while fetching items' }, { status: 500 });
	}
};

// POST - Create new item
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const data = (await request.json()) as ItemData;

		if (!data.url) {
			return json({ message: 'URL is required' }, { status: 400 });
		}

		if (!data.title) {
			return json({ message: 'Title is required' }, { status: 400 });
		}

		const item = await repo.createItem(locals.db, {
			title: data.title,
			description: data.description || '',
			url: data.url,
			comments: data.comments || '',
			image: data.image || '',
			createdAt: data.created_at
		});

		// Set tags if provided
		if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
			await repo.setItemTags(locals.db, item.id, data.tags);
		}

		return json({
			message: 'Item created successfully',
			data: { item_id: item.id }
		});
	} catch (error) {
		console.error('Create item error:', error);
		return json({ message: 'An error occurred while creating item' }, { status: 500 });
	}
};

// PATCH - Update item
export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const data = (await request.json()) as ItemData;

		if (!data.id) {
			return json({ message: 'Item ID is required' }, { status: 400 });
		}

		await repo.updateItem(locals.db, data.id, {
			title: data.title || '',
			description: data.description || '',
			url: data.url || '',
			comments: data.comments || '',
			image: data.image || ''
		});

		// Update tags if provided
		if (data.tags && Array.isArray(data.tags)) {
			await repo.setItemTags(locals.db, data.id, data.tags);
		}

		return json({ message: 'Item updated successfully' });
	} catch (error) {
		console.error('Update item error:', error);
		return json({ message: 'An error occurred while updating item' }, { status: 500 });
	}
};

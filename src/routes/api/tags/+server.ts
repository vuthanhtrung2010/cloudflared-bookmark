import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import * as repo from '$lib/server/repository.js';

// GET - Get all tags
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const tags = await repo.getTags(locals.db);
		return json(tags);
	} catch (error) {
		console.error('Get tags error:', error);
		return json({ message: 'An error occurred while fetching tags' }, { status: 500 });
	}
};

// POST - Create new tag
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { title, parent } = (await request.json()) as { title?: string; parent?: number };

		if (!title) {
			return json({ message: 'Tag title is required' }, { status: 400 });
		}

		const tag = await repo.createTag(locals.db, title, parent || 0);

		return json({
			message: 'Tag created successfully',
			data: { tag_id: tag.id }
		});
	} catch (error) {
		console.error('Create tag error:', error);
		return json({ message: 'An error occurred while creating tag' }, { status: 500 });
	}
};

// DELETE - Delete tag
export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ message: 'Not authenticated' }, { status: 401 });
	}

	try {
		const tagId = url.searchParams.get('tag_id');

		if (!tagId) {
			return json({ message: 'Tag ID is required' }, { status: 400 });
		}

		await repo.deleteTag(locals.db, parseInt(tagId, 10));

		return json({ message: 'Tag deleted successfully' });
	} catch (error) {
		console.error('Delete tag error:', error);
		return json({ message: 'An error occurred while deleting tag' }, { status: 500 });
	}
};

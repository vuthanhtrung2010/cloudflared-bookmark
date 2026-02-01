import { eq, desc, inArray, and, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './db/schema.js';

type DB = DrizzleD1Database<typeof schema>;

// Helper to get current timestamp
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// ==================== USERS ====================

export async function getUser(db: DB, userId: number) {
	return db.query.users.findFirst({
		where: eq(schema.users.id, userId)
	});
}

export async function getUserByUsername(db: DB, username: string) {
	return db.query.users.findFirst({
		where: eq(schema.users.username, username)
	});
}

export async function createUser(
	db: DB,
	username: string,
	passwordHash: string,
	isAdmin: boolean = false
) {
	const timestamp = now();
	const result = await db
		.insert(schema.users)
		.values({
			username,
			passwordHash,
			isAdmin,
			createdAt: timestamp,
			updatedAt: timestamp
		})
		.returning();
	return result[0];
}

export async function updateUsername(db: DB, userId: number, username: string) {
	return db
		.update(schema.users)
		.set({ username, updatedAt: now() })
		.where(eq(schema.users.id, userId));
}

export async function updatePasswordHash(db: DB, userId: number, passwordHash: string) {
	return db
		.update(schema.users)
		.set({ passwordHash, updatedAt: now() })
		.where(eq(schema.users.id, userId));
}

export async function deleteUser(db: DB, userId: number) {
	return db.delete(schema.users).where(eq(schema.users.id, userId));
}

export async function isUsersTableEmpty(db: DB) {
	const result = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
	return result[0].count === 0;
}

// ==================== SESSIONS ====================

export async function createSession(db: DB, userId: number, expiresAt: Date) {
	const sessionId = crypto.randomUUID();
	const timestamp = now();
	await db.insert(schema.sessions).values({
		id: sessionId,
		userId,
		expiresAt: expiresAt.toISOString(),
		createdAt: timestamp
	});
	return sessionId;
}

export async function getSession(db: DB, sessionId: string) {
	return db.query.sessions.findFirst({
		where: eq(schema.sessions.id, sessionId),
		with: {
			user: true
		}
	});
}

export async function deleteSession(db: DB, sessionId: string) {
	return db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
}

export async function deleteExpiredSessions(db: DB) {
	const currentTime = new Date().toISOString();
	return db.delete(schema.sessions).where(sql`${schema.sessions.expiresAt} < ${currentTime}`);
}

// ==================== ITEMS ====================

export async function getItems(db: DB) {
	const items = await db.select().from(schema.items).orderBy(desc(schema.items.id));

	// Get all item tags
	const itemsTags = await db.select().from(schema.itemsTags);

	// Build items with their tags
	const itemsTagsMap = new Map<number, number[]>();
	for (const it of itemsTags) {
		if (!itemsTagsMap.has(it.itemId)) {
			itemsTagsMap.set(it.itemId, []);
		}
		itemsTagsMap.get(it.itemId)!.push(it.tagId);
	}

	return items.map((item) => ({
		...item,
		url: decodeURIComponent(item.url),
		image: item.image ? decodeURIComponent(item.image) : '',
		tags: itemsTagsMap.get(item.id) || []
	}));
}

export async function createItem(
	db: DB,
	data: {
		title: string;
		description?: string;
		url: string;
		comments?: string;
		image?: string;
		createdAt?: string;
	}
) {
	const timestamp = data.createdAt || now();
	const result = await db
		.insert(schema.items)
		.values({
			title: data.title,
			description: data.description || '',
			url: encodeURIComponent(data.url),
			comments: data.comments || '',
			image: data.image ? encodeURIComponent(data.image) : '',
			createdAt: timestamp,
			updatedAt: null
		})
		.returning();
	return result[0];
}

export async function updateItem(
	db: DB,
	itemId: number,
	data: {
		title: string;
		description?: string;
		url: string;
		comments?: string;
		image?: string;
	}
) {
	return db
		.update(schema.items)
		.set({
			title: data.title,
			description: data.description || '',
			url: encodeURIComponent(data.url),
			comments: data.comments || '',
			image: data.image ? encodeURIComponent(data.image) : '',
			updatedAt: now()
		})
		.where(eq(schema.items.id, itemId));
}

export async function updateItemsMetadata(
	db: DB,
	itemIds: number[],
	data: { title: string; description: string; image: string }
) {
	if (itemIds.length === 0) return;
	return db
		.update(schema.items)
		.set({
			title: data.title,
			description: data.description,
			image: data.image ? encodeURIComponent(data.image) : '',
			updatedAt: now()
		})
		.where(inArray(schema.items.id, itemIds));
}

export async function deleteItems(db: DB, itemIds: number[]) {
	if (itemIds.length === 0) return;
	// Delete item tags first (cascade should handle this, but being explicit)
	await db.delete(schema.itemsTags).where(inArray(schema.itemsTags.itemId, itemIds));
	return db.delete(schema.items).where(inArray(schema.items.id, itemIds));
}

export async function getItemsUrls(db: DB, itemIds: number[]) {
	if (itemIds.length === 0) return {};
	const items = await db
		.select({ id: schema.items.id, url: schema.items.url })
		.from(schema.items)
		.where(inArray(schema.items.id, itemIds));

	const urlMap: Record<number, string> = {};
	for (const item of items) {
		urlMap[item.id] = decodeURIComponent(item.url);
	}
	return urlMap;
}

// ==================== TAGS ====================

export async function getTags(db: DB) {
	const tags = await db.select().from(schema.tags).orderBy(schema.tags.title);

	const tagsMap: Record<number, (typeof tags)[0]> = {};
	for (const tag of tags) {
		tagsMap[tag.id] = tag;
	}
	return tagsMap;
}

export async function createTag(db: DB, title: string, parent: number = 0) {
	const timestamp = now();
	const result = await db
		.insert(schema.tags)
		.values({
			title,
			description: '',
			color: '',
			parent,
			pinned: false,
			createdAt: timestamp,
			updatedAt: null
		})
		.returning();
	return result[0];
}

export async function updateTagTitle(db: DB, tagId: number, title: string) {
	return db.update(schema.tags).set({ title, updatedAt: now() }).where(eq(schema.tags.id, tagId));
}

export async function updateTagColor(db: DB, tagId: number, color: string) {
	return db.update(schema.tags).set({ color, updatedAt: now() }).where(eq(schema.tags.id, tagId));
}

export async function updateTagPinned(db: DB, tagId: number, pinned: boolean) {
	return db.update(schema.tags).set({ pinned, updatedAt: now() }).where(eq(schema.tags.id, tagId));
}

export async function updateTagParent(db: DB, tagId: number, parent: number) {
	return db.update(schema.tags).set({ parent, updatedAt: now() }).where(eq(schema.tags.id, tagId));
}

export async function deleteTag(db: DB, tagId: number) {
	// Delete item-tag relationships first
	await db.delete(schema.itemsTags).where(eq(schema.itemsTags.tagId, tagId));
	return db.delete(schema.tags).where(eq(schema.tags.id, tagId));
}

// ==================== ITEMS-TAGS ====================

export async function setItemTags(db: DB, itemId: number, tagIds: number[]) {
	// Delete all existing tags for this item
	await db.delete(schema.itemsTags).where(eq(schema.itemsTags.itemId, itemId));

	// Insert new tags
	if (tagIds.length > 0) {
		await db.insert(schema.itemsTags).values(
			tagIds.map((tagId) => ({
				itemId,
				tagId
			}))
		);
	}
}

export async function attachItemsTags(db: DB, itemIds: number[], tagIds: number[]) {
	if (tagIds.length === 0 || itemIds.length === 0) return;

	const values: { itemId: number; tagId: number }[] = [];
	for (const itemId of itemIds) {
		for (const tagId of tagIds) {
			values.push({ itemId, tagId });
		}
	}

	// Using INSERT OR IGNORE to avoid duplicates
	await db.insert(schema.itemsTags).values(values).onConflictDoNothing();
}

export async function deleteItemsTags(db: DB, itemIds: number[], exceptTagIds: number[] = []) {
	if (itemIds.length === 0) return;

	if (exceptTagIds.length === 0) {
		await db.delete(schema.itemsTags).where(inArray(schema.itemsTags.itemId, itemIds));
	} else {
		await db
			.delete(schema.itemsTags)
			.where(
				and(
					inArray(schema.itemsTags.itemId, itemIds),
					sql`${schema.itemsTags.tagId} NOT IN (${exceptTagIds.join(',')})`
				)
			);
	}
}

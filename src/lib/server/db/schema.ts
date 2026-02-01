import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at'),
	updatedAt: text('updated_at')
});

// Items table (bookmarks)
export const items = sqliteTable('items', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	url: text('url').notNull(),
	comments: text('comments').notNull().default(''),
	image: text('image').notNull().default(''),
	createdAt: text('created_at'),
	updatedAt: text('updated_at')
});

// Tags table
export const tags = sqliteTable('tags', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	description: text('description').notNull().default(''),
	color: text('color').notNull().default(''),
	parent: integer('parent').notNull().default(0),
	pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at'),
	updatedAt: text('updated_at')
});

// Items-Tags junction table for many-to-many relationship
export const itemsTags = sqliteTable(
	'items_tags',
	{
		itemId: integer('item_id')
			.notNull()
			.references(() => items.id, { onDelete: 'cascade' }),
		tagId: integer('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.itemId, table.tagId] })]
);

// Sessions table for authentication
export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at')
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type ItemTag = typeof itemsTags.$inferSelect;
export type NewItemTag = typeof itemsTags.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions)
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const itemsRelations = relations(items, ({ many }) => ({
	itemsTags: many(itemsTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
	itemsTags: many(itemsTags)
}));

export const itemsTagsRelations = relations(itemsTags, ({ one }) => ({
	item: one(items, {
		fields: [itemsTags.itemId],
		references: [items.id]
	}),
	tag: one(tags, {
		fields: [itemsTags.tagId],
		references: [tags.id]
	})
}));

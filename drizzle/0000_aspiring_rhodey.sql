CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`url` text NOT NULL,
	`comments` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `items_tags` (
	`item_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`item_id`, `tag_id`),
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`parent` integer DEFAULT 0 NOT NULL,
	`pinned` integer DEFAULT false NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
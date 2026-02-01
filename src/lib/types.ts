// Types for items, tags, and user
export interface ItemType {
	id: number;
	title: string;
	description: string;
	url: string;
	comments: string;
	image: string;
	tags: number[];
	createdAt: string | null;
	updatedAt: string | null;
}

export interface TagType {
	id: number;
	title: string;
	description: string;
	color: string;
	parent: number;
	pinned: boolean;
	createdAt: string | null;
	updatedAt: string | null;
}

export type TagsObjectType = Record<number, TagType>;

export interface UserType {
	id: number;
	username: string;
}

export type LayoutType = 'table' | 'cards' | 'list';

export interface CreateItemType {
	title: string;
	url: string;
	description?: string;
	comments?: string;
	image?: string;
	tags?: number[];
}

export interface UpdateItemType extends CreateItemType {
	id: number;
}

export interface CreateUserType {
	username: string;
	password: string;
	confirm_password: string;
}

export interface LoginType {
	username: string;
	password: string;
}

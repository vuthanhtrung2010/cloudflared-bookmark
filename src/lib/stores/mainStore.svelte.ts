import { toast } from 'svelte-sonner';
import type {
	ItemType,
	TagsObjectType,
	UserType,
	CreateItemType,
	UpdateItemType,
	CreateUserType,
	LoginType,
	LayoutType,
	TagType
} from '$lib/types.js';

interface ApiResponse {
	message?: string;
	data?: unknown;
}

// State using Svelte 5 runes module-level state
let items = $state<ItemType[]>([]);
let tags = $state<TagsObjectType>({});
let user = $state<UserType | null>(null);

// UI State
let isLoading = $state(false);
let isAuthRequired = $state(false);
let isShowEditModal = $state(false);
let editingItem = $state<ItemType | null>(null);
let isOpenSettingsModal = $state(false);

let layout = $state<LayoutType>('table');

function setLayout(newLayout: LayoutType) {
	layout = newLayout;
	if (typeof window !== 'undefined') {
		localStorage.setItem('preferred_layout', newLayout);
	}
}

// Bulk selection
let selectedItemIds = $state<number[]>([]);

// Tag filtering
let selectedTagId = $state<number | string | null>(null);

// Request helper
async function runRequest<T>(
	endpoint: string,
	method: string,
	bodyData?: object | FormData,
	defaultErrorMessage: string = 'An error occurred',
	skipSuccessMessage: boolean = false,
	skipErrorMessage: boolean = false
): Promise<{ success: boolean; data?: T; message?: string }> {
	try {
		const options: RequestInit = {
			method,
			headers:
				bodyData instanceof FormData
					? {}
					: {
							'Content-Type': 'application/json'
						}
		};

		if (bodyData) {
			options.body = bodyData instanceof FormData ? bodyData : JSON.stringify(bodyData);
		}

		const response = await fetch(endpoint, options);
		const result = (await response.json()) as ApiResponse;

		if (!response.ok) {
			if (!skipErrorMessage) {
				toast.error(result.message || defaultErrorMessage);
			}
			return { success: false, message: result.message };
		}

		if (!skipSuccessMessage && result.message) {
			toast.success(result.message);
		}

		return { success: true, data: (result.data || result) as T };
	} catch (error) {
		console.error('Request error:', error);
		if (!skipErrorMessage) {
			toast.error(defaultErrorMessage);
		}
		return { success: false, message: defaultErrorMessage };
	}
}

// Data fetching
async function fetchItems() {
	isLoading = true;
	const result = await runRequest<ItemType[]>(
		'/api/items',
		'GET',
		undefined,
		'Failed to fetch items',
		true,
		false
	);

	if (result.success && result.data) {
		items = result.data;
	}
	isLoading = false;
}

async function fetchTags() {
	const result = await runRequest<TagsObjectType>(
		'/api/tags',
		'GET',
		undefined,
		'Failed to fetch tags',
		true,
		false
	);

	if (result.success && result.data) {
		tags = result.data;
	}
}

async function getUser(noErrorEmit: boolean = false) {
	const result = await runRequest<{ user: UserType }>(
		'/api/settings/user',
		'GET',
		undefined,
		'Failed to get user',
		true,
		noErrorEmit
	);

	if (result.success && result.data) {
		user = result.data.user;
		isAuthRequired = false;
	} else {
		isAuthRequired = true;
	}
}

// Authentication
async function login(values: LoginType) {
	const result = await runRequest<{ user: UserType }>(
		'/api/auth/login',
		'POST',
		values,
		'Failed to login'
	);

	if (result.success && result.data) {
		user = result.data.user;
		isAuthRequired = false;
		return true;
	}
	return false;
}

async function logout() {
	const result = await runRequest('/api/auth/logout', 'POST', {}, 'Failed to logout');

	if (result.success) {
		user = null;
		items = [];
		isAuthRequired = true;
		return true;
	}
	return false;
}

async function createUser(values: CreateUserType) {
	const result = await runRequest<{ user: UserType }>(
		'/api/settings/user',
		'POST',
		values,
		'Failed to create user'
	);

	if (result.success && result.data) {
		user = result.data.user;
		isAuthRequired = false;
		return true;
	}
	return false;
}

// Item CRUD
async function createItem(values: CreateItemType) {
	const result = await runRequest<{ item_id: number }>(
		'/api/items',
		'POST',
		values,
		'Failed to create item'
	);

	if (result.success) {
		await fetchItems();
		return true;
	}
	return false;
}

async function updateItem(values: UpdateItemType) {
	const result = await runRequest('/api/items', 'PATCH', values, 'Failed to update item');

	if (result.success) {
		await fetchItems();
		closeEditModal();
		return true;
	}
	return false;
}

async function deleteItems(itemIds: number[]) {
	const result = await runRequest(
		'/api/items/delete',
		'POST',
		{ 'item-ids': itemIds },
		'Failed to delete items'
	);

	if (result.success) {
		await fetchItems();
		selectedItemIds = [];
		return true;
	}
	return false;
}

async function fetchMetadata(itemIds: number[]) {
	const result = await runRequest(
		'/api/items/fetch-metadata',
		'POST',
		{ 'item-ids': itemIds },
		'Failed to fetch metadata'
	);

	if (result.success) {
		await fetchItems();
		return true;
	}
	return false;
}

async function updateItemsTags(itemIds: number[], tagIdsAll: number[], tagIdsSome: number[]) {
	const result = await runRequest(
		'/api/items/tags',
		'PATCH',
		{
			'item-ids': itemIds,
			'tag-ids-all': tagIdsAll,
			'tag-ids-some': tagIdsSome
		},
		'Failed to update item tags'
	);

	if (result.success) {
		await fetchItems();
		return true;
	}
	return false;
}

// Tag CRUD
async function createTag(title: string, parent: number = 0) {
	// Support "A/B/C" syntax for hierarchical creation
	const parts = title
		.split('/')
		.map((s) => s.trim())
		.filter(Boolean);

	if (parts.length > 1) {
		let currentParentId = parent;
		let lastCreatedId: number | null = null;

		for (const part of parts) {
			// Check if this tag already exists under the current parent
			const existing = Object.values(tags as Record<number, TagType>).find(
				(t) => t.title === part && t.parent === currentParentId
			);

			if (existing) {
				currentParentId = existing.id;
				lastCreatedId = existing.id;
			} else {
				const result = await runRequest<{ tag_id: number }>(
					'/api/tags',
					'POST',
					{ title: part, parent: currentParentId },
					'Failed to create hierarchical tag'
				);

				if (result.success && result.data) {
					currentParentId = result.data.tag_id;
					lastCreatedId = result.data.tag_id;
					// Fetch tags after each creation to keep the local state updated for the next part
					await fetchTags();
				} else {
					return null;
				}
			}
		}
		return lastCreatedId;
	}

	// Normal creation
	const result = await runRequest<{ tag_id: number }>(
		'/api/tags',
		'POST',
		{ title, parent },
		'Failed to create tag'
	);

	if (result.success) {
		await fetchTags();
		return result.data?.tag_id;
	}
	return null;
}

async function deleteTag(tagId: number) {
	const result = await runRequest(
		`/api/tags?tag_id=${tagId}`,
		'DELETE',
		undefined,
		'Failed to delete tag'
	);

	if (result.success) {
		await fetchTags();
		return true;
	}
	return false;
}

async function updateTagTitle(tagId: number, title: string) {
	const result = await runRequest(
		'/api/tags/update-title',
		'PATCH',
		{ tag_id: tagId, title },
		'Failed to update tag title'
	);

	if (result.success) {
		await fetchTags();
		return true;
	}
	return false;
}

async function updateTagColor(tagId: number, color: string) {
	const result = await runRequest(
		'/api/tags/update-color',
		'PATCH',
		{ tag_id: tagId, color },
		'Failed to update tag color'
	);

	if (result.success) {
		await fetchTags();
		return true;
	}
	return false;
}

async function updateTagPinned(tagId: number, pinned: boolean) {
	const result = await runRequest(
		'/api/tags/update-pinned',
		'PATCH',
		{ tag_id: tagId, pinned },
		'Failed to update tag pinned status'
	);

	if (result.success) {
		await fetchTags();
		return true;
	}
	return false;
}

async function updateTagParent(tagId: number, parent: number) {
	const result = await runRequest(
		'/api/tags/update-parent',
		'PATCH',
		{ tag_id: tagId, parent },
		'Failed to update tag parent'
	);

	if (result.success) {
		await fetchTags();
		return true;
	}
	return false;
}

// Settings
async function updateUsername(username: string) {
	const result = await runRequest(
		'/api/settings/username',
		'PATCH',
		{ username },
		'Failed to update username'
	);

	if (result.success && user) {
		user = { ...user, username };
		return true;
	}
	return false;
}

async function updatePassword(password: string, confirm_password: string) {
	const result = await runRequest(
		'/api/settings/password',
		'PATCH',
		{ password, confirm_password },
		'Failed to update password'
	);

	return result.success;
}

async function deleteUser() {
	const result = await runRequest(
		'/api/settings/user',
		'DELETE',
		undefined,
		'Failed to delete user'
	);

	if (result.success) {
		user = null;
		items = [];
		isAuthRequired = true;
		return true;
	}
	return false;
}

// URL Metadata
async function fetchUrlMetadata(url: string) {
	const result = await runRequest<{ title: string; description: string; image: string }>(
		'/api/url/fetch-metadata',
		'POST',
		{ url },
		'Failed to fetch URL metadata',
		true,
		true
	);

	return result.success ? result.data : null;
}

// UI Actions
function openEditModal(item: ItemType) {
	editingItem = item;
	isShowEditModal = true;
}

function closeEditModal() {
	editingItem = null;
	isShowEditModal = false;
}

function openSettingsModal() {
	isOpenSettingsModal = true;
}

function closeSettingsModal() {
	isOpenSettingsModal = false;
}

function toggleItemSelection(itemId: number) {
	if (selectedItemIds.includes(itemId)) {
		selectedItemIds = selectedItemIds.filter((id) => id !== itemId);
	} else {
		selectedItemIds = [...selectedItemIds, itemId];
	}
}

function selectAllItems() {
	selectedItemIds = items.map((item) => item.id);
}

function deselectAllItems() {
	selectedItemIds = [];
}

function setSelectedTagId(tagId: number | string | null) {
	selectedTagId = tagId;
}

function clearSelectedTag() {
	selectedTagId = null;
}

// Init
async function init() {
	// Initialize layout from localStorage if available
	if (typeof window !== 'undefined') {
		const savedLayout = localStorage.getItem('preferred_layout') as LayoutType;
		if (savedLayout && ['cards', 'list', 'table'].includes(savedLayout)) {
			layout = savedLayout;
		}
	}

	await getUser(true);
	if (!isAuthRequired) {
		await Promise.all([fetchItems(), fetchTags()]);
	}
}

// Export the store as a reactive object
export const store = {
	// State getters (reactive)
	get items() {
		return items;
	},
	get tags() {
		return tags;
	},
	get user() {
		return user;
	},
	get isLoading() {
		return isLoading;
	},
	get isAuthRequired() {
		return isAuthRequired;
	},
	get isShowEditModal() {
		return isShowEditModal;
	},
	get editingItem() {
		return editingItem;
	},
	get isOpenSettingsModal() {
		return isOpenSettingsModal;
	},
	get layout() {
		return layout;
	},
	get selectedItemIds() {
		return selectedItemIds;
	},
	get selectedTagId() {
		return selectedTagId;
	},

	// Actions
	init,
	fetchItems,
	fetchTags,
	getUser,
	login,
	logout,
	createUser,
	createItem,
	updateItem,
	deleteItems,
	fetchMetadata,
	updateItemsTags,
	createTag,
	deleteTag,
	updateTagTitle,
	updateTagColor,
	updateTagPinned,
	updateTagParent,
	updateUsername,
	updatePassword,
	deleteUser,
	fetchUrlMetadata,
	openEditModal,
	closeEditModal,
	openSettingsModal,
	closeSettingsModal,
	setLayout,
	toggleItemSelection,
	selectAllItems,
	deselectAllItems,
	setSelectedTagId,
	clearSelectedTag
};

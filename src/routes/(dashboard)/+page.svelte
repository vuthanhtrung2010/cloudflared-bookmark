<script lang="ts">
	import { store } from '$lib/stores/mainStore.svelte.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Plus } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SearchInput from '$lib/components/Items/SearchInput.svelte';
	import SortDropdown from '$lib/components/Items/SortDropdown.svelte';
	import ViewButton from '$lib/components/Items/ViewButton.svelte';
	import BulkActions from '$lib/components/Items/BulkActions.svelte';
	import TagBadge from '$lib/components/Items/TagBadge.svelte';
	import PreviewImage from '$lib/components/Items/PreviewImage.svelte';
	import ItemCard from '$lib/components/Items/ItemCard.svelte';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import { decodeHtmlEntities } from '$lib/utils/html.js';

	// Local state
	let searchQuery = $state('');
	let sortField = $state<string>('createdAt');
	let sortDirection = $state<'asc' | 'desc'>('desc');
	let visibleFields = $state<Record<string, boolean>>({});

	// Get filter tag from URL
	let filterTagId = $derived.by(() => {
		const tagParam = page.url.searchParams.get('tag');
		if (tagParam === 'none') return 'none';
		return tagParam ? parseInt(tagParam, 10) : null;
	});

	// Sync URL tag with store
	$effect(() => {
		if (filterTagId !== store.selectedTagId) {
			store.setSelectedTagId(filterTagId);
		}
	});

	let filterTag = $derived(typeof filterTagId === 'number' ? store.tags[filterTagId] : null);

	// Filter and sort items
	let filteredItems = $derived.by(() => {
		let result = [...store.items];

		// Filter by search
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(item) =>
					item.title?.toLowerCase().includes(query) ||
					item.url?.toLowerCase().includes(query) ||
					item.description?.toLowerCase().includes(query)
			);
		}

		// Filter by tag
		if (filterTagId === 'none') {
			result = result.filter((item) => item.tags.length === 0);
		} else if (typeof filterTagId === 'number') {
			result = result.filter((item) => item.tags.includes(filterTagId));
		}

		// Sort
		result.sort((a, b) => {
			let aValue: string | null = null;
			let bValue: string | null = null;

			if (sortField === 'title') {
				aValue = a.title?.toLowerCase() || '';
				bValue = b.title?.toLowerCase() || '';
			} else if (sortField === 'createdAt') {
				aValue = a.createdAt;
				bValue = b.createdAt;
			} else if (sortField === 'updatedAt') {
				aValue = a.updatedAt;
				bValue = b.updatedAt;
			} else if (sortField === 'url') {
				aValue = a.url?.toLowerCase() || '';
				bValue = b.url?.toLowerCase() || '';
			} else if (sortField === 'description') {
				aValue = a.description?.toLowerCase() || '';
				bValue = b.description?.toLowerCase() || '';
			} else if (sortField === 'comments') {
				aValue = a.comments?.toLowerCase() || '';
				bValue = b.comments?.toLowerCase() || '';
			}

			if (!aValue && !bValue) return 0;
			if (!aValue) return sortDirection === 'asc' ? -1 : 1;
			if (!bValue) return sortDirection === 'asc' ? 1 : -1;

			const comparison = aValue.localeCompare(bValue);
			return sortDirection === 'asc' ? comparison : -comparison;
		});

		return result;
	});

	let selectedCount = $derived(store.selectedItemIds.length);

	function handleSearch(value: string) {
		searchQuery = value;
	}

	function handleSort(field: string, direction: 'asc' | 'desc') {
		sortField = field;
		sortDirection = direction;
	}

	function handleFieldToggle(field: string, visible: boolean) {
		visibleFields = { ...visibleFields, [field]: visible };
	}

	function handleToggleSelect(itemId: number) {
		store.toggleItemSelection(itemId);
	}

	function handleClearSelection() {
		store.deselectAllItems();
	}

	// Get handleNewItem from layout context
	const handleNewItem = getContext<() => void>('handleNewItem');

	function handleAddItem() {
		handleNewItem?.();
	}

	function isFieldVisible(field: string): boolean {
		return visibleFields[field] !== false;
	}
</script>

<svelte:head>
	<title>{filterTag ? `${filterTag.title} - ` : ''}Bookmarks</title>
</svelte:head>

<!-- Header toolbar matching Faved -->
<header class="bg-background sticky top-0 z-50 flex h-(--header-height) w-full items-center gap-1.5 border-b px-4 backdrop-blur-sm">
	<div class="flex h-14 items-center space-x-1">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="h-8 min-h-0!" />
	</div>

	<ViewButton {visibleFields} onFieldToggle={handleFieldToggle} />
	<SearchInput value={searchQuery} onSearch={handleSearch} />
	<SortDropdown {sortField} {sortDirection} onSort={handleSort} />

	<Button variant="default" onclick={handleAddItem}>
		<Plus class="size-4" />
		Add
	</Button>
</header>

<div class="flex-1 overflow-auto">
	<!-- Bulk Actions -->
	{#if selectedCount > 0}
		<BulkActions {selectedCount} onClear={handleClearSelection} selectedItemIds={store.selectedItemIds} />
	{/if}

	<!-- Content -->
	{#if store.isLoading}
		<div class="text-muted-foreground flex h-full items-center justify-center text-lg">Loading...</div>
	{:else if filteredItems.length === 0}
		<div class="text-muted-foreground flex h-full items-center justify-center text-lg">No items.</div>
	{:else}
		<div class="flex h-full flex-col justify-between gap-5 item-list--{store.layout}">
			{#if store.layout === 'cards'}
				<!-- Cards Layout matching Faved -->
				<div class="m-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
					{#each filteredItems as item (item.id)}
						<Card.Root
							data-state={store.selectedItemIds.includes(item.id) ? 'selected' : undefined}
							class="onhover-container data-[state=selected]:bg-muted/50 relative overflow-hidden p-0! gap-0! shadow-xs transition-colors"
						>
							{#if item.image && isFieldVisible('image')}
								<PreviewImage imageUrl={item.image} />
							{/if}
							<Card.Content class="flex h-full flex-col gap-3 p-4 text-left">
								<!-- Selection checkbox -->
								<div class="select-container absolute top-2 left-2 z-40">
									<input
										type="checkbox"
										checked={store.selectedItemIds.includes(item.id)}
										onchange={() => handleToggleSelect(item.id)}
										class="onhover-visible bg-background size-4 rounded border {store.selectedItemIds.includes(item.id) ? 'opacity-100!' : ''}"
									/>
								</div>

								<!-- Actions -->
								<div class="actions-container absolute top-2 right-2 z-40">
									<ItemCard {item} />
								</div>


								<!-- Title -->
								{#if item.title && isFieldVisible('title')}
									<h4 class="title-container line-clamp-3 scroll-m-20 font-semibold tracking-tight lg:text-lg xl:text-xl">
										{decodeHtmlEntities(item.title)}
									</h4>
								{/if}

								<!-- URL -->
								{#if item.url && isFieldVisible('url')}
									<div class="url-container line-clamp-3 break-all text-sm lg:text-base">
										<a href={item.url} target="_blank" rel="noopener noreferrer" class="underline">
											{item.url}
										</a>
									</div>
								{/if}

								<!-- Tags -->
								{#if item.tags && item.tags.length > 0 && isFieldVisible('tags')}
									<div class="tags-container flex w-full flex-wrap gap-1 py-2 leading-relaxed">
										{#each item.tags as tagId (tagId)}
											<TagBadge {tagId} />
										{/each}
									</div>
								{/if}

								<!-- Description -->
								{#if item.description && isFieldVisible('description')}
									<div class="description-container">
										<div class="text-muted-foreground line-clamp-3 whitespace-pre-line text-sm leading-6 xl:line-clamp-none">
											{decodeHtmlEntities(item.description)}
										</div>
									</div>
								{/if}

								<!-- Notes -->
								{#if item.comments && isFieldVisible('comments')}
									<div class="comments-container">
										<blockquote class="text-muted-foreground line-clamp-3 whitespace-pre-line border-l-2 pl-6 text-sm italic xl:line-clamp-none">
											{item.comments}
										</blockquote>
									</div>
								{/if}

								<!-- Created date -->
								{#if item.createdAt && isFieldVisible('createdAt')}
									<div class="created_at-container text-muted-foreground text-xs lg:text-sm">
										<span class="font-medium leading-none">Created date:</span> {item.createdAt}
									</div>
								{/if}

								<!-- Updated date -->
								{#if item.updatedAt && isFieldVisible('updatedAt')}
									<div class="updated_at-container text-muted-foreground text-xs lg:text-sm">
										<span class="font-medium leading-none">Updated date:</span> {item.updatedAt}
									</div>
								{/if}
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{:else if store.layout === 'list'}
				<!-- List Layout -->
				<div class="m-4 space-y-2">
					{#each filteredItems as item (item.id)}
						<Card.Root class="onhover-container bg-card hover:bg-muted/50 relative transition-colors">
							<Card.Content class="flex items-start gap-4 p-4">
								{#if item.image && isFieldVisible('image')}
									<div class="item__image-container">
										<PreviewImage imageUrl={item.image} />
									</div>
								{/if}
								<div class="min-w-0 flex-1">
									<a
										href={item.url}
										target="_blank"
										rel="noopener noreferrer"
										class="block truncate font-semibold hover:underline"
									>
										{decodeHtmlEntities(item.title) || item.url}
									</a>
									{#if item.description && isFieldVisible('description')}
										<p class="text-muted-foreground mt-1 line-clamp-2 text-sm">{decodeHtmlEntities(item.description)}</p>
									{/if}
									{#if item.tags && item.tags.length > 0 && isFieldVisible('tags')}
										<div class="mt-2 flex flex-wrap gap-1">
											{#each item.tags as tagId (tagId)}
												<TagBadge {tagId} />
											{/each}
										</div>
									{/if}
								</div>
								<div class="actions-container">
									<ItemCard {item} />
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{:else}
				<!-- Table view - matching Faved exactly -->
				<table class="w-full">
					<thead>
						<tr class="border-b">
							<!-- Select column -->
							<th class="h-10 px-2 text-left align-middle"></th>
							{#if isFieldVisible('image')}
								<th class="h-10 px-2 text-left align-middle text-sm font-medium">Image</th>
							{/if}
							{#if isFieldVisible('title')}
								<th class="h-10 min-w-xs px-2 text-left align-middle text-sm font-medium">Title</th>
							{/if}
							{#if isFieldVisible('url')}
								<th class="h-10 min-w-xs px-2 text-left align-middle text-sm font-medium break-all">URL</th>
							{/if}
							{#if isFieldVisible('tags')}
								<th class="h-10 min-w-xs px-2 text-left align-middle text-sm font-medium">Tags</th>
							{/if}
							{#if isFieldVisible('description')}
								<th class="h-10 min-w-xs px-2 text-left align-middle text-sm font-medium">Description</th>
							{/if}
							{#if isFieldVisible('comments')}
								<th class="h-10 min-w-xs px-2 text-left align-middle text-sm font-medium">Notes</th>
							{/if}
							{#if isFieldVisible('createdAt')}
								<th class="h-10 min-w-[170px] px-2 text-left align-middle text-sm font-medium">Created date</th>
							{/if}
							{#if isFieldVisible('updatedAt')}
								<th class="h-10 min-w-[170px] px-2 text-left align-middle text-sm font-medium">Updated date</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each filteredItems as item (item.id)}
							{@const isSelected = store.selectedItemIds.includes(item.id)}
							<tr
								class="onhover-container hover:bg-muted/50 border-b transition-colors data-[state=selected]:bg-muted"
								data-state={isSelected ? 'selected' : undefined}
							>
								<!-- Select cell -->
								<td class="text-left align-middle whitespace-normal break-normal px-2">
									<input
										type="checkbox"
										checked={isSelected}
										onchange={() => handleToggleSelect(item.id)}
										class="bg-primary-foreground onhover-visible size-4 rounded border {isSelected ? 'opacity-100!' : ''}"
									/>
								</td>
								{#if isFieldVisible('image')}
									<td class="text-left align-middle whitespace-normal break-normal px-2 py-2">
										{#if item.image}
											<PreviewImage imageUrl={item.image} class="" />
										{/if}
									</td>
								{/if}
								{#if isFieldVisible('title')}
									<td class="min-w-xs text-left align-middle whitespace-normal break-normal px-2">
										<span title={item.title}>{item.title || 'Untitled'}</span>
									</td>
								{/if}
								{#if isFieldVisible('url')}
									<td class="min-w-xs text-left align-middle whitespace-normal break-all px-2">
										<a href={item.url} target="_blank" rel="noopener noreferrer" class="underline">
											{item.url}
										</a>
									</td>
								{/if}
								{#if isFieldVisible('tags')}
									<td class="min-w-xs text-left align-middle whitespace-normal break-normal px-2">
										<div class="flex w-full flex-wrap gap-1 py-2 leading-relaxed">
											{#each item.tags as tagId (tagId)}
												<TagBadge {tagId} />
											{/each}
										</div>
									</td>
								{/if}
								{#if isFieldVisible('description')}
									<td class="min-w-xs text-left align-middle whitespace-normal break-normal px-2">
										{decodeHtmlEntities(item.description)}
									</td>
								{/if}
								{#if isFieldVisible('comments')}
									<td class="min-w-xs text-left align-middle whitespace-normal break-normal px-2">
										{decodeHtmlEntities(item.comments)}
									</td>
								{/if}
								{#if isFieldVisible('createdAt')}
									<td class="text-muted-foreground min-w-[170px] text-left align-middle whitespace-normal break-normal px-2 text-sm">{item.createdAt || '-'}</td>
								{/if}
								{#if isFieldVisible('updatedAt')}
									<td class="text-muted-foreground min-w-[170px] text-left align-middle whitespace-normal break-normal px-2 text-sm">{item.updatedAt || '-'}</td>
								{/if}
								<!-- Actions pinned to right -->
								<td class="sticky right-0 z-10 bg-transparent text-left align-middle px-2">
									<div class="onhover-visible">
										<ItemCard {item} />
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}
</div>

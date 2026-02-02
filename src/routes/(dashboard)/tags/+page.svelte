<script lang="ts">
	import { Tag, Pencil, Trash, Pin, PinOff, Palette, MoreVertical } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import type { TagType } from '$lib/types.js';
	import { colorPresets } from '$lib/utils/colors.js';

	import { getTagPath, getDescendantIds, sortTagsAlphabetically } from '$lib/utils/tags.js';

	let newTagTitle = $state('');
	let newTagParent = $state<number>(0);
	let isCreating = $state(false);

	// Dialog states
	let showRenameDialog = $state(false);
	let showColorDialog = $state(false);
	let showDeleteDialog = $state(false);
	let showEditDialog = $state(false); // New unified edit dialog

	let selectedTag = $state<TagType | null>(null);
	let editTitle = $state('');
	let editColor = $state('');
	let editParent = $state<number>(0);
	let isProcessing = $state(false);

	let tagsMap = $derived(store.tags as Record<number, TagType>);
	let allTags = $derived(Object.values(tagsMap) as TagType[]);
	let sortedTags = $derived(sortTagsAlphabetically(allTags, tagsMap));

	async function handleCreateTag() {
		if (!newTagTitle.trim()) return;
		isCreating = true;
		try {
			await store.createTag(newTagTitle.trim(), newTagParent);
			newTagTitle = '';
			newTagParent = 0;
		} finally {
			isCreating = false;
		}
	}

	function openEditDialog(tag: TagType) {
		selectedTag = tag;
		editTitle = tag.title;
		editColor = tag.color || '';
		editParent = tag.parent || 0;
		showEditDialog = true;
	}

	function openDeleteDialog(tag: TagType) {
		selectedTag = tag;
		showDeleteDialog = true;
	}

	async function handleUpdateTag() {
		if (!selectedTag) return;
		isProcessing = true;
		try {
			if (editTitle.trim() !== selectedTag.title) {
				await store.updateTagTitle(selectedTag.id, editTitle.trim());
			}
			if (editColor !== selectedTag.color) {
				await store.updateTagColor(selectedTag.id, editColor);
			}
			if (editParent !== selectedTag.parent) {
				// We need an updateTagParent method in store
				await store.updateTagParent?.(selectedTag.id, editParent);
			}
			showEditDialog = false;
		} finally {
			isProcessing = false;
		}
	}

	async function handleTogglePinned(tag: TagType) {
		await store.updateTagPinned(tag.id, !tag.pinned);
	}

	async function handleDelete() {
		if (!selectedTag) return;
		isProcessing = true;
		try {
			await store.deleteTag(selectedTag.id);
			showDeleteDialog = false;
		} finally {
			isProcessing = false;
		}
	}

	// Filter options for parent selection (no self, no descendants)
	let parentOptions = $derived.by(() => {
		if (!selectedTag) return allTags;
		const descendants = getDescendantIds(selectedTag.id, tagsMap);
		return allTags.filter((t) => t.id !== selectedTag!.id && !descendants.includes(t.id));
	});
</script>

<svelte:head>
	<title>Tags - Bookmarks</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6 p-6">
	<div>
		<h2 class="text-2xl font-bold">Tags</h2>
		<p class="text-muted-foreground">Manage your bookmark tags</p>
	</div>

	<!-- Create new tag -->
	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleCreateTag();
		}}
		class="flex flex-wrap gap-2"
	>
		<Input
			type="text"
			bind:value={newTagTitle}
			placeholder="New tag name..."
			class="max-w-sm min-w-[200px]"
		/>
		<select
			bind:value={newTagParent}
			class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
		>
			<option value={0}>No Parent (Top Level)</option>
			{#each sortTagsAlphabetically(allTags, tagsMap) as parent}
				<option value={parent.id}>{getTagPath(parent.id, tagsMap)}</option>
			{/each}
		</select>
		<Button type="submit" disabled={isCreating || !newTagTitle.trim()}>
			{isCreating ? 'Creating...' : 'Create Tag'}
		</Button>
	</form>

	<!-- Tag list -->
	{#if sortedTags.length === 0}
		<div class="py-8 text-center text-muted-foreground">
			No tags yet. Create your first tag above.
		</div>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each sortedTags as tag (tag.id)}
				{@const path = getTagPath(tag.id, tagsMap)}
				<div
					class="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:shadow-sm"
					style={tag.color ? `border-left: 4px solid ${tag.color}` : ''}
				>
					<Tag class="size-5 shrink-0" style={tag.color ? `color: ${tag.color}` : ''} />
					<div class="min-w-0 flex-1">
						<a
							href={`/?tag=${tag.id}`}
							class="block truncate font-medium hover:underline"
							title={path}
						>
							{tag.title}
						</a>
						<div
							class="flex items-center gap-2 text-[10px] tracking-wider text-muted-foreground uppercase"
						>
							{#if tag.parent !== 0}
								<span class="truncate opacity-70">{path.split(' / ').slice(0, -1).join(' / ')}</span
								>
							{:else}
								<span>Root</span>
							{/if}
							{#if tag.pinned}
								<span class="ml-auto font-bold text-primary">Pinned</span>
							{/if}
						</div>
					</div>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon"
									class="size-8 opacity-0 transition-opacity group-hover:opacity-100"
								>
									<MoreVertical class="size-4" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item onclick={() => openEditDialog(tag)}>
								<Pencil class="mr-2 size-4" />
								Edit Tag
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => handleTogglePinned(tag)}>
								{#if tag.pinned}
									<PinOff class="mr-2 size-4" />
									Unpin
								{:else}
									<Pin class="mr-2 size-4" />
									Pin to Sidebar
								{/if}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onclick={() => openDeleteDialog(tag)}
								class="text-destructive focus:text-destructive"
							>
								<Trash class="mr-2 size-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Unified Edit Dialog -->
<Dialog.Root bind:open={showEditDialog}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Edit Tag</Dialog.Title>
			<Dialog.Description>Update tag details and organization.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-6 py-4">
			<!-- Title -->
			<div class="grid gap-2">
				<Label for="tagName">Tag name</Label>
				<Input id="tagName" bind:value={editTitle} placeholder="Enter tag name..." />
			</div>

			<!-- Parent -->
			<div class="grid gap-2">
				<Label for="tagParent">Parent Tag</Label>
				<select
					id="tagParent"
					bind:value={editParent}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
				>
					<option value={0}>No Parent (Top Level)</option>
					{#each sortTagsAlphabetically(parentOptions, tagsMap) as parent}
						<option value={parent.id}>{getTagPath(parent.id, tagsMap)}</option>
					{/each}
				</select>
			</div>

			<!-- Color -->
			<div class="grid gap-2">
				<Label>Color</Label>
				<div class="grid grid-cols-6 gap-2">
					{#each colorPresets as color}
						<button
							type="button"
							class="size-8 rounded-full border-2 transition-transform hover:scale-110 {editColor ===
							color
								? 'ring-2 ring-primary ring-offset-2'
								: 'border-transparent'}"
							style="background-color: {color}"
							onclick={() => (editColor = color)}
							aria-label="Select color {color}"
						></button>
					{/each}
				</div>
				<div class="mt-2 flex items-center gap-2">
					<input
						type="color"
						bind:value={editColor}
						class="h-8 w-12 cursor-pointer rounded border"
					/>
					<Input bind:value={editColor} placeholder="#000000" class="h-8 flex-1" />
				</div>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => (showEditDialog = false)}>
				Cancel
			</Button>
			<Button onclick={handleUpdateTag} disabled={isProcessing || !editTitle.trim()}>
				{isProcessing ? 'Saving...' : 'Save Changes'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete tag?</AlertDialog.Title>
			<AlertDialog.Description>
				This will delete the tag "{selectedTag?.title}". Your bookmarks won't be deleted, only the
				tag association will be removed.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={isProcessing}
				class="text-destructive-foreground bg-destructive hover:bg-destructive/90"
			>
				{isProcessing ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

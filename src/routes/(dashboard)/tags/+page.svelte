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

	let newTagTitle = $state('');
	let isCreating = $state(false);

	// Dialog states
	let showRenameDialog = $state(false);
	let showColorDialog = $state(false);
	let showDeleteDialog = $state(false);
	let selectedTag = $state<TagType | null>(null);
	let editTitle = $state('');
	let editColor = $state('');
	let isProcessing = $state(false);

	let allTags = $derived(Object.values(store.tags) as TagType[]);



	async function handleCreateTag() {
		if (!newTagTitle.trim()) return;
		isCreating = true;
		try {
			await store.createTag(newTagTitle.trim());
			newTagTitle = '';
		} finally {
			isCreating = false;
		}
	}

	function openRenameDialog(tag: TagType) {
		selectedTag = tag;
		editTitle = tag.title;
		showRenameDialog = true;
	}

	function openColorDialog(tag: TagType) {
		selectedTag = tag;
		editColor = tag.color || '#888888';
		showColorDialog = true;
	}

	function openDeleteDialog(tag: TagType) {
		selectedTag = tag;
		showDeleteDialog = true;
	}

	async function handleRename() {
		if (!selectedTag || !editTitle.trim()) return;
		isProcessing = true;
		try {
			await store.updateTagTitle(selectedTag.id, editTitle.trim());
			showRenameDialog = false;
		} finally {
			isProcessing = false;
		}
	}

	async function handleChangeColor() {
		if (!selectedTag) return;
		isProcessing = true;
		try {
			await store.updateTagColor(selectedTag.id, editColor);
			showColorDialog = false;
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
	<form onsubmit={(e) => { e.preventDefault(); handleCreateTag(); }} class="flex gap-2">
		<Input
			type="text"
			bind:value={newTagTitle}
			placeholder="New tag name..."
			class="max-w-sm"
		/>
		<Button type="submit" disabled={isCreating || !newTagTitle.trim()}>
			{isCreating ? 'Creating...' : 'Create Tag'}
		</Button>
	</form>

	<!-- Tag list -->
	{#if allTags.length === 0}
		<div class="text-muted-foreground py-8 text-center">
			No tags yet. Create your first tag above.
		</div>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			{#each allTags as tag (tag.id)}
				<div
					class="bg-card group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:shadow-sm"
					style={tag.color ? `border-left: 4px solid ${tag.color}` : ''}
				>
					<Tag class="size-5 shrink-0" style={tag.color ? `color: ${tag.color}` : ''} />
					<div class="min-w-0 flex-1">
						<a
							href={`/?tag=${tag.id}`}
							class="block truncate font-medium hover:underline"
						>
							{tag.title}
						</a>
						<div class="text-muted-foreground flex items-center gap-2 text-xs">
							{#if tag.pinned}
								<span class="text-primary">Pinned</span>
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
							<DropdownMenu.Item onclick={() => openRenameDialog(tag)}>
								<Pencil class="mr-2 size-4" />
								Rename
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => openColorDialog(tag)}>
								<Palette class="mr-2 size-4" />
								Change Color
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

<!-- Rename Dialog -->
<Dialog.Root bind:open={showRenameDialog}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Rename Tag</Dialog.Title>
			<Dialog.Description>
				Enter a new name for the tag.
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={(e) => { e.preventDefault(); handleRename(); }}>
			<div class="grid gap-4 py-4">
				<div class="grid gap-2">
					<Label for="tagName">Tag name</Label>
					<Input
						id="tagName"
						bind:value={editTitle}
						placeholder="Enter tag name..."
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => showRenameDialog = false}>
					Cancel
				</Button>
				<Button type="submit" disabled={isProcessing || !editTitle.trim()}>
					{isProcessing ? 'Saving...' : 'Save'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Color Dialog -->
<Dialog.Root bind:open={showColorDialog}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Change Color</Dialog.Title>
			<Dialog.Description>
				Choose a color for the tag.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<!-- Color presets -->
			<div class="grid grid-cols-6 gap-2">
				{#each colorPresets as color}
					<button
						type="button"
						class="size-8 rounded-full border-2 transition-transform hover:scale-110 {editColor === color ? 'ring-2 ring-offset-2 ring-primary' : 'border-transparent'}"
						style="background-color: {color}"
						onclick={() => editColor = color}
						aria-label="Select color {color}"
					></button>
				{/each}
			</div>
			<!-- Custom color input -->
			<div class="flex items-center gap-2">
				<input
					type="color"
					bind:value={editColor}
					class="h-10 w-14 cursor-pointer rounded border"
				/>
				<Input
					bind:value={editColor}
					placeholder="#000000"
					class="flex-1"
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button type="button" variant="outline" onclick={() => showColorDialog = false}>
				Cancel
			</Button>
			<Button onclick={handleChangeColor} disabled={isProcessing}>
				{isProcessing ? 'Saving...' : 'Save'}
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
				This will delete the tag "{selectedTag?.title}". Your bookmarks won't be deleted, only the tag association will be removed.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={isProcessing}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{isProcessing ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

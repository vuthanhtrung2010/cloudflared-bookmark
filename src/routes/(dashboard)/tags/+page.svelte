<script lang="ts">
	import { Tag, Pencil, Trash, Pin, PinOff, Palette } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import type { TagType } from '$lib/types.js';

	let newTagTitle = $state('');
	let isCreating = $state(false);

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

	async function handleRename(tag: TagType) {
		const title = prompt('Enter new name:', tag.title);
		if (title && title !== tag.title) {
			await store.updateTagTitle(tag.id, title);
		}
	}

	async function handleChangeColor(tag: TagType) {
		const color = prompt('Enter color (hex, e.g. #ff5500):', tag.color || '#888888');
		if (color !== null) {
			await store.updateTagColor(tag.id, color);
		}
	}

	async function handleTogglePinned(tag: TagType) {
		await store.updateTagPinned(tag.id, !tag.pinned);
	}

	async function handleDelete(tag: TagType) {
		if (confirm(`Delete tag "${tag.title}"? Bookmarks won't be deleted.`)) {
			await store.deleteTag(tag.id);
		}
	}
</script>

<svelte:head>
	<title>Tags - Faved</title>
</svelte:head>

<div class="space-y-6">
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
									<svg class="size-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
									</svg>
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item onclick={() => handleRename(tag)}>
								<Pencil class="mr-2 size-4" />
								Rename
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => handleChangeColor(tag)}>
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
							<DropdownMenu.Item onclick={() => handleDelete(tag)} class="text-destructive">
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

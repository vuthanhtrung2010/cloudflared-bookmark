<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import TagSelect from '$lib/components/Items/TagSelect.svelte';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import type { ItemType } from '$lib/types.js';
	import { RefreshCw, Image as ImageIcon } from '@lucide/svelte';

	interface Props {
		item: ItemType;
		open?: boolean;
		onClose?: () => void;
	}

	let { item, open = false, onClose }: Props = $props();

	let title = $state(item.title);
	let url = $state(item.url);
	let description = $state(item.description);
	let comments = $state(item.comments);
	let image = $state(item.image);
	let selectedTags = $state<number[]>([...item.tags]);
	let isLoading = $state(false);
	let isFetchingMeta = $state(false);

	// Reset form when item changes
	$effect(() => {
		title = item.title;
		url = item.url;
		description = item.description;
		comments = item.comments;
		image = item.image;
		selectedTags = [...item.tags];
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;

		try {
			await store.updateItem({
				id: item.id,
				title,
				url,
				description,
				comments,
				image,
				tags: selectedTags
			});
			onClose?.();
		} finally {
			isLoading = false;
		}
	}

	async function handleFetchMetadata() {
		isFetchingMeta = true;
		try {
			const metadata = await store.fetchUrlMetadata(url);
			if (metadata) {
				if (metadata.title) title = metadata.title;
				if (metadata.description) description = metadata.description;
				if (metadata.image) image = metadata.image;
			}
		} finally {
			isFetchingMeta = false;
		}
	}

	function handleTagsChange(values: number[]) {
		selectedTags = values;
	}
</script>

<Dialog.Root {open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
	<Dialog.Content class="max-h-[95dvh] overflow-y-auto sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title class="text-xl">Edit Bookmark</Dialog.Title>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<!-- URL -->
			<div class="grid gap-2">
				<Label for="edit-url">URL</Label>
				<div class="flex gap-2">
					<Input
						id="edit-url"
						type="text"
						bind:value={url}
						placeholder="https://example.com"
						required
						class="flex-1"
					/>
					<Button
						type="button"
						variant="outline"
						onclick={handleFetchMetadata}
						disabled={isFetchingMeta || !url}
						title="Pull title, description and image from the URL"
					>
						<RefreshCw class={`size-4 ${isFetchingMeta ? 'animate-spin' : ''}`} />
					</Button>
				</div>
			</div>

			<!-- Title -->
			<div class="grid gap-2">
				<Label for="edit-title">Title</Label>
				<Input id="edit-title" type="text" bind:value={title} placeholder="Page title" />
			</div>

			<!-- Description (Textarea) -->
			<div class="grid gap-2">
				<Label for="edit-description">Description</Label>
				<Textarea
					id="edit-description"
					bind:value={description}
					placeholder="Brief description"
					class="overflow-y-auto"
				/>
			</div>

			<!-- Image URL with Preview -->
			<div class="flex flex-col gap-3 sm:flex-row">
				<div class="flex-1 space-y-2">
					<Label for="edit-image">Image URL</Label>
					<Input id="edit-image" type="text" bind:value={image} placeholder="https://..." />
				</div>
				<div class="min-h-16 min-w-16 sm:max-w-[40%]">
					{#if image}
						<img
							src={image}
							alt="Preview"
							class="max-h-[100px] w-auto rounded-sm object-contain shadow-sm"
						/>
					{:else}
						<div
							class="text-muted-foreground flex size-16 items-center justify-center rounded-full bg-gray-200"
							title="No image"
						>
							<ImageIcon class="size-6" />
						</div>
					{/if}
				</div>
			</div>

			<Separator class="my-5!" />

			<!-- Notes (Textarea) -->
			<div class="grid gap-2">
				<Label for="edit-comments">Notes</Label>
				<Textarea
					id="edit-comments"
					bind:value={comments}
					placeholder="Personal notes"
					class="overflow-y-auto"
				/>
			</div>

			<!-- Tags (Custom Select) -->
			<div class="grid gap-2">
				<Label>Tags</Label>
				<TagSelect values={selectedTags} onChange={handleTagsChange} />
			</div>

			<!-- Timestamps (readonly) -->
			{#if item.createdAt || item.updatedAt}
				<div class="grid gap-3 sm:grid-cols-2">
					{#if item.createdAt}
						<div class="space-y-2">
							<Label>Created at</Label>
							<Input value={item.createdAt} disabled class="cursor-not-allowed bg-gray-200 text-gray-500" />
						</div>
					{/if}
					{#if item.updatedAt}
						<div class="space-y-2">
							<Label>Updated at</Label>
							<Input value={item.updatedAt} disabled class="cursor-not-allowed bg-gray-200 text-gray-500" />
						</div>
					{/if}
				</div>
			{/if}

			<div class="bg-background mt-4 flex flex-col justify-end gap-2 border-t pt-5 sm:flex-row">
				<Button type="button" variant="outline" onclick={onClose} disabled={isLoading} class="order-3 sm:order-none">
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading} class="order-1 sm:order-none">
					{isLoading ? 'Saving...' : 'Save changes'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

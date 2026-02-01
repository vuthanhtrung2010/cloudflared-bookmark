<script lang="ts">
	import { MoreVertical } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import type { ItemType } from '$lib/types.js';

	interface Props {
		item: ItemType;
	}

	let { item }: Props = $props();
	let showDeleteDialog = $state(false);
	let isDeleting = $state(false);

	function handleEdit() {
		store.openEditModal(item);
	}

	async function handleMakeCopy() {
		await store.createItem({
			url: item.url,
			title: item.title,
			description: item.description,
			comments: item.comments,
			image: item.image,
			tags: [...item.tags]
		});
	}

	async function handleDelete() {
		isDeleting = true;
		await store.deleteItems([item.id]);
		isDeleting = false;
		showDeleteDialog = false;
	}

	async function handleRefetchMetadata() {
		await store.fetchMetadata([item.id]);
	}
</script>

<!-- Only the 3-dot actions dropdown button -->
<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="onhover-visible size-8 rounded-full p-0 shadow-md bg-black/70 hover:bg-black text-white backdrop-blur-sm transition-all duration-200">
				<MoreVertical class="size-4" />
				<span class="sr-only">Open menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-40">
		<DropdownMenu.Item onclick={handleEdit}>
			Edit
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleRefetchMetadata}>
			Refetch metadata
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={handleMakeCopy}>
			Make a copy
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item
			onclick={() => showDeleteDialog = true}
			class="hover:bg-destructive/90 focus:bg-destructive focus:text-destructive-foreground hover:text-white"
		>
			Delete
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete item?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. The item will be permanently deleted.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={isDeleting}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
			>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

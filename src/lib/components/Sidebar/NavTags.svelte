<script lang="ts">
	import { ChevronRight, MoreVertical, Pin } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { goto } from '$app/navigation';
	import type { TagType } from '$lib/types.js';
	import { getColorValue, colorPresets, getColorClass } from '$lib/utils/colors.js';

	import NavTagItem from './NavTagItem.svelte';

	// Delete dialog state
	let showDeleteDialog = $state(false);
	let tagToDelete = $state<TagType | null>(null);
	let isDeleting = $state(false);

	// Get all tags
	let tagsMap = $derived(store.tags as Record<number, TagType>);

	// Top level tags (parent = 0)
	let topLevelTags = $derived.by(() => {
		return Object.values(tagsMap)
			.filter((tag) => tag.parent === 0)
			.sort((a, b) => {
				if (a.pinned && !b.pinned) return -1;
				if (!a.pinned && b.pinned) return 1;
				return a.title.localeCompare(b.title);
			});
	});

	function openDeleteDialog(tag: TagType) {
		tagToDelete = tag;
		showDeleteDialog = true;
	}

	async function handleDelete() {
		if (!tagToDelete) return;
		isDeleting = true;
		try {
			await store.deleteTag(tagToDelete.id);
			showDeleteDialog = false;
		} finally {
			isDeleting = false;
		}
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Tags</Sidebar.GroupLabel>
	<Sidebar.GroupContent class="flex flex-col">
		<Sidebar.Menu>
			{#each topLevelTags as tag (tag.id)}
				<NavTagItem {tag} onDelete={openDeleteDialog} />
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={showDeleteDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete tag?</AlertDialog.Title>
			<AlertDialog.Description>
				This will delete the tag "{tagToDelete?.title}". Your bookmarks won't be deleted, only the
				tag association will be removed.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={handleDelete}
				disabled={isDeleting}
				class="text-destructive-foreground bg-destructive hover:bg-destructive/90"
			>
				{isDeleting ? 'Deleting...' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

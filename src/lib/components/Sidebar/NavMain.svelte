<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Check if current selection matches
	let isAllItems = $derived(store.selectedTagId === null && !page.url.searchParams.has('tag'));
	let isUntagged = $derived(store.selectedTagId === 'none' || page.url.searchParams.get('tag') === 'none');

	function handleAllItems() {
		store.setSelectedTagId(null);
		goto('/');
	}

	function handleUntagged() {
		store.setSelectedTagId('none');
		goto('/?tag=none');
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={handleAllItems}
					class="active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear {isAllItems ? 'bg-primary! text-primary-foreground!' : ''}"
				>
					<span>All items</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					onclick={handleUntagged}
					class="active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear {isUntagged ? 'bg-primary! text-primary-foreground!' : ''}"
				>
					<span>Untagged</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

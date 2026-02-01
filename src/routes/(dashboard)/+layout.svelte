<script lang="ts">
	import type { LayoutProps } from './$types.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/Sidebar/AppSidebar.svelte';
	import SettingsDialog from '$lib/components/Settings/SettingsDialog.svelte';
	import EditItemDialog from '$lib/components/Items/EditItemDialog.svelte';
	import AddItemDialog from '$lib/components/Items/AddItemDialog.svelte';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';

	let { children }: LayoutProps = $props();
	let isLoading = $state(true);
	let showAddItemDialog = $state(false);

	onMount(async () => {
		await store.init();
		isLoading = false;

		if (store.isAuthRequired) {
			goto('/login');
		}
	});

	function handleNewItem() {
		showAddItemDialog = true;
	}

	// Expose handleNewItem via context so pages can use it
	setContext('handleNewItem', handleNewItem);
</script>

{#if isLoading}
	<div class="flex h-dvh items-center justify-center">
		<div class="text-muted-foreground">Loading...</div>
	</div>
{:else if !store.isAuthRequired}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset class="@container/main">
			{@render children?.()}
		</Sidebar.Inset>
	</Sidebar.Provider>

	<!-- Global Dialogs -->
	<SettingsDialog
		open={store.isOpenSettingsModal}
		onClose={() => store.closeSettingsModal()}
	/>

	{#if store.editingItem}
		<EditItemDialog
			item={store.editingItem}
			open={store.isShowEditModal}
			onClose={() => store.closeEditModal()}
		/>
	{/if}

	<AddItemDialog
		bind:open={showAddItemDialog}
		onClose={() => (showAddItemDialog = false)}
	/>
{/if}

<script lang="ts">
	import { SquareCheck, SquareMinus, Square, Tags, RefreshCw, Trash, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { toast } from 'svelte-sonner';

	interface Props {
		selectedCount: number;
		onClear: () => void;
		selectedItemIds?: number[];
	}

	let { selectedCount, onClear, selectedItemIds = [] }: Props = $props();

	let isDeleting = $state(false);
	let isRefetching = $state(false);

	async function handleRefetch() {
		isRefetching = true;
		const ids = selectedItemIds.length > 0 ? selectedItemIds : store.selectedItemIds;
		await store.fetchMetadata(ids);
		isRefetching = false;
	}

	async function handleDelete() {
		isDeleting = true;
		const ids = selectedItemIds.length > 0 ? selectedItemIds : store.selectedItemIds;
		const count = ids.length;
		await store.deleteItems(ids);
		onClear();
		isDeleting = false;
		toast.success(`Successfully deleted ${count} item${count > 1 ? 's' : ''}`);
	}
</script>

{#if selectedCount > 0}
	<div class="fixed bottom-[5dvh] left-1/2 z-50 flex -translate-x-1/2 items-center gap-1">
		<!-- Selection count -->
		<Button
			variant="outline"
			class="bg-primary-foreground rounded-full"
			onclick={onClear}
		>
			<SquareCheck class="size-4" />
			<span class="whitespace-nowrap">{selectedCount} selected</span>
		</Button>

		<!-- Tags button -->
		<Button variant="outline" class="bg-primary-foreground rounded-full">
			<Tags class="size-4" />
			<span class="hidden md:block">Tags</span>
		</Button>

		<!-- Refetch button -->
		<Button
			variant="outline"
			class="bg-primary-foreground rounded-full"
			onclick={handleRefetch}
			disabled={isRefetching}
		>
			<RefreshCw class="size-4 {isRefetching ? 'animate-spin' : ''}" />
			<span class="hidden md:block">Refetch</span>
		</Button>

		<!-- Delete button -->
		<Button
			variant="outline"
			class="bg-primary-foreground rounded-full"
			onclick={handleDelete}
			disabled={isDeleting}
		>
			<Trash class="size-4" />
			<span class="hidden md:block">Delete</span>
		</Button>

		<!-- Close button -->
		<Button
			variant="outline"
			size="icon"
			class="bg-primary-foreground rounded-full"
			onclick={onClear}
		>
			<X class="size-4" />
		</Button>
	</div>
{/if}

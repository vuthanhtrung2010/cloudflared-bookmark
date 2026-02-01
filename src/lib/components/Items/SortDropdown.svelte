<script lang="ts">
	import { ArrowDownUp, ArrowDown, ArrowUp } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	interface Props {
		sortField: string;
		sortDirection: 'asc' | 'desc';
		onSort: (field: string, direction: 'asc' | 'desc') => void;
	}

	let { sortField, sortDirection, onSort }: Props = $props();

	const sortColumns = [
		{ id: 'title', label: 'Title' },
		{ id: 'url', label: 'URL' },
		{ id: 'description', label: 'Description' },
		{ id: 'comments', label: 'Notes' },
		{ id: 'createdAt', label: 'Created date' },
		{ id: 'updatedAt', label: 'Updated date' }
	];

	function handleSort(columnId: string) {
		if (sortField === columnId) {
			// Toggle direction
			onSort(columnId, sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			// New column, default to desc
			onSort(columnId, 'desc');
		}
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">
				<ArrowDownUp class="size-4" />
				Sort
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content side="bottom" align="end" class="min-w-40">
		<DropdownMenu.Label>Sort by</DropdownMenu.Label>
		{#each sortColumns as column (column.id)}
			<DropdownMenu.Item
				onclick={(e) => {
					e.preventDefault();
					handleSort(column.id);
				}}
				class="flex justify-between {column.id === sortField ? 'bg-accent' : ''}"
			>
				<span>{column.label}</span>
				{#if column.id === sortField}
					{#if sortDirection === 'desc'}
						<ArrowDown class="text-primary size-4" />
					{:else}
						<ArrowUp class="text-primary size-4" />
					{/if}
				{/if}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>

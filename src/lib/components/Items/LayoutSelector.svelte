<script lang="ts">
	import { LayoutList, LayoutGrid, Table } from '@lucide/svelte';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import type { LayoutType } from '$lib/types.js';

	function handleChange(value: string | undefined) {
		if (value) {
			store.setLayout(value as LayoutType);
		}
	}
</script>

<ToggleGroup.Root
	variant="outline"
	type="single"
	value={store.layout}
	class="flex w-full justify-center"
	onValueChange={handleChange}
>
	<ToggleGroup.Item value="list" class="flex-1">
		<LayoutList class="size-4" />
	</ToggleGroup.Item>
	<ToggleGroup.Item value="cards" class="flex-1">
		<LayoutGrid class="size-4" />
	</ToggleGroup.Item>
	<ToggleGroup.Item value="table" class="flex-1">
		<Table class="size-4" />
	</ToggleGroup.Item>
</ToggleGroup.Root>

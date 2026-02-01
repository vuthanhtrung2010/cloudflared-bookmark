<script lang="ts">
	import { Search, X } from '@lucide/svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		value?: string;
		onSearch?: (value: string) => void;
		placeholder?: string;
	}

	let { value = $bindable(''), onSearch, placeholder = 'Search bookmarks...' }: Props = $props();

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		value = target.value;
		onSearch?.(value);
	}

	function handleClear() {
		value = '';
		onSearch?.('');
	}
</script>

<div class="relative flex-1">
	<Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
	<Input
		type="text"
		{value}
		oninput={handleInput}
		{placeholder}
		class="pl-9 pr-9"
	/>
	{#if value}
		<Button
			variant="ghost"
			size="icon"
			class="absolute top-1/2 right-1 size-7 -translate-y-1/2"
			onclick={handleClear}
		>
			<X class="size-4" />
			<span class="sr-only">Clear search</span>
		</Button>
	{/if}
</div>

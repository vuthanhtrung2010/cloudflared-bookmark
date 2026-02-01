<script lang="ts">
	interface Props {
		imageUrl: string;
		class?: string;
	}

	let { imageUrl, class: className = '' }: Props = $props();

	import { store } from '$lib/stores/mainStore.svelte.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Search } from '@lucide/svelte';

	let hasError = $state(false);

	function handleError() {
		hasError = true;
	}
</script>

{#if !hasError && imageUrl}
	<Dialog.Root>
		<Dialog.Trigger class="w-full">
			<div class="item__image-container group relative cursor-zoom-in overflow-hidden">
				<img
					src={imageUrl}
					alt=""
					class="item__image transition-transform duration-300 group-hover:scale-105 {className}"
					loading="lazy"
					onerror={handleError}
				/>
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/10 group-hover:opacity-100">
					<Search class="text-white drop-shadow-md" />
				</div>
			</div>
		</Dialog.Trigger>
		<Dialog.Content class="max-w-[95vw] border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] lg:max-w-[80vw]">
			<div class="relative flex h-full w-full items-center justify-center overflow-auto p-4 lg:p-10">
				<img
					src={imageUrl}
					alt=""
					class="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
				/>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}

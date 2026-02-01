<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { getColorClass } from '$lib/utils/colors.js';
	import { goto } from '$app/navigation';

	interface Props {
		tagId: number;
	}

	let { tagId }: Props = $props();

	let tag = $derived(store.tags[tagId]);
	let isSelected = $derived(store.selectedTagId === tagId);

	function handleClick() {
		if (isSelected) {
			store.clearSelectedTag();
			goto('/');
		} else {
			store.setSelectedTagId(tagId);
			goto(`/?tag=${tagId}`);
		}
	}
</script>

{#if tag}
	<Tooltip.Root delayDuration={500}>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Badge
					{...props}
					variant={isSelected ? 'outline' : 'secondary'}
					class="cursor-pointer gap-1.5"
					onclick={handleClick}
				>
					<span class={`size-2.5 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
					<span>{tag.title}</span>
				</Badge>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>{tag.title}</p>
		</Tooltip.Content>
	</Tooltip.Root>
{/if}

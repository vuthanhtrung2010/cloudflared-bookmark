<script lang="ts">
	import { Check, ChevronsUpDown } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { getColorClass, getColorValue } from '$lib/utils/colors.js';
	import type { TagType } from '$lib/types.js';
	import { cn } from '$lib/utils.js';
	import { getTagPath } from '$lib/utils/tags.js';

	interface Props {
		values?: number[];
		onChange?: (values: number[]) => void;
		class?: string;
	}

	let { values = [], onChange, class: className }: Props = $props();

	let open = $state(false);
	let query = $state('');
	let selected = $state<number[]>([...values]);

	// Sync selected with values prop
	$effect(() => {
		selected = [...values];
	});

	// Get sorted tags (selected first)
	let sortedTags = $derived.by(() => {
		const allTags = Object.values(store.tags) as TagType[];
		return allTags.sort((a, b) => {
			const aSelected = selected.includes(a.id) ? 1 : 0;
			const bSelected = selected.includes(b.id) ? 1 : 0;
			return bSelected - aSelected;
		});
	});

	// Filter tags by query
	let filteredTags = $derived.by(() => {
		if (!query.trim()) return sortedTags;
		const q = query.toLowerCase().trim();
		return sortedTags.filter((tag) => tag.title.toLowerCase().includes(q));
	});

	// Check if query matches an existing tag exactly
	let queryMatchesExisting = $derived.by(() => {
		const q = query.toLowerCase().trim();
		return sortedTags.some((tag) => tag.title.toLowerCase() === q);
	});

	function toggleTag(tagId: number) {
		if (selected.includes(tagId)) {
			selected = selected.filter((id) => id !== tagId);
		} else {
			selected = [...selected, tagId];
		}
		onChange?.(selected);
	}

	async function createTag() {
		const title = query.trim();
		if (!title) return;

		const newTagId = await store.createTag(title);
		if (newTagId) {
			selected = [...selected, newTagId];
			onChange?.(selected);
			query = '';
		}
	}

	function handleOpenChange(isOpen: boolean) {
		open = isOpen;
		if (!isOpen) {
			query = '';
		}
	}
</script>

<Popover.Root bind:open onOpenChange={handleOpenChange}>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={cn(
					'flex h-auto min-h-10 w-full justify-start text-left whitespace-normal',
					className
				)}
			>
				<div class="flex flex-1 flex-wrap gap-1">
					{#if selected.length > 0}
						{#each selected as tagId (tagId)}
							{@const tag = store.tags[tagId]}
							{#if tag}
								<Badge variant="secondary" class="gap-1.5">
									<span
										class={cn('size-2.5 flex-none rounded-full', getColorClass(tag.color))}
										style={getColorClass(tag.color)
											? ''
											: `background-color: ${getColorValue(tag.color)}`}
									></span>
									<span>{tag.title}</span>
								</Badge>
							{/if}
						{/each}
					{:else}
						<span class="text-muted-foreground">Select tags...</span>
					{/if}
				</div>
				<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content
		class={cn('w-full min-w-[300px] overflow-y-hidden p-0', className)}
		align="start"
	>
		<Command.Root shouldFilter={false}>
			<Command.Input
				placeholder="Search or create tag..."
				value={query}
				oninput={(e) => {
					query = (e.target as HTMLInputElement).value;
				}}
			/>
			<Command.List class="max-h-[200px] overflow-y-auto">
				<Command.Empty class="hidden">No tags found.</Command.Empty>
				<Command.Group>
					{#each filteredTags as tag (tag.id)}
						<Command.Item
							value={tag.id.toString()}
							onSelect={() => toggleTag(tag.id)}
							class="flex items-center gap-3"
						>
							<span
								class={cn('size-3 flex-none rounded-full', getColorClass(tag.color))}
								style={getColorClass(tag.color)
									? ''
									: `background-color: ${getColorValue(tag.color)}`}
							></span>
							<span class="flex-1">{getTagPath(tag.id, store.tags as Record<number, TagType>)}</span
							>
							<Check
								class={cn('size-4', selected.includes(tag.id) ? 'opacity-100' : 'opacity-0')}
							/>
						</Command.Item>
					{/each}

					{#if query.trim().length > 1 && !queryMatchesExisting}
						<Command.Item value="__create__" onSelect={createTag} class="flex items-center gap-2">
							+ Create new tag: "{query.trim()}"
						</Command.Item>
					{/if}
				</Command.Group>
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>

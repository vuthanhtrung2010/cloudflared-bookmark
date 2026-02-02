<script lang="ts">
	import { ChevronRight, MoreVertical, Pin } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { goto } from '$app/navigation';
	import type { TagType } from '$lib/types.js';
	import { getColorValue, colorPresets, getColorClass } from '$lib/utils/colors.js';
	import NavTagItem from './NavTagItem.svelte';

	interface Props {
		tag: TagType;
		level?: number;
		onDelete: (tag: TagType) => void;
	}

	let { tag, level = 0, onDelete }: Props = $props();

	// Get children
	let children = $derived.by(() => {
		return Object.values(store.tags as Record<number, TagType>)
			.filter((t) => t.parent === tag.id)
			.sort((a, b) => {
				if (a.pinned && !b.pinned) return -1;
				if (!a.pinned && b.pinned) return 1;
				return a.title.localeCompare(b.title);
			});
	});

	// Check if this tag or any of its children/descendants are selected
	let isSelected = $derived(store.selectedTagId === tag.id);

	let hasActiveDescendant = $derived.by(() => {
		if (isSelected) return true;
		const sid = store.selectedTagId;
		if (typeof sid !== 'number') return false;

		// Recursive check
		const checkActive = (parentTagId: number): boolean => {
			const kids = Object.values(store.tags as Record<number, TagType>).filter(
				(t) => t.parent === parentTagId
			);
			for (const k of kids) {
				if (k.id === sid) return true;
				if (checkActive(k.id)) return true;
			}
			return false;
		};

		return checkActive(tag.id);
	});

	let tagColor = $derived(getColorValue(tag.color));
	let tagColorClass = $derived(getColorClass(tag.color));

	function handleTagClick() {
		store.setSelectedTagId(tag.id);
		goto(`/?tag=${tag.id}`);
	}

	async function handlePinToggle() {
		await store.updateTagPinned(tag.id, !tag.pinned);
	}

	async function handleRename() {
		const newTitle = prompt('Rename tag:', tag.title);
		if (newTitle && newTitle !== tag.title) {
			await store.updateTagTitle(tag.id, newTitle);
		}
	}

	async function handleColorChange(color: string) {
		await store.updateTagColor(tag.id, color);
	}
</script>

{#if children.length > 0}
	<Collapsible.Root class="group/collapsible" open={hasActiveDescendant}>
		<Sidebar.MenuItem data-selected={isSelected}>
			<Sidebar.MenuButton
				class="gap-0 p-0 active:bg-primary/90 active:text-primary-foreground {isSelected
					? 'bg-primary! text-primary-foreground!'
					: ''}"
			>
				<div class="px-2 py-2 hover:cursor-pointer" style="padding-left: {level * 12 + 8}px">
					<Collapsible.Trigger>
						<ChevronRight
							class="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90"
						/>
					</Collapsible.Trigger>
				</div>
				<button
					onclick={handleTagClick}
					class="flex w-full items-center justify-start gap-2 py-2 pe-0 text-left"
				>
					<span
						class="size-2.5 flex-none rounded-full {tagColorClass}"
						style={tagColorClass ? '' : `background-color: ${tagColor}`}
					></span>
					<span title={tag.title} class="line-clamp-1 break-all">{tag.title}</span>
					{#if tag.pinned}
						<Pin class="ms-auto mr-2 size-4" />
					{/if}
				</button>
			</Sidebar.MenuButton>

			<Collapsible.Content>
				<Sidebar.MenuSub class="m-0 border-l-0 p-0">
					{#each children as child (child.id)}
						<NavTagItem tag={child} level={level + 1} {onDelete} />
					{/each}
				</Sidebar.MenuSub>
			</Collapsible.Content>

			<!-- Actions -->
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuAction
							{...props}
							class="sidebar-menu-action cursor-pointer rounded-sm hover:bg-sidebar-accent data-[state=open]:bg-accent"
						>
							<MoreVertical class="size-4" />
							<span class="sr-only">More</span>
						</Sidebar.MenuAction>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content class="w-32 rounded-lg" side="right" align="start">
					<DropdownMenu.Item onclick={handlePinToggle}>
						{tag.pinned ? 'Unpin' : 'Pin'} tag
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={handleRename}>Rename</DropdownMenu.Item>
					<DropdownMenu.Sub>
						<DropdownMenu.SubTrigger>Color</DropdownMenu.SubTrigger>
						<DropdownMenu.SubContent>
							<div class="grid grid-cols-5 gap-1 p-1">
								{#each colorPresets as color (color)}
									<button
										class="size-6 rounded-full border border-black/10 transition-transform hover:scale-110 {tag.color ===
										color
											? 'ring-2 ring-primary ring-offset-1'
											: ''}"
										style="background-color: {color}"
										onclick={() => handleColorChange(color)}
										aria-label="Select color {color}"
									></button>
								{/each}
							</div>
						</DropdownMenu.SubContent>
					</DropdownMenu.Sub>
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						onclick={() => onDelete(tag)}
						class="text-destructive focus:text-destructive"
					>
						Delete
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</Sidebar.MenuItem>
	</Collapsible.Root>
{:else}
	<Sidebar.MenuItem data-selected={isSelected}>
		<Sidebar.MenuButton
			class="p-0 {isSelected
				? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
				: ''}"
		>
			<button
				onclick={handleTagClick}
				class="flex w-full items-center justify-start gap-2 py-2 text-left"
				style="padding-left: {level * 12 + (level > 0 ? 32 : 32)}px"
			>
				<span
					class="size-2.5 flex-none rounded-full {tagColorClass}"
					style={tagColorClass ? '' : `background-color: ${tagColor}`}
				></span>
				<span title={tag.title} class="line-clamp-1 break-all">{tag.title}</span>
				{#if tag.pinned}
					<Pin class="ms-auto mr-2 size-4" />
				{/if}
			</button>
		</Sidebar.MenuButton>

		<!-- Actions -->
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuAction
						{...props}
						class="sidebar-menu-action cursor-pointer rounded-sm hover:bg-sidebar-accent data-[state=open]:bg-accent"
					>
						<MoreVertical class="size-4" />
						<span class="sr-only">More</span>
					</Sidebar.MenuAction>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-32 rounded-lg" side="right" align="start">
				<DropdownMenu.Item onclick={handlePinToggle}>
					{tag.pinned ? 'Unpin' : 'Pin'} tag
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={handleRename}>Rename</DropdownMenu.Item>
				<DropdownMenu.Sub>
					<DropdownMenu.SubTrigger>Color</DropdownMenu.SubTrigger>
					<DropdownMenu.SubContent>
						<div class="grid grid-cols-5 gap-1 p-1">
							{#each colorPresets as color (color)}
								<button
									class="size-6 rounded-full border border-black/10 transition-transform hover:scale-110 {tag.color ===
									color
										? 'ring-2 ring-primary ring-offset-1'
										: ''}"
									style="background-color: {color}"
									onclick={() => handleColorChange(color)}
									aria-label="Select color {color}"
								></button>
							{/each}
						</div>
					</DropdownMenu.SubContent>
				</DropdownMenu.Sub>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onclick={() => onDelete(tag)}
					class="text-destructive focus:text-destructive"
				>
					Delete
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
{/if}

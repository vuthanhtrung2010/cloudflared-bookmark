<script lang="ts">
	import { ChevronRight, MoreVertical, Pin } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { goto } from '$app/navigation';
	import type { TagType } from '$lib/types.js';
	import { getColorClass, colorOptions } from '$lib/utils/colors.js';

	// Get all tags as object
	let allTags = $derived(store.tags as Record<number, TagType>);

	// Get selected tag
	let selectedTag = $derived.by(() => {
		const sid = store.selectedTagId;
		if (typeof sid === 'number') {
			return allTags[sid] ?? null;
		}
		return null;
	});

	// Recursively render tags
	function getChildTags(parentId: number | string): TagType[] {
		const pid = Number(parentId);
		return Object.values(allTags)
			.filter((tag) => tag.parent === pid)
			.sort((a, b) => {
				// Pinned first, then alphabetically
				if (a.pinned && !b.pinned) return -1;
				if (!a.pinned && b.pinned) return 1;
				return a.title.localeCompare(b.title);
			});
	}

	function handleTagClick(tagId: number) {
		store.setSelectedTagId(tagId);
		goto(`/?tag=${tagId}`);
	}

	async function handlePinToggle(tag: TagType) {
		await store.updateTagPinned(tag.id, !tag.pinned);
	}

	async function handleRename(tag: TagType) {
		const newTitle = prompt('Rename tag:', tag.title);
		if (newTitle && newTitle !== tag.title) {
			await store.updateTagTitle(tag.id, newTitle);
		}
	}

	async function handleColorChange(tag: TagType, color: string) {
		await store.updateTagColor(tag.id, color);
	}

	async function handleDelete(tag: TagType) {
		if (confirm(`Delete tag "${tag.title}"?`)) {
			await store.deleteTag(tag.id);
		}
	}

	// Check if a child of this tag is selected
	function isChildSelected(tag: TagType): boolean {
		if (!selectedTag) return false;
		// Check if selectedTag's fullPath starts with this tag's fullPath
		return selectedTag.title.startsWith(tag.title + '/');
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>Tags</Sidebar.GroupLabel>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each getChildTags(0) as tag (tag.id)}
				{@const children = getChildTags(tag.id)}
				{@const isSelected = store.selectedTagId === tag.id}
				{@const hasChildSelected = isChildSelected(tag)}

				{#if children.length > 0}
					<!-- Tag with children - collapsible -->
					<Collapsible.Root class="group/collapsible" open={hasChildSelected}>
						<Sidebar.MenuItem data-selected={isSelected}>
							<Sidebar.MenuButton
								class="active:bg-primary/90 active:text-primary-foreground gap-0 p-0 {isSelected ? 'bg-primary! text-primary-foreground!' : ''}"
							>
								<div class="p-2 hover:cursor-pointer">
									<Collapsible.Trigger>
										<ChevronRight class="size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
									</Collapsible.Trigger>
								</div>
								<button onclick={() => handleTagClick(tag.id)} class="flex w-full items-center justify-start gap-2 py-2 pe-0 text-left">
									<span class={`size-2.5 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
									<span title={tag.title} class="line-clamp-1 break-all">{tag.title}</span>
									{#if tag.pinned}
										<Pin class="ms-auto size-4" />
									{/if}
								</button>
							</Sidebar.MenuButton>

							<Collapsible.Content>
								<Sidebar.MenuSub class="mr-px pr-0">
									{#each children as childTag (childTag.id)}
										{@const isChildSel = store.selectedTagId === childTag.id}
										<Sidebar.MenuSubItem>
											<Sidebar.MenuSubButton
												class={isChildSel ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}
											>
												{#snippet child({ props })}
													<button {...props} onclick={() => handleTagClick(childTag.id)} class="flex w-full items-center gap-2 pl-8">
														<span class={`size-2.5 flex-none rounded-full ${getColorClass(childTag.color)}`}></span>
														<span title={childTag.title} class="line-clamp-1 break-all">{childTag.title}</span>
													</button>
												{/snippet}
											</Sidebar.MenuSubButton>
										</Sidebar.MenuSubItem>
									{/each}
								</Sidebar.MenuSub>
							</Collapsible.Content>

							<!-- Tag actions -->
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuAction {...props} class="data-[state=open]:bg-accent hover:bg-sidebar-accent sidebar-menu-action cursor-pointer rounded-sm">
											<MoreVertical class="size-4" />
											<span class="sr-only">More</span>
										</Sidebar.MenuAction>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-24 rounded-lg" side="right" align="start">
									<DropdownMenu.Item onclick={() => handlePinToggle(tag)}>
										{tag.pinned ? 'Unpin' : 'Pin'} tag
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => handleRename(tag)}>
										Rename
									</DropdownMenu.Item>
									<DropdownMenu.Sub>
										<DropdownMenu.SubTrigger>Color</DropdownMenu.SubTrigger>
										<DropdownMenu.SubContent>
											{#each colorOptions as color (color)}
												<DropdownMenu.Item onclick={() => handleColorChange(tag, color)}>
													<span class={`mr-2 inline-block size-3 rounded-full ${getColorClass(color)}`}></span>
													{color.charAt(0).toUpperCase() + color.slice(1)}
													{#if tag.color === color}
														<span class="ml-auto">✓</span>
													{/if}
												</DropdownMenu.Item>
											{/each}
										</DropdownMenu.SubContent>
									</DropdownMenu.Sub>
									<DropdownMenu.Separator />
									<DropdownMenu.Item onclick={() => handleDelete(tag)} class="text-destructive">
										Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Sidebar.MenuItem>
					</Collapsible.Root>
				{:else}
					<!-- Tag without children -->
					<Sidebar.MenuItem data-selected={isSelected}>
						<Sidebar.MenuButton
							class="p-0 {isSelected ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''}"
						>
							<button onclick={() => handleTagClick(tag.id)} class="flex w-full items-center justify-start gap-2 py-2 pl-8 text-left">
								<span class={`size-2.5 flex-none rounded-full ${getColorClass(tag.color)}`}></span>
								<span title={tag.title} class="line-clamp-1 break-all">{tag.title}</span>
								{#if tag.pinned}
									<Pin class="ms-auto size-4" />
								{/if}
							</button>
						</Sidebar.MenuButton>

						<!-- Tag actions -->
						<DropdownMenu.Root>
							<DropdownMenu.Trigger>
								{#snippet child({ props })}
									<Sidebar.MenuAction {...props} class="data-[state=open]:bg-accent hover:bg-sidebar-accent sidebar-menu-action cursor-pointer rounded-sm">
										<MoreVertical class="size-4" />
										<span class="sr-only">More</span>
									</Sidebar.MenuAction>
								{/snippet}
							</DropdownMenu.Trigger>
							<DropdownMenu.Content class="w-24 rounded-lg" side="right" align="start">
								<DropdownMenu.Item onclick={() => handlePinToggle(tag)}>
									{tag.pinned ? 'Unpin' : 'Pin'} tag
								</DropdownMenu.Item>
								<DropdownMenu.Item onclick={() => handleRename(tag)}>
									Rename
								</DropdownMenu.Item>
								<DropdownMenu.Sub>
									<DropdownMenu.SubTrigger>Color</DropdownMenu.SubTrigger>
									<DropdownMenu.SubContent>
										{#each colorOptions as color (color)}
											<DropdownMenu.Item onclick={() => handleColorChange(tag, color)}>
												<span class={`mr-2 inline-block size-3 rounded-full ${getColorClass(color)}`}></span>
												{color.charAt(0).toUpperCase() + color.slice(1)}
												{#if tag.color === color}
													<span class="ml-auto">✓</span>
												{/if}
											</DropdownMenu.Item>
										{/each}
									</DropdownMenu.SubContent>
								</DropdownMenu.Sub>
								<DropdownMenu.Separator />
								<DropdownMenu.Item onclick={() => handleDelete(tag)} class="text-destructive">
									Delete
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</Sidebar.MenuItem>
				{/if}
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>

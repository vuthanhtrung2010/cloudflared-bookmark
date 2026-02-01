<script lang="ts">
	import { Bookmark } from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import NavMain from './NavMain.svelte';
	import NavTags from './NavTags.svelte';
	import NavUser from './NavUser.svelte';
	import ThemeToggler from './ThemeToggler.svelte';
	import SettingsButton from './SettingsButton.svelte';
	import { store } from '$lib/stores/mainStore.svelte.js';

	interface Props {
		onNewItem?: () => void;
	}

	let { onNewItem }: Props = $props();
</script>

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					<div class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
						<Bookmark class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-semibold">Faved</span>
						<span class="text-muted-foreground truncate text-xs">Bookmark Manager</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
		<div class="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
			<ThemeToggler />
			<SettingsButton />
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain />
		<NavTags />
	</Sidebar.Content>
	{#if store.user}
		<Sidebar.Footer>
			<NavUser />
		</Sidebar.Footer>
	{/if}
	<Sidebar.Rail />
</Sidebar.Root>

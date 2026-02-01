<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	let theme = $state<'light' | 'dark' | 'system'>('system');

	function setTheme(newTheme: 'light' | 'dark' | 'system') {
		theme = newTheme;
		
		if (newTheme === 'system') {
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			document.documentElement.classList.toggle('dark', prefersDark);
		} else {
			document.documentElement.classList.toggle('dark', newTheme === 'dark');
		}
		
		localStorage.setItem('theme', newTheme);
	}

	// Initialize theme on mount
	$effect(() => {
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
		if (savedTheme) {
			setTheme(savedTheme);
		} else {
			setTheme('system');
		}
	});
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" size="icon" class="h-7 w-7">
				{#if theme === 'light'}
					<Sun class="h-4 w-4" />
				{:else if theme === 'dark'}
					<Moon class="h-4 w-4" />
				{:else}
					<Monitor class="h-4 w-4" />
				{/if}
				<span class="sr-only">Toggle theme</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Item onclick={() => setTheme('light')}>
			<Sun class="mr-2 h-4 w-4" />
			Light
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setTheme('dark')}>
			<Moon class="mr-2 h-4 w-4" />
			Dark
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => setTheme('system')}>
			<Monitor class="mr-2 h-4 w-4" />
			System
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

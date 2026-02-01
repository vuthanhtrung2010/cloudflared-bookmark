<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
</script>

<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => store.openSettingsModal()}>
	<Settings class="h-4 w-4" />
	<span class="sr-only">Settings</span>
</Button>

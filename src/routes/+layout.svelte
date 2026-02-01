<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types.js';

	let { children }: LayoutProps = $props();
</script>

<main class="flex h-dvh items-center justify-center">
    {@render children?.()}
</main>

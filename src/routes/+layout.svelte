<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';

	let { children }: LayoutProps = $props();
</script>

<Toaster richColors position="bottom-right" />

<div class="min-h-dvh">
	{@render children?.()}
</div>

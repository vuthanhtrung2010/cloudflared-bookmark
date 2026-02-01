<script lang="ts">
	import { Settings2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import LayoutSelector from './LayoutSelector.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	interface Props {
		visibleFields?: Record<string, boolean>;
		onFieldToggle?: (field: string, visible: boolean) => void;
	}

	let { visibleFields = {}, onFieldToggle }: Props = $props();

	const fieldOptions = [
		{ id: 'image', label: 'Image' },
		{ id: 'title', label: 'Title' },
		{ id: 'url', label: 'URL' },
		{ id: 'tags', label: 'Tags' },
		{ id: 'description', label: 'Description' },
		{ id: 'comments', label: 'Notes' },
		{ id: 'createdAt', label: 'Created Date' },
		{ id: 'updatedAt', label: 'Updated Date' }
	];

	function handleFieldToggle(fieldId: string) {
		const currentValue = visibleFields[fieldId] !== false;
		onFieldToggle?.(fieldId, !currentValue);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline">
				<Settings2 class="size-4" />
				View
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="start" class="min-w-40">
		<DropdownMenu.Label>Layout</DropdownMenu.Label>
		<div class="mx-1 mb-3">
			<LayoutSelector />
		</div>
		<DropdownMenu.Separator />
		<DropdownMenu.Label>Visible fields</DropdownMenu.Label>
		{#each fieldOptions as field (field.id)}
			<DropdownMenu.CheckboxItem
				checked={visibleFields[field.id] !== false}
				onCheckedChange={() => handleFieldToggle(field.id)}
			>
				{field.label}
			</DropdownMenu.CheckboxItem>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>

<script lang="ts">
	interface Props {
		imageUrl: string;
		class?: string;
	}

	let { imageUrl, class: className = '' }: Props = $props();

	let hasError = $state(false);

	function handleError() {
		hasError = true;
	}
</script>

{#if !hasError && imageUrl}
	<div class="item__image-container">
		<img
			src={imageUrl}
			alt=""
			class="item__image {className}"
			loading="lazy"
			onerror={handleError}
		/>
	</div>
{/if}

<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { onMount } from 'svelte';

	let username = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	onMount(async () => {
		// Check if already logged in
		if (store.user) {
			goto('/');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isLoading = true;

		try {
			const success = await store.login({ username, password });
			if (success) {
				goto('/');
			} else {
				error = 'Invalid username or password';
			}
		} catch {
			error = 'An error occurred during login';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Faved</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Welcome back</Card.Title>
			<Card.Description>Enter your credentials to access your bookmarks</Card.Description>
		</Card.Header>
		<Card.Content>
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
						{error}
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						type="text"
						bind:value={username}
						placeholder="Enter your username"
						required
						disabled={isLoading}
					/>
				</div>

				<div class="space-y-2">
					<Label for="password">Password</Label>
					<Input
						id="password"
						type="password"
						bind:value={password}
						placeholder="Enter your password"
						required
						disabled={isLoading}
					/>
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						Signing in...
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex justify-center">
			<p class="text-muted-foreground text-sm">
				Don't have an account? <a href="/setup" class="text-primary hover:underline">Set up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>

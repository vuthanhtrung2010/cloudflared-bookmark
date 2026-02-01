<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { onMount } from 'svelte';

	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let activeTab = $state('auth');

	// Import states
	let importFile = $state<File | null>(null);
	let isImporting = $state(false);
	let importResult = $state('');

	onMount(async () => {
		// Check if already logged in
		if (store.user) {
			goto('/');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}

		isLoading = true;

		try {
			const success = await store.createUser({
				username,
				password,
				confirm_password: confirmPassword
			});

			if (success) {
				activeTab = 'import';
			} else {
				error = 'Failed to create user';
			}
		} catch {
			error = 'An error occurred during registration';
		} finally {
			isLoading = false;
		}
	}

	async function handleImport() {
		if (!importFile) return;

		isImporting = true;
		importResult = '';

		try {
			const formData = new FormData();
			formData.append('browser-html', importFile);

			const response = await fetch('/api/import/bookmarks', {
				method: 'POST',
				body: formData
			});

			const result = (await response.json()) as { message?: string };

			if (response.ok) {
				importResult = result.message || 'Import successful!';
				await store.fetchItems();
				await store.fetchTags();
			} else {
				importResult = result.message || 'Import failed';
			}
		} catch {
			importResult = 'An error occurred during import';
		} finally {
			isImporting = false;
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			importFile = target.files[0];
		}
	}

	function goToDashboard() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Setup - Faved</title>
</svelte:head>

<div class="flex min-h-dvh items-center justify-center p-4">
	<Card.Root class="w-full max-w-lg">
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Welcome to Faved</Card.Title>
			<Card.Description>Set up your bookmark manager</Card.Description>
		</Card.Header>
		<Card.Content>
			<Tabs.Root bind:value={activeTab}>
				<Tabs.List class="grid w-full grid-cols-3">
					<Tabs.Trigger value="auth">1. Account</Tabs.Trigger>
					<Tabs.Trigger value="import" disabled={!store.user}>2. Import</Tabs.Trigger>
					<Tabs.Trigger value="finish" disabled={!store.user}>3. Finish</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="auth" class="mt-4">
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
								placeholder="Choose a username"
								required
								disabled={isLoading}
								minlength={3}
							/>
						</div>

						<div class="space-y-2">
							<Label for="password">Password</Label>
							<Input
								id="password"
								type="password"
								bind:value={password}
								placeholder="Choose a password"
								required
								disabled={isLoading}
								minlength={6}
							/>
						</div>

						<div class="space-y-2">
							<Label for="confirmPassword">Confirm Password</Label>
							<Input
								id="confirmPassword"
								type="password"
								bind:value={confirmPassword}
								placeholder="Confirm your password"
								required
								disabled={isLoading}
							/>
						</div>

						<Button type="submit" class="w-full" disabled={isLoading}>
							{#if isLoading}
								Creating account...
							{:else}
								Create Account
							{/if}
						</Button>
					</form>

					<p class="text-muted-foreground mt-4 text-center text-sm">
						Already have an account? <a href="/login" class="text-primary hover:underline">Login</a>
					</p>
				</Tabs.Content>

				<Tabs.Content value="import" class="mt-4 space-y-4">
					<p class="text-muted-foreground text-sm">
						Import your bookmarks from your browser or another service. This step is optional.
					</p>

					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="bookmarkFile">Browser Bookmarks (HTML)</Label>
							<Input
								id="bookmarkFile"
								type="file"
								accept=".html,.htm"
								onchange={handleFileChange}
								disabled={isImporting}
							/>
							<p class="text-muted-foreground text-xs">
								Export your bookmarks from your browser as HTML and upload here.
							</p>
						</div>

						<Button
							type="button"
							onclick={handleImport}
							disabled={isImporting || !importFile}
							class="w-full"
						>
							{#if isImporting}
								Importing...
							{:else}
								Import Bookmarks
							{/if}
						</Button>

						{#if importResult}
							<div
								class="rounded-md p-3 text-sm {importResult.includes('successful')
									? 'bg-green-500/10 text-green-600'
									: 'bg-destructive/10 text-destructive'}"
							>
								{importResult}
							</div>
						{/if}
					</div>

					<div class="flex justify-between pt-4">
						<Button variant="outline" onclick={() => (activeTab = 'auth')}>Back</Button>
						<Button onclick={() => (activeTab = 'finish')}>
							{importResult.includes('successful') ? 'Next' : 'Skip'}
						</Button>
					</div>
				</Tabs.Content>

				<Tabs.Content value="finish" class="mt-4 space-y-4 text-center">
					<div class="py-8">
						<h3 class="text-xl font-semibold">You're all set!</h3>
						<p class="text-muted-foreground mt-2">
							Your bookmark manager is ready to use. Start adding and organizing your bookmarks.
						</p>
					</div>

					<Button onclick={goToDashboard} class="w-full">Go to Dashboard</Button>
				</Tabs.Content>
			</Tabs.Root>
		</Card.Content>
	</Card.Root>
</div>

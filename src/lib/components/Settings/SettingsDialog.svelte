<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { store } from '$lib/stores/mainStore.svelte.js';
	import { goto } from '$app/navigation';

	interface Props {
		open?: boolean;
		onClose?: () => void;
	}

	let { open = false, onClose }: Props = $props();

	// Account settings
	let username = $state(store.user?.username || '');
	let password = $state('');
	let confirmPassword = $state('');
	let isUpdatingUsername = $state(false);
	let isUpdatingPassword = $state(false);
	let isDeletingUser = $state(false);

	// Reset form when dialog opens
	$effect(() => {
		if (open) {
			username = store.user?.username || '';
			password = '';
			confirmPassword = '';
		}
	});

	async function handleUpdateUsername() {
		if (!username) return;
		isUpdatingUsername = true;
		try {
			await store.updateUsername(username);
		} finally {
			isUpdatingUsername = false;
		}
	}

	async function handleUpdatePassword() {
		if (!password || password !== confirmPassword) return;
		isUpdatingPassword = true;
		try {
			const success = await store.updatePassword(password, confirmPassword);
			if (success) {
				password = '';
				confirmPassword = '';
			}
		} finally {
			isUpdatingPassword = false;
		}
	}

	async function handleDeleteAccount() {
		if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
			return;
		}
		isDeletingUser = true;
		try {
			const success = await store.deleteUser();
			if (success) {
				onClose?.();
				goto('/login');
			}
		} finally {
			isDeletingUser = false;
		}
	}
</script>

<Dialog.Root {open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
	<Dialog.Content class="max-h-[90vh] overflow-y-auto sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Settings</Dialog.Title>
			<Dialog.Description>Manage your account settings.</Dialog.Description>
		</Dialog.Header>

		<Tabs.Root value="account" class="mt-4">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="account">Account</Tabs.Trigger>
				<Tabs.Trigger value="about">About</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="account" class="space-y-6 pt-4">
				<!-- Username -->
				<div class="space-y-2">
					<Label for="settings-username">Username</Label>
					<div class="flex gap-2">
						<Input
							id="settings-username"
							type="text"
							bind:value={username}
							placeholder="Username"
							class="flex-1"
						/>
						<Button
							variant="outline"
							onclick={handleUpdateUsername}
							disabled={isUpdatingUsername || !username || username === store.user?.username}
						>
							{isUpdatingUsername ? 'Saving...' : 'Save'}
						</Button>
					</div>
				</div>

				<!-- Password -->
				<div class="space-y-2">
					<Label for="settings-password">New Password</Label>
					<Input
						id="settings-password"
						type="password"
						bind:value={password}
						placeholder="New password"
					/>
				</div>

				<div class="space-y-2">
					<Label for="settings-confirm">Confirm Password</Label>
					<div class="flex gap-2">
						<Input
							id="settings-confirm"
							type="password"
							bind:value={confirmPassword}
							placeholder="Confirm new password"
							class="flex-1"
						/>
						<Button
							variant="outline"
							onclick={handleUpdatePassword}
							disabled={isUpdatingPassword || !password || password !== confirmPassword}
						>
							{isUpdatingPassword ? 'Updating...' : 'Update'}
						</Button>
					</div>
					{#if password && confirmPassword && password !== confirmPassword}
						<p class="text-destructive text-sm">Passwords do not match</p>
					{/if}
				</div>

				<!-- Danger Zone -->
				<div class="border-destructive/50 rounded-lg border p-4">
					<h4 class="text-destructive mb-2 font-medium">Danger Zone</h4>
					<p class="text-muted-foreground mb-3 text-sm">
						Permanently delete your account and all data.
					</p>
					<Button
						variant="destructive"
						onclick={handleDeleteAccount}
						disabled={isDeletingUser}
					>
						{isDeletingUser ? 'Deleting...' : 'Delete Account'}
					</Button>
				</div>
			</Tabs.Content>

			<Tabs.Content value="about" class="space-y-4 pt-4">
				<div class="text-center">
					<h3 class="text-lg font-semibold">Faved</h3>
					<p class="text-muted-foreground text-sm">Your personal bookmark manager</p>
					<p class="text-muted-foreground mt-2 text-xs">Version 1.0.0</p>
				</div>

				<div class="space-y-2 text-sm">
					<p>
						<strong>Built with:</strong> SvelteKit, Cloudflare Workers, D1
					</p>
					<p>
						<strong>UI:</strong> shadcn-svelte, Tailwind CSS
					</p>
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={onClose}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

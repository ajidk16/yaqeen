<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Shield, Key, Smartphone, LogOut, Trash2, EyeOff, Eye, Lock } from 'lucide-svelte';
	import { Card, Button, Input, Badge } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import type { PageData } from './$types';
	import { formatDateTime } from '$lib/utils/format';

	let { data } = $props<{ data: PageData }>();

	let isUpdatingPassword = $state(false);
	let isDeleting = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	const showPassword = $state({
		now: false,
		new: false,
		confirm: false,
	});
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={()=>goto('/profile')}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Keamanan</h1>
				<p class="text-base-content/60 text-sm">Kelola keamanan akun Anda</p>
			</div>
		</header>

		<div class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 100 }}>
			<!-- Password -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<form 
					method="POST" 
					action="?/updatePassword"
					use:enhance={() => {
						isUpdatingPassword = true;
						return async ({ result, update }) => {
							isUpdatingPassword = false;
							if (result.type === 'success') {
								toast.add('Password updated successfully!', 'success');
								triggerConfetti();
								update();
							} else {
								// @ts-ignore
								toast.add(result.data?.message || 'Failed to update password.', 'error');
							}
						};
					}}
					class="space-y-4"
				>
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Key class="size-5 text-primary" />
						Ganti Password
					</h3>
					
					<div class="space-y-3">
						<Input
							type={showPassword.now ? 'text' : 'password'}
							name="currentPassword"
							placeholder="Password Saat Ini"
							startIcon={Lock}
							endIcon={showPassword.now ? EyeOff : Eye}
							onendIconClick={() => showPassword.now = !showPassword.now}
							required
							class="bg-base-200/50 focus:bg-base-100"
						/>
						<Input
							type={showPassword.new ? 'text' : 'password'}
							name="newPassword"
							placeholder="Password Baru"
							startIcon={Lock}
							endIcon={showPassword.new ? EyeOff : Eye}
							onendIconClick={() => showPassword.new = !showPassword.new}
							required
							class="bg-base-200/50 focus:bg-base-100"
						/>
						<Input
							type={showPassword.confirm ? 'text' : 'password'}
							name="confirmPassword"
							placeholder="Konfirmasi Password Baru"
							startIcon={Lock}
							endIcon={showPassword.confirm ? EyeOff : Eye}
							onendIconClick={() => showPassword.confirm = !showPassword.confirm}
							required
							class="bg-base-200/50 focus:bg-base-100"
						/>
					</div>
					
					<div class="flex justify-end">
						<Button 
							type="submit" 
							variant="primary"
							size="sm"
							disabled={isUpdatingPassword}
						>
							{#if isUpdatingPassword}
								<span class="loading loading-spinner loading-xs"></span>
							{/if}
							Update Password
						</Button>
					</div>
				</form>
			</Card>

			<!-- 2FA -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
							<Shield class="size-5" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<p class="font-medium">Two-Factor Authentication</p>
								<Badge variant="warning" size="sm hidden lg:block">Coming Soon</Badge>
							</div>
							<p class="text-xs text-base-content/40">Tambahan lapisan keamanan</p>
						</div>
					</div>
					<input type="checkbox" class="toggle toggle-primary" disabled />
				</div>
			</Card>

			<!-- Active Sessions -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="space-y-4">
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Smartphone class="size-5 text-secondary" />
						Sesi Aktif
					</h3>
					
					<div class="space-y-3">
						{#each data.sessions as session}
							<div class="flex items-center justify-between p-3 rounded-xl bg-base-200/30">
								<div class="flex items-center gap-3">
									<Smartphone class="size-5 text-base-content/40" />
									<div>
										<p class="font-medium text-sm">{session.device.split('/')[1]}</p>
										<p class="text-xs text-base-content/40">{session.location} • {formatDateTime(session.lastActive)}</p>
									</div>
								</div>
								{#if session.active}
									<Badge variant="success" size="sm">This Device</Badge>
								{:else}
									<form 
										method="POST" 
										action="?/revokeSession"
										use:enhance
									>
										<input type="hidden" name="sessionId" value={session.id} />
										<Button type="submit" variant="ghost" size="xs" circle class="text-error">
											<LogOut class="size-4" />
										</Button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</Card>

			<!-- Danger Zone -->
			<div class="pt-8">
				<div class="p-4 rounded-xl border border-error/20 bg-error/5 space-y-4">
					<div>
						<h4 class="font-bold text-error">Danger Zone</h4>
						<p class="text-xs text-base-content/60">Tindakan ini tidak dapat dibatalkan.</p>
					</div>
					<form 
						method="POST" 
						action="?/deleteAccount"
						use:enhance={({ cancel }) => {
							if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
								cancel();
								return;
							}
							isDeleting = true;
							return async ({ result }) => {
								isDeleting = false;
								if (result.type === 'error') {
									toast.add('Failed to delete account.', 'error');
								}
							};
						}}
					>
						<Button 
							type="submit"
							class="w-full border-error text-error hover:bg-error hover:text-white gap-2"
							disabled={isDeleting}
						>
							{#if isDeleting}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
								<Trash2 class="size-4" />
							{/if}
							Hapus Akun Permanen
						</Button>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>

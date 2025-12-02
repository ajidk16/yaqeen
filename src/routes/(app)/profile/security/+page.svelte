<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Shield, Key, Smartphone, LogOut, Trash2 } from 'lucide-svelte';
	import { Card, Button, Input, Badge } from '$lib/components/ui';

	let sessions = [
		{ device: 'iPhone 13 Pro', location: 'Jakarta, ID', active: true, lastActive: 'Now' },
		{ device: 'MacBook Air', location: 'Jakarta, ID', active: false, lastActive: '2 days ago' }
	];
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" href="/profile">
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
				<div class="p-6 space-y-4">
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Key class="size-5 text-primary" />
						Ganti Password
					</h3>
					
					<div class="space-y-3">
						<Input type="password" placeholder="Password Saat Ini" class="bg-base-200/50" />
						<Input type="password" placeholder="Password Baru" class="bg-base-200/50" />
						<Input type="password" placeholder="Konfirmasi Password Baru" class="bg-base-200/50" />
					</div>
					
					<div class="flex justify-end">
						<Button variant="outline" size="sm">Update Password</Button>
					</div>
				</div>
			</Card>

			<!-- 2FA -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
							<Shield class="size-5" />
						</div>
						<div>
							<div class="flex items-center gap-2">
								<p class="font-medium">Two-Factor Authentication</p>
								<Badge variant="warning" size="sm">Coming Soon</Badge>
							</div>
							<p class="text-xs text-base-content/40">Tambahan lapisan keamanan</p>
						</div>
					</div>
					<input type="checkbox" class="toggle toggle-primary" disabled />
				</div>
			</Card>

			<!-- Active Sessions -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 space-y-4">
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Smartphone class="size-5 text-secondary" />
						Sesi Aktif
					</h3>
					
					<div class="space-y-3">
						{#each sessions as session}
							<div class="flex items-center justify-between p-3 rounded-xl bg-base-200/30">
								<div class="flex items-center gap-3">
									<Smartphone class="size-5 text-base-content/40" />
									<div>
										<p class="font-medium text-sm">{session.device}</p>
										<p class="text-xs text-base-content/40">{session.location} • {session.lastActive}</p>
									</div>
								</div>
								{#if session.active}
									<Badge variant="success" size="sm">This Device</Badge>
								{:else}
									<Button variant="ghost" size="xs" circle class="text-error">
										<LogOut class="size-4" />
									</Button>
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
					<Button variant="outline" class="w-full border-error text-error hover:bg-error hover:text-white gap-2">
						<Trash2 class="size-4" />
						Hapus Akun Permanen
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

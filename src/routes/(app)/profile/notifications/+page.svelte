<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Bell, Clock, Zap, Info } from 'lucide-svelte';
	import { Card, Button } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';

	const profile = $derived(page?.data?.user??	null)

	let isSaving = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={()=>goto('/profile')}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Notifikasi</h1>
				<p class="text-base-content/60 text-sm">Atur pengingat dan pemberitahuan</p>
			</div>
		</header>

		<form 
			method="POST" 
			action="?/update" 
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						toast.add('Pengaturan notifikasi berhasil disimpan!', 'success');
						triggerConfetti();
						update();
					} else {
						toast.add('Gagal menyimpan pengaturan.', 'error');
					}
				};
			}}
			class="space-y-6" 
			in:fly={{ y: 20, duration: 800, delay: 100 }}
		>
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-primary/10 text-primary">
							<Bell class="size-5" />
						</div>
						<div>
							<p class="font-medium">Izinkan Notifikasi</p>
							<p class="text-xs text-base-content/40">Matikan untuk senyapkan semua</p>
						</div>
					</div>
					<input 
						type="checkbox" 
						name="pushEnabled"
						class="toggle toggle-primary" 
						bind:checked={profile.preferences.notifications} 
					/>
				</div>
			</Card>

			{#if profile?.preferences.notifications}
				<div class="bg-base-100 shadow-sm border border-base-content/10 rounded-box" transition:fade>
					<div class="p-6 space-y-4">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Clock class="size-5 text-secondary" />
							Waktu Sholat (Adzan)
						</h3>
						
						<div class="space-y-3">
							{#each Object.entries(profile?.preferences?.notificationSettings?.prayers??[]) as [prayer, enabled]}
								<div class="flex items-center justify-between p-2 hover:bg-base-200/50 rounded-lg transition-colors">
									<span class="capitalize font-medium text-base-content/80">{prayer}</span>
									<input 
										type="checkbox" 
										name={prayer}
										class="toggle toggle-sm toggle-secondary" 
										bind:checked={profile.preferences.notificationSettings.prayers[prayer as keyof typeof profile.preferences.notificationSettings.prayers]}
									/>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div class="bg-base-100 shadow-sm border border-base-content/10 rounded-box" transition:fade>
					<div class="p-6 space-y-4">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Zap class="size-5 text-accent" />
							Lainnya
						</h3>
						
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Pengingat Kebiasaan</p>
									<p class="text-xs text-base-content/40">Reminder harian untuk habit</p>
								</div>
								<input 
									type="checkbox" 
									name="habits"
									class="toggle toggle-accent" 
									bind:checked={profile.preferences.notificationSettings.habits} 
								/>
							</div>

							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Info & Update Aplikasi</p>
									<p class="text-xs text-base-content/40">Berita fitur baru</p>
								</div>
								<input 
									type="checkbox" 
									name="updates"
									class="toggle toggle-accent" 
									bind:checked={profile.preferences.notificationSettings.updates}
								/>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="sticky bottom-6 pt-4">
				<Button 
					type="submit" 
					variant="primary" 
					class="w-full shadow-lg shadow-primary/20"
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-sm"></span>
						Menyimpan...
					{:else}
						Simpan Pengaturan
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>

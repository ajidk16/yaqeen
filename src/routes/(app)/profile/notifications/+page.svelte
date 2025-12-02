<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Bell, Clock, Zap, Info } from 'lucide-svelte';
	import { Card, Button } from '$lib/components/ui';

	let notifications = $state({
		pushEnabled: true,
		prayers: {
			fajr: true,
			dhuhr: true,
			asr: true,
			maghrib: true,
			isha: true
		},
		habits: true,
		updates: false
	});
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" href="/profile">
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Notifikasi</h1>
				<p class="text-base-content/60 text-sm">Atur pengingat dan pemberitahuan</p>
			</div>
		</header>

		<div class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 100 }}>
			<!-- Global Toggle -->
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
					<input type="checkbox" class="toggle toggle-primary" bind:checked={notifications.pushEnabled} />
				</div>
			</Card>

			{#if notifications.pushEnabled}
				<!-- Prayer Times -->
				<div class="bg-base-100 shadow-sm border border-base-content/10" transition:fade>
					<div class="p-6 space-y-4">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Clock class="size-5 text-secondary" />
							Waktu Sholat (Adzan)
						</h3>
						
						<div class="space-y-3">
							{#each Object.entries(notifications.prayers) as [prayer, enabled]}
								<div class="flex items-center justify-between p-2 hover:bg-base-200/50 rounded-lg transition-colors">
									<span class="capitalize font-medium text-base-content/80">{prayer}</span>
									<input 
										type="checkbox" 
										class="toggle toggle-sm toggle-secondary" 
										checked={enabled} 
										onclick={() => notifications.prayers[prayer as keyof typeof notifications.prayers] = !enabled}
									/>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Other Notifications -->
				<div class="bg-base-100 shadow-sm border border-base-content/10" transition:fade>
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
								<input type="checkbox" class="toggle toggle-accent" bind:checked={notifications.habits} />
							</div>

							<div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Info & Update Aplikasi</p>
									<p class="text-xs text-base-content/40">Berita fitur baru</p>
								</div>
								<input type="checkbox" class="toggle toggle-accent" bind:checked={notifications.updates} />
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

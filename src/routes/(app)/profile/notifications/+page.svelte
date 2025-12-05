<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Bell, Clock, Zap, Info, Play, Pause } from 'lucide-svelte';
	import { Card, Button } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PrayerTimer } from '$lib/runes/prayer.svelte';

	const profile = $derived(page?.data?.user ?? null);

	let isSaving = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	const timer = new PrayerTimer(page.data?.prayerTimes || []);

	let isPlayingSound = $state(false);
	let audio: HTMLAudioElement | undefined;

	function stopSound() {
		if (audio) {
			audio.pause();
			audio.currentTime = 0;
		}
		isPlayingSound = false;
	}

	function toggleSound(type: string) {
		if (isPlayingSound) {
			stopSound();
		} else {
			stopSound(); // Ensure any previous sound is stopped
			audio = new Audio(`/audio/${type}.mp3`);
			audio.addEventListener('ended', () => {
				isPlayingSound = false;
			});
			audio.play().catch((e) => {
				console.error('Error playing sound:', e);
				toast.add('Gagal memutar suara. Pastikan file audio tersedia.', 'error');
				isPlayingSound = false;
			});
			isPlayingSound = true;
		}
	}

	const input = $state({
		notifications: false,
		notificationSettings: {
			prayers: {
				fajr: false,
				dhuhr: false,
				asr: false,
				maghrib: false,
				isha: false
			},
			habits: false,
			sound: 'notification'
		}
	});

	onMount(() => {
		if (profile?.preferences) {
			input.notifications = profile?.preferences?.notifications;
			input.notificationSettings = profile?.preferences?.notificationSettings;
		}
	});
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={() => goto('/profile')}>
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
						// update();
					} else {
						toast.add('Gagal menyimpan pengaturan.', 'error');
					}
				};
			}}
			class="space-y-6"
			in:fly={{ y: 20, duration: 800, delay: 100 }}
		>
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="flex items-center justify-between">
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
						bind:checked={input.notifications}
					/>
				</div>
			</Card>

			{#if input.notifications}
				<div
					class="bg-base-100 shadow-sm border border-base-content/10 rounded-box"
					transition:fade
				>
					<div class="p-6 space-y-4">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Clock class="size-5 text-secondary" />
							Waktu Sholat (Adzan)
						</h3>

						<div class="space-y-3">
							{#each Object.entries(input.notificationSettings.prayers) as [prayer, enabled]}
								<div
									class="flex items-center justify-between p-2 hover:bg-base-200/50 rounded-lg transition-colors"
								>
									<span class="capitalize font-medium text-base-content/80">{prayer}</span>
									<input
										type="checkbox"
										name={prayer}
										class="toggle toggle-sm toggle-secondary"
										bind:checked={input.notificationSettings.prayers[prayer as keyof typeof input.notificationSettings.prayers]}
									/>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div
					class="bg-base-100 shadow-sm border border-base-content/10 rounded-box"
					transition:fade
				>
					<div class="p-6 space-y-4">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Info class="size-5 text-info" />
							Test Suara
						</h3>

						<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<select
								class="select select-accent"
								name="sound"
								bind:value={input.notificationSettings.sound}
							>
								<option value="notification">Notifikasi</option>
								<option value="bird">Burung</option>
								<option value="adzan">Adzan</option>
							</select>
							<button
								type="button"
								class="btn btn-circle {isPlayingSound ? 'btn-secondary' : 'btn-accent'}"
								disabled={!input.notificationSettings.sound}
								onclick={() => {
									toggleSound(input.notificationSettings.sound);
								}}
							>
								{#if isPlayingSound}
									<Pause class="size-4" />
								{:else}
									<Play class="size-4" />
								{/if}
							</button>
						</div>
					</div>
				</div>

				<div
					class="bg-base-100 shadow-sm border border-base-content/10 rounded-box"
					transition:fade
				>
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
									bind:checked={input.notificationSettings.habits}
								/>
							</div>

							<!-- <div class="flex items-center justify-between">
								<div>
									<p class="font-medium">Info & Update Aplikasi</p>
									<p class="text-xs text-base-content/40">Berita fitur baru</p>
								</div>
								<input
									type="checkbox"
									name="updates"
									class="toggle toggle-accent"
									bind:checked={input.notificationSettings.updates}
								/>
							</div> -->
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

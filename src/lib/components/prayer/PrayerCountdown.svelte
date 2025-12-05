<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { Volume2, VolumeX } from 'lucide-svelte';
	import type { PrayerTime } from '$lib/server/services/prayer';
	import { formatTimeDiff } from '$lib/utils/format';

	let {
		prayerTimes = [],
		soundPreference = 'notification'
	}: { prayerTimes: PrayerTime[]; soundPreference?: string } = $props();

	let currentTime = $state(new Date());
	let nextPrayer = $state<PrayerTime | null>(null);
	let currentPrayer = $state<PrayerTime | null>(null);
	let timeToNext = $state('');
	let status = $state<'upcoming' | 'near' | 'now' | 'praying'>('upcoming');
	let audio: HTMLAudioElement;
	let isMuted = $state(false);
	let showWidget = $state(true);
	let isPlayingTest = $state(false);

	// Map preference to file path
	let audioSrc = $derived.by(() => {
		if (soundPreference === 'adzan') return '/audio/adzan.mp3';
		if (soundPreference === 'bird') return '/audio/bird.mp3';
		return '/audio/notification.mp3'; // Default
	});

	function playAudio() {
		if (audio && !isMuted) {
			audio.currentTime = 0;
			audio.play().catch((e) => console.error('Audio play failed', e));
		}
	}

	function testAudio() {
		if (audio) {
			if (isPlayingTest) {
				audio.pause();
				audio.currentTime = 0;
				isPlayingTest = false;
			} else {
				audio.currentTime = 0;
				audio
					.play()
					.then(() => {
						isPlayingTest = true;
						audio.onended = () => {
							isPlayingTest = false;
							audio.onended = null;
						};
					})
					.catch((e) => console.error('Audio play failed', e));
			}
		}
	}

	function updateTimer() {
		const now = new Date();
		currentTime = now;
		const nowTs = now.getTime();

		const activePrayer = prayerTimes.find((p) => {
			const diff = nowTs - p.timestamp;
			return diff >= 0 && diff <= 10 * 60 * 1000; // 0 to 10 mins after
		});

		if (activePrayer) {
			status = 'praying';
			currentPrayer = activePrayer;
			nextPrayer = null; // Hide next prayer countdown while praying? Or show both? User said "muncul text sedang solat", implies priority.

			const timeSinceStart = nowTs - activePrayer.timestamp;
			if (activePrayer.id !== lastPlayedPrayerId && timeSinceStart < 5000 && !isMuted) {
				playAudio();
				lastPlayedPrayerId = activePrayer.id;
			}
			return;
		}

		let upcoming = prayerTimes.find((p) => p.timestamp > nowTs);

		if (!upcoming && prayerTimes.length > 0) {
			const firstPrayer = prayerTimes[0];
			upcoming = {
				...firstPrayer,
				timestamp: firstPrayer.timestamp + 24 * 60 * 60 * 1000
			};
		}

		if (upcoming) {
			nextPrayer = upcoming;
			const diff = upcoming.timestamp - nowTs;
			timeToNext = formatTimeDiff(diff);

			if (diff <= 5 * 60 * 1000 && diff > 0) {
				status = 'near';
			} else {
				status = 'upcoming';
			}

			// Reset lastPlayedPrayerId if we are far from the last prayer
			if (currentPrayer && nowTs - currentPrayer.timestamp > 10 * 60 * 1000) {
				lastPlayedPrayerId = null;
			}
		}
	}

	let interval: NodeJS.Timeout;
	let lastPlayedPrayerId = $state<string | null>(null);

	onMount(() => {
		updateTimer();
		interval = setInterval(updateTimer, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

{#if status === 'praying' && currentPrayer}
	<div
		transition:slide
		class="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-content p-3 text-center shadow-lg flex items-center justify-center gap-2"
	>
		<span class="loading loading-ring loading-sm"></span>
		<span class="font-bold">Sedang Berlangsung Solat {currentPrayer.name}</span>
	</div>
{/if}

{#if (status === 'near' || status === 'upcoming') && nextPrayer && showWidget}
	<div transition:fade class="fixed bottom-20 right-4 z-40 hidden md:flex flex-col items-end gap-2">
		<!-- Desktop Widget -->
		<div class="card w-64 bg-base-100/80 backdrop-blur shadow-xl border border-base-200">
			<div class="card-body p-4">
				<div class="flex justify-between items-center mb-2">
					<h3 class="font-bold text-sm text-base-content/70">
						Menuju {nextPrayer.name ?? 'Shubuh'}
					</h3>
					<div class="flex gap-1">
						<button class="btn btn-ghost btn-xs btn-circle" onclick={testAudio} title="Test Sound">
							{#if isPlayingTest}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
								<Volume2 size={14} class="text-primary" />
							{/if}
						</button>
						<button class="btn btn-ghost btn-xs btn-circle" onclick={() => (isMuted = !isMuted)}>
							{#if isMuted}
								<VolumeX size={14} />
							{:else}
								<Volume2 size={14} />
							{/if}
						</button>
					</div>
				</div>
				<div class="text-3xl font-mono font-bold text-primary tracking-wider">
					{timeToNext}
				</div>
				{#if status === 'near'}
					<div class="text-xs text-warning font-medium mt-1 animate-pulse">
						Waktu solat segera tiba!
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Mobile Top Banner for "Near" status only? Or always? User said "countdown jalan". -->
	<!-- Let's put a small floating pill on mobile top or bottom -->
	<div class="fixed top-4 right-4 z-40 md:hidden">
		<div
			class="badge badge-lg gap-2 shadow-lg {status === 'near' ? 'badge-warning' : 'badge-neutral'}"
		>
			<span class="font-bold">{nextPrayer.name}</span>
			<span class="font-mono">{timeToNext}</span>
		</div>
	</div>
{/if}

<audio bind:this={audio} src={audioSrc} preload="auto"></audio>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { MapPin, Bell, BellOff, Clock, Loader2, Volume2, Navigation, RefreshCw } from 'lucide-svelte';
	import { Card, Button, Badge } from '$lib/components/ui';

	// Types
	interface PrayerTime {
		id: string;
		name: string;
		time: string; // HH:mm
		timestamp: number; // Unix timestamp
		isNext: boolean;
		isPassed: boolean;
		notificationEnabled: boolean;
	}

	// State
	let locationName = $state('Detecting Location...');
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let prayers = $state<PrayerTime[]>([]);
	let nextPrayer = $state<PrayerTime | null>(null);
	let timeToNextPrayer = $state('');
	let currentTime = $state(new Date());
	
	let timerInterval: any;

	// Constants
	const PRAYER_NAMES = {
		Fajr: 'Subuh',
		Dhuhr: 'Dzuhur',
		Asr: 'Ashar',
		Maghrib: 'Maghrib',
		Isha: 'Isya'
	};

	onMount(() => {
		initLocation();
		timerInterval = setInterval(() => {
			currentTime = new Date();
			updateCountdown();
		}, 1000);
	});

	onDestroy(() => {
		if (timerInterval) clearInterval(timerInterval);
	});

	async function initLocation() {
		isLoading = true;
		error = null;

		if (!navigator.geolocation) {
			error = "Geolocation is not supported by your browser";
			isLoading = false;
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				await fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
			},
			(err) => {
				console.error(err);
				error = "Unable to retrieve your location. Using default (Jakarta).";
				// Fallback to Jakarta
				fetchPrayerTimes(-6.2088, 106.8456);
			}
		);
	}

	async function fetchPrayerTimes(lat: number, lng: number) {
		try {
			// Get Location Name (Reverse Geocoding - simplified for now using API response if available or generic)
			// For this demo, we'll try to get city from Aladhan or just show coords/generic
			
			const date = new Date();
			const method = 20; // Kemenag RI
			
			const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=${method}`);
			const data = await response.json();

			if (data.code === 200) {
				const timings = data.data.timings;
				const meta = data.data.meta;
				
				locationName = meta.timezone; // Aladhan returns timezone, usually "Asia/Jakarta"

				// Process Prayers
				const prayerList: PrayerTime[] = Object.entries(timings)
					.filter(([key]) => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key))
					.map(([key, timeStr]) => {
						const [hours, minutes] = (timeStr as string).split(':');
						const prayerDate = new Date();
						prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

						return {
							id: key,
							name: PRAYER_NAMES[key as keyof typeof PRAYER_NAMES],
							time: timeStr as string,
							timestamp: prayerDate.getTime(),
							isNext: false,
							isPassed: false,
							notificationEnabled: true // Default on
						};
					})
					.sort((a, b) => a.timestamp - b.timestamp);

				prayers = prayerList;
				updatePrayerStatus();
			} else {
				error = "Failed to fetch prayer times data";
			}
		} catch (e) {
			error = "Network error occurred";
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	function updatePrayerStatus() {
		const now = new Date().getTime();
		let foundNext = false;

		prayers = prayers.map(p => {
			const isPassed = p.timestamp < now;
			let isNext = false;

			if (!isPassed && !foundNext) {
				isNext = true;
				foundNext = true;
				nextPrayer = p;
			}

			return { ...p, isPassed, isNext };
		});

		// If all passed, next is Fajr tomorrow (logic simplified: just show "All done" or handle tomorrow fetch)
		if (!foundNext && prayers.length > 0) {
			nextPrayer = null; // Or handle tomorrow's Fajr
			timeToNextPrayer = "See you tomorrow!";
		}
	}

	function updateCountdown() {
		if (!nextPrayer) return;

		const now = new Date().getTime();
		const diff = nextPrayer.timestamp - now;

		if (diff <= 0) {
			updatePrayerStatus(); // Refresh status if time passed
			return;
		}

		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		timeToNextPrayer = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function toggleNotification(id: string) {
		const index = prayers.findIndex(p => p.id === id);
		if (index !== -1) {
			prayers[index].notificationEnabled = !prayers[index].notificationEnabled;
		}
	}

	function formatTime(date: Date) {
		return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-md mx-auto space-y-6">
		
		<!-- Header / Location -->
		<div class="flex items-center justify-between" in:fly={{ y: -20, duration: 800 }}>
			<div>
				<h1 class="text-2xl font-bold">Jadwal Sholat</h1>
				<div class="flex items-center gap-2 text-base-content/60 mt-1">
					<MapPin class="size-4 text-primary" />
					<span class="text-sm font-medium">{locationName}</span>
				</div>
			</div>
			<Button variant="ghost" size="sm" circle onclick={initLocation} disabled={isLoading}>
				<RefreshCw class="size-5 {isLoading ? 'animate-spin' : ''}" />
			</Button>
		</div>

		{#if error}
			<div class="alert alert-error shadow-sm" transition:slide>
				<span>{error}</span>
			</div>
		{/if}

		<!-- Hero Countdown -->
		<div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-focus text-primary-content shadow-xl" in:scale={{ duration: 600, start: 0.95 }}>
			<!-- Decorative Background Elements -->
			<div class="absolute top-0 right-0 -mt-10 -mr-10 size-40 rounded-full bg-white/10 blur-3xl"></div>
			<div class="absolute bottom-0 left-0 -mb-10 -ml-10 size-40 rounded-full bg-black/10 blur-3xl"></div>

			<div class="relative p-8 text-center space-y-2">
				<p class="text-primary-content/80 font-medium tracking-wide text-sm uppercase">Next Prayer</p>
				
				{#if isLoading}
					<div class="h-16 flex items-center justify-center">
						<Loader2 class="size-8 animate-spin" />
					</div>
				{:else if nextPrayer}
					<h2 class="text-4xl font-bold tracking-tight">{nextPrayer.name}</h2>
					<div class="text-6xl font-black font-mono tracking-tighter my-4 tabular-nums">
						{timeToNextPrayer}
					</div>
					<div class="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
						<Clock class="size-4" />
						<span>{nextPrayer.time}</span>
					</div>
				{:else}
					<div class="py-8">
						<h2 class="text-2xl font-bold">All prayers done</h2>
						<p class="text-primary-content/80">See you tomorrow!</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prayer List -->
		<div class="space-y-3">
			{#if isLoading}
				{#each Array(5) as _}
					<div class="skeleton h-20 w-full rounded-2xl"></div>
				{/each}
			{:else}
				{#each prayers as prayer, i (prayer.id)}
					<div 
						class="group relative overflow-hidden rounded-2xl border transition-all duration-300
						{prayer.isNext 
							? 'bg-base-100 border-primary shadow-lg scale-[1.02] z-10' 
							: 'bg-base-100/50 border-base-content/5 hover:bg-base-100 hover:border-base-content/20'}"
						in:fly={{ y: 20, duration: 500, delay: i * 100 }}
					>
						<!-- Active Indicator Strip -->
						{#if prayer.isNext}
							<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
						{/if}

						<div class="p-4 flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div class="flex flex-col items-center justify-center size-12 rounded-xl {prayer.isNext ? 'bg-primary/10 text-primary' : 'bg-base-200 text-base-content/50'}">
									<span class="text-xs font-bold uppercase">{prayer.id.substring(0, 3)}</span>
								</div>
								<div>
									<h3 class="font-bold text-lg {prayer.isNext ? 'text-primary' : ''}">{prayer.name}</h3>
									<p class="text-sm font-mono {prayer.isPassed ? 'text-base-content/40 line-through' : 'text-base-content/60'}">
										{prayer.time}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								{#if prayer.isNext}
									<Badge variant="primary" class="animate-pulse">Next</Badge>
								{/if}
								
								<button 
									class="btn btn-circle btn-sm btn-ghost transition-colors {prayer.notificationEnabled ? 'text-primary' : 'text-base-content/30'}"
									onclick={() => toggleNotification(prayer.id)}
								>
									{#if prayer.notificationEnabled}
										<Bell class="size-5" />
									{:else}
										<BellOff class="size-5" />
									{/if}
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer Info -->
		<div class="text-center text-xs text-base-content/40 pb-8">
			<p>Data provided by Aladhan API</p>
			<p>Calculation Method: Kemenag RI</p>
		</div>

	</div>
</div>

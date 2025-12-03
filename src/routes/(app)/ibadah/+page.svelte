<script lang="ts">
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Sun, Moon, Users, User, Check, Calendar, ChevronLeft, ChevronRight, Star, MapPin, Loader2 } from 'lucide-svelte';
	import { Card, Button, Badge } from '$lib/components/ui';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	let selectedDate = $state(new Date(data.date));
	let isLoadingTimes = $state(false);
	let locationName = $state('Jakarta, ID');
	const ibadahHabits = $derived(data.ibadahHabits);
	
	// Fardhu Prayers State
	type PrayerStatus = 'none' | 'munfarid' | 'jamaah';
	
	interface FardhuPrayer {
		id: string;
		name: string;
		time: string;
		status: PrayerStatus;
		icon: any;
	}

	let fardhuPrayers = $state<FardhuPrayer[]>([
		{ id: 'subuh', name: 'Subuh', time: '--:--', status: 'none', icon: Moon },
		{ id: 'dzuhur', name: 'Dzuhur', time: '--:--', status: 'none', icon: Sun },
		{ id: 'ashar', name: 'Ashar', time: '--:--', status: 'none', icon: Sun },
		{ id: 'maghrib', name: 'Maghrib', time: '--:--', status: 'none', icon: Moon },
		{ id: 'isya', name: 'Isya', time: '--:--', status: 'none', icon: Moon }
	]);

	// Sunnah Prayers State (Habits)
	interface SunnahPrayer {
		id: string;
		title: string; // Changed from name to title to match DB
		category: string;
		completed: boolean;
		time?: string;
	}

	let sunnahPrayers = $state<SunnahPrayer[]>([]);

	// Initialize from data
	$effect(() => {
		if (data.prayerLogs) {
			fardhuPrayers.forEach(prayer => {
				const log = data.prayerLogs.find((l: any) => l.prayerName === prayer?.id);
				prayer.status = (log?.status as PrayerStatus) || 'none';
			});
		}
		
		if (data.sunnahPrayers) {
			sunnahPrayers = data.sunnahPrayers.map((h: any) => ({
				id: h.id,
				title: h.title,
				category: h.category,
				completed: h.completed,
				time: h.time
			}));
		}

		selectedDate = new Date(data.date);
	});

	async function updateFardhuStatus(id: string, status: PrayerStatus) {
		// Optimistic update
		const index = fardhuPrayers.findIndex(p => p.id === id);
		if (index !== -1) {
			fardhuPrayers[index].status = status;
		}

		const formData = new FormData();
		formData.append('prayerName', id);
		formData.append('status', status);

		await fetch(`?/updatePrayer&date=${data.date}`, {
			method: 'POST',
			body: formData
		});
		
		// Ideally handle error and revert if needed
		invalidateAll();
	}

	async function toggleSunnah(id: string) {
		// Optimistic update
		const index = sunnahPrayers.findIndex(p => p.id === id);
		if (index !== -1) {
			sunnahPrayers[index].completed = !sunnahPrayers[index].completed;
		}

		const formData = new FormData();
		formData.append('habitId', id);

		await fetch(`?/toggleHabit&date=${data.date}`, {
			method: 'POST',
			body: formData
		});

		invalidateAll();
	}

	// Date Navigation
	function changeDate(days: number) {
		const newDate = new Date(selectedDate);
		newDate.setDate(selectedDate.getDate() + days);
		const dateStr = newDate.toISOString().split('T')[0];
		goto(`?date=${dateStr}`);
	}

	// Fetch Prayer Times
	async function fetchPrayerTimes() {
		isLoadingTimes = true;
		try {
			// Jakarta Coordinates
			const lat = -6.2088;
			const lng = 106.8456;
			const method = 20; // Kemenag RI
			
			const dateStr = `${selectedDate.getDate()}-${selectedDate.getMonth() + 1}-${selectedDate.getFullYear()}`;
			
			const response = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`);
			const resData = await response.json();
			
			if (resData.code === 200) {
				const timings = resData.data.timings;
				
				// Update Fardhu times
				const timeMap: Record<string, string> = {
					'subuh': timings.Fajr,
					'dzuhur': timings.Dhuhr,
					'ashar': timings.Asr,
					'maghrib': timings.Maghrib,
					'isya': timings.Isha
				};

				fardhuPrayers = fardhuPrayers.map(p => ({
					...p,
					time: timeMap[p.id] || p.time
				}));
			}
		} catch (e) {
			console.error("Failed to fetch prayer times", e);
		} finally {
			isLoadingTimes = false;
		}
	}

	// Reactivity
	$effect(() => {
		// Re-fetch times whenever date changes
		fetchPrayerTimes();
	});

	// Progress Calculation
	let fardhuProgress = $derived(
		fardhuPrayers.length > 0 
			? (fardhuPrayers.filter(p => p.status !== 'none').length / fardhuPrayers.length) * 100 
			: 0
	);
	
	let sunnahProgress = $derived(
		sunnahPrayers.length > 0
			? (sunnahPrayers.filter(p => p.completed).length / sunnahPrayers.length) * 100
			: 0
	);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
	};
	
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row justify-between items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold">Ibadah Tracker</h1>
				<div class="flex items-center gap-2 text-base-content/60 mt-1">
					<MapPin class="size-4" />
					<span class="text-sm">{locationName}</span>
				</div>
			</div>
			
			<div class="flex items-center gap-4 bg-base-200 rounded-full p-1 pr-4">
				<Button variant="ghost" size="sm" circle onclick={() => changeDate(-1)}>
					<ChevronLeft class="size-5" />
				</Button>
				<div class="flex items-center gap-2 font-medium min-w-[180px] justify-center">
					<Calendar class="size-4 text-primary" />
					<span>{formatDate(selectedDate)}</span>
				</div>
				<Button variant="ghost" size="sm" circle onclick={() => changeDate(1)}>
					<ChevronRight class="size-5" />
				</Button>
			</div>
		</div>

		<!-- Progress Overview -->
		<div class="grid grid-cols-2 gap-4" in:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }}>
			<Card class="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
				<div class="p-4 text-center">
					<h3 class="text-sm font-medium text-base-content/70 mb-2">Fardhu Completion</h3>
					<div class="text-3xl font-bold text-primary">{Math.round(fardhuProgress)}%</div>
					<progress class="progress progress-primary w-full mt-2" value={fardhuProgress} max="100"></progress>
				</div>
			</Card>
			<Card class="bg-linear-to-br from-secondary/10 to-secondary/5 border-secondary/20">
				<div class="p-4 text-center">
					<h3 class="text-sm font-medium text-base-content/70 mb-2">Sunnah Completion</h3>
					<div class="text-3xl font-bold text-secondary">{Math.round(sunnahProgress)}%</div>
					<progress class="progress progress-secondary w-full mt-2" value={sunnahProgress} max="100"></progress>
				</div>
			</Card>
		</div>

		<!-- Fardhu Prayers -->
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold flex items-center gap-2">
					<div class="size-2 rounded-full bg-primary"></div>
					Fardhu Prayers
				</h2>
				{#if isLoadingTimes}
					<div class="flex items-center gap-2 text-xs text-base-content/50">
						<Loader2 class="size-3 animate-spin" />
						Updating times...
					</div>
				{/if}
			</div>
			
			<div class="grid gap-4">
				{#each fardhuPrayers as prayer, i}
					<div 
						class="card bg-base-100 shadow-sm border border-base-content/10 hover:shadow-md transition-all duration-300"
						in:fly={{ x: -20, duration: 600, delay: 200 + (i * 100), easing: quintOut }}
					>
						<div class="card-body p-4 sm:p-6 flex-row flex-wrap items-center justify-between gap-4">
							<div class="flex items-center gap-4">
								<div class="size-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70">
									<prayer.icon size="24" />
								</div>
								<div>
									<h3 class="font-bold text-lg">{prayer?.name}</h3>
									<p class="text-sm text-base-content/60 font-mono flex items-center gap-1">
										{prayer?.time}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2 bg-base-200/50 p-1 rounded-lg">
								<button 
									class="btn btn-sm border-none shadow-none {prayer?.status === 'none' ? 'btn-active bg-base-300' : 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'none')}
								>
									Not Done
								</button>
								<button 
									class="btn btn-sm border-none shadow-none gap-2 {prayer?.status === 'munfarid' ? 'bg-info text-info-content' : 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'munfarid')}
								>
									<User class="size-4" />
									Munfarid
								</button>
								<button 
									class="btn btn-sm border-none shadow-none gap-2 {prayer?.status === 'jamaah' ? 'bg-success text-success-content' : 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'jamaah')}
								>
									<Users class="size-4" />
									Jamaah
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Sunnah Prayers (Dynamic Habits) -->
		<section class="space-y-6">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<div class="size-2 rounded-full bg-secondary"></div>
				Ibadah Lainnya
			</h2>

			<div class="grid md:grid-cols-2 gap-6">
				<!-- Sunnah -->
				<div class="space-y-4">
					<h3 class="text-sm font-medium text-base-content/60 uppercase tracking-wider ml-1">Sunnah</h3>
					{#each sunnahPrayers.filter(p => p.category === 'Sunnah') as prayer, i}
						<button 
							class="w-full text-left group cursor-pointer"
							onclick={() => toggleSunnah(prayer.id)}
							in:fly={{ y: 20, duration: 600, delay: 600 + (i * 50), easing: quintOut }}
						>
							<div class="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 {prayer.completed ? 'bg-secondary/10 border-secondary/20' : 'bg-base-100 border-base-content/10 hover:border-secondary/30'}">
								<div class="size-6 rounded-full border-2 flex items-center justify-center transition-colors {prayer.completed ? 'border-secondary bg-secondary text-white' : 'border-base-content/30 group-hover:border-secondary/50'}">
									{#if prayer.completed}
										<Check class="size-3.5" />
									{/if}
								</div>
								<span class="font-medium {prayer.completed ? 'text-secondary' : ''}">{prayer.title}</span>
							</div>
						</button>
					{/each}
					{#if sunnahPrayers.filter(p => p.category === 'Sunnah').length === 0}
						<div class="text-sm text-base-content/40 italic ml-1">Belum ada habit Sunnah</div>
					{/if}
				</div>

				<!-- Mubah / Extra -->
				<div class="space-y-4">
					<h3 class="text-sm font-medium text-base-content/60 uppercase tracking-wider ml-1">Mubah</h3>
					{#each sunnahPrayers.filter(p => p.category === 'Mubah') as prayer, i}
						<div 
							class="card bg-base-100 shadow-sm border border-base-content/10 overflow-hidden group hover:shadow-md transition-all duration-300"
							in:fly={{ y: 20, duration: 600, delay: 800 + (i * 100), easing: quintOut }}
						>
							<div class="card-body p-0">
								<button 
									class="w-full text-left p-6 flex items-center justify-between cursor-pointer"
									onclick={() => toggleSunnah(prayer.id)}
								>
									<div class="flex items-center gap-4">
										<div class="size-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
											<Star class="size-5" />
										</div>
										<div>
											<h3 class="font-bold">{prayer.title}</h3>
											<p class="text-xs text-base-content/60 mt-1">{prayer.time || 'Anytime'}</p>
										</div>
									</div>
									
									<div class="size-8 rounded-full border-2 flex items-center justify-center transition-all {prayer.completed ? 'border-accent bg-accent text-white scale-110' : 'border-base-content/20 group-hover:border-accent/50'}">
										{#if prayer.completed}
											<Check class="size-4" />
										{/if}
									</div>
								</button>
							</div>
						</div>
					{/each}
					{#if sunnahPrayers.filter(p => p.category === 'Mubah').length === 0}
						<div class="text-sm text-base-content/40 italic ml-1">Belum ada habit Mubah</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>

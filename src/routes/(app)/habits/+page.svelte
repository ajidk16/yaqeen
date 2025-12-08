<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		Sun,
		Moon,
		Users,
		User,
		Check,
		Calendar,
		ChevronLeft,
		ChevronRight,
		Star,
		MapPin,
		Plus
	} from 'lucide-svelte';
	import { Card, Button } from '$lib/components/ui';
	import { goto, invalidateAll } from '$app/navigation';
	import { formatDate } from '$lib/utils/format.js';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import CalendarModal from '../../../lib/modules/quran/components/CalendarModal.svelte';

	let { data } = $props();

	let selectedDate = $state(new Date());
	let locationName = $state('Jakarta, ID');

	// Fardhu Prayers State
	type PrayerStatus = 'none' | 'munfarid' | 'jamaah';

	interface FardhuPrayer {
		id: string;
		name: string;
		time: string;
		status: PrayerStatus;
		icon: any;
	}

	let fardhuPrayers = $state<FardhuPrayer[]>([]);

	// Sunnah Prayers State (Habits)
	interface SunnahPrayer {
		id: string;
		title: string; // Changed from name to title to match DB
		category: string;
		completed: boolean;
		time?: string;
	}

	let sunnahPrayers = $state<SunnahPrayer[]>([]);

	// Initialize and Sync from data
	$effect(() => {
		selectedDate = new Date(data.date);

		// Sync Fardhu Prayers
		if (data.prayerTimes) {
			fardhuPrayers = data.prayerTimes.map((pt: any) => {
				const log = data.prayerLogs?.find((l: any) => l.prayerName === pt.name);
				return {
					id: pt.name,
					name: pt.name,
					time: pt.time,
					status: log ? (log.status as PrayerStatus) : 'none',
					icon: (() => {
						switch (pt.name) {
							case 'subuh':
								return Moon;
							case 'dzuhur':
								return Sun;
							case 'ashar':
								return Sun;
							case 'maghrib':
								return Moon;
							case 'isya':
								return Moon;
							default:
								return Sun;
						}
					})()
				};
			});
		}

		// Sync Sunnah Prayers
		if (data.sunnahPrayers) {
			sunnahPrayers = data.sunnahPrayers.map((h: any) => ({
				id: h.id,
				title: h.title,
				category: h.category,
				completed: h.completed,
				time: h.time
			}));
		}
	});

	async function updateFardhuStatus(id: string, status: PrayerStatus) {
		// Optimistic update
		const index = fardhuPrayers.findIndex((p) => p.id === id);
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

		invalidateAll();
	}

	async function toggleSunnah(id: string) {
		// Optimistic update
		const index = sunnahPrayers.findIndex((p) => p.id === id);
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

	let debounceTimer: NodeJS.Timeout;
	let isCalendarOpen = $state(false);

	function navigateToDate(dateStr: string) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			goto(`?date=${dateStr}`);
		}, 10);
	}

	// Date Navigation
	function changeDate(days: number) {
		selectedDate = new Date(selectedDate.setDate(selectedDate.getDate() + days));
		const dateStr = selectedDate.toISOString().split('T')[0];
		navigateToDate(dateStr);
	}

	function handleDateSelect(date: Date) {
		selectedDate = date;
		const newDate = new Date(selectedDate);
		newDate.setDate(newDate.getDate() + 1);
		const newDateStr = newDate.toISOString().split('T')[0];
		navigateToDate(newDateStr);
	}

	// Progress Calculation
	let fardhuProgress = $derived(
		fardhuPrayers.length > 0
			? (fardhuPrayers.filter((p) => p.status !== 'none').length / fardhuPrayers.length) * 100
			: 0
	);

	let sunnahProgress = $derived(
		sunnahPrayers.length > 0
			? (sunnahPrayers.filter((p) => p.completed).length / sunnahPrayers.length) * 100
			: 0
	);

	const profile = $derived(page?.data?.user || {});
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div
			class="flex flex-col md:flex-row justify-between items-center gap-4"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<div>
				<h1 class="text-3xl font-bold">{m.ibadah_title()}</h1>
				<div class="flex items-center gap-2 text-base-content/60 mt-1">
					<MapPin class="size-4" />
					<span class="text-sm">{profile?.location?.city}</span>
				</div>
			</div>

			<div class="flex items-center gap-4 bg-base-200 rounded-full p-1 pr-4">
				<Button variant="ghost" size="sm" circle onclick={() => changeDate(-1)}>
					<ChevronLeft class="size-5" />
				</Button>
				<button
					onclick={() => (isCalendarOpen = true)}
					class="flex items-center gap-2 font-medium min-w-[180px] justify-center"
				>
					<Calendar class="size-4 text-primary" />
					<span>{formatDate(selectedDate)}</span>
				</button>
				<Button variant="ghost" size="sm" circle onclick={() => changeDate(1)}>
					<ChevronRight class="size-5" />
				</Button>
			</div>
		</div>

		<!-- Progress Overview -->
		<div
			class="grid grid-cols-2 gap-4"
			in:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }}
		>
			<Card class="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
				<div class="p-4 text-center">
					<h3 class="text-sm font-medium text-base-content/70 mb-2">{m.ibadah_fardhu_title()}</h3>
					<div class="text-3xl font-bold text-primary">{Math.round(fardhuProgress)}%</div>
					<progress class="progress progress-primary w-full mt-2" value={fardhuProgress} max="100"
					></progress>
				</div>
			</Card>
			<Card class="bg-linear-to-br from-secondary/10 to-secondary/5 border-secondary/20">
				<div class="p-4 text-center">
					<h3 class="text-sm font-medium text-base-content/70 mb-2">{m.ibadah_sunnah_title()}</h3>
					<div class="text-3xl font-bold text-secondary">{Math.round(sunnahProgress)}%</div>
					<progress class="progress progress-secondary w-full mt-2" value={sunnahProgress} max="100"
					></progress>
				</div>
			</Card>
		</div>

		<!-- Fardhu Prayers -->
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold flex items-center gap-2">
					<div class="size-2 rounded-full bg-primary"></div>
					{m.ibadah_fardhu_section()}
				</h2>
			</div>

			<div class="grid gap-4">
				{#each fardhuPrayers as prayer, i}
					<div
						class="card bg-base-100 shadow-sm border border-base-content/10 hover:shadow-md transition-all duration-300"
						in:fly={{ x: -20, duration: 600, delay: 200 + i * 100, easing: quintOut }}
					>
						<div class="card-body p-4 sm:p-6 flex-row flex-wrap items-center justify-between gap-4">
							<div class="flex items-center gap-4">
								<div
									class="size-12 rounded-xl bg-base-200 flex items-center justify-center text-base-content/70"
								>
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
									class="btn btn-sm border-none shadow-none {prayer?.status === 'none'
										? 'btn-active bg-base-300'
										: 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'none')}
								>
									{m.ibadah_status_none()}
								</button>
								<button
									class="btn btn-sm border-none shadow-none gap-2 {prayer?.status === 'munfarid'
										? 'bg-info text-info-content'
										: 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'munfarid')}
								>
									<User class="size-4" />
									{m.ibadah_status_munfarid()}
								</button>
								<button
									class="btn btn-sm border-none shadow-none gap-2 {prayer?.status === 'jamaah'
										? 'bg-success text-success-content'
										: 'btn-ghost'}"
									onclick={() => updateFardhuStatus(prayer?.id, 'jamaah')}
								>
									<Users class="size-4" />
									{m.ibadah_status_jamaah()}
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Sunnah Prayers (Dynamic Habits) -->
		<section class="space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-bold flex items-center gap-2">
					<div class="size-2 rounded-full bg-secondary"></div>
					{m.ibadah_others_section()}
				</h2>
				<Button variant="info" size="xs" onclick={() => goto('/habits/habits')}>
					<Plus class="size-4 mr-1" />
					{m.ibadah_manage_habits()}
				</Button>
			</div>

			<div class="grid md:grid-cols-2 gap-6">
				<!-- Sunnah -->
				<div class="space-y-4">
					<h3 class="text-sm font-medium text-base-content/60 uppercase tracking-wider ml-1">
						{m.ibadah_category_sunnah()}
					</h3>
					{#each sunnahPrayers.filter((p) => p.category === 'Sunnah') as prayer, i}
						<button
							class="w-full text-left group cursor-pointer"
							onclick={() => toggleSunnah(prayer.id)}
							in:fly={{ y: 20, duration: 600, delay: 600 + i * 50, easing: quintOut }}
						>
							<div
								class="flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 {prayer.completed
									? 'bg-secondary/10 border-secondary/20'
									: 'bg-base-100 border-base-content/10 hover:border-secondary/30'}"
							>
								<div
									class="size-6 rounded-full border-2 flex items-center justify-center transition-colors {prayer.completed
										? 'border-secondary bg-secondary text-white'
										: 'border-base-content/30 group-hover:border-secondary/50'}"
								>
									{#if prayer.completed}
										<Check class="size-3.5" />
									{/if}
								</div>
								<span class="font-medium {prayer.completed ? 'text-secondary' : ''}"
									>{prayer.title}</span
								>
							</div>
						</button>
					{/each}
					{#if sunnahPrayers.filter((p) => p.category === 'Sunnah').length === 0}
						<div class="text-sm text-base-content/40 italic ml-1">{m.ibadah_no_sunnah()}</div>
					{/if}
				</div>

				<!-- Mubah / Extra -->
				<div class="space-y-4">
					<h3 class="text-sm font-medium text-base-content/60 uppercase tracking-wider ml-1">
						{m.ibadah_category_mubah()}
					</h3>
					{#each sunnahPrayers.filter((p) => p.category === 'Mubah') as prayer, i}
						<div
							class="card bg-base-100 shadow-sm border border-base-content/10 overflow-hidden group hover:shadow-md transition-all duration-300"
							in:fly={{ y: 20, duration: 600, delay: 800 + i * 100, easing: quintOut }}
						>
							<div class="card-body p-0">
								<button
									class="w-full text-left p-6 flex items-center justify-between cursor-pointer"
									onclick={() => toggleSunnah(prayer.id)}
								>
									<div class="flex items-center gap-4">
										<div
											class="size-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent"
										>
											<Star class="size-5" />
										</div>
										<div>
											<h3 class="font-bold">{prayer.title}</h3>
											<p class="text-xs text-base-content/60 mt-1">
												{prayer.time || m.ibadah_anytime()}
											</p>
										</div>
									</div>

									<div
										class="size-8 rounded-full border-2 flex items-center justify-center transition-all {prayer.completed
											? 'border-accent bg-accent text-white scale-110'
											: 'border-base-content/20 group-hover:border-accent/50'}"
									>
										{#if prayer.completed}
											<Check class="size-4" />
										{/if}
									</div>
								</button>
							</div>
						</div>
					{/each}
					{#if sunnahPrayers.filter((p) => p.category === 'Mubah').length === 0}
						<div class="text-sm text-base-content/40 italic ml-1">{m.ibadah_no_mubah()}</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>

<CalendarModal bind:open={isCalendarOpen} currentDate={selectedDate} onSelect={handleDateSelect} />

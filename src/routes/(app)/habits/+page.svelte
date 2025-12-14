<script lang="ts">
	import { fly, scale } from 'svelte/transition';
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
		Plus,
		Clock,
		X,
		Info
	} from 'lucide-svelte';
	import { Button, Badge } from '$lib/components/ui';
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
		title: string;
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
		if (page.data.isMenstruating) return; // Block interaction
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
		if (page.data.isMenstruating) return; // Block interaction
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

	// Status options for segmented control
	const statusOptions = [
		{
			value: 'none',
			label: m.ibadah_status_none(),
			icon: X,
			color: 'base-300',
			textColor: 'base-content'
		},
		{
			value: 'munfarid',
			label: m.ibadah_status_munfarid(),
			icon: User,
			color: 'info',
			textColor: 'info-content'
		},
		{
			value: 'jamaah',
			label: m.ibadah_status_jamaah(),
			icon: Users,
			color: 'success',
			textColor: 'success-content'
		}
	];

	// Derived category groups
	let sunnahCategory = $derived(sunnahPrayers.filter((p) => p.category === 'Sunnah'));
	let mubahCategory = $derived(sunnahPrayers.filter((p) => p.category === 'Mubah'));
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Header Section with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 p-6 lg:p-8"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl animate-breathe"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-secondary/10 blur-3xl animate-breathe"
				style="animation-delay: -2s"
			></div>

			{#if page.data.isMenstruating}
				<div
					class="mb-6 rounded-xl bg-error/10 p-4 text-error border border-error/20 flex items-center gap-3 relative z-10"
				>
					<Info class="size-5 shrink-0" />
					<p class="font-medium">
						Lagi halangan/datang bulan. Aktivitas ibadah dimatikan sementara.
					</p>
				</div>
			{/if}

			<div
				class="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
			>
				<div>
					<h1 class="text-3xl font-bold lg:text-4xl">{m.ibadah_title()}</h1>
					<div class="mt-2 flex items-center gap-2 text-base-content/60">
						<MapPin class="size-4" />
						<span class="text-sm">{profile?.location?.city || 'Jakarta, ID'}</span>
					</div>
				</div>

				<!-- Enhanced Date Navigator -->
				<div class="glass-card flex items-center gap-1 rounded-2xl p-1.5">
					<Button variant="ghost" size="sm" circle onclick={() => changeDate(-1)}>
						<ChevronLeft class="size-5" />
					</Button>
					<button
						onclick={() => (isCalendarOpen = true)}
						class="flex min-w-[160px] items-center justify-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors hover:bg-base-content/5"
					>
						<Calendar class="size-4 text-primary" />
						<span>{formatDate(selectedDate)}</span>
					</button>
					<Button variant="ghost" size="sm" circle onclick={() => changeDate(1)}>
						<ChevronRight class="size-5" />
					</Button>
				</div>
			</div>
		</header>

		<!-- Progress Overview - Radial Progress -->
		<div
			class="grid grid-cols-2 gap-4"
			in:fly={{ y: 20, duration: 800, delay: 100, easing: quintOut }}
		>
			<!-- Fardhu Progress Card -->
			<div class="glass-card rounded-2xl p-6 text-center">
				<div class="relative mx-auto mb-3 inline-flex items-center justify-center">
					<!-- Radial Progress SVG -->
					<svg class="size-24 -rotate-90" viewBox="0 0 96 96">
						<circle
							cx="48"
							cy="48"
							r="40"
							stroke-width="8"
							class="fill-none stroke-base-content/10"
						/>
						<circle
							cx="48"
							cy="48"
							r="40"
							stroke-width="8"
							class="fill-none stroke-primary transition-all duration-700"
							stroke-linecap="round"
							stroke-dasharray="{fardhuProgress * 2.51} 251"
						/>
					</svg>
					<span class="absolute text-2xl font-bold text-primary">{Math.round(fardhuProgress)}%</span
					>
				</div>
				<h3 class="font-medium text-base-content/70">{m.ibadah_fardhu_title()}</h3>
				<p class="mt-1 text-xs text-base-content/50">
					{fardhuPrayers.filter((p) => p.status !== 'none').length}/{fardhuPrayers.length} selesai
				</p>
			</div>

			<!-- Sunnah Progress Card -->
			<div class="glass-card rounded-2xl p-6 text-center">
				<div class="relative mx-auto mb-3 inline-flex items-center justify-center">
					<svg class="size-24 -rotate-90" viewBox="0 0 96 96">
						<circle
							cx="48"
							cy="48"
							r="40"
							stroke-width="8"
							class="fill-none stroke-base-content/10"
						/>
						<circle
							cx="48"
							cy="48"
							r="40"
							stroke-width="8"
							class="fill-none stroke-secondary transition-all duration-700"
							stroke-linecap="round"
							stroke-dasharray="{sunnahProgress * 2.51} 251"
						/>
					</svg>
					<span class="absolute text-2xl font-bold text-secondary"
						>{Math.round(sunnahProgress)}%</span
					>
				</div>
				<h3 class="font-medium text-base-content/70">{m.ibadah_sunnah_title()}</h3>
				<p class="mt-1 text-xs text-base-content/50">
					{sunnahPrayers.filter((p) => p.completed).length}/{sunnahPrayers.length} selesai
				</p>
			</div>
		</div>

		<!-- Fardhu Prayers Section -->
		<section class="space-y-4">
			<div class="flex items-center gap-2">
				<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
					<div class="size-2 rounded-full bg-primary"></div>
				</div>
				<h2 class="text-xl font-bold">{m.ibadah_fardhu_section()}</h2>
			</div>

			<div class="space-y-3">
				{#each fardhuPrayers as prayer, i}
					<div
						class="glass-card rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
						in:fly={{ x: -20, duration: 600, delay: 200 + i * 80, easing: quintOut }}
					>
						<div
							class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
						>
							<div class="flex items-center gap-4">
								<div
									class="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary"
								>
									<prayer.icon size={28} />
								</div>
								<div>
									<h3 class="text-xl font-bold capitalize">{prayer?.name}</h3>
									<p class="flex items-center gap-1.5 text-sm text-base-content/60">
										<Clock class="size-3.5" />
										<span class="font-mono">{prayer?.time}</span>
									</p>
								</div>
							</div>

							<div class="flex w-full items-center gap-1 rounded-xl bg-base-200/50 p-1.5 sm:w-auto">
								{#each statusOptions as status}
									{@const isActive = prayer?.status === status.value}
									<button
										class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:flex-initial
											{isActive ? `bg-${status.color} text-${status.textColor} shadow-sm` : 'hover:bg-base-content/5'}"
										onclick={() => updateFardhuStatus(prayer?.id, status.value as PrayerStatus)}
									>
										<status.icon class="size-4" />
										<span class="hidden sm:inline">{status.label}</span>
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Sunnah Prayers (Dynamic Habits) -->
		<section class="space-y-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<div class="flex size-8 items-center justify-center rounded-lg bg-secondary/10">
						<Star class="size-4 text-secondary" />
					</div>
					<h2 class="text-xl font-bold">{m.ibadah_others_section()}</h2>
				</div>
				<Button
					variant="ghost"
					size="sm"
					class="text-primary"
					onclick={() => goto('/habits/habits')}
				>
					{m.ibadah_manage_habits()}
					<ChevronRight class="ml-1 size-4" />
				</Button>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<!-- Sunnah Category -->
				<div class="space-y-3">
					<h3
						class="ml-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-base-content/60"
					>
						<div class="size-1.5 rounded-full bg-secondary"></div>
						{m.ibadah_category_sunnah()}
					</h3>
					{#each sunnahCategory as prayer, i}
						<button
							class="glass-card group w-full cursor-pointer rounded-xl p-4 text-left transition-all duration-300 hover:shadow-md
								{prayer.completed ? 'ring-2 ring-success/30 bg-success/5' : ''}"
							onclick={() => toggleSunnah(prayer.id)}
							in:fly={{ y: 20, duration: 600, delay: 600 + i * 50, easing: quintOut }}
						>
							<div class="flex items-center gap-4">
								<!-- Animated Checkbox -->
								<div
									class="relative flex size-6 items-center justify-center rounded-full border-2 transition-all duration-300
										{prayer.completed
										? 'scale-110 border-success bg-success text-white'
										: 'border-base-content/30 group-hover:border-secondary'}"
								>
									{#if prayer.completed}
										<Check class="size-3.5" />
									{/if}
								</div>

								<span class="flex-1 font-medium {prayer.completed ? 'text-success' : ''}">
									{prayer.title}
								</span>

								{#if prayer.completed}
									<Badge class="badge-success badge-sm text-white">Selesai</Badge>
								{/if}
							</div>
						</button>
					{/each}
					{#if sunnahCategory.length === 0}
						<div class="ml-1 text-sm italic text-base-content/40">{m.ibadah_no_sunnah()}</div>
					{/if}
				</div>

				<!-- Mubah / Extra Category -->
				<div class="space-y-3">
					<h3
						class="ml-1 flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-base-content/60"
					>
						<div class="size-1.5 rounded-full bg-accent"></div>
						{m.ibadah_category_mubah()}
					</h3>
					{#each mubahCategory as prayer, i}
						<button
							class="glass-card group w-full cursor-pointer rounded-xl p-4 text-left transition-all duration-300 hover:shadow-md
								{prayer.completed ? 'ring-2 ring-accent/30 bg-accent/5' : ''}"
							onclick={() => toggleSunnah(prayer.id)}
							in:fly={{ y: 20, duration: 600, delay: 800 + i * 50, easing: quintOut }}
						>
							<div class="flex items-center gap-4">
								<div
									class="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-all group-hover:scale-105"
								>
									<Star class="size-5" />
								</div>
								<div class="flex-1">
									<h4 class="font-bold {prayer.completed ? 'text-accent' : ''}">{prayer.title}</h4>
									<p class="mt-0.5 text-xs text-base-content/60">
										{prayer.time || m.ibadah_anytime()}
									</p>
								</div>

								<div
									class="flex size-8 items-center justify-center rounded-full border-2 transition-all
										{prayer.completed
										? 'scale-110 border-accent bg-accent text-white'
										: 'border-base-content/20 group-hover:border-accent/50'}"
								>
									{#if prayer.completed}
										<Check class="size-4" />
									{/if}
								</div>
							</div>
						</button>
					{/each}
					{#if mubahCategory.length === 0}
						<div class="ml-1 text-sm italic text-base-content/40">{m.ibadah_no_mubah()}</div>
					{/if}
				</div>
			</div>
		</section>
	</div>
</div>

<CalendarModal bind:open={isCalendarOpen} currentDate={selectedDate} onSelect={handleDateSelect} />

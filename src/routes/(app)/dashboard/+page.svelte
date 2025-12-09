<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		Flame,
		Clock,
		Calendar,
		Check,
		BookOpen,
		Activity,
		Sparkles,
		Heart,
		ChevronRight
	} from 'lucide-svelte';
	import { Badge, Button } from '$lib/components/ui';
	import { goto, invalidateAll } from '$app/navigation';
	import { PrayerTimer } from '$lib/runes/prayer.svelte';
	import { formatDate, formatTime } from '$lib/utils/format.js';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// Initialize Timer
	const timer = new PrayerTimer(data?.prayerTimes || []);

	const profile = $derived(data?.user);

	function getGreeting() {
		const hour = timer?.currentTime.getHours();
		if (hour < 12) return m.greeting_morning();
		if (hour < 15) return m.greeting_afternoon();
		if (hour < 18) return m.greeting_evening();
		return m.greeting_night();
	}

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	function refreshLocation() {
		isLoading = true;
		if (!navigator.geolocation) {
			error = 'Geolokasi tidak didukung';
			isLoading = false;
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const formData = new FormData();
				formData.append('latitude', position.coords.latitude.toString());
				formData.append('longitude', position.coords.longitude.toString());
				await fetch('/profile/settings?/updateLatLong', {
					method: 'POST',
					body: formData
				});

				await invalidateAll();
				isLoading = false;
			},
			(err) => {
				console.error(err);
				error = 'Gagal mengambil lokasi';
				isLoading = false;
			}
		);
	}

	// Quick actions data
	const quickActions = [
		{
			icon: Sparkles,
			label: m.dashboard_quick_habit(),
			path: '/habits',
			color: 'secondary',
			hoverBorder: 'hover:border-secondary',
			hoverText: 'hover:text-secondary',
			hoverShadow: 'hover:shadow-secondary/10',
			bgColor: 'bg-secondary/10',
			textColor: 'text-secondary'
		},
		{
			icon: BookOpen,
			label: m.dashboard_quick_quran(),
			path: '/quran/list',
			color: 'accent',
			hoverBorder: 'hover:border-accent',
			hoverText: 'hover:text-accent',
			hoverShadow: 'hover:shadow-accent/10',
			bgColor: 'bg-accent/10',
			textColor: 'text-accent'
		},
		{
			icon: Calendar,
			label: m.dashboard_quick_journal(),
			path: '/journal',
			color: 'info',
			hoverBorder: 'hover:border-info',
			hoverText: 'hover:text-info',
			hoverShadow: 'hover:shadow-info/10',
			bgColor: 'bg-info/10',
			textColor: 'text-info'
		},
		{
			icon: Clock,
			label: m.dashboard_prayer_schedule_button(),
			path: '/jadwal-solat',
			color: 'primary',
			hoverBorder: 'hover:border-primary',
			hoverText: 'hover:text-primary',
			hoverShadow: 'hover:shadow-primary/10',
			bgColor: 'bg-primary/10',
			textColor: 'text-primary'
		}
	];
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Hero Section with Floating Orbs -->
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

			<div
				class="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
			>
				<div>
					<h1 class="text-3xl font-bold lg:text-4xl">
						{getGreeting()}, <span class="text-gradient-primary">{profile?.name}!</span> 👋
					</h1>
					<p class="mt-2 text-base-content/60">"{m.dashboard_quote()}"</p>
				</div>

				<!-- Enhanced Streak Badge -->
				<div
					class="glass-card flex items-center gap-3 rounded-2xl px-5 py-3 transition-all hover:shadow-lg"
				>
					<div class="relative">
						<Flame class="size-7 text-orange-500" />
						<div
							class="absolute inset-0 rounded-full bg-orange-500/30 blur-xl animate-pulse-glow"
						></div>
					</div>
					<div>
						<span class="text-2xl font-black tabular-nums">{profile?.streak}</span>
						<span class="ml-1 text-xs text-base-content/60">{m.dashboard_streak_label()}</span>
					</div>
				</div>
			</div>
		</header>

		<!-- Main Grid - Bento Style -->
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Prayer Timer - Hero Card -->
			<div
				class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-purple-600 text-primary-content shadow-2xl shadow-primary/20 md:col-span-2"
				in:scale={{ duration: 600, start: 0.95, delay: 100 }}
			>
				<!-- Decorative elements -->
				<div
					class="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-white/10 blur-2xl"
				></div>
				<div
					class="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-black/10 blur-2xl"
				></div>

				{#if timer.nextPrayer}
					<div class="relative z-10 p-8 text-center">
						<Badge
							class="mx-auto mb-4 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white/90 backdrop-blur-sm"
						>
							<Clock class="size-4" />
							<span>{formatDate(new Date())}</span>
						</Badge>

						<h2 class="mt-2 text-4xl font-black tracking-tight lg:text-5xl">
							{timer.nextPrayer.name ?? m.prayer_fajr()}
						</h2>

						<div
							class="my-6 font-mono text-5xl font-black tracking-tighter tabular-nums lg:text-7xl"
						>
							{timer.countdown}
						</div>

						<div class="flex flex-wrap items-center justify-center gap-4">
							<Badge
								class="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white/90 backdrop-blur-sm"
							>
								<Clock class="size-4" />
								<span>{timer.nextPrayer.time}</span>
							</Badge>
							<!-- <Button
								onclick={() => goto('/jadwal-solat')}
								class="border-0 bg-white/20 text-white hover:bg-white/30"
								size="sm"
							>
								{m.dashboard_prayer_schedule_button()}
								<ChevronRight class="ml-1 size-4" />
							</Button> -->
						</div>
					</div>
				{:else}
					<div
						class="relative z-10 flex h-full flex-col items-center justify-center gap-4 p-8 text-center"
					>
						<div class="size-16 rounded-full bg-white/20 flex items-center justify-center">
							<Check class="size-8" />
						</div>
						<h2 class="text-2xl font-bold">{m.dashboard_all_prayers_completed()}</h2>
						<p class="text-primary-content/80">{m.dashboard_see_you_tomorrow()}</p>
					</div>
				{/if}
			</div>

			<!-- Daily Progress Card -->
			<div class="glass-card rounded-2xl p-6" in:fly={{ x: 20, duration: 800, delay: 200 }}>
				<h3 class="mb-5 flex items-center gap-2 text-lg font-bold">
					<div class="flex size-9 items-center justify-center rounded-xl bg-secondary/10">
						<Activity class="size-5 text-secondary" />
					</div>
					{m.dashboard_daily_progress()}
				</h3>

				<div class="space-y-5">
					<!-- Ibadah Progress -->
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span class="flex items-center gap-2">
								<Check class="size-4 text-primary" />
								{m.dashboard_progress_worship()}
							</span>
							<span class="font-bold text-primary">{profile?.progress?.ibadah ?? 0}%</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-base-content/10">
							<div
								class="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
								style="width: {profile?.progress?.ibadah ?? 0}%"
							></div>
						</div>
					</div>

					<!-- Habits Progress -->
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span class="flex items-center gap-2">
								<Flame class="size-4 text-secondary" />
								{m.dashboard_progress_habits()}
							</span>
							<span class="font-bold text-secondary">{profile?.progress?.habits ?? 0}%</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-base-content/10">
							<div
								class="h-full rounded-full bg-gradient-to-r from-secondary to-pink-500 transition-all duration-500"
								style="width: {profile?.progress?.habits ?? 0}%"
							></div>
						</div>
					</div>

					<!-- Quran Progress -->
					<div>
						<div class="mb-2 flex items-center justify-between text-sm">
							<span class="flex items-center gap-2">
								<BookOpen class="size-4 text-accent" />
								{m.dashboard_progress_quran()}
							</span>
							<span class="font-bold text-accent">{profile?.progress?.quran ?? 0}%</span>
						</div>
						<div class="h-2.5 w-full overflow-hidden rounded-full bg-base-content/10">
							<div
								class="h-full rounded-full bg-gradient-to-r from-accent to-teal-400 transition-all duration-500"
								style="width: {profile?.progress?.quran ?? 0}%"
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activity Section -->
		<section class="space-y-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-xl font-bold">
					<Calendar class="size-5 text-base-content/60" />
					{m.dashboard_recent_activity()}
				</h2>
				<Button
					variant="ghost"
					class="h-auto p-0 text-primary hover:bg-transparent hover:underline"
					onclick={() => goto('/habits')}
				>
					{m.dashboard_view_all()}
					<ChevronRight class="ml-1 size-4" />
				</Button>
			</div>

			<!-- Timeline Style Activity Feed -->
			<div class="relative pl-6">
				<!-- Vertical timeline line -->
				<div class="absolute bottom-0 left-[7px] top-0 w-0.5 bg-base-content/10"></div>

				<div class="space-y-3">
					{#each profile?.recentActivity as activity, i}
						{@const Icon =
							activity.type === 'prayer' ? Check : activity.type === 'quran' ? BookOpen : Activity}
						{@const color =
							activity.type === 'prayer'
								? 'text-success'
								: activity.type === 'quran'
									? 'text-primary'
									: 'text-warning'}
						{@const dotColor =
							activity.type === 'prayer'
								? 'bg-success'
								: activity.type === 'quran'
									? 'bg-primary'
									: 'bg-warning'}
						<div
							class="glass-card relative rounded-xl p-4 transition-all duration-300 hover:shadow-md"
							in:fly={{ y: 20, duration: 500, delay: 400 + i * 80 }}
						>
							<!-- Timeline dot -->
							<div
								class="absolute -left-[17px] top-5 size-2.5 rounded-full {dotColor} ring-4 ring-base-200"
							></div>

							<div class="flex items-center gap-4">
								<div
									class="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200"
								>
									<Icon class="size-5 {color}" />
								</div>
								<div class="flex-1">
									<h4 class="text-sm font-semibold">{activity.title}</h4>
									<p class="text-xs text-base-content/50">
										{activity.originalTime ? formatTime(activity.originalTime) : ''}
									</p>
								</div>
							</div>
						</div>
					{/each}

					{#if profile?.recentActivity.length === 0}
						<div class="py-8 text-center italic text-base-content/40">
							{m.dashboard_no_activity()}
						</div>
					{/if}
				</div>
			</div>
		</section>

		<!-- Quick Actions Grid -->
		<section
			class="grid grid-cols-2 gap-3 sm:grid-cols-4"
			in:fly={{ y: 20, duration: 800, delay: 500 }}
		>
			{#each quickActions as action, i}
				<button
					class="glass-card group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent p-6 transition-all duration-300 {action.hoverBorder} {action.hoverText} {action.hoverShadow} hover:shadow-lg"
					onclick={() => goto(action.path)}
					in:scale={{ duration: 400, start: 0.9, delay: 550 + i * 50 }}
				>
					<div
						class="flex size-12 items-center justify-center rounded-xl {action.bgColor} transition-all duration-300 group-hover:scale-110"
					>
						<action.icon class="size-6 {action.textColor}" />
					</div>
					<span class="text-center text-xs font-medium">{action.label}</span>
				</button>
			{/each}
		</section>
	</div>
</div>

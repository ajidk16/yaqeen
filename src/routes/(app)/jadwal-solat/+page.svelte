<script lang="ts">
	import { fly, scale, slide } from 'svelte/transition';
	import { MapPin, Bell, BellOff, Clock, Loader2, RefreshCw } from 'lucide-svelte';
	import { Button, Badge, Loading } from '$lib/components/ui';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { PrayerTimer } from '$lib/runes/prayer.svelte';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();

	// Initialize Timer
	const timer = new PrayerTimer(
		data.prayerTimes || [],
		data.user?.preferences?.notificationSettings?.sound
	);

	$effect(() => {
		if (data.prayerTimes) {
			timer.updatePrayers(data.prayerTimes);
		}
		if (data.user?.preferences?.notificationSettings?.sound) {
			timer.updatePreference(data.user.preferences.notificationSettings.sound);
		}
	});

	const user = $derived(page.data.user);

	// State
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	function refreshLocation() {
		isLoading = true;

		// timer.playAudio();
		// isLoading = false;
		// return

		if (!navigator.geolocation) {
			error = m.prayer_geolocation_unsupported();
			isLoading = false;
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				console.log('Got position:', position.coords.latitude, position.coords.longitude);
				return
				const formData = new FormData();
				formData.append('latitude', position.coords.latitude.toString());
				formData.append('longitude', position.coords.longitude.toString());
				await fetch('/profile/settings?/updateLatLong', {
					method: 'POST',
					body: formData
				});

				// Clear prayer-times cookie to force refetch
				// document.cookie = 'prayer-times=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

				await invalidateAll();
				isLoading = false;
			},
			(err) => {
				console.error(err);
				error = m.prayer_location_error();
				isLoading = false;
			}
		);
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-md mx-auto space-y-6">
		<!-- Header / Location -->
		<div class="flex items-center justify-between" in:fly={{ y: -20, duration: 800 }}>
			<div>
				<h1 class="text-2xl font-bold">{m.prayer_schedule_title()}</h1>
				<div class="flex items-center gap-2 text-base-content/60 mt-1">
					<MapPin class="size-4 text-primary" />
					<span class="text-sm font-medium">{user.location.city}</span>
				</div>
			</div>
			<Button variant="ghost" size="sm" circle onclick={refreshLocation} disabled={isLoading}>
				<RefreshCw class="size-5 {isLoading ? 'animate-spin' : ''}" />
			</Button>
		</div>

		{#if error}
			<div class="alert alert-error shadow-sm" transition:slide>
				<span>{error}</span>
			</div>
		{/if}

		<!-- Hero Countdown -->
		<div
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-primary-focus text-primary-content shadow-xl"
			in:scale={{ duration: 600, start: 0.95 }}
		>
			<!-- Decorative Background Elements -->
			<div
				class="absolute top-0 right-0 -mt-10 -mr-10 size-40 rounded-full bg-white/10 blur-3xl"
			></div>
			<div
				class="absolute bottom-0 left-0 -mb-10 -ml-10 size-40 rounded-full bg-black/10 blur-3xl"
			></div>

			<div class="relative p-8 text-center space-y-2">
				<p class="text-primary-content/80 font-medium tracking-wide text-sm uppercase">
					{m.prayer_next_label()}
				</p>

				{#if isLoading}
					<div class="h-16 flex items-center justify-center">
						<Loading variant="infinity" class="ml-4" />
					</div>
				{:else if timer.nextPrayer}
					<h2 class="text-4xl font-bold tracking-tight">{timer.nextPrayer.name}</h2>
					<div class="text-6xl font-black font-mono tracking-tighter my-4 tabular-nums">
						{timer.countdown}
					</div>
					<div
						class="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm"
					>
						<Clock class="size-4" />
						<span>{timer.nextPrayer.time}</span>
					</div>
				{:else}
					<div class="py-8">
						<h2 class="text-2xl font-bold">{m.prayer_all_completed()}</h2>
						<p class="text-primary-content/80">{m.prayer_see_you_tomorrow()}</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Prayer List -->
		<div class="space-y-3">
			{#if isLoading && timer.prayerTimes.length === 0}
				{#each Array(5) as _}
					<div class="skeleton h-20 w-full rounded-2xl"></div>
				{/each}
			{:else}
				{#each timer.prayerTimes as prayer, i (prayer.id)}
					{@const isNext = timer.nextPrayer?.id === prayer.id}
					{@const isPassed = prayer.timestamp < timer.currentTime.getTime()}
					<div
						class="group relative overflow-hidden rounded-2xl border transition-all duration-300
						{isNext
							? 'bg-base-100 border-primary shadow-lg scale-[1.02] z-10'
							: 'bg-base-100/50 border-base-content/5 hover:bg-base-100 hover:border-base-content/20'}"
						in:fly={{ y: 20, duration: 500, delay: i * 100 }}
					>
						<!-- Active Indicator Strip -->
						{#if isNext}
							<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
						{/if}

						<div class="p-4 flex items-center justify-between">
							<div class="flex items-center gap-4">
								<div
									class="flex flex-col items-center justify-center size-12 rounded-xl {isNext
										? 'bg-primary/10 text-primary'
										: 'bg-base-200 text-base-content/50'}"
								>
									<span class="text-xs font-bold uppercase">{prayer.id.substring(0, 3)}</span>
								</div>
								<div>
									<h3 class="font-bold text-lg {isNext ? 'text-primary' : ''}">{prayer.name}</h3>
									<p
										class="text-sm font-mono {isPassed
											? 'text-base-content/40 line-through'
											: 'text-base-content/60'}"
									>
										{prayer.time}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-2">
								{#if isNext}
									<Badge variant="primary" class="animate-pulse">{m.prayer_next_badge()}</Badge>
								{/if}

								<form
									method="POST"
									action="?/toggle"
									use:enhance={() => {
										// Optimistic update
										const index = timer.prayerTimes.findIndex((p) => p.id === prayer.id);
										if (index !== -1) {
											timer.prayerTimes[index].notificationEnabled =
												!timer.prayerTimes[index].notificationEnabled;
										}
										return async ({ result }) => {
											if (result.type !== 'success') {
												// Revert on failure
												if (index !== -1) {
													timer.prayerTimes[index].notificationEnabled =
														!timer.prayerTimes[index].notificationEnabled;
												}
											}
										};
									}}
								>
									<input type="hidden" name="prayerId" value={prayer.id.toLowerCase()} />
									<button
										type="submit"
										class="btn btn-circle btn-sm btn-ghost transition-colors {prayer.notificationEnabled
											? 'text-primary'
											: 'text-base-content/30'}"
									>
										{#if prayer.notificationEnabled}
											<Bell class="size-5" />
										{:else}
											<BellOff class="size-5" />
										{/if}
									</button>
								</form>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Footer Info -->
		<div class="text-center text-xs text-base-content/40 pb-8">
			<p>{m.prayer_source_data()}</p>
			<p>{m.prayer_method()}</p>
		</div>
	</div>
</div>

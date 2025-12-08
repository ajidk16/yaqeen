<script lang="ts">
	import {
		BookOpen,
		Flame,
		FileText,
		Award,
		ChevronRight,
		Calendar,
		Sparkles
	} from 'lucide-svelte';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';
	import { Button, Card, Badge } from '$lib/components/ui';

	// Components
	import DateNavigator from '../../../lib/modules/quran/components/DateNavigator.svelte';
	import TilawahCard from '../../../lib/modules/quran/components/TilawahCard.svelte';
	import HafalanCard from '../../../lib/modules/quran/components/HafalanCard.svelte';
	import QuranStats from '../../../lib/modules/quran/components/QuranStats.svelte';
	import { formatDateShort } from '$lib/utils/format';

	// State
	let currentDate = $state(new Date()) as Date;
	let tilawahTarget = $state(10);

	// Initialize state from server data
	let currentEntry = $state({
		tilawahProgress: 0,
		hafalanProgress: [] as number[],
		hafalanSurah: 'Al-Fatihah',
		hafalanAyahStart: 1,
		hafalanAyahEnd: 7
	});

	// Sync state when data changes
	$effect(() => {
		currentDate = new Date(page?.data.date);
		currentEntry = {
			tilawahProgress: page?.data.quranProgress?.pagesRead ?? 0,
			hafalanProgress: page?.data.quranProgress?.hafalanProgress ?? [],
			hafalanSurah: page?.data.quranProgress?.hafalanSurah ?? 'Al-Fatihah',
			hafalanAyahStart: page?.data.quranProgress?.hafalanAyahStart ?? 1,
			hafalanAyahEnd: page?.data.quranProgress?.hafalanAyahEnd ?? 7
		};
		if (page?.data.userSettings?.quranTarget) {
			tilawahTarget = page?.data.userSettings.quranTarget;
		}
	});

	// Derived
	let dateKey = $derived(formatDateShort(currentDate));
	let hafalanTotalAyahs = $derived(currentEntry.hafalanAyahEnd - currentEntry.hafalanAyahStart + 1);
	let formattedDate = $derived(
		currentDate.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);

	// Stats (mock data for now, can be derived from server)
	let stats = $derived({
		streak: page?.data.stats?.streak ?? 7,
		totalPages: page?.data.stats?.totalPages ?? 142,
		memorizedAyahs: page?.data.stats?.memorizedAyahs ?? 28
	});

	// Actions
	let saveTimeout: NodeJS.Timeout;

	async function saveProgress() {
		const input = new FormData();
		input.append('tilawahProgress', currentEntry.tilawahProgress.toString());
		input.append('hafalanSurah', currentEntry.hafalanSurah);
		input.append('hafalanAyahStart', currentEntry.hafalanAyahStart.toString());
		input.append('hafalanAyahEnd', currentEntry.hafalanAyahEnd.toString());
		input.append('hafalanProgress', JSON.stringify(currentEntry.hafalanProgress));

		fetch(`?/update&date=${dateKey}`, {
			method: 'POST',
			body: input
		});
	}

	async function updateTarget(newTarget: number) {
		tilawahTarget = newTarget;
		const formData = new FormData();
		formData.append('target', newTarget.toString());

		await fetch('?/updateTarget', {
			method: 'POST',
			body: formData
		});
	}

	function updateEntry(updates: Partial<typeof currentEntry>, debounce = false) {
		currentEntry = { ...currentEntry, ...updates };

		if (debounce) {
			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(saveProgress, 500);
		} else {
			saveProgress();
		}
	}

	function toggleAyah(ayah: number) {
		let newProgress = [...currentEntry.hafalanProgress];
		if (newProgress.includes(ayah)) {
			newProgress = newProgress.filter((a) => a !== ayah);
		} else {
			newProgress.push(ayah);
		}

		updateEntry({ hafalanProgress: newProgress });

		if (newProgress.length === hafalanTotalAyahs && newProgress.length > 0) {
			triggerConfetti();
		}
	}

	function handleTilawahUpdate(newProgress: number) {
		updateEntry({ tilawahProgress: newProgress });
		if (newProgress === tilawahTarget) {
			triggerConfetti();
		}
	}

	function triggerConfetti() {
		const duration = 3000;
		const end = Date.now() + duration;

		(function frame() {
			confetti({
				particleCount: 3,
				angle: 60,
				spread: 55,
				origin: { x: 0 },
				colors: ['#14B8A6', '#2DD4BF', '#0D9488']
			});
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ['#14B8A6', '#2DD4BF', '#0D9488']
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		})();
	}
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Hero Section -->
		<div
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary via-secondary to-accent p-6 md:p-8 text-primary-content shadow-xl"
		>
			<!-- Background Pattern -->
			<div class="absolute inset-0 opacity-10">
				<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					<pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
						<path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" />
					</pattern>
					<rect width="100%" height="100%" fill="url(#islamic-pattern)" />
				</svg>
			</div>

			<div class="relative z-10">
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
					<div class="space-y-3">
						<div class="flex items-center gap-2 opacity-80">
							<Calendar class="size-4" />
							<span class="text-sm font-medium">{formattedDate}</span>
						</div>
						<h1 class="text-2xl md:text-3xl font-bold">Jurnal Al-Quran</h1>
						<p class="opacity-80 text-sm md:text-base max-w-md">
							Catat tilawah dan hafalan harianmu. Konsisten adalah kunci keberhasilan.
						</p>
					</div>

					<a
						href="/quran/list"
						class="group flex items-center gap-3 bg-base-100/20 hover:bg-base-100/30 backdrop-blur-sm rounded-2xl px-5 py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
					>
						<div class="p-3 bg-base-100/20 rounded-xl group-hover:bg-base-100/30 transition-colors">
							<BookOpen class="size-6" />
						</div>
						<div class="text-left">
							<p class="font-bold">Baca Al-Quran</p>
							<p class="text-xs opacity-80">Buka daftar surah</p>
						</div>
						<ChevronRight
							class="size-5 opacity-60 group-hover:translate-x-1 transition-transform"
						/>
					</a>
				</div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-3 gap-3 md:gap-4">
			<!-- Streak -->
			<div
				class="relative overflow-hidden rounded-2xl bg-warning p-4 text-warning-content shadow-lg"
			>
				<div class="absolute -right-2 -top-2 opacity-20">
					<Flame class="size-16" />
				</div>
				<div class="relative z-10">
					<Flame class="size-5 mb-2" />
					<p class="text-2xl md:text-3xl font-bold">{stats.streak}</p>
					<p class="text-xs opacity-80 font-medium">Hari Streak</p>
				</div>
			</div>

			<!-- Total Pages -->
			<div
				class="relative overflow-hidden rounded-2xl bg-primary p-4 text-primary-content shadow-lg"
			>
				<div class="absolute -right-2 -top-2 opacity-20">
					<FileText class="size-16" />
				</div>
				<div class="relative z-10">
					<FileText class="size-5 mb-2" />
					<p class="text-2xl md:text-3xl font-bold">{stats.totalPages}</p>
					<p class="text-xs opacity-80 font-medium">Total Halaman</p>
				</div>
			</div>

			<!-- Memorized Ayahs -->
			<div
				class="relative overflow-hidden rounded-2xl bg-secondary p-4 text-secondary-content shadow-lg"
			>
				<div class="absolute -right-2 -top-2 opacity-20">
					<Award class="size-16" />
				</div>
				<div class="relative z-10">
					<Award class="size-5 mb-2" />
					<p class="text-2xl md:text-3xl font-bold">{stats.memorizedAyahs}</p>
					<p class="text-xs opacity-80 font-medium">Ayat Dihafal</p>
				</div>
			</div>
		</div>

		<!-- Date Navigator -->
		<DateNavigator>
			<Sparkles class="size-5 text-primary" />
			Progress Hari Ini
		</DateNavigator>

		<!-- Tilawah & Hafalan Cards -->
		<div class="grid md:grid-cols-2 gap-6">
			<TilawahCard
				progress={currentEntry.tilawahProgress}
				target={tilawahTarget}
				onUpdate={handleTilawahUpdate}
				onUpdateTarget={updateTarget}
			/>

			<HafalanCard
				surah={currentEntry.hafalanSurah}
				start={currentEntry.hafalanAyahStart}
				end={currentEntry.hafalanAyahEnd}
				progress={currentEntry.hafalanProgress}
				onUpdate={updateEntry}
				onToggleAyah={toggleAyah}
			/>
		</div>

		<!-- Extended Stats -->
		<QuranStats stats={page?.data.stats} />
	</div>
</div>

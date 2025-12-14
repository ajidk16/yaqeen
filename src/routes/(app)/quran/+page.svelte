<script lang="ts">
	import {
		BookOpen,
		Flame,
		FileText,
		Award,
		ChevronRight,
		Calendar,
		Sparkles,
		Info
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
		streak: page.data.stats.currentStreak ?? 7,
		totalPages: page?.data.stats?.totalPages ?? 142,
		memorizedAyahs: page?.data.stats?.ayahsMemorized ?? 28
	});

	let isMenstruating = $derived(page.data.isMenstruating || false);

	// Actions
	let saveTimeout: NodeJS.Timeout;

	async function saveProgress() {
		if (isMenstruating) return;
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
		if (isMenstruating) return;
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
		if (isMenstruating) return;
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
		if (isMenstruating) return;
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
		<!-- Hero Section with Enhanced Design -->
		<div
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-2xl"
		>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"
			></div>
			<div class="absolute inset-0 opacity-[0.03]">
				<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					<pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
						<path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" class="text-primary" />
					</pattern>
					<rect width="100%" height="100%" fill="url(#islamic-pattern)" />
				</svg>
			</div>

			<!-- Content Container -->
			<div class="relative z-10 p-6 md:p-8 lg:p-10">
				<!-- Top Badge -->
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 mb-6"
				>
					<Calendar class="size-4 text-primary" aria-hidden="true" />
					<time
						datetime={currentDate.toISOString()}
						class="text-sm font-medium text-base-content/80"
					>
						{formattedDate}
					</time>
				</div>

				<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
					<!-- Main Content -->
					<div class="space-y-4 flex-1">
						<div class="space-y-2">
							<h1
								class="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-linear-to-br from-base-content to-base-content/70 bg-clip-text text-transparent"
							>
								Jurnal Al-Quran
							</h1>
							<p class="text-base-content/70 text-base md:text-lg max-w-2xl leading-relaxed">
								Catat tilawah dan hafalan harianmu dengan mudah. Konsistensi adalah kunci kesuksesan
								dalam menghafal Al-Quran.
							</p>
						</div>

						<!-- Quick Stats Preview (Mobile) -->
						<div class="flex items-center gap-4 lg:hidden pt-2">
							<div class="flex items-center gap-2 text-sm">
								<Flame class="size-4 text-warning" aria-hidden="true" />
								<span class="font-semibold tabular-nums">{stats.streak}</span>
								<span class="text-base-content/60">hari</span>
							</div>
							<div class="w-px h-4 bg-base-content/20"></div>
							<div class="flex items-center gap-2 text-sm">
								<FileText class="size-4 text-primary" aria-hidden="true" />
								<span class="font-semibold tabular-nums">{stats.totalPages}</span>
								<span class="text-base-content/60">halaman</span>
							</div>
						</div>
					</div>

					<!-- CTA Button -->
					<a
						href={isMenstruating ? undefined : '/quran/surah'}
						class="group btn btn-primary btn-lg gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 self-start lg:self-auto"
						aria-label="Buka daftar surah Al-Quran"
					>
						<div
							class="p-2 bg-primary-content/10 rounded-lg group-hover:bg-primary-content/20 transition-colors"
						>
							<BookOpen class="size-5" aria-hidden="true" />
						</div>
						<div class="text-left">
							<span class="font-bold text-base">Baca Al-Quran</span>
							<span class="text-xs opacity-90 block">Daftar surah lengkap</span>
						</div>
						<ChevronRight
							class="size-5 group-hover:translate-x-1 transition-transform duration-300"
							aria-hidden="true"
						/>
					</a>
				</div>
			</div>

			<!-- Bottom Accent -->
			<div
				class="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-primary/50 via-primary to-primary/50"
			></div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
			<!-- Streak Card -->
			<div
				class="group relative overflow-hidden rounded-2xl bg-linear-to-br from-warning to-warning/80 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
			>
				<!-- Background Decoration -->
				<div
					class="absolute inset-0 bg-linear-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
				<div class="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
					<Flame class="size-24" />
				</div>

				<!-- Content -->
				<div class="relative z-10 space-y-3">
					<div class="flex items-center justify-between">
						<div class="p-2.5 bg-warning-content/10 rounded-xl backdrop-blur-sm">
							<Flame class="size-5 text-warning-content" />
						</div>
						<div
							class="px-2.5 py-1 bg-warning-content/10 rounded-full text-xs font-semibold text-warning-content backdrop-blur-sm"
						>
							Aktif
						</div>
					</div>
					<div>
						<p
							class="text-4xl md:text-5xl font-bold text-warning-content tracking-tight mb-1 tabular-nums"
						>
							{stats.streak}
						</p>
						<p class="text-sm font-medium text-warning-content/80">Hari Beruntun</p>
					</div>
				</div>
			</div>

			<!-- Total Pages Card -->
			<div
				class="group relative overflow-hidden rounded-2xl bg-linear-to-br from-primary to-primary/80 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
			>
				<!-- Background Decoration -->
				<div
					class="absolute inset-0 bg-linear-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
				<div class="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
					<FileText class="size-24" />
				</div>

				<!-- Content -->
				<div class="relative z-10 space-y-3">
					<div class="flex items-center justify-between">
						<div class="p-2.5 bg-primary-content/10 rounded-xl backdrop-blur-sm">
							<FileText class="size-5 text-primary-content" />
						</div>
						<div
							class="px-2.5 py-1 bg-primary-content/10 rounded-full text-xs font-semibold text-primary-content backdrop-blur-sm"
						>
							Total
						</div>
					</div>
					<div>
						<p
							class="text-4xl md:text-5xl font-bold text-primary-content tracking-tight mb-1 tabular-nums"
						>
							{stats.totalPages}
						</p>
						<p class="text-sm font-medium text-primary-content/80">Halaman Dibaca</p>
					</div>
				</div>
			</div>

			<!-- Memorized Ayahs Card -->
			<div
				class="group relative overflow-hidden rounded-2xl bg-linear-to-br from-secondary to-secondary/80 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 sm:col-span-2 lg:col-span-1"
			>
				<!-- Background Decoration -->
				<div
					class="absolute inset-0 bg-linear-to-br from-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
				<div class="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
					<Award class="size-24" />
				</div>

				<!-- Content -->
				<div class="relative z-10 space-y-3">
					<div class="flex items-center justify-between">
						<div class="p-2.5 bg-secondary-content/10 rounded-xl backdrop-blur-sm">
							<Award class="size-5 text-secondary-content" />
						</div>
						<div
							class="px-2.5 py-1 bg-secondary-content/10 rounded-full text-xs font-semibold text-secondary-content backdrop-blur-sm"
						>
							Hafalan
						</div>
					</div>
					<div>
						<p
							class="text-4xl md:text-5xl font-bold text-secondary-content tracking-tight mb-1 tabular-nums"
						>
							{stats.memorizedAyahs}
						</p>
						<p class="text-sm font-medium text-secondary-content/80">Ayat Terhafal</p>
					</div>
				</div>
			</div>
		</div>

		{#if isMenstruating}
			<div
				class="rounded-xl bg-error/10 p-4 text-error border border-error/20 flex items-center gap-3"
			>
				<Info class="size-5 shrink-0" />
				<p class="font-medium">Lagi halangan/datang bulan. Pencatatan Quran dimatikan sementara.</p>
			</div>
		{/if}

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
		<!-- <QuranStats stats={page?.data.stats} /> -->
	</div>
</div>

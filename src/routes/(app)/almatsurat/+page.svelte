<script lang="ts">
	import {
		Sun,
		Moon,
		Star,
		Flame,
		Award,
		ChevronLeft,
		ChevronRight,
		Book,
		RotateCcw,
		Check,
		Calendar,
		X,
		Minus,
		Home
	} from 'lucide-svelte';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';
	import { Button, Badge, Modal } from '$lib/components/ui';
	import type { DzikrItem } from '$lib/data/almatsurat';
	import { formatDateShort } from '$lib/utils/format';

	// Get data from server (loaded from .toon file)
	let ALMATSURAT_DATA = $derived<DzikrItem[]>(page?.data?.almatsuratData ?? []);
	let TOTAL_REPETITIONS = $derived<number>(page?.data?.totalRepetitions ?? 175);

	// State
	let sessionType = $state<'morning' | 'evening'>('morning');
	let completedItems = $state<Record<number, number>>({});
	let currentDate = $state(new Date());
	let showCelebration = $state(false);
	let currentSlide = $state(0);
	let isSliderMode = $state(false);
	let touchStartX = $state(0);
	let touchEndX = $state(0);

	// Auto-detect session type based on time
	$effect(() => {
		const hour = new Date().getHours();
		sessionType = hour >= 15 ? 'evening' : 'morning';
	});

	// Sync state from server data
	$effect(() => {
		if (page?.data?.session) {
			const session = page.data.session;
			completedItems = session.completedItems || {};
			sessionType = session.sessionType || (new Date().getHours() >= 15 ? 'evening' : 'morning');
		}
	});

	// Derived
	let dateKey = $derived(formatDateShort(currentDate));
	let formattedDate = $derived(
		currentDate.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);

	let totalCompleted = $derived(
		Object.values(completedItems).reduce((sum, count) => sum + count, 0)
	);

	let completedDzikirCount = $derived(
		ALMATSURAT_DATA.filter((item) => (completedItems[item.index] || 0) >= item.repetition).length
	);

	let isSessionComplete = $derived(
		ALMATSURAT_DATA.length > 0 &&
			ALMATSURAT_DATA.every((item) => (completedItems[item.index] || 0) >= item.repetition)
	);

	let stats = $derived({
		streak: page?.data?.stats?.streak ?? 0,
		totalSessions: page?.data?.stats?.totalSessions ?? 0,
		thisMonth: page?.data?.stats?.thisMonth ?? 0
	});

	let currentDzikr = $derived(ALMATSURAT_DATA[currentSlide]);
	let currentCount = $derived(completedItems[currentSlide] || 0);
	let isCurrentComplete = $derived(currentDzikr ? currentCount >= currentDzikr.repetition : false);

	// Actions
	let saveTimeout: NodeJS.Timeout;

	async function saveProgress() {
		const formData = new FormData();
		formData.append('sessionType', sessionType);
		formData.append('completedItems', JSON.stringify(completedItems));
		formData.append('status', isSessionComplete ? 'completed' : 'in_progress');

		await fetch(`?/save&date=${dateKey}`, {
			method: 'POST',
			body: formData
		});
	}

	function incrementDzikr() {
		const index = currentSlide;
		const current = completedItems[index] || 0;
		const maxRepetition = ALMATSURAT_DATA[index].repetition;

		if (current < maxRepetition) {
			completedItems = { ...completedItems, [index]: current + 1 };

			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(saveProgress, 300);

			// Auto-advance when complete
			if (completedItems[index] === maxRepetition) {
				setTimeout(() => {
					if (currentSlide < ALMATSURAT_DATA.length - 1) {
						currentSlide++;
					} else if (
						ALMATSURAT_DATA.every((item) => (completedItems[item.index] || 0) >= item.repetition)
					) {
						triggerCelebration();
					}
				}, 500);
			}
		}
	}

	function decrementDzikr() {
		const index = currentSlide;
		const current = completedItems[index] || 0;
		if (current > 0) {
			completedItems = { ...completedItems, [index]: current - 1 };

			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(saveProgress, 300);
		}
	}

	async function resetSession() {
		completedItems = {};
		currentSlide = 0;

		await fetch(`?/reset&date=${dateKey}`, {
			method: 'POST'
		});
	}

	function triggerCelebration() {
		showCelebration = true;
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

	function startSlider(index: number = 0) {
		currentSlide = index;
		isSliderMode = true;
	}

	function exitSlider() {
		isSliderMode = false;
	}

	function goToPrevSlide() {
		if (currentSlide > 0) {
			currentSlide--;
		}
	}

	function goToNextSlide() {
		if (currentSlide < ALMATSURAT_DATA.length - 1) {
			currentSlide++;
		}
	}

	// Touch handlers for swipe
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
	}

	function handleTouchMove(e: TouchEvent) {
		touchEndX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		const diff = touchStartX - touchEndX;
		const threshold = 50;

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				goToNextSlide();
			} else {
				goToPrevSlide();
			}
		}
		touchStartX = 0;
		touchEndX = 0;
	}

	// Keyboard navigation
	function handleKeydown(e: KeyboardEvent) {
		if (!isSliderMode) return;

		switch (e.key) {
			case 'ArrowLeft':
				goToPrevSlide();
				break;
			case 'ArrowRight':
				goToNextSlide();
				break;
			case 'Escape':
				exitSlider();
				break;
			case ' ':
			case 'Enter':
				incrementDzikr();
				e.preventDefault();
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isSliderMode}
	<!-- Fullscreen Slider Mode -->
	<div class="fixed inset-0 z-50 bg-base-100 flex flex-col" ontouchstart={handleTouchStart}>
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-base-content/10">
			<button class="btn btn-ghost btn-sm btn-circle" onclick={exitSlider}>
				<X class="size-5" />
			</button>
			<div class="flex items-center gap-2">
				{#if sessionType === 'morning'}
					<Sun class="size-4 text-warning" />
					<span class="text-sm font-medium">Pagi</span>
				{:else}
					<Moon class="size-4 text-primary" />
					<span class="text-sm font-medium">Sore</span>
				{/if}
			</div>
			<div class="text-sm font-medium text-base-content/60">
				{currentSlide + 1} / {ALMATSURAT_DATA.length}
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="h-1 bg-base-300">
			<div
				class="h-full bg-ibadah transition-all duration-300"
				style="width: {((currentSlide + 1) / ALMATSURAT_DATA.length) * 100}%"
			></div>
		</div>

		<!-- Main Content -->
		<div class="flex-1 overflow-auto p-6 flex flex-col">
			<!-- Title -->
			<div class="text-center mb-6">
				<div class="flex items-center justify-center gap-2 mb-2">
					<span
						class="size-8 rounded-full flex items-center justify-center text-sm font-bold
						{isCurrentComplete ? 'bg-success text-success-content' : 'bg-ibadah/10 text-ibadah'}"
					>
						{#if isCurrentComplete}
							<Check class="size-4" />
						{:else}
							{currentSlide + 1}
						{/if}
					</span>
					<h2 class="text-xl font-bold">{currentDzikr.name}</h2>
				</div>
				{#if currentDzikr.repetition > 1}
					<Badge variant={isCurrentComplete ? 'success' : 'primary'}>
						{currentCount}/{currentDzikr.repetition}x
					</Badge>
				{/if}
			</div>

			<!-- Verses -->
			<div class="flex-1 overflow-auto space-y-6">
				{#each currentDzikr.verses as verse, i}
					<div
						class="space-y-3 {currentDzikr.verses.length > 1 && i > 0
							? 'pt-4 border-t border-base-content/10'
							: ''}"
					>
						{#if verse.note && currentDzikr.verses.length > 1}
							<p class="text-xs font-medium text-ibadah text-center">
								{verse.note}
							</p>
						{/if}
						<p
							dir="rtl"
							class="text-2xl md:text-3xl lg:text-4xl leading-loose text-center font-arabic"
							style="font-family: 'Amiri', 'Traditional Arabic', serif; line-height: 2.2;"
						>
							{verse.arabic}
						</p>
						<p
							class="text-sm md:text-base text-base-content/60 italic leading-relaxed text-center max-w-2xl mx-auto"
						>
							{verse.translation}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Footer Controls -->
		<div class="p-4 border-t border-base-content/10 bg-base-100">
			<div class="flex items-center justify-between max-w-lg mx-auto">
				<!-- Prev -->
				<button
					class="btn btn-ghost btn-circle"
					onclick={goToPrevSlide}
					disabled={currentSlide === 0}
				>
					<ChevronLeft class="size-6" />
				</button>

				<!-- Counter -->
				<div class="flex items-center gap-4">
					<button
						class="btn btn-circle btn-outline"
						onclick={decrementDzikr}
						disabled={currentCount === 0}
					>
						<Minus class="size-5" />
					</button>

					<button
						class="btn btn-lg btn-circle {isCurrentComplete
							? 'btn-success'
							: 'btn-primary'} shadow-lg"
						onclick={incrementDzikr}
						disabled={isCurrentComplete}
					>
						{#if isCurrentComplete}
							<Check class="size-6" />
						{:else}
							<span class="text-xl font-bold tabular-nums">{currentCount}</span>
						{/if}
					</button>

					<button
						class="btn btn-circle btn-outline"
						onclick={() => {
							completedItems = { ...completedItems, [currentSlide]: 0 };
							clearTimeout(saveTimeout);
							saveTimeout = setTimeout(saveProgress, 300);
						}}
						disabled={currentCount === 0}
					>
						<RotateCcw class="size-5" />
					</button>
				</div>

				<!-- Next -->
				<button
					class="btn btn-ghost btn-circle"
					onclick={goToNextSlide}
					disabled={currentSlide === ALMATSURAT_DATA.length - 1}
				>
					<ChevronRight class="size-6" />
				</button>
			</div>

			<!-- Dots Indicator (only show on larger screens) -->
			<div class="hidden md:flex justify-center gap-1 mt-4 flex-wrap max-w-lg mx-auto">
				{#each ALMATSURAT_DATA as dzikr, i}
					{@const count = completedItems[i] || 0}
					{@const complete = count >= dzikr.repetition}
					<button
						class="size-2 rounded-full transition-all
						{i === currentSlide ? 'w-6 bg-primary' : complete ? 'bg-success' : 'bg-base-300'}"
						onclick={() => (currentSlide = i)}
						aria-label="Go to dzikr {i + 1}"
					></button>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<!-- Normal List Mode -->
	<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
		<div class="max-w-4xl mx-auto space-y-6">
			<!-- Hero Section -->
			<div
				class="relative overflow-hidden rounded-3xl bg-linear-to-br from-ibadah/10 via-ibadah/5 to-transparent border border-ibadah/20 shadow-2xl"
			>
				<div
					class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-ibadah/10 via-transparent to-transparent"
				></div>
				<!-- Islamic Pattern -->
				<div class="absolute inset-0 opacity-[0.03]">
					<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
						<pattern
							id="islamic-pattern-almatsurat"
							patternUnits="userSpaceOnUse"
							width="20"
							height="20"
						>
							<path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" class="text-ibadah" />
						</pattern>
						<rect width="100%" height="100%" fill="url(#islamic-pattern-almatsurat)" />
					</svg>
				</div>

				<div class="relative z-10 p-6 md:p-8 lg:p-10">
					<!-- Session Type Toggle -->
					<div class="flex flex-wrap items-center gap-3 mb-6">
						<button
							class="btn btn-sm {sessionType === 'morning' ? 'btn-primary' : 'btn-ghost'} gap-2"
							onclick={() => (sessionType = 'morning')}
						>
							<Sun class="size-4" />
							Pagi
						</button>
						<button
							class="btn btn-sm {sessionType === 'evening' ? 'btn-primary' : 'btn-ghost'} gap-2"
							onclick={() => (sessionType = 'evening')}
						>
							<Moon class="size-4" />
							Sore
						</button>
						<span class="ml-auto text-sm text-base-content/60 flex items-center gap-2">
							<Calendar class="size-4" />
							<span class="hidden sm:inline">{formattedDate}</span>
						</span>
					</div>

					<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
						<div class="space-y-3 flex-1">
							<h1
								class="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-linear-to-br from-base-content to-base-content/70 bg-clip-text text-transparent"
							>
								Al-Matsurat Sugro
							</h1>
							<p class="text-base-content/70 text-base md:text-lg max-w-2xl leading-relaxed">
								{sessionType === 'morning' ? 'Dzikir pagi' : 'Dzikir sore'} untuk
								{sessionType === 'morning' ? 'memulai hari' : 'menutup hari'} dengan penuh berkah dan
								perlindungan.
							</p>

							<!-- Progress Bar -->
							<div class="pt-3">
								<div class="flex items-center justify-between mb-2">
									<span class="text-sm font-medium text-base-content/70">Progress</span>
									<span class="text-sm font-bold text-ibadah"
										>{completedDzikirCount}/{ALMATSURAT_DATA.length} dzikr</span
									>
								</div>
								<div class="h-3 bg-base-300 rounded-full overflow-hidden">
									<div
										class="h-full bg-linear-to-r from-ibadah to-ibadah/80 rounded-full transition-all duration-500 ease-out"
										style="width: {(completedDzikirCount / ALMATSURAT_DATA.length) * 100}%"
									></div>
								</div>
								<p class="text-xs text-base-content/50 mt-1">
									{totalCompleted} / {TOTAL_REPETITIONS} total bacaan
								</p>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex gap-2 self-start lg:self-auto">
							{#if totalCompleted > 0}
								<Button variant="ghost" size="sm" class="gap-2" onclick={resetSession}>
									<RotateCcw class="size-4" />
									Reset
								</Button>
							{/if}
							<Button variant="primary" size="sm" class="gap-2" onclick={() => startSlider()}>
								<Book class="size-4" />
								Mulai Dzikir
							</Button>
						</div>
					</div>
				</div>

				<div
					class="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-ibadah/50 via-ibadah to-ibadah/50"
				></div>
			</div>

			<!-- Stats Cards -->
			<div class="grid grid-cols-3 gap-3 md:gap-4">
				<div class="rounded-2xl bg-warning/10 border border-warning/20 p-4 text-center">
					<Flame class="size-5 text-warning mx-auto mb-2" />
					<p class="text-2xl font-bold text-warning tabular-nums">{stats.streak}</p>
					<p class="text-xs text-base-content/60">Hari Beruntun</p>
				</div>
				<div class="rounded-2xl bg-ibadah/10 border border-ibadah/20 p-4 text-center">
					<Award class="size-5 text-ibadah mx-auto mb-2" />
					<p class="text-2xl font-bold text-ibadah tabular-nums">
						{stats.totalSessions}
					</p>
					<p class="text-xs text-base-content/60">Total Sesi</p>
				</div>
				<div class="rounded-2xl bg-secondary/10 border border-secondary/20 p-4 text-center">
					<Star class="size-5 text-secondary mx-auto mb-2" />
					<p class="text-2xl font-bold text-secondary tabular-nums">{stats.thisMonth}</p>
					<p class="text-xs text-base-content/60">Bulan Ini</p>
				</div>
			</div>

			<!-- Dzikr Grid -->
			<div class="space-y-3">
				<div class="flex items-center gap-2 mb-4">
					<Book class="size-5 text-ibadah" />
					<h2 class="font-semibold text-lg">Daftar Dzikir</h2>
				</div>

				<div class="grid gap-2 md:gap-3">
					{#each ALMATSURAT_DATA as dzikr, index}
						{@const count = completedItems[dzikr.index] || 0}
						{@const complete = count >= dzikr.repetition}

						<button
							class="group flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200
							{complete
								? 'bg-success/5 border-success/30'
								: 'bg-base-100 border-base-content/10 hover:border-ibadah/40 hover:shadow-md'}"
							onclick={() => startSlider(index)}
						>
							<!-- Number/Check -->
							<div
								class="shrink-0 size-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
								{complete
									? 'bg-success text-success-content'
									: 'bg-ibadah/10 text-ibadah group-hover:bg-ibadah/20'}"
							>
								{#if complete}
									<Check class="size-5" />
								{:else}
									{index + 1}
								{/if}
							</div>

							<!-- Title -->
							<div class="flex-1 min-w-0">
								<h3 class="font-medium truncate {complete ? 'text-success' : ''}">
									{dzikr.name}
								</h3>
								{#if dzikr.repetition > 1}
									<p class="text-xs text-base-content/50">
										{count}/{dzikr.repetition}x
									</p>
								{/if}
							</div>

							<!-- Progress -->
							{#if !complete && dzikr.repetition > 1}
								<div class="relative size-8">
									<svg class="size-8 -rotate-90" viewBox="0 0 32 32">
										<circle
											cx="16"
											cy="16"
											r="14"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											class="text-base-300"
										/>
										<circle
											cx="16"
											cy="16"
											r="14"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-dasharray={2 * Math.PI * 14}
											stroke-dashoffset={2 * Math.PI * 14 * (1 - count / dzikr.repetition)}
											stroke-linecap="round"
											class="text-ibadah transition-all duration-300"
										/>
									</svg>
								</div>
							{/if}

							<ChevronRight
								class="size-5 text-base-content/30 group-hover:text-base-content/50 transition-colors"
							/>
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Celebration Modal -->
<Modal bind:open={showCelebration} title="🎉 Alhamdulillah!">
	<div class="text-center py-4">
		<div class="text-6xl mb-4">✨</div>
		<h3 class="text-xl font-bold mb-2">Sesi Dzikir Selesai!</h3>
		<p class="text-base-content/70">Semoga Allah SWT melindungi dan memberkahi harimu.</p>
	</div>
	{#snippet actions()}
		<Button
			variant="primary"
			onclick={() => {
				showCelebration = false;
				exitSlider();
			}}>Aamiin</Button
		>
	{/snippet}
</Modal>

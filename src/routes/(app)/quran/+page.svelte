<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { BookOpen, ChevronRight, ChevronLeft, Trophy, Target, Sparkles, Calendar } from 'lucide-svelte';
	import { Button, Badge } from '$lib/components/ui';
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	// Types
	type JournalEntry = {
		tilawahProgress: number;
		hafalanProgress: number[];
		hafalanSurah: string;
		hafalanAyahStart: number;
		hafalanAyahEnd: number;
	};

	// State
	let currentDate = $state(new Date());
	let tilawahTarget = $state(10); // Pages per day
	let currentJuz = $state(1);
	
	// Data Store (In-memory for now, could be localStorage/DB)
	let journalData = $state<Record<string, JournalEntry>>({});

	// Derived State for Current Date
	let dateKey = $derived(currentDate.toISOString().split('T')[0]);
	let currentEntry = $derived(journalData[dateKey] || {
		tilawahProgress: 0,
		hafalanProgress: [],
		hafalanSurah: 'Al-Mulk',
		hafalanAyahStart: 1,
		hafalanAyahEnd: 30
	});

	// Date Formatters
	let formattedDate = $derived(new Intl.DateTimeFormat('en-GB', { 
		weekday: 'short', 
		day: 'numeric', 
		month: 'short', 
		year: 'numeric' 
	}).format(currentDate));

	let hijriDate = $derived(new Intl.DateTimeFormat('en-GB', { 
		calendar: 'islamic-umalqura',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(currentDate));

	// Derived Metrics
	let tilawahPercentage = $derived(Math.min((currentEntry.tilawahProgress / tilawahTarget) * 100, 100));
	let hafalanTotalAyahs = $derived(currentEntry.hafalanAyahEnd - currentEntry.hafalanAyahStart + 1);
	let hafalanPercentage = $derived(Math.round((currentEntry.hafalanProgress.length / hafalanTotalAyahs) * 100));

	// Actions
	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		currentDate = newDate;
	}

	function updateEntry(updates: Partial<JournalEntry>) {
		const entry = journalData[dateKey] || {
			tilawahProgress: 0,
			hafalanProgress: [],
			hafalanSurah: 'Al-Mulk',
			hafalanAyahStart: 1,
			hafalanAyahEnd: 30
		};
		
		journalData[dateKey] = { ...entry, ...updates };
	}

	function incrementTilawah() {
		if (currentEntry.tilawahProgress < tilawahTarget) {
			const newProgress = currentEntry.tilawahProgress + 1;
			updateEntry({ tilawahProgress: newProgress });
			
			if (newProgress === tilawahTarget) {
				triggerConfetti();
			}
		}
	}

	function decrementTilawah() {
		if (currentEntry.tilawahProgress > 0) {
			updateEntry({ tilawahProgress: currentEntry.tilawahProgress - 1 });
		}
	}

	function toggleAyah(ayah: number) {
		let newProgress = [...currentEntry.hafalanProgress];
		if (newProgress.includes(ayah)) {
			newProgress = newProgress.filter(a => a !== ayah);
		} else {
			newProgress = [...newProgress, ayah];
		}
		
		updateEntry({ hafalanProgress: newProgress });

		if (newProgress.length === hafalanTotalAyahs && newProgress.length > 0) {
			triggerConfetti();
		}
	}

	function updateHafalanSettings(surah: string, start: number, end: number) {
		updateEntry({ 
			hafalanSurah: surah, 
			hafalanAyahStart: start, 
			hafalanAyahEnd: end,
			hafalanProgress: [] // Reset progress when settings change? Optional.
		});
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
				colors: ['#10B981', '#34D399', '#059669'] // Emerald colors
			});
			confetti({
				particleCount: 3,
				angle: 120,
				spread: 55,
				origin: { x: 1 },
				colors: ['#10B981', '#34D399', '#059669']
			});

			if (Date.now() < end) {
				requestAnimationFrame(frame);
			}
		}());
	}

	const surahs = [
		"Al-Fatihah", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", 
		"At-Tawbah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", 
		"Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", 
		"Al-Qasas", "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", 
		"As-Saffat", "Sad", "Az-Zumar", "Ghafir", "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", 
		"Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", 
		"Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", 
		"Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", 
		"Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddathir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", 
		"An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", 
		"Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams", "Al-Layl", "Ad-Duha", "Ash-Sharh", 
		"At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat", "Al-Qari'ah", "At-Takathur", 
		"Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr", 
		"Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
	];
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold flex items-center gap-3">
					<BookOpen class="size-8 text-primary" />
					Quran
				</h1>
				<p class="text-base-content/60">Track your recitation and memorization journey.</p>
			</div>
			
			<!-- Date Navigation -->
			<div class="flex items-center gap-4 bg-base-100 shadow-sm border border-base-content/10 rounded-full p-1 pr-6">
				<div class="flex gap-1">
					<button class="btn btn-circle btn-sm btn-ghost" onclick={() => changeDate(-1)}>
						<ChevronLeft class="size-5" />
					</button>
					<button class="btn btn-circle btn-sm btn-ghost" onclick={() => changeDate(1)}>
						<ChevronRight class="size-5" />
					</button>
				</div>
				<div class="flex flex-col items-end">
					<span class="font-bold text-sm">{formattedDate}</span>
					<span class="text-xs text-primary font-medium">{hijriDate}</span>
				</div>
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-6">
			<!-- Tilawah Tracker -->
			<div class="card border border-primary/20 bg-linear-to-br from-base-100 to-primary/5 overflow-visible shadow-sm" in:fly={{ x: -20, duration: 800, delay: 100 }}>
				<div class="card-body p-6 space-y-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-bold flex items-center gap-2">
							<Target class="size-5 text-primary" />
							Daily Tilawah
						</h2>
						<Badge class="font-mono">Target: {tilawahTarget} Pages</Badge>
					</div>

					<!-- Circular Progress -->
					<div class="flex justify-center py-4">
						<div class="relative size-48">
							<svg class="size-full -rotate-90" viewBox="0 0 100 100">
								<circle class="text-base-200 stroke-current" stroke-width="8" cx="50" cy="50" r="40" fill="transparent"></circle>
								<circle 
									class="text-primary stroke-current transition-all duration-1000 ease-out" 
									stroke-width="8" 
									stroke-linecap="round" 
									cx="50" 
									cy="50" 
									r="40" 
									fill="transparent" 
									stroke-dasharray="251.2" 
									stroke-dashoffset={251.2 - (251.2 * tilawahPercentage) / 100}
								></circle>
							</svg>
							<div class="absolute inset-0 flex flex-col items-center justify-center">
								<span class="text-4xl font-bold">{currentEntry.tilawahProgress}</span>
								<span class="text-xs text-base-content/60 uppercase tracking-widest">Pages</span>
							</div>
						</div>
					</div>

					<!-- Controls -->
					<div class="flex gap-3">
						<Button 
						 
							class="flex-1" 
							onclick={decrementTilawah}
							disabled={currentEntry.tilawahProgress === 0}
						>
							-1 Page
						</Button>
						<Button 
							variant="primary" 
							class="flex-1" 
							onclick={incrementTilawah}
							disabled={currentEntry.tilawahProgress >= tilawahTarget}
						>
							+1 Page
						</Button>
					</div>
				</div>
			</div>

			<!-- Hafalan Tracker -->
			<div class="card border border-secondary/20 bg-linear-to-br from-base-100 to-secondary/5 shadow-sm" in:fly={{ x: 20, duration: 800, delay: 200 }}>
				<div class="card-body p-6 space-y-6">
					<div class="flex items-center justify-between">
						<h2 class="text-xl font-bold flex items-center gap-2">
							<Trophy class="size-5 text-secondary" />
							Hafalan Progress
						</h2>
						<Badge variant="secondary" class="font-mono">{hafalanPercentage}% Done</Badge>
					</div>

					<div class="space-y-4">
						<div class="form-control">
							<label class="label" for="">
								<span class="label-text font-medium">Surah</span>
							</label>
							<select 
								class="select select-bordered w-full" 
								value={currentEntry.hafalanSurah} 
								onchange={(e) => updateEntry({ hafalanSurah: e.currentTarget.value })}
							>
								{#each surahs as surah}
									<option value={surah}>{surah}</option>
								{/each}
							</select>
						</div>

						<div class="flex gap-4">
							<div class="form-control flex-1">
								<label class="label" for="">
									<span class="label-text text-xs">Start Ayah</span>
								</label>
								<input 
									type="number" 
									class="input input-bordered w-full" 
									value={currentEntry.hafalanAyahStart} 
									oninput={(e) => updateEntry({ hafalanAyahStart: parseInt(e.currentTarget.value) })}
									min="1" 
								/>
							</div>
							<div class="form-control flex-1">
								<label class="label" for="">
									<span class="label-text text-xs">End Ayah</span>
								</label>
								<input 
									type="number" 
									class="input input-bordered w-full" 
									value={currentEntry.hafalanAyahEnd} 
									oninput={(e) => updateEntry({ hafalanAyahEnd: parseInt(e.currentTarget.value) })}
									min={currentEntry.hafalanAyahStart} 
								/>
							</div>
						</div>
					</div>

					<!-- Ayah Grid -->
					<div class="space-y-2">
						<p class="text-xs font-medium text-base-content/60 uppercase tracking-wider">Mark Completed Ayahs</p>
						<div class="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
							{#each Array(hafalanTotalAyahs) as _, i}
								{@const ayahNum = currentEntry.hafalanAyahStart + i}
								<button 
									class="aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200
									{currentEntry.hafalanProgress.includes(ayahNum) 
										? 'bg-secondary border-secondary text-white scale-95' 
										: 'border-base-content/10 hover:border-secondary/50 text-base-content/60'}"
									onclick={() => toggleAyah(ayahNum)}
								>
									{ayahNum}
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Recent Activity / Stats Placeholder -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Total Khatam</div>
					<div class="stat-value text-primary text-2xl">2</div>
					<div class="stat-desc">Times this year</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Current Streak</div>
					<div class="stat-value text-secondary text-2xl">12</div>
					<div class="stat-desc">Days</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Total Pages</div>
					<div class="stat-value text-accent text-2xl">450</div>
					<div class="stat-desc">Read all time</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Ayahs Memorized</div>
					<div class="stat-value text-info text-2xl">156</div>
					<div class="stat-desc">Total ayahs</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 20px;
	}
</style>

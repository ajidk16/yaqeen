<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { BookOpen, ChevronRight, ChevronLeft, Trophy, Target, Sparkles, Calendar } from 'lucide-svelte';
	import { Button, Badge } from '$lib/components/ui';
	import confetti from 'canvas-confetti';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';

	let { data } = $props();

	// State
	let currentDate = $state(new Date(data.date));
	let tilawahTarget = $state(data.userSettings?.quranTarget || 10); // Pages per day
	let isEditingTarget = $state(false);
	let currentJuz = $state(1);
	
	// Initialize state from server data
	let currentEntry = $state({
		tilawahProgress: data.quranProgress?.pagesRead ?? 0,
		hafalanProgress: data.quranProgress?.hafalanProgress ?? [],
		hafalanSurah: data.quranProgress?.hafalanSurah ?? 'Al-Fatihah',
		hafalanAyahStart: data.quranProgress?.hafalanAyahStart ?? 1,
		hafalanAyahEnd: data.quranProgress?.hafalanAyahEnd ?? 7
	});

	// Sync state when data changes (e.g. navigation)
	$effect(() => {
		currentDate = new Date(data.date);
		currentEntry = {
			tilawahProgress: data.quranProgress?.pagesRead ?? 0,
			hafalanProgress: data.quranProgress?.hafalanProgress ?? [],
			hafalanSurah: data.quranProgress?.hafalanSurah ?? 'Al-Fatihah',
			hafalanAyahStart: data.quranProgress?.hafalanAyahStart ?? 1,
			hafalanAyahEnd: data.quranProgress?.hafalanAyahEnd ?? 7
		};
		// Update target if it changed on server (though usually it won't change on nav unless we refetch user settings)
		if (data.userSettings?.quranTarget) {
			tilawahTarget = data.userSettings.quranTarget;
		}
	});

	// Derived State for Current Date
	let dateKey = $derived(currentDate.toISOString().split('T')[0]);

	// Date Formatters
	let formattedDate = $derived(new Intl.DateTimeFormat('id-ID', { 
		weekday: 'long', 
		day: 'numeric', 
		month: 'long', 
		year: 'numeric' 
	}).format(currentDate));

	let hijriDate = $derived(new Intl.DateTimeFormat('id-ID-u-ca-islamic', { 
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	}).format(currentDate));

	// Derived Metrics
	let tilawahPercentage = $derived(Math.min((currentEntry.tilawahProgress / tilawahTarget) * 100, 100));
	let hafalanTotalAyahs = $derived(currentEntry.hafalanAyahEnd - currentEntry.hafalanAyahStart + 1);
	let hafalanPercentage = $derived(Math.round((Array.isArray(currentEntry.hafalanProgress) ? currentEntry.hafalanProgress.length : 0) / hafalanTotalAyahs * 100));

	// Actions
	let saveTimeout: NodeJS.Timeout;

	async function saveProgress() {
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			const formData = new FormData();
			formData.append('tilawahProgress', currentEntry.tilawahProgress.toString());
			formData.append('hafalanSurah', currentEntry.hafalanSurah);
			formData.append('hafalanAyahStart', currentEntry.hafalanAyahStart.toString());
			formData.append('hafalanAyahEnd', currentEntry.hafalanAyahEnd.toString());
			formData.append('hafalanProgress', JSON.stringify(currentEntry.hafalanProgress));

			await fetch(`?/update&date=${dateKey}`, {
				method: 'POST',
				body: formData
			});
		}, 500);
	}

	async function saveTarget() {
		isEditingTarget = false;
		const formData = new FormData();
		formData.append('target', tilawahTarget.toString());
		
		await fetch('?/updateTarget', {
			method: 'POST',
			body: formData
		});
	}

	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		const newDateStr = newDate.toISOString().split('T')[0];
		goto(`?date=${newDateStr}`);
	}

	function updateEntry(updates: Partial<typeof currentEntry>) {
		currentEntry = { ...currentEntry, ...updates };
		saveProgress();
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
		let newProgress = Array.isArray(currentEntry.hafalanProgress) ? [...currentEntry.hafalanProgress] : [];
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
				<p class="text-base-content/60">Pantau perjalanan tilawah dan hafalanmu.</p>
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
							Tilawah Harian
						</h2>
						{#if isEditingTarget}
							<div class="flex items-center gap-2">
								<input 
									type="number" 
									class="input input-xs input-bordered w-16 text-center font-mono" 
									bind:value={tilawahTarget} 
									onblur={saveTarget}
									onkeydown={(e) => e.key === 'Enter' && saveTarget()}
									autofocus={true}
								/>
								<span class="text-xs text-base-content/60">Halaman</span>
							</div>
						{:else}
							<button class="badge font-mono cursor-pointer hover:bg-base-200 transition-colors" onclick={() => isEditingTarget = true}>
								Target: {tilawahTarget} Halaman
							</button>
						{/if}
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
								<span class="text-xs text-base-content/60 uppercase tracking-widest">Halaman</span>
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
							-1 Halaman
						</Button>
						<Button 
							variant="primary" 
							class="flex-1" 
							onclick={incrementTilawah}
							disabled={currentEntry.tilawahProgress >= tilawahTarget}
						>
							+1 Halaman
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
							Progres Hafalan
						</h2>
						<Badge variant="secondary" class="font-mono">{hafalanPercentage}% Selesai</Badge>
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
									<span class="label-text text-xs">Ayat Awal</span>
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
									<span class="label-text text-xs">Ayat Akhir</span>
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
						<p class="text-xs font-medium text-base-content/60 uppercase tracking-wider">Tandai Ayat Selesai</p>
						<div class="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
							{#each Array(hafalanTotalAyahs) as _, i}
								{@const ayahNum = currentEntry.hafalanAyahStart + i}
								<button 
									class="aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200
									{currentEntry.hafalanProgress.includes(ayahNum ?? 0) 
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
					<div class="stat-value text-primary text-2xl">{data.stats?.totalKhatam ?? 0}</div>
					<div class="stat-desc">Kali tahun ini</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Streak Saat Ini</div>
					<div class="stat-value text-secondary text-2xl">{data.stats?.currentStreak ?? 0}</div>
					<div class="stat-desc">Hari</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Total Halaman</div>
					<div class="stat-value text-accent text-2xl">{data.stats?.totalPages ?? 0}</div>
					<div class="stat-desc">Dibaca sepanjang waktu</div>
				</div>
			</div>
			<div class="stats shadow bg-base-100 border border-base-content/5">
				<div class="stat place-items-center p-4">
					<div class="stat-title text-xs">Ayat Dihafal</div>
					<div class="stat-value text-info text-2xl">{data.stats?.ayahsMemorized ?? 0}</div>
					<div class="stat-desc">Total ayat</div>
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

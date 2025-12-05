<script lang="ts">
	import { BookOpen } from 'lucide-svelte';
	import confetti from 'canvas-confetti';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';

	// Components
	import DateNavigator from './components/DateNavigator.svelte';
	import TilawahCard from './components/TilawahCard.svelte';
	import HafalanCard from './components/HafalanCard.svelte';
	import QuranStats from './components/QuranStats.svelte';

	let { data } = $props();

	// State
	let currentDate = $state(new Date());
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
	let dateKey = $derived(currentDate.toISOString().split('T')[0]);
	let hafalanTotalAyahs = $derived(currentEntry.hafalanAyahEnd - currentEntry.hafalanAyahStart + 1);

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

	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		const newDateStr = newDate.toISOString().split('T')[0];
		goto(`?date=${newDateStr}`);
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
				colors: ['#10B981', '#34D399', '#059669']
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
		})();
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<DateNavigator date={currentDate} onDateChange={changeDate}>
			<BookOpen class="size-8 text-primary" />
			{m.quran_title()}
		</DateNavigator>

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

		<QuranStats stats={page?.data.stats} />
	</div>
</div>

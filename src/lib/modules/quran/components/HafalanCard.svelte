<script lang="ts">
	import { Trophy } from 'lucide-svelte';
	import { Badge, Card } from '$lib/components/ui';
	import { fly } from 'svelte/transition';
	import { quranMetadata } from '$lib/data/quran-metadata';
	import * as m from '$lib/paraglide/messages.js';

	type HafalanProps = {
		surah: string;
		start: number;
		end: number;
		progress: number[];
		onUpdate: (updates: any, debounce?: boolean) => void;
		onToggleAyah: (ayah: number) => void;
	};

	let { surah, start, end, progress, onUpdate, onToggleAyah } = $props<HafalanProps>();

	let currentSurahData = $derived(quranMetadata.find((s) => s.name === surah) || quranMetadata[0]);
	let maxAyah = $derived(currentSurahData.ayahs);

	let totalAyahs = $derived(end - start + 1);
	let percentage = $derived(
		Math.round(((Array.isArray(progress) ? progress.length : 0) / totalAyahs) * 100)
	);

	function handleSurahChange(e: Event) {
		const newSurah = (e.currentTarget as HTMLSelectElement).value;
		const newSurahData = quranMetadata.find((s) => s.name === newSurah);
		// Reset start/end if out of bounds (though unlikely on surah change unless we force it)
		onUpdate({
			hafalanSurah: newSurah,
			hafalanAyahStart: 1,
			hafalanAyahEnd: Math.min(7, newSurahData?.ayahs || 7)
		});
	}
</script>

<Card class="border-secondary/20 bg-linear-to-br from-base-100 to-secondary/5 shadow-sm">
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<Trophy class="size-5 text-secondary" />
				{m.quran_hafalan_title()}
			</h2>
			<Badge variant="secondary" class="font-mono hidden lg:block"
				>{percentage}{m.quran_hafalan_completed()}</Badge
			>
		</div>

		<div class="space-y-4">
			<div class="form-control">
				<label class="label" for="surah-select">
					<span class="label-text font-medium">{m.quran_hafalan_surah()}</span>
				</label>
				<select
					id="surah-select"
					class="select select-bordered w-full"
					value={surah}
					onchange={handleSurahChange}
				>
					{#each quranMetadata as s}
						<option value={s.name}>{s.number}. {s.name} </option>
					{/each}
				</select>
			</div>

			<div class="flex gap-4">
				<div class="form-control flex-1">
					<label class="label" for="ayah-start">
						<span class="label-text text-xs">{m.quran_hafalan_ayah_start()}</span>
					</label>
					<input
						id="ayah-start"
						type="number"
						class="input input-bordered w-full"
						value={start}
						oninput={(e) => {
							let val = parseInt(e.currentTarget.value) || 1;
							if (val < 1) val = 1;
							if (val > maxAyah) val = maxAyah;
							// Ensure start <= end
							if (val > end) onUpdate({ hafalanAyahStart: val, hafalanAyahEnd: val }, true);
							else onUpdate({ hafalanAyahStart: val }, true);
						}}
						min="1"
						max={maxAyah}
					/>
				</div>
				<div class="form-control flex-1">
					<label class="label" for="ayah-end">
						<span class="label-text text-xs">{m.quran_hafalan_ayah_end()}</span>
					</label>
					<input
						id="ayah-end"
						type="number"
						class="input input-bordered w-full"
						value={end}
						oninput={(e) => {
							let val = parseInt(e.currentTarget.value) || start;
							if (val < start) val = start;
							if (val > maxAyah) val = maxAyah;
							onUpdate({ hafalanAyahEnd: val }, true);
						}}
						min={start}
						max={maxAyah}
					/>
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<p class="text-xs font-medium text-base-content/60 uppercase tracking-wider">
					{m.quran_hafalan_mark_completed()}
				</p>
				<div class="flex gap-2">
					<button
						class="btn btn-xs btn-ghost text-xs"
						onclick={() => {
							// Select all
							const all = Array.from({ length: totalAyahs }, (_, i) => start + i);
							onUpdate({ hafalanProgress: all });
						}}
					>
						All
					</button>
					<button
						class="btn btn-xs btn-ghost text-xs"
						onclick={() => onUpdate({ hafalanProgress: [] })}
					>
						None
					</button>
				</div>
			</div>
			<div
				class="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar"
			>
				{#each Array(totalAyahs) as _, i}
					{@const ayahNum = start + i}
					<button
						class="aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all duration-200
                        {Array.isArray(progress) && progress.includes(ayahNum)
							? 'bg-secondary border-secondary text-white scale-95'
							: 'border-base-content/10 hover:border-secondary/50 text-base-content/60'}"
						onclick={() => onToggleAyah(ayahNum)}
						aria-label={`Tandai ayat ${ayahNum} ${progress.includes(ayahNum) ? 'belum' : 'sudah'} hafal`}
					>
						{ayahNum}
					</button>
				{/each}
			</div>
		</div>
	</div>
</Card>

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

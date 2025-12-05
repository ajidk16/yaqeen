<script lang="ts">
	import { Trophy } from 'lucide-svelte';
	import { Badge, Card } from '$lib/components/ui';
	import { fly } from 'svelte/transition';
	import { surahs } from '$lib/utils/global.js';

	type HafalanProps = {
		surah: string;
		start: number;
		end: number;
		progress: number[];
		onUpdate: (updates: any, debounce?: boolean) => void;
		onToggleAyah: (ayah: number) => void;
	};

	let { surah, start, end, progress, onUpdate, onToggleAyah } = $props<HafalanProps>();

	let totalAyahs = $derived(end - start + 1);
	let percentage = $derived(
		Math.round(((Array.isArray(progress) ? progress.length : 0) / totalAyahs) * 100)
	);
</script>

<Card class="border-secondary/20 bg-linear-to-br from-base-100 to-secondary/5 shadow-sm">
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<Trophy class="size-5 text-secondary" />
				Progres Hafalan
			</h2>
			<Badge variant="secondary" class="font-mono hidden lg:block">{percentage}% Selesai</Badge>
		</div>

		<div class="space-y-4">
			<div class="form-control">
				<label class="label" for="surah-select">
					<span class="label-text font-medium">Surah</span>
				</label>
				<select
					id="surah-select"
					class="select select-bordered w-full"
					value={surah}
					onchange={(e) => onUpdate({ hafalanSurah: e.currentTarget.value })}
				>
					{#each surahs as s}
						<option value={s}>{s}</option>
					{/each}
				</select>
			</div>

			<div class="flex gap-4">
				<div class="form-control flex-1">
					<label class="label" for="ayah-start">
						<span class="label-text text-xs">Ayat Awal</span>
					</label>
					<input
						id="ayah-start"
						type="number"
						class="input input-bordered w-full"
						value={start}
						oninput={(e) =>
							onUpdate({ hafalanAyahStart: parseInt(e.currentTarget.value) || 1 }, true)}
						min="1"
					/>
				</div>
				<div class="form-control flex-1">
					<label class="label" for="ayah-end">
						<span class="label-text text-xs">Ayat Akhir</span>
					</label>
					<input
						id="ayah-end"
						type="number"
						class="input input-bordered w-full"
						value={end}
						oninput={(e) =>
							onUpdate({ hafalanAyahEnd: parseInt(e.currentTarget.value) || start }, true)}
						min={start}
					/>
				</div>
			</div>
		</div>

		<div class="space-y-2">
			<p class="text-xs font-medium text-base-content/60 uppercase tracking-wider">
				Tandai Ayat Selesai
			</p>
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

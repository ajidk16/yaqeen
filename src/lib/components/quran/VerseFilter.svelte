<script lang="ts">
	import { Search, ChevronDown, Volume2 } from 'lucide-svelte';
	import { Select } from '$lib/components/ui';

	interface Props {
		totalAyat: number;
		selectedAyat?: number;
		selectedQori?: string;
		onAyatChange?: (ayat: number) => void;
		onQoriChange?: (qori: string) => void;
	}

	let {
		totalAyat,
		selectedAyat = $bindable(1),
		selectedQori = $bindable('01'),
		onAyatChange,
		onQoriChange
	}: Props = $props();

	// Ayat options
	const ayatOptions = $derived(
		Array.from({ length: totalAyat }, (_, i) => ({
			value: i + 1,
			label: `Ayat ${i + 1}`
		}))
	);

	// Qori options (from equran.id API)
	const qoriOptions = [
		{ value: '01', label: 'Abdullah Al-Juhany' },
		{ value: '02', label: 'Abdul Muhsin Al-Qasim' },
		{ value: '03', label: 'Abdurrahman as-Sudais' },
		{ value: '04', label: 'Ibrahim Al-Dossari' },
		{ value: '05', label: 'Misyari Rasyid Al-Afasi' }
	];

	function handleAyatChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const ayat = Number(target.value);
		selectedAyat = ayat;
		onAyatChange?.(ayat);

		// Smooth scroll to ayat
		const element = document.getElementById(`ayah-${ayat}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}

	function handleQoriChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		selectedQori = target.value;
		onQoriChange?.(target.value);
	}
</script>

<div
	class="verse-filter sticky top-30 z-30 bg-base-100/90 backdrop-blur-md border-b border-base-200 px-4 py-3"
>
	<div class="max-w-3xl mx-auto flex items-center gap-3">
		<!-- Ayat Selector -->
		<div class="flex-1">
			<div class="relative">
				<select
					class="select select-sm select-bordered w-full pr-10 font-medium"
					value={selectedAyat}
					onchange={handleAyatChange}
				>
					<option value="" disabled>Pilih Ayat</option>
					{#each ayatOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
				<Search
					class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none"
				/>
			</div>
		</div>

		<!-- Divider -->
		<div class="w-px h-6 bg-base-300"></div>

		<!-- Qori Selector -->
		<div class="flex-1">
			<div class="relative">
				<select
					class="select select-sm select-bordered w-full pr-10 font-medium"
					value={selectedQori}
					onchange={handleQoriChange}
				>
					{#each qoriOptions as qori}
						<option value={qori.value}>{qori.label}</option>
					{/each}
				</select>
				<Volume2
					class="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40 pointer-events-none"
				/>
			</div>
		</div>
	</div>
</div>

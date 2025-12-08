<script lang="ts">
	import { PlayCircle, PauseCircle, MapPin, BookOpen, Info, ChevronDown } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { slide } from 'svelte/transition';

	interface Props {
		surah: {
			nama: string;
			namaLatin: string;
			nomor: number;
			jumlahAyat: number;
			tempatTurun: string;
			arti: string;
			deskripsi: string;
			audioFull?: { [key: string]: string };
		};
		selectedQori?: string;
		isPlaying?: boolean;
		onPlayAudio?: () => void;
	}

	let { surah, selectedQori = '01', isPlaying = false, onPlayAudio }: Props = $props();

	let showDescription = $state(false);

	// Format tempat turun
	const tempatTurunLabel = $derived(
		surah.tempatTurun?.toLowerCase() === 'mekah' ? 'Makkiyah' : 'Madaniyah'
	);

	// Get audio URL based on selected qori
	const audioUrl = $derived(surah.audioFull?.[selectedQori] || '');
</script>

<div
	class="surah-header relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 mx-4 mt-4"
>
	<!-- Islamic Pattern Overlay -->
	<div class="absolute inset-0 opacity-5">
		<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
			<pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
				<path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" class="text-primary" />
			</pattern>
			<rect width="100%" height="100%" fill="url(#islamic-pattern)" />
		</svg>
	</div>

	<div class="relative p-5 md:p-6 space-y-4">
		<!-- Top Row: Arabic Name & Play Button -->
		<div class="flex items-start justify-between gap-4">
			<div class="flex-1 min-w-0">
				<!-- Arabic Name -->
				<h2 class="font-amiri text-4xl md:text-5xl text-primary mb-1" dir="rtl">
					{surah.nama}
				</h2>
				<!-- Latin Name & Meaning -->
				<p class="text-lg md:text-xl font-semibold text-base-content">
					{surah.namaLatin}
					<span class="text-base-content/60 font-normal">({surah.arti})</span>
				</p>
			</div>

			<!-- Play Full Surah Button -->
			{#if audioUrl}
				<Button
					variant="primary"
					class="shadow-lg shadow-primary/20 flex-none"
					onclick={onPlayAudio}
				>
					{#if isPlaying}
						<PauseCircle class="size-5 mr-2" />
						<span>Jeda</span>
					{:else}
						<PlayCircle class="size-5 mr-2" />
						<span>Putar</span>
					{/if}
				</Button>
			{/if}
		</div>

		<!-- Info Badges -->
		<div class="flex flex-wrap gap-2">
			<div class="badge badge-lg badge-ghost gap-1.5">
				<BookOpen class="size-3.5" />
				<span>{surah.jumlahAyat} Ayat</span>
			</div>
			<div class="badge badge-lg badge-ghost gap-1.5">
				<MapPin class="size-3.5" />
				<span>{tempatTurunLabel}</span>
			</div>
			<div class="badge badge-lg badge-ghost gap-1.5">
				<span class="font-bold">Surah ke-{surah.nomor}</span>
			</div>
		</div>

		<!-- Description Toggle -->
		{#if surah.deskripsi}
			<div class="pt-2">
				<button
					class="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
					onclick={() => (showDescription = !showDescription)}
				>
					<Info class="size-4" />
					<span>{showDescription ? 'Sembunyikan' : 'Lihat'} deskripsi surah</span>
					<ChevronDown
						class="size-4 transition-transform duration-200 {showDescription ? 'rotate-180' : ''}"
					/>
				</button>

				{#if showDescription}
					<div
						class="mt-3 p-4 bg-base-100/50 rounded-xl text-sm text-base-content/80 leading-relaxed"
						transition:slide={{ duration: 200 }}
					>
						{@html surah.deskripsi}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

	.font-amiri {
		font-family: 'Amiri', serif;
	}
</style>

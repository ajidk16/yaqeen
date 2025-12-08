<script lang="ts">
	import { Bookmark, FileText, Volume2, Share2, Highlighter, MoreHorizontal } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	// Props
	interface Props {
		verse: any;
		surahNumber: number;
		isBookmarked?: boolean;
		highlightColor?: string | null;
		hasNotes?: boolean;
		onAction: (action: string, data?: any) => void;
	}
	let {
		verse,
		surahNumber,
		isBookmarked = false,
		highlightColor = null,
		hasNotes = false,
		onAction
	}: Props = $props();
	console.log('verse', verse);
	let isPressed = $state(false);
	let isHovered = $state(false);
	console.log('anjeng')
	// Highlight mapping with proper Tailwind classes
	const highlightColors: Record<string, string> = {
		yellow: 'bg-yellow-100/80 dark:bg-yellow-500/20',
		green: 'bg-green-100/80 dark:bg-green-500/20',
		blue: 'bg-blue-100/80 dark:bg-blue-500/20',
		pink: 'bg-pink-100/80 dark:bg-pink-500/20'
	};
	const currentHighlightClass = $derived(
		highlightColor ? highlightColors[highlightColor] || '' : ''
	);
	// Handle click - on mobile open menu, on desktop this is for the whole card
	function handleCardClick(e: MouseEvent) {
		onAction('openMenu', verse);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="verse-item relative group cursor-pointer select-none transition-all duration-200
		{currentHighlightClass} 
		{isPressed ? 'scale-[0.99] bg-base-200/80' : 'hover:bg-base-200/50 active:bg-base-200/80'}"
	onmousedown={() => (isPressed = true)}
	onmouseup={() => (isPressed = false)}
	onmouseleave={() => {
		isPressed = false;
		isHovered = false;
	}}
	onmouseenter={() => (isHovered = true)}
	onclick={handleCardClick}
>
	<div class="flex gap-3 md:gap-5 py-5 px-4 md:px-6">
		<!-- Verse Number Column -->
		<div class="flex-none flex flex-col items-center gap-2">
			<!-- Number Badge -->
			<div class="relative size-10 md:size-11 flex items-center justify-center">
				<!-- Islamic decoration background -->
				<svg class="absolute inset-0 size-full text-primary/20" viewBox="0 0 40 40">
					<polygon points="20,0 40,20 20,40 0,20" fill="currentColor" />
				</svg>
				<span class="relative z-10 text-xs md:text-sm font-bold text-primary">
					{verse.nomorAyat}
				</span>
			</div>
			<!-- Status Indicators -->
			<div class="flex flex-col items-center gap-1.5">
				{#if isBookmarked}
					<div class="tooltip tooltip-right" data-tip="Tersimpan">
						<Bookmark class="size-3.5 text-primary fill-primary" />
					</div>
				{/if}
				{#if hasNotes}
					<div class="tooltip tooltip-right" data-tip="Ada Catatan">
						<FileText class="size-3.5 text-secondary fill-secondary/50" />
					</div>
				{/if}
			</div>
		</div>
		<!-- Content Column -->
		<div class="flex-1 min-w-0 space-y-4">
			<!-- Arabic Text -->
			<p
				class="font-amiri text-right text-2xl sm:text-3xl md:text-4xl leading-[1.9] md:leading-[2.1] text-base-content"
				dir="rtl"
			>
				{verse.teksArab}
			</p>
			<!-- Transliteration & Translation -->
			<div class="space-y-2">
				{#if verse.teksLatin}
					<p class="text-xs sm:text-sm text-primary/70 italic font-medium leading-relaxed">
						{verse.teksLatin}
					</p>
				{/if}
				<p class="text-sm sm:text-base text-base-content/75 leading-relaxed">
					{verse.teksIndonesia}
				</p>
			</div>
		</div>
		<!-- Mobile: Show small indicator that it's tappable -->
		<div class="md:hidden flex-none self-center">
			<MoreHorizontal class="size-4 text-base-content/30" />
		</div>
	</div>
	<!-- Bottom Border -->
	<div class="absolute bottom-0 left-16 right-4 h-px bg-base-200"></div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');
	.font-amiri {
		font-family: 'Amiri', serif;
	}
	/* Smooth touch feedback */
	.verse-item {
		-webkit-tap-highlight-color: transparent;
	}
</style>

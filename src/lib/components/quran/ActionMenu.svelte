<script lang="ts">
	import {
		Bookmark,
		Share2,
		Highlighter,
		FileText,
		Play,
		Copy,
		BookOpen,
		Sun,
		Moon,
		CheckCircle2,
		X,
		BookPlus,
		GraduationCap,
		Volume2,
		Image
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { fade, slide } from 'svelte/transition';

	interface Props {
		open: boolean;
		verse: any;
		surahName?: string;
		isBookmarked: boolean;
		highlightColor: string | null;
		hasNotes?: boolean;
		onClose: () => void;
		onAction: (action: string, payload?: any) => void;
	}

	let {
		open,
		verse,
		surahName = 'Al-Fatihah',
		isBookmarked,
		highlightColor,
		hasNotes = false,
		onClose,
		onAction
	}: Props = $props();

	// Highlight colors with proper CSS variables for light/dark mode
	const highlightOptions = [
		{ id: 'yellow', bg: 'bg-yellow-400', label: 'Kuning' },
		{ id: 'green', bg: 'bg-green-400', label: 'Hijau' },
		{ id: 'blue', bg: 'bg-blue-400', label: 'Biru' },
		{ id: 'pink', bg: 'bg-pink-400', label: 'Merah Muda' }
	];
</script>

{#if open && verse}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/60 z-50 transition-opacity"
		transition:fade={{ duration: 200 }}
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	></div>

	<!-- Drawer/Sheet -->
	<div
		class="fixed inset-x-0 bottom-0 z-50 bg-base-100 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
		transition:slide={{ duration: 300, axis: 'y' }}
	>
		<!-- Handle & Close -->
		<div class="flex-none p-4 pb-2">
			<div class="w-12 h-1.5 bg-base-300 rounded-full mx-auto mb-4"></div>
			<div class="flex items-start justify-between">
				<div class="flex-1 min-w-0">
					<h3 class="font-bold text-lg">QS. {surahName}: {verse?.number?.inSurah}</h3>
					<p class="text-sm text-base-content/60 line-clamp-2 mt-1">
						{verse?.translation?.text}
					</p>
				</div>
				<button class="btn btn-ghost btn-circle btn-sm flex-none" onclick={onClose}>
					<X class="size-5" />
				</button>
			</div>
		</div>

		<!-- Scrollable Content -->
		<div class="flex-1 overflow-y-auto px-4 pb-8 space-y-6">
			<!-- Quick Actions Grid -->
			<div class="grid grid-cols-4 gap-3">
				<!-- Bookmark -->
				<button
					class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 {isBookmarked
						? 'bg-primary/15'
						: 'bg-base-200/70 hover:bg-base-200'}"
					onclick={() => onAction('bookmark')}
				>
					<Bookmark
						class="size-6 {isBookmarked ? 'text-primary fill-primary' : 'text-base-content/70'}"
					/>
					<span class="text-[11px] font-medium text-base-content/80">Simpan</span>
				</button>

				<!-- Play Audio -->
				<button
					class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/70 hover:bg-base-200 transition-all active:scale-95"
					onclick={() => onAction('play')}
				>
					<Volume2 class="size-6 text-base-content/70" />
					<span class="text-[11px] font-medium text-base-content/80">Audio</span>
				</button>

				<!-- Copy -->
				<button
					class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/70 hover:bg-base-200 transition-all active:scale-95"
					onclick={() => onAction('copy')}
				>
					<Copy class="size-6 text-base-content/70" />
					<span class="text-[11px] font-medium text-base-content/80">Salin</span>
				</button>

				<!-- Share -->
				<button
					class="flex flex-col items-center gap-2 p-3 rounded-2xl bg-base-200/70 hover:bg-base-200 transition-all active:scale-95"
					onclick={() => onAction('share')}
				>
					<Share2 class="size-6 text-base-content/70" />
					<span class="text-[11px] font-medium text-base-content/80">Bagikan</span>
				</button>
			</div>

			<!-- Highlight Section -->
			<div class="bg-base-200/50 rounded-2xl p-4 space-y-3">
				<div class="flex items-center gap-2 text-sm font-semibold text-base-content/90">
					<Highlighter class="size-4" />
					<span>Highlight Ayat</span>
				</div>
				<div class="flex items-center gap-3">
					{#each highlightOptions as color}
						<button
							class="size-10 rounded-full {color.bg} border-4 transition-all hover:scale-110 active:scale-95 {highlightColor ===
							color.id
								? 'border-base-content ring-2 ring-offset-2 ring-offset-base-100 ring-base-content/30'
								: 'border-transparent'}"
							onclick={() => onAction('highlight', color.id === highlightColor ? null : color.id)}
							title={color.label}
						>
							{#if highlightColor === color.id}
								<CheckCircle2 class="size-full p-1.5 text-white drop-shadow-md" />
							{/if}
						</button>
					{/each}
					<!-- Remove highlight -->
					{#if highlightColor}
						<button
							class="size-10 rounded-full bg-base-300 border-2 border-dashed border-base-content/30 flex items-center justify-center transition-all hover:scale-110"
							onclick={() => onAction('highlight', null)}
							title="Hapus Highlight"
						>
							<X class="size-4 text-base-content/50" />
						</button>
					{/if}
				</div>
			</div>

			<!-- Notes Section -->
			<button
				class="w-full flex items-center justify-between p-4 bg-base-200/50 rounded-2xl hover:bg-base-200 transition-colors"
				onclick={() => onAction('note')}
			>
				<div class="flex items-center gap-3">
					<div class="p-2 rounded-xl bg-secondary/10">
						<FileText class="size-5 text-secondary" />
					</div>
					<div class="text-left">
						<span class="font-semibold text-sm block">Catatan Pribadi</span>
						<span class="text-xs text-base-content/60"
							>{hasNotes ? 'Lihat atau edit catatan' : 'Tambahkan catatan untuk ayat ini'}</span
						>
					</div>
				</div>
				{#if hasNotes}
					<span class="badge badge-secondary badge-sm">Ada</span>
				{/if}
			</button>

			<!-- Daily Practice Section -->
			<div class="space-y-3">
				<h4 class="text-sm font-semibold text-base-content/90 px-1">Tambahkan ke Target Harian</h4>

				<!-- Add to Tilawah -->
				<button
					class="w-full flex items-center gap-4 p-4 bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl hover:from-primary/10 hover:to-primary/15 transition-all"
					onclick={() => onAction('addToTilawah')}
				>
					<div class="p-2.5 rounded-xl bg-primary/20">
						<BookOpen class="size-5 text-primary" />
					</div>
					<div class="text-left flex-1">
						<span class="font-semibold text-sm block text-primary">Tilawah Harian</span>
						<span class="text-xs text-base-content/60">Tandai sebagai tilawah hari ini</span>
					</div>
					<BookPlus class="size-5 text-primary/50" />
				</button>

				<!-- Add to Hafalan -->
				<button
					class="w-full flex items-center gap-4 p-4 bg-linear-to-r from-secondary/5 to-secondary/10 border border-secondary/20 rounded-2xl hover:from-secondary/10 hover:to-secondary/15 transition-all"
					onclick={() => onAction('addToHafalan')}
				>
					<div class="p-2.5 rounded-xl bg-secondary/20">
						<GraduationCap class="size-5 text-secondary" />
					</div>
					<div class="text-left flex-1">
						<span class="font-semibold text-sm block text-secondary">Hafalan Harian</span>
						<span class="text-xs text-base-content/60">Tambahkan ke target hafalan</span>
					</div>
					<BookPlus class="size-5 text-secondary/50" />
				</button>
			</div>

			<!-- Share as Image -->
			<button
				class="w-full flex items-center gap-4 p-4 bg-base-200/50 rounded-2xl hover:bg-base-200 transition-colors"
				onclick={() => onAction('shareAsImage')}
			>
				<div class="p-2 rounded-xl bg-accent/10">
					<Image class="size-5 text-accent" />
				</div>
				<div class="text-left flex-1">
					<span class="font-semibold text-sm block">Bagikan sebagai Gambar</span>
					<span class="text-xs text-base-content/60">Buat gambar ayat untuk media sosial</span>
				</div>
			</button>
		</div>
	</div>
{/if}

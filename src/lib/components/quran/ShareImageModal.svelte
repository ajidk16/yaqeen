<script lang="ts">
	import { X, Download, Share2, Image as ImageIcon, Palette } from 'lucide-svelte';
	import { Button, Modal } from '$lib/components/ui';
	import { toast } from '$lib/stores/toast';
	import { onMount } from 'svelte';

	interface Props {
		open?: boolean;
		verse: any;
		surahName: string;
		surahNumber: number;
		onClose?: () => void;
	}

	let { open = $bindable(false), verse, surahName, surahNumber, onClose }: Props = $props();

	let previewRef: HTMLDivElement;
	let isGenerating = $state(false);
	let generatedImage = $state<string | null>(null);
	let selectedTheme = $state<'light' | 'dark' | 'gold'>('light');

	// Theme configurations
	const themes = {
		light: {
			bg: 'bg-gradient-to-br from-white via-slate-50 to-slate-100',
			text: 'text-slate-900',
			arabic: 'text-slate-800',
			accent: 'text-primary',
			border: 'border-slate-200'
		},
		dark: {
			bg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
			text: 'text-slate-100',
			arabic: 'text-white',
			accent: 'text-primary',
			border: 'border-slate-700'
		},
		gold: {
			bg: 'bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-50',
			text: 'text-amber-900',
			arabic: 'text-amber-800',
			accent: 'text-amber-600',
			border: 'border-amber-200'
		}
	};

	const currentTheme = $derived(themes[selectedTheme]);

	async function generateImage() {
		if (!previewRef) return;

		isGenerating = true;
		try {
			const html2canvas = (await import('html2canvas')).default;
			const canvas = await html2canvas(previewRef, {
				scale: 2,
				useCORS: true,
				backgroundColor: null
			});
			generatedImage = canvas.toDataURL('image/png');
		} catch (e) {
			console.error(e);
			toast.error('Gagal generate gambar');
		} finally {
			isGenerating = false;
		}
	}

	async function handleDownload() {
		if (!generatedImage) {
			await generateImage();
		}
		if (generatedImage) {
			const link = document.createElement('a');
			link.download = `QS-${surahName}-${verse?.nomorAyat}.png`;
			link.href = generatedImage;
			link.click();
			toast.success('Gambar berhasil diunduh!');
		}
	}

	async function handleShare() {
		if (!generatedImage) {
			await generateImage();
		}
		if (!generatedImage) return;

		try {
			// Convert data URL to blob
			const response = await fetch(generatedImage);
			const blob = await response.blob();
			const file = new File([blob], `QS-${surahName}-${verse?.nomorAyat}.png`, {
				type: 'image/png'
			});

			if (navigator.share && navigator.canShare({ files: [file] })) {
				await navigator.share({
					title: `QS. ${surahName}: ${verse?.nomorAyat}`,
					files: [file]
				});
				toast.success('Berhasil dibagikan!');
			} else {
				// Fallback: download
				handleDownload();
			}
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				console.error(e);
				toast.error('Gagal membagikan');
			}
		}
	}

	function handleClose() {
		open = false;
		generatedImage = null;
		onClose?.();
	}

	// Regenerate when theme changes
	$effect(() => {
		if (open && selectedTheme) {
			generatedImage = null;
		}
	});
</script>

<Modal bind:open title="Bagikan sebagai Gambar" class="modal-bottom sm:modal-middle">
	<div class="space-y-4">
		<!-- Theme Selector -->
		<div class="flex items-center gap-3">
			<Palette class="size-4 text-base-content/60" />
			<span class="text-sm font-medium">Pilih Tema:</span>
			<div class="flex gap-2">
				<button
					class="size-8 rounded-full bg-linear-to-br from-white to-slate-100 border-2 transition-all {selectedTheme ===
					'light'
						? 'ring-2 ring-primary ring-offset-2'
						: 'border-slate-300'}"
					onclick={() => (selectedTheme = 'light')}
					title="Light"
				></button>
				<button
					class="size-8 rounded-full bg-linear-to-br from-slate-800 to-slate-900 border-2 transition-all {selectedTheme ===
					'dark'
						? 'ring-2 ring-primary ring-offset-2'
						: 'border-slate-600'}"
					onclick={() => (selectedTheme = 'dark')}
					title="Dark"
				></button>
				<button
					class="size-8 rounded-full bg-linear-to-br from-amber-100 to-yellow-100 border-2 transition-all {selectedTheme ===
					'gold'
						? 'ring-2 ring-primary ring-offset-2'
						: 'border-amber-300'}"
					onclick={() => (selectedTheme = 'gold')}
					title="Gold"
				></button>
			</div>
		</div>

		<!-- Preview Card -->
		<div class="border border-base-300 rounded-xl overflow-hidden">
			<div
				bind:this={previewRef}
				class="p-6 md:p-8 {currentTheme.bg}"
				style="aspect-ratio: 4/3; min-width: 300px;"
			>
				<!-- Islamic ornament top -->
				<div class="flex justify-center mb-4 opacity-30">
					<svg class="h-6 {currentTheme.accent}" viewBox="0 0 100 20">
						<path
							d="M0 10L10 0L20 10L10 20L0 10M20 10L30 0L40 10L30 20L20 10M40 10L50 0L60 10L50 20L40 10M60 10L70 0L80 10L70 20L60 10M80 10L90 0L100 10L90 20L80 10"
							fill="currentColor"
						/>
					</svg>
				</div>

				<!-- Arabic Text -->
				<p
					class="font-amiri text-2xl md:text-3xl leading-loose text-center mb-4 {currentTheme.arabic}"
					dir="rtl"
				>
					{verse?.teksArab}
				</p>

				<!-- Translation -->
				<p class="text-sm md:text-base text-center leading-relaxed mb-4 {currentTheme.text}">
					"{verse?.teksIndonesia}"
				</p>

				<!-- Reference -->
				<p class="text-center text-sm font-semibold {currentTheme.accent}">
					QS. {surahName}: {verse?.nomorAyat}
				</p>

				<!-- Islamic ornament bottom -->
				<div class="flex justify-center mt-4 opacity-30">
					<svg class="h-6 {currentTheme.accent}" viewBox="0 0 100 20">
						<path
							d="M0 10L10 0L20 10L10 20L0 10M20 10L30 0L40 10L30 20L20 10M40 10L50 0L60 10L50 20L40 10M60 10L70 0L80 10L70 20L60 10M80 10L90 0L100 10L90 20L80 10"
							fill="currentColor"
						/>
					</svg>
				</div>
			</div>
		</div>

		<!-- Hint -->
		<p class="text-xs text-base-content/50 text-center">
			Gambar akan digenerate dengan resolusi tinggi untuk dibagikan
		</p>
	</div>

	{#snippet actions()}
		<div class="flex items-center gap-2 w-full">
			<Button variant="ghost" onclick={handleClose}>Batal</Button>
			<div class="flex-1"></div>
			<Button variant="ghost" onclick={handleDownload} disabled={isGenerating}>
				<Download class="size-4 mr-1" />
				Unduh
			</Button>
			<Button
				variant="primary"
				onclick={handleShare}
				disabled={isGenerating}
				loading={isGenerating}
			>
				<Share2 class="size-4 mr-1" />
				Bagikan
			</Button>
		</div>
	{/snippet}
</Modal>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

	.font-amiri {
		font-family: 'Amiri', serif;
	}
</style>

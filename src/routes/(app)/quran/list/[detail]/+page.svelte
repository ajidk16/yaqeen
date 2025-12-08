<script lang="ts">
	import { page } from '$app/state';
	import {
		ChevronLeft,
		MoreVertical,
		PlayCircle,
		PauseCircle,
		Settings2,
		Moon,
		Sun
	} from 'lucide-svelte';
	import { Button, Card } from '$lib/components/ui';
	import VerseItem from '$lib/components/quran/VerseItem.svelte';
	import ActionMenu from '$lib/components/quran/ActionMenu.svelte';
	import SurahHeader from '$lib/components/quran/SurahHeader.svelte';
	import VerseFilter from '$lib/components/quran/VerseFilter.svelte';
	import NoteModal from '$lib/components/quran/NoteModal.svelte';
	import ShareImageModal from '$lib/components/quran/ShareImageModal.svelte';
	import { toast } from '$lib/stores/toast';

	// Props from load

	// State
	let activeTab = $state('translation'); // translation, page, tafsir
	let isPlaying = $state(false);
	let activeVerse = $state<any>(null);
	let isMenuOpen = $state(false);
	let bookmarks = $state(
		page.data.userInteractions?.bookmarks?.map((b: { ayahNumber: number }) => b.ayahNumber) || []
	);
	const quran = $derived(page.data.quran.data);

	let highlights = $state<Record<number, string>>({}); // ayahNumber -> color
	let notes = $state<number[]>(
		page.data.userInteractions?.notes?.map((n: { ayahNumber: number }) => n.ayahNumber) || []
	);
	let isDarkMode = $state(false); // Should sync with global theme ideally

	// New state for filters and modals
	let selectedAyat = $state(1);
	let selectedQori = $state('05'); // Default: Mishary Alafasy
	let isNoteModalOpen = $state(false);
	let isShareImageModalOpen = $state(false);
	let currentNoteText = $state('');
	let audioRef = $state<HTMLAudioElement | null>(null);

	// Initialize highlights map
	$effect(() => {
		if (page.data.userInteractions?.highlights) {
			const map: Record<number, string> = {};
			page.data.userInteractions.highlights.forEach((h: { ayahNumber: number; color: string }) => {
				map[h.ayahNumber] = h.color;
			});
			highlights = map;
		}
	});

	// Dark mode toggle effect
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
		}
	});

	// Actions
	function handleVerseAction(action: string, payload?: any) {
		console.log('Action:', action, payload);

		switch (action) {
			case 'openMenu':
				activeVerse = payload;
				isMenuOpen = true;
				break;
			case 'bookmark':
				toggleBookmark(activeVerse.nomorAyat);
				break;
			case 'highlight':
				updateHighlight(activeVerse.nomorAyat, payload);
				break;
			case 'note':
				isMenuOpen = false;
				isNoteModalOpen = true;
				break;
			case 'play':
				// Play specific verse audio
				playVerseAudio(payload || activeVerse);
				break;
			case 'copy':
				copyVerseToClipboard();
				break;
			case 'share':
				shareVerse();
				break;
			case 'shareAsImage':
				isMenuOpen = false;
				isShareImageModalOpen = true;
				break;
			case 'addToTilawah':
				addToTilawah();
				break;
			case 'addToHafalan':
				addToHafalan();
				break;
		}
	}

	function copyVerseToClipboard() {
		if (!activeVerse) return;
		const text = `${activeVerse.teksArab}\n\n${activeVerse.teksIndonesia}\n\n— QS. ${quran.namaLatin}: ${activeVerse.nomorAyat}`;
		navigator.clipboard.writeText(text);
		toast.success('Teks ayat berhasil disalin!');
		isMenuOpen = false;
	}

	async function shareVerse() {
		if (!activeVerse) return;
		const shareData = {
			title: `QS. ${quran.namaLatin}: ${activeVerse.nomorAyat}`,
			text: `${activeVerse.teksArab}\n\n${activeVerse.teksIndonesia}`,
			url: `${window.location.origin}/quran/list/${quran.nomor}#ayah-${activeVerse.nomorAyat}`
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				// Fallback: copy to clipboard
				await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
				toast.success('Link berhasil disalin!');
			}
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				console.error('Share failed:', e);
			}
		}
		isMenuOpen = false;
	}

	function playVerseAudio(verse: any) {
		if (!verse?.audio?.[selectedQori]) {
			toast.error('Audio tidak tersedia');
			return;
		}

		// Create or reuse audio element
		if (audioRef) {
			audioRef.pause();
		}
		audioRef = new Audio(verse.audio[selectedQori]);
		audioRef.play();
		isPlaying = true;

		audioRef.onended = () => {
			isPlaying = false;
		};

		isMenuOpen = false;
	}

	function playSurahAudio() {
		if (!quran.audioFull?.[selectedQori]) {
			toast.error('Audio tidak tersedia');
			return;
		}

		if (audioRef) {
			audioRef.pause();
		}
		audioRef = new Audio(quran.audioFull[selectedQori]);
		audioRef.play();
		isPlaying = true;

		audioRef.onended = () => {
			isPlaying = false;
		};
	}

	async function addToTilawah() {
		if (!activeVerse) return;

		const formData = new FormData();
		formData.append('surahNumber', quran.nomor.toString());
		formData.append('surahName', quran.namaLatin);
		formData.append('ayahNumber', activeVerse.nomorAyat.toString());

		try {
			await fetch('?/addToTilawah', { method: 'POST', body: formData });
			toast.success(`Ayat ${activeVerse.nomorAyat} ditambahkan ke Tilawah Harian!`);
		} catch (e) {
			console.error(e);
			toast.error('Gagal menambahkan ke tilawah');
		}
		isMenuOpen = false;
	}

	async function addToHafalan() {
		if (!activeVerse) return;

		const formData = new FormData();
		formData.append('surahNumber', quran.nomor.toString());
		formData.append('surahName', quran.namaLatin);
		formData.append('ayahNumber', activeVerse.nomorAyat.toString());

		try {
			await fetch('?/addToHafalan', { method: 'POST', body: formData });
			toast.success(`Ayat ${activeVerse.nomorAyat} ditambahkan ke Target Hafalan!`);
		} catch (e) {
			console.error(e);
			toast.error('Gagal menambahkan ke hafalan');
		}
		isMenuOpen = false;
	}

	function handleNoteSaved(note: string) {
		if (activeVerse && !notes.includes(activeVerse.nomorAyat)) {
			notes = [...notes, activeVerse.nomorAyat];
		}
		currentNoteText = note;
	}

	function handleNoteDeleted() {
		if (activeVerse) {
			notes = notes.filter((n) => n !== activeVerse.nomorAyat);
		}
		currentNoteText = '';
	}

	async function toggleBookmark(ayah: number) {
		// Optimistic update
		const wasBookmarked = bookmarks.includes(ayah);
		if (wasBookmarked) {
			bookmarks = bookmarks.filter((b: unknown) => b !== ayah);
		} else {
			bookmarks = [...bookmarks, ayah];
		}

		const formData = new FormData();
		formData.append('surahNumber', quran.nomor.toString());
		formData.append('ayahNumber', ayah.toString());

		try {
			await fetch('?/toggleBookmark', { method: 'POST', body: formData });
		} catch (e) {
			console.error(e);
			// Revert on error
			if (wasBookmarked) bookmarks = [...bookmarks, ayah];
			else bookmarks = bookmarks.filter((b: unknown) => b !== ayah);
		}
	}

	async function updateHighlight(ayah: number, color: string | null) {
		const oldColor = highlights[ayah];

		if (!color) {
			const newH = { ...highlights };
			delete newH[ayah];
			highlights = newH;
		} else {
			highlights = { ...highlights, [ayah]: color };
		}

		isMenuOpen = false;

		const formData = new FormData();
		formData.append('surahNumber', quran.nomor.toString());
		formData.append('ayahNumber', ayah.toString());
		if (color) formData.append('color', color);

		try {
			await fetch('?/updateHighlight', { method: 'POST', body: formData });
		} catch (e) {
			console.error(e);
			// Revert
			if (oldColor) highlights = { ...highlights, [ayah]: oldColor };
			else {
				const newH = { ...highlights };
				delete newH[ayah];
				highlights = newH;
			}
		}
	}
</script>

<div class="min-h-screen bg-base-100 pb-24">
	<!-- Sticky Header -->
	<header class="sticky top-0 z-40 bg-base-100/80 backdrop-blur-md border-b border-base-200">
		<div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<a href="/quran/list" class="btn btn-ghost btn-circle btn-sm">
					<ChevronLeft class="size-5" />
				</a>
				<div>
					<h1 class="font-bold text-lg leading-tight">{quran.namaLatin}</h1>
					<p class="text-xs text-base-content/60">
						{quran.arti} • {quran.jumlahAyat} Ayat
					</p>
				</div>
			</div>

			<div class="flex gap-1">
				<button class="btn btn-ghost btn-circle btn-sm" onclick={() => (isDarkMode = !isDarkMode)}>
					{#if isDarkMode}
						<Sun class="size-5" />
					{:else}
						<Moon class="size-5" />
					{/if}
				</button>
				<button class="btn btn-ghost btn-circle btn-sm">
					<Settings2 class="size-5" />
				</button>
			</div>
		</div>

		<!-- Tabs -->
		<div class="px-4 pb-0 overflow-x-auto hide-scrollbar">
			<div class="flex max-w-3xl mx-auto">
				<button
					class="flex-1 pb-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
					'translation'
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/60'}"
					onclick={() => (activeTab = 'translation')}
				>
					Terjemah
				</button>
				<button
					class="flex-1 pb-3 text-sm font-medium border-b-2 transition-colors {activeTab === 'page'
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/60'}"
					onclick={() => (activeTab = 'page')}
				>
					Per Halaman
				</button>
				<button
					class="flex-1 pb-3 text-sm font-medium border-b-2 transition-colors {activeTab ===
					'tafsir'
						? 'border-primary text-primary'
						: 'border-transparent text-base-content/60'}"
					onclick={() => (activeTab = 'tafsir')}
				>
					Tafsir
				</button>
			</div>
		</div>
	</header>

	<!-- Surah Header Card -->
	<SurahHeader surah={quran} {selectedQori} {isPlaying} onPlayAudio={playSurahAudio} />

	<!-- Verse Filter -->
	<VerseFilter totalAyat={quran.jumlahAyat} bind:selectedAyat bind:selectedQori />

	<!-- Main Content -->
	<main class="max-w-3xl mx-auto py-4">
		<!-- Bismillah -->
		{#if quran.nomor !== 1 && quran.nomor !== 9}
			<div class="text-center py-8 font-amiri text-3xl md:text-4xl text-base-content/80">﷽</div>
		{/if}

		<div class="space-y-2">
			{#if activeTab === 'translation'}
				{#each quran.ayat as verse (verse.nomorAyat)}
					<div id="ayah-{verse.nomorAyat}">
						<VerseItem
							{verse}
							surahNumber={quran.nomor}
							isBookmarked={bookmarks.includes(verse.nomorAyat)}
							highlightColor={highlights[verse.nomorAyat]}
							hasNotes={notes.includes(verse.nomorAyat)}
							onAction={handleVerseAction}
						/>
					</div>
				{/each}
			{:else if activeTab === 'page'}
				<!-- Mushaf Page View -->
				<div class="mushaf-container p-4 md:p-8">
					<!-- Page Header -->
					<div class="flex items-center justify-between mb-6 px-2">
						<button
							class="flex items-center gap-2 text-base-content/70 hover:text-primary transition-colors"
						>
							<svg
								class="size-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M12 16v-4M12 8h.01" />
							</svg>
							<span class="text-sm font-medium">Surah Info</span>
						</button>
						<button
							class="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
						>
							<svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
								<polygon points="5 3 19 12 5 21 5 3" />
							</svg>
							<span class="text-sm font-medium">Play Audio</span>
						</button>
					</div>

					<!-- Mushaf Text Container -->
					<div
						class="mushaf-page bg-base-100 dark:bg-base-200 rounded-2xl border border-base-300 p-6 md:p-10 shadow-sm"
					>
						<p
							class="font-amiri text-2xl md:text-3xl lg:text-4xl leading-[2.2] md:leading-[2.4] text-center text-base-content"
							dir="rtl"
							style="text-align-last: center; word-spacing: 0.15em;"
						>
							{page.data.mushafPageText}
						</p>
					</div>

					<!-- Page Number -->
					<div class="text-center mt-6">
						<span class="text-primary font-medium text-sm">{page.data.surah.pageNumber || 1}</span>
					</div>
				</div>
			{:else}
				<!-- Tafsir View -->
				<div class="tafsir-container space-y-6 p-4">
					{#each quran.ayat as verse (verse.nomorAyat)}
						<div
							class="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
						>
							<!-- Verse Header -->
							<div
								class="bg-linear-to-r from-primary/10 to-secondary/10 px-4 py-3 flex items-center justify-between"
							>
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-primary/20 flex items-center justify-center">
										<span class="text-sm font-bold text-primary">{verse.nomorAyat}</span>
									</div>
									<p class="font-amiri text-xl text-base-content" dir="rtl">{verse.teksArab}</p>
								</div>
							</div>

							<!-- Translation -->
							<div class="px-4 py-3 border-b border-base-200">
								<p class="text-sm text-base-content/80">{verse.teksIndonesia}</p>
							</div>

							<!-- Tafsir Content -->
							<div class="px-4 py-4 bg-base-50">
								<div class="flex items-start gap-3">
									<div class="flex-none mt-1">
										<svg
											class="size-5 text-secondary"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
											/>
										</svg>
									</div>
									<div>
										<p class="text-xs font-semibold text-secondary mb-2 uppercase tracking-wide">
											Tafsir
										</p>
										<p class="text-sm text-base-content/90 leading-relaxed">
											{@html quran.tafsir?.wpiId
												? `Lihat tafsir untuk Surah ${quran.namaLatin}`
												: 'Tafsir belum tersedia.'}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>

	<!-- Floating Audio Player (Mini) -->
	<div
		class="fixed bottom-0 inset-x-0 bg-base-100/90 backdrop-blur-lg border-t border-base-200 p-4 z-40"
	>
		<div class="max-w-3xl mx-auto flex items-center gap-4">
			<div class="flex-1">
				<p class="text-xs font-bold truncate">QS. {quran.namaLatin}</p>
				<p class="text-[10px] text-base-content/60">Mishary Rashid Alafasy</p>
			</div>
			<div class="flex items-center gap-3">
				<Button size="sm" circle variant="ghost">
					<ChevronLeft class="size-4" />
				</Button>
				<Button
					circle
					variant="primary"
					class="shadow-lg shadow-primary/30"
					onclick={() => (isPlaying = !isPlaying)}
				>
					{#if isPlaying}
						<PauseCircle class="size-6" />
					{:else}
						<PlayCircle class="size-6 ml-0.5" />
					{/if}
				</Button>
				<Button size="sm" circle variant="ghost">
					<ChevronLeft class="size-4 rotate-180" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Action Drawer -->
	<ActionMenu
		open={isMenuOpen}
		verse={activeVerse}
		surahName={quran.namaLatin}
		isBookmarked={activeVerse ? bookmarks.includes(activeVerse.nomorAyat) : false}
		highlightColor={activeVerse ? highlights[activeVerse.nomorAyat] : null}
		hasNotes={activeVerse ? notes.includes(activeVerse.nomorAyat) : false}
		onClose={() => (isMenuOpen = false)}
		onAction={handleVerseAction}
	/>

	<!-- Note Modal -->
	<NoteModal
		bind:open={isNoteModalOpen}
		verse={activeVerse}
		surahNumber={quran.nomor}
		surahName={quran.namaLatin}
		existingNote={currentNoteText}
		onSave={handleNoteSaved}
		onDelete={handleNoteDeleted}
	/>

	<!-- Share Image Modal -->
	<ShareImageModal
		bind:open={isShareImageModalOpen}
		verse={activeVerse}
		surahName={quran.namaLatin}
		surahNumber={quran.nomor}
	/>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');

	.font-amiri {
		font-family: 'Amiri', serif;
	}

	.hide-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.hide-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>

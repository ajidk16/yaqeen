<script lang="ts">
	import { page } from '$app/state';
	import { ChevronLeft, Settings2, Moon, Sun, Pause, Play } from 'lucide-svelte';
	import { Button, Card, Modal } from '$lib/components/ui';
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
	let notesMap = $state<Record<number, string>>({}); // ayahNumber -> text
	let isDarkMode = $state(false); // Should sync with global theme ideally

	// New state for filters and modals
	let selectedAyat = $state(1);
	let selectedQori = $state('05'); // Default: Mishary Alafasy
	let isNoteModalOpen = $state(false);
	let isShareImageModalOpen = $state(false);
	let currentNoteText = $state('');
	let audioRef = $state<HTMLAudioElement | null>(null);

	// Page tab state
	let currentPageIndex = $state(0);
	const versesPerPage = 20;

	// Modal for page tab ayah detail
	let isVerseDetailModalOpen = $state(false);
	let selectedVerseDetail = $state<any>(null);

	// Tafsir data
	const tafsir = $derived(page.data.tafsir?.data?.tafsir || []);

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

	// Initialize notes map
	$effect(() => {
		if (page.data.userInteractions?.notes) {
			const map: Record<number, string> = {};
			page.data.userInteractions.notes.forEach((n: { ayahNumber: number; text: string }) => {
				map[n.ayahNumber] = n.text;
			});
			notesMap = map;
		}
	});

	// Dark mode toggle effect
	$effect(() => {
		if (typeof document !== 'undefined') {
			document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
		}
	});

	// Actions
	let currentPlayingVerse = $state<number | null>(null);

	// Actions
	function handleVerseAction(action: string, payload?: any) {
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
				currentNoteText = notesMap[activeVerse?.nomorAyat] || '';
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

	function scrollToVerse(ayahNumber: number) {
		// Calculate if we need to switch page in Mushaf view
		if (activeTab === 'page') {
			const targetPage = Math.floor((ayahNumber - 1) / versesPerPage);
			if (currentPageIndex !== targetPage) {
				currentPageIndex = targetPage;
				// Wait for DOM update
				setTimeout(() => {
					doScroll(ayahNumber);
				}, 100);
				return;
			}
		}
		doScroll(ayahNumber);
	}

	function doScroll(ayahNumber: number) {
		const element = document.getElementById(`ayah-${ayahNumber}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			// Add highlight effect
			element.classList.add('bg-primary/20');
			setTimeout(() => {
				element.classList.remove('bg-primary/20');
			}, 2000);
		}
	}

	function playVerseAudio(verse: any) {
		if (!verse?.audio?.[selectedQori]) {
			toast.add('Audio tidak tersedia');
			return;
		}

		// Stop current if playing
		if (audioRef) {
			audioRef.pause();
			audioRef = null;
		}

		currentPlayingVerse = verse.nomorAyat;
		scrollToVerse(verse.nomorAyat);

		audioRef = new Audio(verse.audio[selectedQori]);
		audioRef.play();
		isPlaying = true;

		audioRef.onended = () => {
			// Auto play next verse
			const nextVerseNumber = verse.nomorAyat + 1;
			if (nextVerseNumber <= quran.jumlahAyat) {
				const nextVerse = quran.ayat.find((v: any) => v.nomorAyat === nextVerseNumber);
				if (nextVerse) {
					playVerseAudio(nextVerse);
				} else {
					isPlaying = false;
					currentPlayingVerse = null;
				}
			} else {
				isPlaying = false;
				currentPlayingVerse = null;
			}
		};

		isMenuOpen = false;
	}

	async function addToTilawah() {
		if (!activeVerse) return;

		const formData = new FormData();
		formData.append('surahNumber', quran.nomor.toString());
		formData.append('surahName', quran.namaLatin);
		formData.append('ayahNumber', activeVerse.nomorAyat.toString());

		try {
			await fetch('?/addToTilawah', { method: 'POST', body: formData });
			toast.add(`Ayat ${activeVerse.nomorAyat} ditambahkan ke Tilawah Harian!`);
		} catch (e) {
			console.error(e);
			toast.add('Gagal menambahkan ke tilawah', 'error');
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
			toast.add(`Ayat ${activeVerse.nomorAyat} ditambahkan ke Target Hafalan!`);
		} catch (e) {
			console.error(e);
			toast.add('Gagal menambahkan ke hafalan', 'error');
		}
		isMenuOpen = false;
	}

	function handleNoteSaved(note: string) {
		if (activeVerse) {
			if (!notes.includes(activeVerse.nomorAyat)) {
				notes = [...notes, activeVerse.nomorAyat];
			}
			notesMap = { ...notesMap, [activeVerse.nomorAyat]: note };
		}
		currentNoteText = note;
	}

	function handleNoteDeleted() {
		if (activeVerse) {
			notes = notes.filter((n) => n !== activeVerse.nomorAyat);
			const newMap = { ...notesMap };
			delete newMap[activeVerse.nomorAyat];
			notesMap = newMap;
		}
		currentNoteText = '';
	}

	// Open verse detail modal (for page tab)
	function openVerseDetail(verse: any) {
		selectedVerseDetail = verse;
		isVerseDetailModalOpen = true;
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

	function copyVerseToClipboard() {
		if (!activeVerse) return;

		const textToCopy = `QS. ${quran.namaLatin} ${quran.nomor}:${activeVerse.nomorAyat}\n\n${activeVerse.teksArab}\n\n${activeVerse.teksIndonesia}`;

		navigator.clipboard.writeText(textToCopy).then(() => {
			toast.add('Ayat berhasil disalin', 'success', 2000);
			isMenuOpen = false;
		});
	}

	async function shareVerse() {
		if (!activeVerse) return;

		const textToShare = `QS. ${quran.namaLatin} ${quran.nomor}:${activeVerse.nomorAyat}\n\n${activeVerse.teksArab}\n\n${activeVerse.teksIndonesia}`;

		if (navigator.share) {
			try {
				await navigator.share({
					title: `QS. ${quran.namaLatin} Ayat ${activeVerse.nomorAyat}`,
					text: textToShare
				});
				isMenuOpen = false;
			} catch (error) {
				console.error('Error sharing:', error);
			}
		} else {
			toast.add('Fitur berbagi tidak didukung di perangkat ini', 'error');
		}
	}
</script>

<div class="min-h-screen bg-base-100 pb-24">
	<!-- Sticky Header -->
	<header class="sticky top-0 z-40 bg-base-100/80 backdrop-blur-md border-b border-base-200">
		<div class="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
			<!-- <div class="flex items-center gap-3">
				<a href="/quran/list" class="btn btn-ghost btn-circle btn-sm">
					<ChevronLeft class="size-5" />
				</a>
				<div>
					<h1 class="font-bold text-lg leading-tight">Kembali</h1>
				</div>
			</div> -->
			<a
				href="/quran/list"
				class="inline-flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-primary transition-colors group"
			>
				<div class="p-1.5 rounded-lg bg-base-300 group-hover:bg-primary/10 transition-colors">
					<ChevronLeft class="size-4" />
				</div>
				<span>Kembali ke Daftar Surah</span>
			</a>

			<!-- <div class="flex gap-1">
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
			</div> -->
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
	<SurahHeader
		surah={quran}
		{selectedQori}
		{isPlaying}
		onPlayAudio={() => playVerseAudio(quran.ayat[0])}
	/>

	<!-- Verse Filter -->
	<VerseFilter totalAyat={quran.jumlahAyat} bind:selectedAyat bind:selectedQori />

	<!-- Main Content -->
	<main class="max-w-3xl mx-auto py-4">
		<!-- Bismillah -->
		{#if quran.nomor !== 1 && quran.nomor !== 9}
			<div class="text-center py-8 font-amiri text-xl md:text-4xl text-base-content/80">﷽</div>
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
				<!-- Mushaf Page View with Carousel -->
				<div class="mushaf-container p-4 md:p-8">
					<!-- Page Navigation -->
					<div class="flex items-center justify-between mb-4 px-2">
						<button
							class="btn btn-circle btn-sm btn-ghost"
							disabled={currentPageIndex === 0}
							onclick={() => (currentPageIndex = Math.max(0, currentPageIndex - 1))}
						>
							<ChevronLeft class="size-5" />
						</button>
						<span class="text-sm font-medium text-base-content/70">
							Halaman {currentPageIndex + 1} dari {Math.ceil(quran.ayat.length / versesPerPage)}
						</span>
						<button
							class="btn btn-circle btn-sm btn-ghost"
							disabled={currentPageIndex >= Math.ceil(quran.ayat.length / versesPerPage) - 1}
							onclick={() =>
								(currentPageIndex = Math.min(
									Math.ceil(quran.ayat.length / versesPerPage) - 1,
									currentPageIndex + 1
								))}
						>
							<ChevronLeft class="size-5 rotate-180" />
						</button>
					</div>

					<!-- Mushaf Text Container -->
					<div
						class="mushaf-page bg-amber-50/50 dark:bg-base-200 rounded-2xl border-4 border-l-primary/60 border-primary/20 overflow-hidden shadow-lg"
					>
						<!-- Decorative Header -->
						<div
							class="bg-linear-to-r from-primary/10 to-primary/5 px-4 py-2 border-b border-primary/20 flex items-center justify-center"
						>
							<span class="text-sm font-semibold text-primary/70">۞ {quran.namaLatin} ۞</span>
						</div>

						<!-- Verses (flowing inline) -->
						<div class="p-4 md:p-6">
							<p
								class="font-amiri text-[1.35rem] md:text-[1.6rem] lg:text-[1.8rem] leading-loose md:leading-[2.1] tracking-tight text-base-content text-right break-all"
								dir="rtl"
							>
								{#each quran.ayat.slice(currentPageIndex * versesPerPage, (currentPageIndex + 1) * versesPerPage) as verse, i (verse.nomorAyat)}
									<button
										id="ayah-{verse.nomorAyat}"
										type="button"
										class="inline align-middle hover:text-primary transition-colors cursor-pointer p-0 m-0 border-0 bg-transparent {currentPlayingVerse ===
										verse.nomorAyat
											? 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]'
											: ''}"
										onclick={() => openVerseDetail(verse)}
									>
										{verse.teksArab}
									</button>

									<span class="inline-flex items-start align-middle ml-3">
										<span class="relative inline-flex items-center justify-center size-5 md:size-8">
											<svg
												class="absolute inset-0 w-full h-full text-primary/60"
												viewBox="0 0 40 40"
											>
												<circle
													cx="20"
													cy="20"
													r="18"
													fill="none"
													stroke="currentColor"
													stroke-width="2"
												/>
												<circle
													cx="20"
													cy="20"
													r="15"
													fill="none"
													stroke="currentColor"
													stroke-width="1"
													opacity="0.5"
												/>
												<circle cx="20" cy="2" r="2" fill="currentColor" />
												<circle cx="20" cy="38" r="2" fill="currentColor" />
												<circle cx="2" cy="20" r="2" fill="currentColor" />
												<circle cx="38" cy="20" r="2" fill="currentColor" />
											</svg>
											<span class="relative text-xs md:text-sm font-bold text-primary">
												{verse.nomorAyat}
											</span>
										</span>
									</span>
								{/each}
							</p>
						</div>
					</div>

					<!-- Page Dots Indicator -->
					<div class="flex justify-center gap-2 mt-6">
						{#each Array(Math.ceil(quran.ayat.length / versesPerPage)) as _, i}
							<button
								class="size-10 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all {i ===
								currentPageIndex
									? 'bg-primary border-primary text-primary-content shadow-lg shadow-primary/30'
									: 'bg-base-100 border-primary/30 text-primary/70 hover:border-primary hover:bg-primary/10'}"
								onclick={() => (currentPageIndex = i)}
							>
								{i + 1}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Tafsir View -->
				<div class="tafsir-container space-y-6 p-4">
					{#each tafsir as item (item.ayat)}
						<div
							class="bg-base-100 rounded-2xl border border-base-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
						>
							<!-- Verse Header -->
							<div
								class="bg-linear-to-r from-primary/10 to-secondary/10 px-4 py-3 flex items-center justify-between"
							>
								<div class="flex items-center gap-3">
									<div class="size-8 rounded-full bg-primary/20 flex items-center justify-center">
										<span class="text-sm font-bold text-primary">{item.ayat}</span>
									</div>
									<p class="font-amiri text-xl text-base-content" dir="rtl">
										{quran.ayat.find((v: any) => v.nomorAyat === item.ayat)?.teksArab || ''}
									</p>
								</div>
							</div>

							<!-- Translation -->
							<div class="px-4 py-3 border-b border-base-200">
								<p class="text-sm text-base-content/80">
									{quran.ayat.find((v: any) => v.nomorAyat === item.ayat)?.teksIndonesia || ''}
								</p>
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
											{item.teks}
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
					onclick={() => {
						if (isPlaying && audioRef) {
							audioRef.pause();
							isPlaying = false;
						} else if (!isPlaying && audioRef) {
							audioRef.play();
							isPlaying = true;
						} else {
							// Start from first verse or current playing
							const verseToPlay = currentPlayingVerse
								? quran.ayat.find((v: any) => v.nomorAyat === currentPlayingVerse)
								: quran.ayat[0];
							playVerseAudio(verseToPlay);
						}
					}}
				>
					{#if isPlaying}
						<Pause class="size-6" />
					{:else}
						<Play class="size-6 ml-0.5" />
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

	<!-- Verse Detail Modal (for Page Tab) -->
	<Modal bind:open={isVerseDetailModalOpen} title="Detail Ayat">
		{#if selectedVerseDetail}
			<div class="space-y-4">
				<!-- Arabic Text -->
				<div class="p-4 bg-primary/5 rounded-xl">
					<p class="font-amiri text-2xl md:text-3xl text-center leading-loose" dir="rtl">
						{selectedVerseDetail.teksArab}
					</p>
				</div>

				<!-- Verse Number -->
				<div class="text-center">
					<span class="badge badge-primary badge-lg">
						Ayat {selectedVerseDetail.nomorAyat}
					</span>
				</div>

				<!-- Latin Text -->
				{#if selectedVerseDetail.teksLatin}
					<div>
						<p class="text-xs font-semibold text-secondary mb-1 uppercase tracking-wide">
							Transliterasi
						</p>
						<p class="text-sm italic text-primary/80 leading-relaxed">
							{selectedVerseDetail.teksLatin}
						</p>
					</div>
				{/if}

				<!-- Translation -->
				<div>
					<p class="text-xs font-semibold text-secondary mb-1 uppercase tracking-wide">
						Terjemahan
					</p>
					<p class="text-sm text-base-content/80 leading-relaxed">
						{selectedVerseDetail.teksIndonesia}
					</p>
				</div>
			</div>
		{/if}

		{#snippet actions()}
			<div class="flex items-center justify-end gap-2 w-full">
				<Button variant="ghost" onclick={() => (isVerseDetailModalOpen = false)}>Tutup</Button>
				<Button
					variant="primary"
					onclick={() => {
						activeVerse = selectedVerseDetail;
						isVerseDetailModalOpen = false;
						isMenuOpen = true;
					}}
				>
					Aksi Lainnya
				</Button>
			</div>
		{/snippet}
	</Modal>
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

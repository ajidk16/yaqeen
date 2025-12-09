<script lang="ts">
	import { Search, BookOpen, ChevronLeft, Sparkles, Filter } from 'lucide-svelte';
	// import { quranMetadata } from '$lib/data/quran-metadata';
	import { fly, fade } from 'svelte/transition';
	import { page } from '$app/state';

	let searchQuery = $state('');
	let selectedType = $state<'all' | 'Meccan' | 'Medinan'>('all');

	// Using $derived checking for page.data.chapters validity
	const chapters = $derived(page.data.chapters?.data || []);

	// Daily quotes
	const quotes = [
		{
			text: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا لَعَلَّكُمْ تُرْحَمُونَ',
			translation:
				'"Dan apabila dibacakan Al-Quran, maka dengarkanlah dan diamlah agar kamu mendapat rahmat."',
			surah: "QS. Al-A'raf: 204"
		},
		{
			text: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
			translation: '"Sesungguhnya Al-Quran ini memberikan petunjuk ke jalan yang paling lurus."',
			surah: 'QS. Al-Isra: 9'
		}
	];
	let dailyQuote = $state(quotes[Math.floor(Math.random() * quotes.length)]);

	let filteredSurahs = $derived(
		chapters.filter((surah: any) => {
			const matchesSearch =
				surah.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(surah.arti && surah.arti.toLowerCase().includes(searchQuery.toLowerCase())) ||
				surah.nomor.toString().includes(searchQuery);

			const matchesType =
				selectedType === 'all' ||
				(selectedType === 'Meccan' && surah.tempatTurun === 'Mekah') ||
				(selectedType === 'Medinan' && surah.tempatTurun === 'Madinah');

			return matchesSearch && matchesType;
		})
	);
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-6">
		<!-- Back Button -->
		<a
			href="/quran"
			class="inline-flex items-center gap-2 text-sm font-medium text-base-content/60 hover:text-primary transition-colors group"
		>
			<div class="p-1.5 rounded-lg bg-base-300 group-hover:bg-primary/10 transition-colors">
				<ChevronLeft class="size-4" />
			</div>
			<span>Kembali ke Quran</span>
		</a>

		<div
			class="card bg-linear-to-br from-primary/5 via-base-100 to-secondary/5 border border-base-300/50 shadow-xl"
		>
			<div class="card-body p-6 md:p-8">
				<!-- Quote Badge -->
				<div class="flex justify-center mb-4">
					<div class="badge badge-primary badge-lg gap-2 py-4 px-4">
						<Sparkles class="size-4" />
						<span class="font-medium">Quote Hari Ini</span>
					</div>
				</div>

				<!-- Arabic Text -->
				<blockquote class="space-y-4">
					<p
						class="font-amiri text-2xl md:text-3xl lg:text-4xl leading-loose text-center text-base-content/90"
						dir="rtl"
						lang="ar"
					>
						{dailyQuote.text}
					</p>

					<!-- Translation -->
					<div class="divider"></div>

					<p
						class="text-sm md:text-base lg:text-lg text-center text-base-content/70 max-w-3xl mx-auto leading-relaxed"
					>
						{dailyQuote.translation}
					</p>

					<!-- Surah Reference -->
					<footer class="text-center">
						<cite
							class="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-primary not-italic"
						>
							<BookOpen class="size-4" />
							<span>{dailyQuote.surah}</span>
						</cite>
					</footer>
				</blockquote>

				<!-- Decorative Islamic Pattern -->
				<div class="absolute inset-0 opacity-[0.02] pointer-events-none" aria-hidden="true">
					<svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
						<pattern id="islamic-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
							<path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" class="text-primary" />
						</pattern>
						<rect width="100%" height="100%" fill="url(#islamic-pattern)" />
					</svg>
				</div>
			</div>
		</div>

		<!-- Search and Filter -->
		<div class="space-y-4">
			<div class="flex flex-col sm:flex-row gap-3">
				<!-- Search Input -->
				<div class="relative flex-1">
					<div class="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40">
						<Search class="size-5" />
					</div>
					<input
						type="text"
						placeholder="Cari surah (nama, nomor, arti)..."
						bind:value={searchQuery}
						class="w-full pl-12 pr-4 h-12 rounded-2xl bg-base-100 border border-base-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/40"
					/>
				</div>

				<!-- Filter Buttons -->
				<div class="flex gap-2">
					<button
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
						{selectedType === 'all'
							? 'bg-primary text-primary-content shadow-lg'
							: 'bg-base-100 border border-base-300 hover:bg-base-300'}"
						onclick={() => (selectedType = 'all')}
					>
						Semua
					</button>
					<button
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
						{selectedType === 'Meccan'
							? 'bg-warning text-warning-content shadow-lg'
							: 'bg-base-100 border border-base-300 hover:bg-base-300'}"
						onclick={() => (selectedType = 'Meccan')}
					>
						Makkiyah
					</button>
					<button
						class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
						{selectedType === 'Medinan'
							? 'bg-secondary text-secondary-content shadow-lg'
							: 'bg-base-100 border border-base-300 hover:bg-base-300'}"
						onclick={() => (selectedType = 'Medinan')}
					>
						Madaniyah
					</button>
				</div>
			</div>

			<!-- Results Count -->
			<p class="text-sm text-base-content/50">
				Menampilkan {filteredSurahs.length} dari {chapters.length} surah
			</p>
		</div>

		<!-- Surah Grid -->
		<div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
			{#if page.data.chapters.code !== 200 && chapters.length === 0}
				<!-- No Results Found (API Error) -->
				<div
					class="text-center py-16 col-span-full flex flex-col items-center justify-center"
					in:fade={{ duration: 200 }}
				>
					<p class="text-base-content/60">Gagal memuat data surah.</p>
				</div>
			{:else if filteredSurahs.length === 0}
				<!-- Search Empty -->
				<div
					class="text-center py-16 col-span-full flex flex-col items-center justify-center"
					in:fade={{ duration: 200 }}
				>
					<div class="inline-flex items-center justify-center p-4 rounded-full bg-base-300 mb-4">
						<Search class="size-8 opacity-40" />
					</div>
					<p class="text-base-content/60">
						Tidak ditemukan surah dengan kata kunci "{searchQuery}"
					</p>
					<button
						class="mt-4 text-sm text-primary hover:underline"
						onclick={() => {
							searchQuery = '';
							selectedType = 'all';
						}}
					>
						Reset pencarian
					</button>
				</div>
			{:else}
				{#each filteredSurahs as surah, idx (surah.nomor)}
					<a
						href="/quran/list/{surah.nomor}"
						class="group"
						in:fly={{ y: 10, duration: 200, delay: Math.min(idx * 20, 200) }}
					>
						<div
							class="relative h-full p-4 rounded-2xl bg-base-100 border border-base-300 hover:border-primary hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02] overflow-hidden"
						>
							<!-- Background Gradient on Hover -->
							<div
								class="absolute inset-0 bg-linear-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500"
							></div>

							<!-- Content -->
							<div class="relative z-10 flex flex-col items-center text-center space-y-3">
								<!-- Surah Number Badge -->
								<div class="relative size-12 flex items-center justify-center">
									<svg class="absolute inset-0 size-full" viewBox="0 0 60 60">
										<polygon
											points="30,0 60,30 30,60 0,30"
											class="fill-primary/10 group-hover:fill-primary/20 transition-colors"
										/>
									</svg>
									<span class="relative z-10 font-bold text-sm text-primary">{surah.nomor}</span>
								</div>

								<!-- Arabic Name -->
								<p
									class="font-amiri text-xl md:text-2xl text-base-content/80 group-hover:text-primary transition-colors"
									dir="rtl"
								>
									{surah.namaLatin}
								</p>

								<!-- Latin Name -->
								<h3 class="font-bold font-amiri text-sm group-hover:text-primary transition-colors">
									{surah.nama}
								</h3>

								<!-- Info -->
								<div class="flex flex-col items-center gap-1">
									<p class="text-xs text-base-content/50">
										{surah.ayat} Ayat
									</p>
									<span
										class="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium
									{surah.tempatTurun === 'Mekah' ? 'bg-warning/20 text-warning' : 'bg-secondary/20 text-secondary'}"
									>
										{surah.tempatTurun}
									</span>
								</div>
							</div>
						</div>
					</a>
				{/each}
			{/if}
		</div>

		<!-- {#if filteredSurahs.length === 0} removed redundant block -->
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');

	.font-amiri {
		font-family: 'Amiri', serif;
	}
</style>

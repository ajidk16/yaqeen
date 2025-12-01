<script>
	import { Calendar as CalendarIcon, BookOpen, Smile, Frown, Meh, Heart } from 'lucide-svelte';

	let selectedMood = $state('happy');
	let gratitudeText = $state('');
	let quranPage = $state(124);
</script>

<div class="space-y-6 animate-fade-in-up">
	<!-- Header -->
	<header class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">Jurnal Muhasabah</h1>
			<p class="text-sm text-slate-500">Catat suasana hati & progres tilawahmu.</p>
		</div>
		<div class="rounded-xl bg-white p-2 shadow-sm border border-slate-100">
			<CalendarIcon class="text-primary" size={24} />
		</div>
	</header>

	<!-- Mood Tracker -->
	<section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
		<h2 class="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Mood Hari Ini</h2>
		<div class="flex justify-between gap-2">
			<button 
				class="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all {selectedMood === 'happy' ? 'bg-green-50 text-green-600 ring-2 ring-green-500 ring-offset-2' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
				onclick={() => selectedMood = 'happy'}
			>
				<Smile size={32} />
				<span class="text-xs font-medium">Bahagia</span>
			</button>
			<button 
				class="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all {selectedMood === 'neutral' ? 'bg-yellow-50 text-yellow-600 ring-2 ring-yellow-500 ring-offset-2' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
				onclick={() => selectedMood = 'neutral'}
			>
				<Meh size={32} />
				<span class="text-xs font-medium">Biasa</span>
			</button>
			<button 
				class="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all {selectedMood === 'sad' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500 ring-offset-2' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}"
				onclick={() => selectedMood = 'sad'}
			>
				<Frown size={32} />
				<span class="text-xs font-medium">Sedih</span>
			</button>
		</div>
	</section>

	<!-- Quran Progress -->
	<section class="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-500/20">
		<div class="mb-4 flex items-center gap-3">
			<div class="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
				<BookOpen size={24} />
			</div>
			<div>
				<h3 class="font-bold">Tilawah Quran</h3>
				<p class="text-xs opacity-90">Lanjutkan bacaanmu</p>
			</div>
		</div>
		
		<div class="mb-4 flex items-end gap-2">
			<span class="text-4xl font-bold">{quranPage}</span>
			<span class="mb-1 text-sm opacity-80">/ 604 Halaman</span>
		</div>

		<div class="relative h-2 w-full overflow-hidden rounded-full bg-black/20">
			<div class="absolute left-0 top-0 h-full bg-white transition-all duration-1000" style="width: {(quranPage / 604) * 100}%"></div>
		</div>

		<div class="mt-4 flex gap-3">
			<button class="flex-1 rounded-lg bg-white/20 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30" onclick={() => quranPage--}>- 1 Hal</button>
			<button class="flex-1 rounded-lg bg-white py-2 text-sm font-bold text-emerald-600 shadow-sm transition-transform hover:scale-105 active:scale-95" onclick={() => quranPage++}>+ 1 Hal</button>
		</div>
	</section>

	<!-- Gratitude Journal -->
	<section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
		<div class="mb-3 flex items-center gap-2 text-rose-500">
			<Heart size={18} class="fill-current" />
			<h2 class="text-sm font-bold uppercase tracking-wider text-slate-400">Gratitude Journal</h2>
		</div>
		<textarea 
			bind:value={gratitudeText}
			class="w-full rounded-xl border-0 bg-slate-50 p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none transition-all"
			placeholder="Apa satu hal kecil yang kamu syukuri hari ini?"
		></textarea>
		<div class="mt-3 flex justify-end">
			<button class="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-600 hover:scale-105 active:scale-95">
				Simpan Jurnal
			</button>
		</div>
	</section>
</div>

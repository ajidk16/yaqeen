<script>
	import { Check, Sparkles, Moon, BookOpen, Activity } from 'lucide-svelte';
</script>

<header class="mb-8 animate-fade-in-up">
	<div class="flex items-start justify-between">
		<div>
			<h1 class="text-2xl font-bold text-slate-800">
				Assalamualaikum, <span class="text-primary">Fatih!</span> 👋
			</h1>
			<p class="mt-1 text-sm text-slate-500">"Mulai harimu dengan Bismillah."</p>
		</div>
		<div class="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-1.5 shadow-sm transition-transform hover:scale-105">
			<span class="text-orange-500 animate-pulse">🔥</span>
			<span class="font-bold text-slate-700">12</span>
			<span class="text-xs text-slate-400">Day Streak</span>
		</div>
	</div>

	<!-- Date Scroller -->
	<div class="no-scrollbar mt-6 flex justify-between gap-3 overflow-x-auto pb-2">
		<!-- Active Day -->
		<div class="flex min-w-[64px] flex-col items-center rounded-2xl bg-primary p-3 text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105">
			<span class="text-xs font-medium opacity-80">SEN</span>
			<span class="text-xl font-bold">28</span>
		</div>
		<!-- Inactive Days -->
		{#each Array(5) as _, i}
			<div class="flex min-w-[64px] flex-col items-center rounded-2xl border border-slate-100 bg-white p-3 text-slate-400 transition-colors hover:border-primary/20 hover:bg-slate-50">
				<span class="text-xs font-medium">SEL</span>
				<span class="text-xl font-bold">{29 + i}</span>
			</div>
		{/each}
	</div>
</header>

<!-- AI Insight Widget -->
<div class="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg shadow-indigo-500/20 animate-fade-in-up" style="animation-delay: 0.1s;">
	<div class="absolute -mt-4 -mr-4 right-0 top-0 h-24 w-24 rounded-full bg-white opacity-10 blur-xl"></div>
	
	<div class="relative z-10">
		<div class="mb-3 flex items-center gap-2 opacity-90">
			<Sparkles size={16} />
			<span class="text-xs font-bold uppercase tracking-wider">Ustaz AI Insight</span>
		</div>
		<p class="mb-4 text-lg font-medium leading-relaxed">
			"MasyaAllah, sholat Subuhmu terjaga 7 hari! Yuk, sempurnakan dengan Dzikir Pagi hari ini."
		</p>
		<button class="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
			Lihat Detail Muhasabah
		</button>
	</div>
</div>

<div class="space-y-3 animate-fade-in-up" style="animation-delay: 0.2s;">
	<!-- Habit Card: Ibadah -->
	<div class="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-ibadah/30">
		<div class="z-10 flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-ibadah-bg text-ibadah transition-transform group-hover:scale-110">
				<Moon size={24} />
			</div>
			<div>
				<h3 class="font-bold text-slate-800 transition-colors group-hover:text-ibadah">Sholat Subuh</h3>
				<div class="flex items-center gap-2 text-xs text-slate-500">
					<span class="rounded-md bg-slate-100 px-2 py-0.5 font-medium">Wajib</span>
					<span>04:15 WIB</span>
				</div>
			</div>
		</div>
		<button class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-transparent transition-all hover:border-ibadah hover:bg-ibadah hover:text-white focus:outline-none active:scale-95">
			<Check size={20} strokeWidth={3} />
		</button>
		<div class="absolute bottom-0 left-0 top-0 -z-0 w-0 bg-ibadah-bg opacity-30 transition-all duration-500 group-hover:w-full"></div>
	</div>

	<!-- Habit Card: Custom -->
	<div class="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-learning/30">
		<div class="z-10 flex items-center gap-4">
			<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-learning-bg text-learning transition-transform group-hover:scale-110">
				<BookOpen size={24} />
			</div>
			<div>
				<h3 class="font-bold text-slate-800 transition-colors group-hover:text-learning">Baca Quran</h3>
				<div class="flex items-center gap-2 text-xs text-slate-500">
					<span class="rounded-md bg-slate-100 px-2 py-0.5 font-medium">Sunnah</span>
					<span class="text-learning font-bold">1/5 Hal</span>
				</div>
			</div>
		</div>
		<button class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-transparent transition-all hover:border-learning hover:bg-learning hover:text-white focus:outline-none active:scale-95">
			<Check size={20} strokeWidth={3} />
		</button>
		<div class="absolute bottom-0 left-0 top-0 -z-0 w-0 bg-learning-bg opacity-30 transition-all duration-500 group-hover:w-full"></div>
	</div>
</div>

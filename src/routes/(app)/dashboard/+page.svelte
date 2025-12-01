<script>
	import { Check, Sparkles, Moon, BookOpen, Activity } from 'lucide-svelte';
	import HabitCard from '$lib/components/dashboard/HabitCard.svelte';
	import confetti from 'canvas-confetti';

	let habits = $state([
		{ id: 1, title: 'Sholat Subuh', type: 'ibadah', category: 'wajib', time: '04:15 WIB', completed: false },
		{ id: 2, title: 'Baca Quran', type: 'learning', category: 'sunnah', progress: '1/5 Hal', completed: false }
	]);

	const toggleHabit = (id) => {
		habits = habits.map(h => {
			if (h.id === id) return { ...h, completed: !h.completed };
			return h;
		});

		const allCompleted = habits.every(h => h.completed);
		if (allCompleted) {
			triggerConfetti();
		}
	};

	const triggerConfetti = () => {
		const duration = 3 * 1000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		const randomInRange = (min, max) => Math.random() * (max - min) + min;

		const interval = setInterval(function() {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);
			confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
			confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
		}, 250);
	};

	const addStarterPack = () => {
		habits = [
			{ id: 1, title: 'Sholat Subuh', type: 'ibadah', category: 'wajib', time: '04:15 WIB', completed: false },
			{ id: 2, title: 'Dzikir Pagi', type: 'ibadah', category: 'sunnah', completed: false },
			{ id: 3, title: 'Minum Air', type: 'health', category: 'health', progress: '0/8 Gelas', completed: false },
			{ id: 4, title: 'Baca Quran', type: 'learning', category: 'sunnah', progress: '1/5 Hal', completed: false }
		];
	};
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
			<div class="relative">
				<span class="text-orange-500 text-xl animate-bounce absolute -top-1 left-0 opacity-50 blur-sm">🔥</span>
				<span class="text-orange-500 text-xl relative z-10">🔥</span>
			</div>
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
	{#if habits.length === 0}
		<div class="rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100">
			<div class="mb-4 flex justify-center">
				<div class="rounded-full bg-primary/10 p-4 text-primary">
					<Sparkles size={32} />
				</div>
			</div>
			<h3 class="mb-2 text-lg font-bold text-slate-800">Mulai Perjalananmu</h3>
			<p class="mb-6 text-sm text-slate-500">Belum ada kebiasaan? Aktifkan paket sunnah harian untuk memulai.</p>
			<button onclick={addStarterPack} class="w-full rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-600 hover:scale-105 active:scale-95">
				Aktifkan Starter Pack
			</button>
		</div>
	{:else}
		{#each habits as habit (habit.id)}
			<HabitCard {habit} onToggle={() => toggleHabit(habit.id)} />
		{/each}
	{/if}
</div>

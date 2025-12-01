<script>
	import { TrendingUp, Award, Zap, Activity } from 'lucide-svelte';

	// Mock Data
	const weeklyData = [
		{ day: 'Sen', value: 80 },
		{ day: 'Sel', value: 65 },
		{ day: 'Rab', value: 90 },
		{ day: 'Kam', value: 75 },
		{ day: 'Jum', value: 85 },
		{ day: 'Sab', value: 50 },
		{ day: 'Ahd', value: 95 }
	];
</script>

<div class="space-y-6 animate-fade-in-up">
	<!-- Header -->
	<header>
		<h1 class="text-2xl font-bold text-slate-800">Statistik</h1>
		<p class="text-sm text-slate-500">Pantau konsistensi ibadah & kebiasaanmu.</p>
	</header>

	<!-- Weekly Chart -->
	<section class="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="font-bold text-slate-800">Minggu Ini</h2>
			<div class="flex items-center gap-2 text-sm text-green-500 font-medium bg-green-50 px-2 py-1 rounded-lg">
				<TrendingUp size={16} />
				<span>+12%</span>
			</div>
		</div>

		<div class="flex items-end justify-between gap-2 h-48">
			{#each weeklyData as data}
				<div class="flex flex-1 flex-col items-center gap-2 group">
					<div class="relative w-full rounded-t-xl bg-slate-100 transition-all duration-500 group-hover:bg-primary/20 overflow-hidden" style="height: 100%">
						<div 
							class="absolute bottom-0 w-full rounded-t-xl bg-primary transition-all duration-1000 group-hover:bg-primary-600"
							style="height: {data.value}%"
						></div>
					</div>
					<span class="text-xs font-medium text-slate-400">{data.day}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- Key Metrics Grid -->
	<div class="grid grid-cols-2 gap-4">
		<div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
			<div class="mb-2 rounded-full bg-orange-50 p-3 text-orange-500">
				<Zap size={24} />
			</div>
			<span class="text-2xl font-bold text-slate-800">12</span>
			<span class="text-xs text-slate-400">Day Streak</span>
		</div>
		<div class="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
			<div class="mb-2 rounded-full bg-blue-50 p-3 text-blue-500">
				<Award size={24} />
			</div>
			<span class="text-2xl font-bold text-slate-800">85%</span>
			<span class="text-xs text-slate-400">Completion Rate</span>
		</div>
	</div>

	<!-- Category Breakdown -->
	<section class="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
		<h2 class="mb-4 font-bold text-slate-800">Fokus Kategori</h2>
		<div class="space-y-4">
			<!-- Ibadah -->
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="font-medium text-slate-600">Ibadah</span>
					<span class="font-bold text-ibadah">8/10</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="h-full rounded-full bg-ibadah transition-all duration-1000" style="width: 80%"></div>
				</div>
			</div>
			<!-- Health -->
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="font-medium text-slate-600">Kesehatan</span>
					<span class="font-bold text-health">3/3</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="h-full rounded-full bg-health transition-all duration-1000" style="width: 100%"></div>
				</div>
			</div>
			<!-- Learning -->
			<div>
				<div class="mb-1 flex justify-between text-sm">
					<span class="font-medium text-slate-600">Ilmu</span>
					<span class="font-bold text-learning">1/2</span>
				</div>
				<div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
					<div class="h-full rounded-full bg-learning transition-all duration-1000" style="width: 50%"></div>
				</div>
			</div>
		</div>
	</section>
</div>

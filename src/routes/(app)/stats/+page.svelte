<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { BarChart3, ChartBar } from 'lucide-svelte';
	import HabitHeatmap from '$lib/components/stats/HabitHeatmap.svelte';

	let { data } = $props();
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Header Section with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/5 via-transparent to-secondary/5 p-6 lg:p-8"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl animate-breathe"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-secondary/10 blur-3xl animate-breathe"
				style="animation-delay: -2s"
			></div>

			<div class="relative z-10">
				<div class="flex items-center gap-3">
					<div
						class="flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20"
					>
						<ChartBar class="size-6 text-primary" />
					</div>
					<div>
						<h1 class="text-3xl font-bold lg:text-4xl">Statistik</h1>
						<p class="mt-1 text-base-content/60">Pantau perkembangan aktivitasmu</p>
					</div>
				</div>
			</div>
		</header>

		<!-- Heatmap Section -->
		<HabitHeatmap
			days={data.heatmap.days}
			totalDaysActive={data.heatmap.totalDaysActive}
			currentStreak={data.heatmap.currentStreak}
			bestStreak={data.heatmap.bestStreak}
		/>
	</div>
</div>

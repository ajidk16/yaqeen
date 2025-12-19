<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Flame, Trophy, Calendar, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui';

	interface DayData {
		date: string;
		completedCount: number;
		totalHabits: number;
		completionRate: number;
		level: 0 | 1 | 2 | 3 | 4;
	}

	interface Props {
		days: DayData[];
		totalDaysActive: number;
		currentStreak: number;
		bestStreak: number;
	}

	let { days = [], totalDaysActive = 0, currentStreak = 0, bestStreak = 0 }: Props = $props();

	// Cell dimensions
	const cellSize = 12;
	const cellGap = 3;
	const cellRadius = 2;

	// Day labels (Indonesian)
	const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
	const monthLabels = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'Mei',
		'Jun',
		'Jul',
		'Agu',
		'Sep',
		'Okt',
		'Nov',
		'Des'
	];

	// Tooltip state
	let tooltipData = $state<DayData | null>(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	// Group days by week
	let weeks = $derived(() => {
		const result: DayData[][] = [];
		let currentWeek: DayData[] = [];

		for (const day of days) {
			const date = new Date(day.date);
			const dayOfWeek = date.getDay();

			// Start new week on Sunday
			if (dayOfWeek === 0 && currentWeek.length > 0) {
				result.push(currentWeek);
				currentWeek = [];
			}

			currentWeek.push(day);
		}

		if (currentWeek.length > 0) {
			result.push(currentWeek);
		}

		return result;
	});

	// Get month labels with positions
	let monthPositions = $derived(() => {
		const positions: { label: string; x: number }[] = [];
		let lastMonth = -1;

		weeks().forEach((week, weekIndex) => {
			if (week.length > 0) {
				const date = new Date(week[0].date);
				const month = date.getMonth();

				if (month !== lastMonth) {
					positions.push({
						label: monthLabels[month],
						x: weekIndex * (cellSize + cellGap) + 30
					});
					lastMonth = month;
				}
			}
		});

		return positions;
	});

	// Get color class based on level
	function getLevelColor(level: 0 | 1 | 2 | 3 | 4): string {
		switch (level) {
			case 0:
				return 'fill-base-300';
			case 1:
				return 'fill-primary/30';
			case 2:
				return 'fill-primary/50';
			case 3:
				return 'fill-primary/70';
			case 4:
				return 'fill-primary';
		}
	}

	// Handle cell hover
	function handleMouseEnter(event: MouseEvent, day: DayData) {
		tooltipData = day;
		const rect = (event.target as SVGElement).getBoundingClientRect();
		tooltipX = rect.left + rect.width / 2;
		tooltipY = rect.top - 10;
	}

	function handleMouseLeave() {
		tooltipData = null;
	}

	// Format date for tooltip
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	// SVG dimensions
	let svgWidth = $derived(weeks().length * (cellSize + cellGap) + 40);
	let svgHeight = 7 * (cellSize + cellGap) + 30;
</script>

<section class="space-y-4 sm:space-y-6" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
	<!-- Header - Responsive -->
	<div class="flex items-center gap-2 sm:gap-3">
		<div
			class="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-linear-to-br from-primary/20 to-secondary/20"
		>
			<Calendar class="size-4 sm:size-5 text-primary" />
		</div>
		<div class="min-w-0">
			<h2 class="text-lg sm:text-xl font-bold">Aktivitas Tahunan</h2>
			<p class="text-[11px] sm:text-xs text-base-content/50 truncate">
				Pola kebiasaanmu dalam 12 bulan terakhir
			</p>
		</div>
	</div>

	<!-- Heatmap Card - Responsive -->
	<div class="glass-card overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-6">
		<!-- Scrollable Heatmap Container -->
		<div class="overflow-x-auto pb-2 sm:pb-4">
			<svg
				width={svgWidth}
				height={svgHeight}
				class="min-w-max"
				role="img"
				aria-label="Habit activity heatmap"
			>
				<!-- Month Labels -->
				{#each monthPositions() as { label, x }}
					<text {x} y="12" class="fill-base-content/50 text-[10px]">
						{label}
					</text>
				{/each}

				<!-- Day Labels -->
				{#each dayLabels as label, i}
					{#if i % 2 === 1}
						<text x="0" y={i * (cellSize + cellGap) + 35} class="fill-base-content/50 text-[10px]">
							{label}
						</text>
					{/if}
				{/each}

				<!-- Cells Grid -->
				{#each weeks() as week, weekIndex}
					{#each week as day, dayIndex}
						{@const dayOfWeek = new Date(day.date).getDay()}
						<rect
							x={weekIndex * (cellSize + cellGap) + 30}
							y={dayOfWeek * (cellSize + cellGap) + 20}
							width={cellSize}
							height={cellSize}
							rx={cellRadius}
							ry={cellRadius}
							class="{getLevelColor(
								day.level
							)} cursor-pointer transition-all duration-200 hover:stroke-base-content/30 hover:stroke-2"
							role="gridcell"
							tabindex="0"
							aria-label="{formatDate(day.date)}: {day.completionRate}%"
							onmouseenter={(e) => handleMouseEnter(e, day)}
							onmouseleave={handleMouseLeave}
						/>
					{/each}
				{/each}
			</svg>
		</div>

		<!-- Legend -->
		<div class="mt-4 flex items-center justify-between border-t border-base-content/10 pt-4">
			<span class="text-xs text-base-content/50">Sedikit</span>
			<div class="flex items-center gap-1">
				{#each [0, 1, 2, 3, 4] as level}
					<div
						class="size-3 rounded-sm {getLevelColor(level as 0 | 1 | 2 | 3 | 4).replace(
							'fill-',
							'bg-'
						)}"
					></div>
				{/each}
			</div>
			<span class="text-xs text-base-content/50">Banyak</span>
		</div>
	</div>

	<!-- Stats Summary Cards - Responsive -->
	<div class="grid grid-cols-3 gap-2 sm:gap-3">
		<!-- Days Active -->
		<div
			class="glass-card flex flex-col items-center rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"
		>
			<div
				class="mb-1 sm:mb-2 flex size-8 sm:size-10 items-center justify-center rounded-full bg-primary/10"
			>
				<Calendar class="size-4 sm:size-5 text-primary" />
			</div>
			<span class="text-lg sm:text-2xl font-bold text-primary">{totalDaysActive}</span>
			<span class="text-[10px] sm:text-xs text-base-content/50">Hari Aktif</span>
		</div>

		<!-- Current Streak -->
		<div
			class="glass-card flex flex-col items-center rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"
		>
			<div
				class="mb-1 sm:mb-2 flex size-8 sm:size-10 items-center justify-center rounded-full bg-secondary/10"
			>
				<Flame class="size-4 sm:size-5 text-secondary" />
			</div>
			<span class="text-lg sm:text-2xl font-bold text-secondary">{currentStreak}</span>
			<span class="text-[10px] sm:text-xs text-base-content/50 leading-tight">Streak Aktif</span>
		</div>

		<!-- Best Streak -->
		<div
			class="glass-card flex flex-col items-center rounded-lg sm:rounded-xl p-2 sm:p-4 text-center"
		>
			<div
				class="mb-1 sm:mb-2 flex size-8 sm:size-10 items-center justify-center rounded-full bg-accent/10"
			>
				<Trophy class="size-4 sm:size-5 text-accent" />
			</div>
			<span class="text-lg sm:text-2xl font-bold text-accent">{bestStreak}</span>
			<span class="text-[10px] sm:text-xs text-base-content/50 leading-tight">Streak Terbaik</span>
		</div>
	</div>
</section>

<!-- Tooltip -->
{#if tooltipData}
	<div
		class="fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg bg-base-100 px-3 py-2 shadow-xl border border-base-content/10"
		style="left: {tooltipX}px; top: {tooltipY}px;"
		in:scale={{ duration: 150, start: 0.9 }}
	>
		<p class="text-xs font-medium">{formatDate(tooltipData.date)}</p>
		<p class="text-xs text-base-content/60">
			{tooltipData.completedCount} dari {tooltipData.totalHabits} selesai
			<span class="font-bold text-primary">({tooltipData.completionRate}%)</span>
		</p>
	</div>
{/if}

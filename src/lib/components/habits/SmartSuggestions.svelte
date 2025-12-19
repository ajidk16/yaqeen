<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Sparkles, Clock, TrendingUp, Lightbulb } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui';

	interface HabitSuggestion {
		id: string;
		timeSlot: string;
		timeSlotLabel: string;
		message: string;
		successRate: number;
		completionCount: number;
		topHabits: string[];
	}

	interface Props {
		suggestions: HabitSuggestion[];
		hasEnoughData: boolean;
		totalCompletions: number;
		total: number;
	}

	let {
		suggestions = [],
		hasEnoughData = false,
		totalCompletions = 0,
		total = 0
	}: Props = $props();

	// Get color based on success rate
	function getSuccessColor(rate: number): string {
		if (rate >= 40) return 'text-success';
		if (rate >= 25) return 'text-info';
		return 'text-warning';
	}

	function getBadgeColor(rate: number): string {
		if (rate >= 40) return 'badge-success';
		if (rate >= 25) return 'badge-info';
		return 'badge-warning';
	}

	function getProgressColor(rate: number): string {
		if (rate >= 40) return 'from-success to-emerald-400';
		if (rate >= 25) return 'from-info to-sky-400';
		return 'from-warning to-amber-400';
	}
</script>

{#if hasEnoughData && suggestions.length > 0}
	<section class="mb-6 space-y-3 sm:space-y-4" in:fly={{ y: 20, duration: 600, easing: quintOut }}>
		<!-- Header - Responsive -->
		<div class="flex items-center gap-2 sm:gap-3">
			<div
				class="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-linear-to-br from-primary/20 to-secondary/20"
			>
				<Sparkles class="size-4 sm:size-5 text-primary" />
			</div>
			<div class="min-w-0 flex-1">
				<h2 class="flex items-center gap-2 text-base sm:text-lg font-bold">
					Saran Pintar
					<Badge class="badge-primary badge-xs sm:badge-sm">AI</Badge>
				</h2>
				<p class="text-[11px] sm:text-xs text-base-content/50 truncate">
					Berdasarkan {totalCompletions} aktivitas terakhirmu
				</p>
			</div>
		</div>

		<!-- Suggestions Cards - Horizontal scroll on mobile, grid on larger -->
		<div
			class="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0"
		>
			{#each suggestions as suggestion, i}
				<div
					class="glass-card group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-w-[280px] sm:min-w-0 snap-start"
					in:fly={{ y: 20, duration: 500, delay: 100 + i * 80, easing: quintOut }}
				>
					<!-- Decorative gradient orb -->
					<div
						class="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-linear-to-br from-primary/10 to-secondary/10 blur-2xl transition-all duration-500 group-hover:scale-150"
					></div>

					<div class="relative z-10 space-y-2 sm:space-y-3">
						<!-- Time Slot Header -->
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2 min-w-0">
								<div
									class="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-base-200"
								>
									<Clock class="size-3.5 sm:size-4 {getSuccessColor(suggestion.successRate)}" />
								</div>
								<div class="min-w-0">
									<h3 class="text-sm font-bold truncate">{suggestion.timeSlotLabel}</h3>
									<p class="font-mono text-[10px] sm:text-xs text-base-content/50">
										{suggestion.timeSlot}
									</p>
								</div>
							</div>
							<Badge
								class="{getBadgeColor(
									suggestion.successRate
								)} badge-xs sm:badge-sm gap-0.5 shrink-0"
							>
								<TrendingUp class="size-2.5 sm:size-3" />
								{suggestion.successRate}%
							</Badge>
						</div>

						<!-- Progress Bar -->
						<div class="h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-base-content/10">
							<div
								class="h-full rounded-full bg-linear-to-r {getProgressColor(
									suggestion.successRate
								)} transition-all duration-700"
								style="width: {suggestion.successRate}%"
							></div>
						</div>

						<!-- Message -->
						<p
							class="text-xs sm:text-sm leading-relaxed text-base-content/70 line-clamp-2 sm:line-clamp-3"
						>
							{suggestion.message}
						</p>

						<!-- Top Habits -->
						{#if suggestion.topHabits.length > 0}
							<div class="flex flex-wrap gap-1 sm:gap-1.5 pt-1">
								{#each suggestion.topHabits.slice(0, 2) as habit}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-base-200/50 px-2 py-0.5 text-[10px] sm:text-xs text-base-content/60"
									>
										<Lightbulb class="size-2.5 sm:size-3 shrink-0" />
										<span class="truncate max-w-[100px] sm:max-w-[120px]">{habit}</span>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{:else if !hasEnoughData && total > 0}
	<!-- Not enough data message - Responsive -->
	<div
		class="glass-card mb-6 flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl p-3 sm:p-4"
		in:fly={{ y: 20, duration: 600, easing: quintOut }}
	>
		<div
			class="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-base-200"
		>
			<Sparkles class="size-5 sm:size-6 text-base-content/40" />
		</div>
		<div class="flex-1 min-w-0">
			<h3 class="font-medium text-sm sm:text-base text-base-content/70">
				Kumpulkan lebih banyak data
			</h3>
			<p class="text-xs sm:text-sm text-base-content/50 truncate sm:whitespace-normal">
				Selesaikan {total - totalCompletions} aktivitas lagi untuk saran pintar.
			</p>
		</div>
		<div
			class="radial-progress text-primary shrink-0"
			style="--value:{(totalCompletions / total) * 100}; --size:2.5rem; --thickness: 3px;"
			role="progressbar"
		>
			<span class="text-[10px] font-bold">{totalCompletions}/{total}</span>
		</div>
	</div>
{/if}

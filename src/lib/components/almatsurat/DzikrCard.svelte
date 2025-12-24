<script lang="ts">
	import {
		Check,
		ChevronDown,
		ChevronUp,
		Plus,
		Minus,
		RotateCcw,
		ChevronRight
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import type { DzikrItem } from '$lib/data/almatsurat';

	interface Props {
		dzikr: DzikrItem;
		currentCount: number;
		isComplete: boolean;
		isActive: boolean;
		onToggle: () => void;
		onIncrement: () => void;
		onDecrement: () => void;
		onReset: () => void;
		onNext: () => void;
	}

	let {
		dzikr,
		currentCount,
		isComplete,
		isActive,
		onToggle,
		onIncrement,
		onDecrement,
		onReset,
		onNext
	}: Props = $props();
</script>

<div
	class="group rounded-2xl border transition-all duration-300 overflow-hidden
	{isComplete
		? 'bg-success/5 border-success/30'
		: isActive
			? 'bg-base-100 border-ibadah/40 shadow-lg'
			: 'bg-base-100 border-base-content/10 hover:border-base-content/20'}"
>
	<!-- Header -->
	<button
		class="w-full p-4 flex items-center gap-3 text-left"
		onclick={onToggle}
		aria-expanded={isActive}
	>
		<!-- Completion Indicator -->
		<div
			class="shrink-0 size-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300
			{isComplete ? 'bg-success text-success-content' : 'bg-ibadah/10 text-ibadah'}"
		>
			{#if isComplete}
				<Check class="size-5" />
			{:else}
				{dzikr.index + 1}
			{/if}
		</div>

		<!-- Title -->
		<div class="flex-1 min-w-0">
			<h3 class="font-semibold text-base truncate {isComplete ? 'text-success' : ''}">
				{dzikr.name}
			</h3>
			<p class="text-xs text-base-content/50">
				{currentCount}/{dzikr.repetition}x
			</p>
		</div>

		<!-- Progress Ring or Chevron -->
		<div class="shrink-0 flex items-center gap-2">
			{#if !isComplete && dzikr.repetition > 1}
				<div class="relative size-8">
					<svg class="size-8 -rotate-90" viewBox="0 0 32 32">
						<circle
							cx="16"
							cy="16"
							r="14"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							class="text-base-300"
						/>
						<circle
							cx="16"
							cy="16"
							r="14"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-dasharray={2 * Math.PI * 14}
							stroke-dashoffset={2 * Math.PI * 14 * (1 - currentCount / dzikr.repetition)}
							stroke-linecap="round"
							class="text-ibadah transition-all duration-300"
						/>
					</svg>
				</div>
			{/if}
			{#if isActive}
				<ChevronUp class="size-5 text-base-content/40" />
			{:else}
				<ChevronDown class="size-5 text-base-content/40" />
			{/if}
		</div>
	</button>

	<!-- Expanded Content -->
	{#if isActive}
		<div class="px-4 pb-4 space-y-4 animate-[fadeIn_0.2s_ease-out]">
			<!-- Verses -->
			{#each dzikr.verses as verse, i}
				<div
					class="space-y-2 {dzikr.verses.length > 1 && i > 0
						? 'pt-3 border-t border-base-content/5'
						: ''}"
				>
					{#if verse.note && dzikr.verses.length > 1}
						<p class="text-xs font-medium text-ibadah">{verse.note}</p>
					{/if}
					<p
						dir="rtl"
						class="text-2xl md:text-3xl leading-loose text-right font-arabic text-base-content"
						style="font-family: 'Amiri', 'Traditional Arabic', serif; line-height: 2;"
					>
						{verse.arabic}
					</p>
					<p class="text-sm text-base-content/60 italic leading-relaxed">
						{verse.translation}
					</p>
				</div>
			{/each}

			<!-- Counter Controls -->
			<div class="flex items-center justify-between pt-4 border-t border-base-content/10">
				<div class="flex items-center gap-2">
					<Button
						variant="ghost"
						size="sm"
						square
						onclick={onDecrement}
						disabled={currentCount === 0}
					>
						<Minus class="size-4" />
					</Button>
					<span class="min-w-16 text-center font-bold text-xl tabular-nums">
						{currentCount}<span class="text-base-content/40">/{dzikr.repetition}</span>
					</span>
					<Button
						variant={isComplete ? 'success' : 'primary'}
						size="sm"
						square
						onclick={onIncrement}
						disabled={isComplete}
					>
						{#if isComplete}
							<Check class="size-4" />
						{:else}
							<Plus class="size-4" />
						{/if}
					</Button>
				</div>

				<div class="flex items-center gap-2">
					{#if currentCount > 0}
						<Button variant="ghost" size="sm" onclick={onReset}>
							<RotateCcw class="size-4" />
						</Button>
					{/if}
					<Button variant="ghost" size="sm" onclick={onNext} class="gap-1">
						Lanjut
						<ChevronRight class="size-4" />
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

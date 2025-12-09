<script lang="ts">
	import { Check, Moon, BookOpen, Activity } from 'lucide-svelte';

	let { habit, onToggle } = $props();

	let touchStartX = 0;
	let touchEndX = 0;
	let translateX = $state(0);
	let isSwiping = $state(false);

	// Map icons based on type/category (simplified for now)
	const getIcon = (type: string) => {
		if (type === 'ibadah') return Moon;
		if (type === 'learning') return BookOpen;
		return Activity;
	};

	const Icon = getIcon(habit.type);

	// Color mapping
	const colors = {
		ibadah: { bg: 'bg-ibadah-bg', text: 'text-ibadah', border: 'hover:border-ibadah/30' },
		learning: { bg: 'bg-learning-bg', text: 'text-learning', border: 'hover:border-learning/30' },
		health: { bg: 'bg-health-bg', text: 'text-health', border: 'hover:border-health/30' }
	};

	const color = colors[habit.type as keyof typeof colors] || colors.health;

	const handleTouchStart = (e: TouchEvent) => {
		touchStartX = e.changedTouches[0].screenX;
		isSwiping = true;
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (!isSwiping) return;
		touchEndX = e.changedTouches[0].screenX;
		translateX = touchEndX - touchStartX;
	};

	const handleTouchEnd = () => {
		isSwiping = false;
		if (translateX > 100) {
			// Swipe Right -> Done
			onToggle();
		} else if (translateX < -100) {
			// Swipe Left -> Skip (For now just toggle, or maybe specific skip logic)
			// onSkip();
			// console.log('Skipped');
		}
		translateX = 0;
	};
</script>

<div
	class="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md {color.border}"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<!-- Swipe Backgrounds -->
	<div
		class="absolute inset-0 flex items-center justify-between px-6"
		style="opacity: {Math.abs(translateX) / 100}"
	>
		<div
			class="flex items-center gap-2 font-bold text-green-500 {translateX > 0
				? 'opacity-100'
				: 'opacity-0'}"
		>
			<Check size={24} /> Selesai
		</div>
		<div
			class="flex items-center gap-2 font-bold text-red-500 {translateX < 0
				? 'opacity-100'
				: 'opacity-0'}"
		>
			Lewati
		</div>
	</div>

	<!-- Card Content -->
	<div
		class="relative flex items-center justify-between bg-white p-4 transition-transform duration-200 ease-out"
		style="transform: translateX({translateX}px)"
	>
		<div class="z-10 flex items-center gap-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-xl {color.bg} {color.text} transition-transform group-hover:scale-110"
			>
				<Icon size={24} />
			</div>
			<div>
				<h3 class="font-bold text-slate-800 transition-colors group-hover:{color.text}">
					{habit.title}
				</h3>
				<div class="flex items-center gap-2 text-xs text-slate-500">
					{#if habit.category}
						<span class="rounded-md bg-slate-100 px-2 py-0.5 font-medium capitalize"
							>{habit.category}</span
						>
					{/if}
					{#if habit.time}
						<span>{habit.time}</span>
					{/if}
					{#if habit.progress}
						<span class="{color.text} font-bold">{habit.progress}</span>
					{/if}
				</div>
			</div>
		</div>
		<button
			onclick={onToggle}
			class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 text-transparent transition-all hover:border-{habit.type} hover:bg-{habit.type} hover:text-white focus:outline-none active:scale-95 {habit.completed
				? `bg-${habit.type} border-${habit.type} text-white`
				: ''}"
		>
			<Check size={20} strokeWidth={3} />
		</button>
	</div>

	<!-- Hover Fill Effect (Desktop) -->
	<div
		class="absolute bottom-0 left-0 top-0 -z-0 w-0 {color.bg} opacity-30 transition-all duration-500 group-hover:w-full pointer-events-none"
	></div>
</div>

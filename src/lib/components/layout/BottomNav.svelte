<script lang="ts">
	import {
		House,
		Calendar,
		ChartBar,
		User,
		Plus,
		AlarmClock,
		Flame,
		BookOpenText,
		Heart,
		BookOpen
	} from 'lucide-svelte';
	import { page } from '$app/stores';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { fly, scale } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';

	let { class: className } = $props();

	// Helper to check active state
	const isActive = (path: string) => $page.url.pathname.startsWith(path);

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};

	const navItems = [
		{ icon: House, label: m.nav_home(), path: '/dashboard' },
		{ icon: Flame, label: m.nav_habits(), path: '/habits' },
		// FAB goes here in the middle
		{ icon: BookOpen, label: m.nav_quran(), path: '/quran' },
		{ icon: User, label: m.nav_profile(), path: '/profile' }
	];
</script>

<!-- Floating Bottom Nav with Glassmorphism -->
<nav class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe md:hidden {className}">
	<div
		class="glass-card flex items-center justify-around rounded-3xl border border-base-content/5 px-2 py-3 shadow-lg"
	>
		{#each navItems.slice(0, 2) as item}
			<a
				href={item.path}
				class="group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all"
			>
				<!-- Active pill indicator -->
				{#if isActive(item.path)}
					<div
						class="absolute inset-x-2 inset-y-0 rounded-2xl bg-primary/10"
						in:scale={{ duration: 200 }}
					></div>
				{/if}
				<item.icon
					class="relative size-6 transition-transform {isActive(item.path)
						? 'scale-110 text-primary'
						: 'text-base-content/40 group-hover:text-base-content/60'}"
				/>
				<!-- <span
					class="relative text-[10px] font-medium {isActive(item.path)
						? 'text-primary'
						: 'text-base-content/40'}">{item.label}</span
				> -->
			</a>
		{/each}

		<!-- Enhanced FAB with Glow -->
		<div class="relative -top-6 flex flex-col items-center justify-center px-2">
			<!-- Glow effect -->
			<div
				class="absolute inset-0 -top-1 rounded-full bg-primary/30 blur-xl animate-pulse-glow"
			></div>
			<button
				onclick={openAddHabit}
				class="relative flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white shadow-xl shadow-primary/30 transition-transform duration-300 hover:scale-105 active:scale-95"
			>
				<Plus size={28} strokeWidth={3} />
			</button>
		</div>

		{#each navItems.slice(2, 4) as item}
			<a
				href={item.path}
				class="group relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all"
			>
				<!-- Active pill indicator -->
				{#if isActive(item.path)}
					<div
						class="absolute inset-x-2 inset-y-0 rounded-2xl bg-primary/10"
						in:scale={{ duration: 200 }}
					></div>
				{/if}
				<item.icon
					class="relative size-6 transition-transform {isActive(item.path)
						? 'scale-110 text-primary'
						: 'text-base-content/40 group-hover:text-base-content/60'}"
				/>
				<!-- <span
					class="relative text-[10px] font-medium {isActive(item.path)
						? 'text-primary'
						: 'text-base-content/40'}">{item.label}</span
				> -->
			</a>
		{/each}
	</div>
</nav>

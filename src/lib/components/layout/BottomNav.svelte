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
		// { icon: AlarmClock, label: 'Ibadah', path: '/habits' },
		{ icon: Flame, label: m.nav_habits(), path: '/habits' },
		// FAB goes here in the middle
		{ icon: BookOpen, label: m.nav_quran(), path: '/quran' },
		// { icon: Heart, label: 'Jurnal', path: '/journal' },
		{ icon: User, label: m.nav_profile(), path: '/profile' }
	];
</script>

<!-- Custom Bottom Nav Implementation for better control than daisyUI's default grid for 5 items + FAB -->
<nav
	class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-base-content/5 bg-base-100/90 px-2 py-2 pb-safe backdrop-blur-xl md:hidden {className} shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
>
	{#each navItems.slice(0, 2) as item}
		<a
			href={item.path}
			class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive(
				item.path
			)
				? 'text-primary'
				: 'text-base-content/40'}"
		>
			<item.icon size={22} />
			<span class="text-[10px] font-medium">{item.label}</span>
		</a>
	{/each}

	<!-- FAB -->
	<div class="relative -top-6 flex flex-col items-center justify-center">
		<button
			onclick={openAddHabit}
			class="flex size-14 items-center justify-center rounded-full bg-linear-to-tr from-primary to-purple-600 text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105 active:scale-95"
		>
			<Plus size={28} strokeWidth={3} />
		</button>
	</div>

	{#each navItems.slice(2, 4) as item}
		<a
			href={item.path}
			class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive(
				item.path
			)
				? 'text-primary'
				: 'text-base-content/40'}"
		>
			<item.icon size={22} />
			<span class="text-[10px] font-medium">{item.label}</span>
		</a>
	{/each}
</nav>

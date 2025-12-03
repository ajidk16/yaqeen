<script lang="ts">
	import { House, Calendar, ChartBar, User, Plus, AlarmClock, Flame, BookOpenText, Heart } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { fly, scale } from 'svelte/transition';

	let { class: className } = $props();

	// Helper to check active state
	const isActive = (path: string) => $page.url.pathname.startsWith(path);

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};

	const navItems = [
		{ icon: House, label: 'Home', path: '/dashboard' },
		{ icon: AlarmClock, label: 'Ibadah', path: '/ibadah' },
		{ icon: BookOpenText, label: 'Quran', path: '/quran' },
		// FAB goes here in the middle
		{ icon: Flame, label: 'Habits', path: '/habits' },
		{ icon: Heart, label: 'Mood', path: '/journal' },
		{ icon: User, label: 'Profile', path: '/profile' }
	];
</script>

<div class="btm-nav md:hidden z-50 bg-white/80 backdrop-blur-xl border-t border-base-content/5 pb-safe {className}">
	<!-- Left Side -->
	{#each navItems.slice(0, 3) as item}
		<a 
			href={item.path} 
			class="text-xs font-medium transition-all duration-300 {isActive(item.path) ? 'text-primary active bg-primary/5' : 'text-base-content/50 hover:text-base-content/80'}"
		>
			<div class="relative">
				<svelte:component this={item.icon} size={20} class="mb-0.5 transition-transform duration-300 {isActive(item.path) ? 'scale-110' : ''}" />
				{#if isActive(item.path)}
					<span class="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" in:scale></span>
				{/if}
			</div>
			<span class="text-[9px] {isActive(item.path) ? 'font-bold' : ''}">{item.label}</span>
		</a>
	{/each}

	<!-- FAB (Floating Action Button) - Positioned absolutely to break out of grid if needed, or just as an item -->
	<!-- For btm-nav, it's a grid. We can insert the FAB in the middle or have it float above. 
	     Let's try a floating button above the nav for better UX, or integrated if we want 5 items.
		 The user requested consistency with Sidebar which has 6 items + FAB. 
		 Fitting 6 items + FAB in bottom nav is tight. 
		 Let's stick to the most important ones or use a "More" menu? 
		 Or just scrollable? DaisyUI btm-nav is flex/grid.
		 
		 Let's try to fit 5 items and put FAB floating above.
		 Items: Home, Ibadah, (FAB), Habits, Profile. 
		 Quran and Mood can be accessed via Home or "More"?
		 
		 Actually, the previous Sidebar had: Home, Ibadah, Quran, Habits, Mood, Profile.
		 That's 6 items. Too many for standard bottom nav.
		 Let's prioritize: Home, Ibadah, Habits, Profile. And maybe Quran/Mood?
		 
		 Let's follow the user's "consistency" request but adapt for mobile.
		 Let's do: Home, Ibadah, [FAB], Habits, Profile.
		 And put Quran/Mood in Dashboard quick actions (which they are).
	-->

	<!-- Re-evaluating items for Mobile Bottom Nav -->
	<!-- 
		1. Home (/dashboard)
		2. Ibadah (/ibadah)
		3. FAB (New)
		4. Habits (/habits)
		5. Profile (/profile)
	-->
</div>

<!-- Custom Bottom Nav Implementation for better control than daisyUI's default grid for 5 items + FAB -->
<nav class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-base-content/5 bg-white/90 px-2 py-2 pb-safe backdrop-blur-xl md:hidden {className} shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
	
	<a href="/dashboard" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/dashboard') ? 'text-primary' : 'text-base-content/40'}">
		<House size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/dashboard') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Home</span>
	</a>

	<a href="/ibadah" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/ibadah') ? 'text-primary' : 'text-base-content/40'}">
		<AlarmClock size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/ibadah') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Ibadah</span>
	</a>

	<!-- FAB -->
	<div class="relative -top-6 flex flex-col items-center justify-center">
		<button 
			onclick={openAddHabit}
			class="flex size-14 items-center justify-center rounded-full bg-linear-to-tr from-primary to-purple-600 text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105 active:scale-95"
		>
			<Plus size={28} strokeWidth={3} />
		</button>
	</div>

	<a href="/habits" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/habits') ? 'text-primary' : 'text-base-content/40'}">
		<Flame size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/habits') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Habits</span>
	</a>

	<a href="/profile" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/profile') ? 'text-primary' : 'text-base-content/40'}">
		<User size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/profile') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Profile</span>
	</a>
</nav>

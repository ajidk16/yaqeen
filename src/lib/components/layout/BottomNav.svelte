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
		{ icon: House, label: 'Beranda', path: '/dashboard' },
		{ icon: AlarmClock, label: 'Ibadah', path: '/ibadah' },
		{ icon: BookOpenText, label: 'Quran', path: '/quran' },
		// FAB goes here in the middle
		{ icon: Flame, label: 'Kebiasaan', path: '/habits' },
		{ icon: Heart, label: 'Jurnal', path: '/journal' },
		{ icon: User, label: 'Profil', path: '/profile' }
	];
</script>

<!-- Custom Bottom Nav Implementation for better control than daisyUI's default grid for 5 items + FAB -->
<nav class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-base-content/5 bg-white/90 px-2 py-2 pb-safe backdrop-blur-xl md:hidden {className} shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
	
	<a href="/dashboard" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/dashboard') ? 'text-primary' : 'text-base-content/40'}">
		<House size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/dashboard') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Beranda</span>
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
		<span class="text-[10px] font-medium">Kebiasaan</span>
	</a>

	<a href="/profile" class="group flex flex-1 flex-col items-center justify-center gap-1 p-1 transition-colors {isActive('/profile') ? 'text-primary' : 'text-base-content/40'}">
		<User size={22} class="transition-transform duration-300 group-active:scale-90 {isActive('/profile') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium">Profil</span>
	</a>
</nav>

<script lang="ts">
	import { House, Calendar, ChartBar, User, Plus } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { isAddHabitModalOpen } from '$lib/stores/ui';

	let { class: className } = $props();

	// Helper to check active state
	const isActive = (path: string) => $page.url.pathname === path;

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-white/20 bg-white/80 px-6 py-3 backdrop-blur-xl md:hidden {className} shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
	<a href="/dashboard" class="group flex flex-col items-center gap-1 transition-colors {isActive('/dashboard') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}">
		<House size={24} class="transition-transform group-active:scale-90 {isActive('/dashboard') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium transition-opacity {isActive('/dashboard') ? 'opacity-100' : 'opacity-70'}">Home</span>
	</a>
	<a href="/journal" class="group flex flex-col items-center gap-1 transition-colors {isActive('/journal') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}">
		<Calendar size={24} class="transition-transform group-active:scale-90 {isActive('/journal') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium transition-opacity {isActive('/journal') ? 'opacity-100' : 'opacity-70'}">Journal</span>
	</a>
	
	<!-- Floating Action Button (FAB) -->
	<button onclick={openAddHabit} class="-mt-12 rounded-full bg-gradient-to-tr from-primary to-purple-600 p-4 text-white shadow-lg shadow-primary/40 transition-all hover:scale-110 hover:shadow-primary/60 active:scale-95">
		<Plus size={28} strokeWidth={3} />
	</button>
	
	<a href="/stats" class="group flex flex-col items-center gap-1 transition-colors {isActive('/stats') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}">
		<ChartBar size={24} class="transition-transform group-active:scale-90 {isActive('/stats') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium transition-opacity {isActive('/stats') ? 'opacity-100' : 'opacity-70'}">Stats</span>
	</a>
	<a href="/profile" class="group flex flex-col items-center gap-1 transition-colors {isActive('/profile') ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}">
		<User size={24} class="transition-transform group-active:scale-90 {isActive('/profile') ? 'fill-primary/20' : ''}" />
		<span class="text-[10px] font-medium transition-opacity {isActive('/profile') ? 'opacity-100' : 'opacity-70'}">Profile</span>
	</a>
</nav>

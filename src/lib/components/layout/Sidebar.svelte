<script lang="ts">
	import { House, Calendar, ChartBar, User, LogOut, Plus, AlarmClock, Flame,BookOpenText, Heart } from 'lucide-svelte';
	import { page } from '$app/state';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { enhance } from '$app/forms';

	// Helper to check active state
	const isActive = (path: string) => page.url.pathname.startsWith(path);

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};

	const listMenu = [
		{
			icon: House,
			label: 'Beranda',
			path: '/dashboard'
		},
		{
			icon: Flame,
			label: 'Kebiasaan',
			path: '/ibadah'
		},
		{
			icon: BookOpenText,
			label: 'Quran',
			path: '/quran'
		},
		// {
		// 	icon: Flame,
		// 	label: 'Kebiasaan',
		// 	path: '/habits'
		// },
		{
			icon: Heart,
			label: 'Jurnal',
			path: '/journal'
		},
		// {
		// 	icon: ChartBar,
		// 	label: 'Stats',
		// 	path: '/stats'
		// },
		{
			icon: User,
			label: 'Profil',
			path: '/profile'
		}
	]	

</script>

<aside class="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-slate-100 bg-white py-8 md:flex z-50 shadow-sm">
	<a href="/" class="mb-6">
		<!-- Logo Placeholder -->
		<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/30 transition-transform hover:scale-110">
			YQ
		</div>
	</a>

	<button onclick={openAddHabit} class="mb-6 group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30">
		<Plus size={24} strokeWidth={3} class="transition-transform group-hover:rotate-90" />
		<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl whitespace-nowrap">Kebiasaan Baru</span>
	</button>

	<nav class="flex flex-1 flex-col gap-6">
		{#each listMenu as menu}
		<a href={menu.path} class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 {isActive(menu.path) ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'}">
			<svelte:component this={menu.icon} size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">{menu.label}</span>
		</a>
		{/each}
	</nav>

	<div class="mt-auto">
		<form action="/dashboard/?/logout" method="POST" use:enhance>
			<button type='submit' class="group relative flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500 hover:shadow-sm">
				<LogOut size={22} class="transition-transform group-hover:scale-110" />
				<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Keluar</span>
			</button>
		</form>
	</div>
</aside>

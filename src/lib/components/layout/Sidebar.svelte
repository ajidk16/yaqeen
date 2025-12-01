<script lang="ts">
	import { House, Calendar, ChartBar, User, LogOut, Plus } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { authClient } from '$lib/auth-client';

	// Helper to check active state
	const isActive = (path: string) => $page.url.pathname.startsWith(path);

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};
</script>

<aside class="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-slate-100 bg-white py-8 md:flex z-50 shadow-sm">
	<a href="/" class="mb-6">
		<!-- Logo Placeholder -->
		<div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/30 transition-transform hover:scale-110">
			H
		</div>
	</a>

	<button onclick={openAddHabit} class="mb-6 group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30">
		<Plus size={24} strokeWidth={3} class="transition-transform group-hover:rotate-90" />
		<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl whitespace-nowrap">New Habit</span>
	</button>

	<nav class="flex flex-1 flex-col gap-6">
		<a href="/dashboard" class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 {isActive('/dashboard') ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'}">
			<House size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Home</span>
		</a>
		<a href="/journal" class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 {isActive('/journal') ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'}">
			<Calendar size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Journal</span>
		</a>
		<a href="/stats" class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 {isActive('/stats') ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'}">
			<ChartBar size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Stats</span>
		</a>
		<a href="/profile" class="group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300 {isActive('/profile') ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:shadow-sm'}">
			<User size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Profile</span>
		</a>
	</nav>

	<div class="mt-auto">
		<button onclick={async () => {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						window.location.href = '/login';
					}
				}
			});
		}} class="group relative flex h-12 w-12 items-center justify-center rounded-2xl text-slate-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500 hover:shadow-sm">
			<LogOut size={22} class="transition-transform group-hover:scale-110" />
			<span class="absolute left-16 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl">Logout</span>
		</button>
	</div>
</aside>

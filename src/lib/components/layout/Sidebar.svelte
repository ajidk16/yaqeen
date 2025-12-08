<script lang="ts">
	import { House, User, LogOut, Plus, Flame, Heart, BookOpen } from 'lucide-svelte';
	import { page } from '$app/state';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { enhance } from '$app/forms';
	import ToggleTheme from '../navigation/ToggleTheme.svelte';
	import * as m from '$lib/paraglide/messages.js';

	// Helper to check active state
	const isActive = (path: string) => page.url.pathname.startsWith(path);

	const openAddHabit = () => {
		$isAddHabitModalOpen = true;
	};

	const listMenu = [
		{
			icon: House,
			label: m.nav_home(),
			path: '/dashboard'
		},
		{
			icon: Flame,
			label: m.nav_habits(),
			path: '/habits'
		},
		{
			icon: BookOpen,
			label: m.nav_quran(),
			path: '/quran'
		},
		// {
		// 	icon: Flame,
		// 	label: 'Kebiasaan',
		// 	path: '/habits'
		// },
		{
			icon: Heart,
			label: m.nav_journal(),
			path: '/journal'
		},
		// {
		// 	icon: ChartBar,
		// 	label: 'Stats',
		// 	path: '/stats'
		// },
		{
			icon: User,
			label: m.nav_profile(),
			path: '/profile'
		}
	];
</script>

<aside
	class="fixed left-0 top-0 hidden h-screen w-20 flex-col items-center border-r border-base-200 bg-base-100 py-8 md:flex z-50 shadow-sm"
>
	<a href="/" class="mb-6">
		<div
			class="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/30 transition-transform hover:scale-110"
		>
			YQ
		</div>
	</a>

	<button
		onclick={openAddHabit}
		class="btn btn-ghost btn-circle mb-6 group relative transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30"
	>
		<Plus size={24} strokeWidth={3} class="transition-transform group-hover:rotate-90" />
		<span
			class="absolute left-16 rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl whitespace-nowrap"
			>{m.nav_new_habit()}</span
		>
	</button>

	<nav class="flex flex-1 flex-col gap-6">
		{#each listMenu as menu}
			<a
				href={menu.path}
				class="btn btn-ghost btn-circle group relative transition-all duration-300 {isActive(
					menu.path
				)
					? 'btn-active text-primary'
					: 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}"
			>
				<svelte:component
					this={menu.icon}
					size={22}
					class="transition-transform group-hover:scale-110"
				/>
				<span
					class="absolute left-16 rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl"
					>{menu.label}</span
				>
			</a>
		{/each}
	</nav>

	<div class="mt-auto flex flex-col items-center gap-2">
		<ToggleTheme />
		<form action="/dashboard/?/logout" method="POST" use:enhance>
			<button
				type="submit"
				class="btn btn-ghost btn-circle group relative transition-all duration-300 hover:bg-error/10 hover:text-error"
			>
				<LogOut size={22} class="transition-transform group-hover:scale-110" />
				<span
					class="absolute left-16 rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 shadow-xl"
					>{m.nav_logout()}</span
				>
			</button>
		</form>
	</div>
</aside>

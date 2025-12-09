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
		{
			icon: Heart,
			label: m.nav_journal(),
			path: '/journal'
		},
		{
			icon: User,
			label: m.nav_profile(),
			path: '/profile'
		}
	];
</script>

<aside
	class="glass-card fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center border-r border-base-content/5 py-8 md:flex"
>
	<!-- Logo with Glow -->
	<a href="/" class="group relative mb-6">
		<div
			class="absolute inset-0 rounded-2xl bg-primary/30 blur-xl opacity-0 transition-opacity group-hover:opacity-100"
		></div>
		<div
			class="relative flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-110"
		>
			YQ
		</div>
	</a>

	<!-- Add Habit Button -->
	<button
		onclick={openAddHabit}
		class="group relative mb-6 flex size-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30"
	>
		<Plus size={24} strokeWidth={3} class="transition-transform group-hover:rotate-90" />
		<span
			class="absolute left-16 -translate-x-2 whitespace-nowrap rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100"
		>
			{m.nav_new_habit()}
		</span>
	</button>

	<!-- Navigation -->
	<nav class="flex flex-1 flex-col gap-2">
		{#each listMenu as menu}
			<a
				href={menu.path}
				class="group relative flex size-10 items-center justify-center rounded-xl transition-all duration-300
					{isActive(menu.path)
					? 'bg-primary/10 text-primary'
					: 'text-base-content/60 hover:bg-base-content/5 hover:text-base-content'}"
			>
				<!-- Active Indicator Bar -->
				{#if isActive(menu.path)}
					<div
						class="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
					></div>
				{/if}
				<svelte:component
					this={menu.icon}
					size={22}
					class="transition-transform {isActive(menu.path) ? 'scale-110' : 'group-hover:scale-110'}"
				/>
				<span
					class="absolute left-16 -translate-x-2 whitespace-nowrap rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100"
				>
					{menu.label}
				</span>
			</a>
		{/each}
	</nav>

	<!-- Footer Actions -->
	<div class="mt-auto flex flex-col items-center gap-2">
		<ToggleTheme />
		<form action="/dashboard/?/logout" method="POST" use:enhance>
			<button
				type="submit"
				class="group relative flex size-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-error/10 hover:text-error"
			>
				<LogOut size={22} class="transition-transform group-hover:scale-110" />
				<span
					class="absolute left-16 -translate-x-2 whitespace-nowrap rounded-lg bg-base-content px-3 py-1.5 text-xs font-medium text-base-100 opacity-0 shadow-xl transition-all group-hover:translate-x-0 group-hover:opacity-100"
				>
					{m.nav_logout()}
				</span>
			</button>
		</form>
	</div>
</aside>

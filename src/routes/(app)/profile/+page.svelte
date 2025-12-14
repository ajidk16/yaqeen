<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		User,
		Settings,
		LogOut,
		ChevronRight,
		Bell,
		Shield,
		Crown,
		Palette,
		HeartPulse,
		Info
	} from 'lucide-svelte';
	import { Button, Avatar, Badge } from '$lib/components/ui';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import * as m from '$lib/paraglide/messages.js';

	const user = $derived(page.data.user);

	const menuItems = [
		// {
		// 	icon: User,
		// 	label: m.profile_menu_edit(),
		// 	href: '/profile/edit',
		// 	color: 'text-primary',
		// 	gradient: 'from-primary/20 to-purple-500/20'
		// },
		{
			icon: Bell,
			label: m.profile_menu_notifications(),
			href: '/profile/notifications',
			color: 'text-secondary',
			gradient: 'from-secondary/20 to-pink-500/20'
		},
		{
			icon: Palette,
			label: m.profile_menu_preferences(),
			href: '/profile/settings',
			color: 'text-accent',
			gradient: 'from-accent/20 to-teal-500/20'
		},
		{
			icon: Shield,
			label: m.profile_menu_security(),
			href: '/profile/security',
			color: 'text-success',
			gradient: 'from-success/20 to-emerald-500/20'
		},
		{
			label: 'Jadwal Haid',
			href: '/calendar',
			color: 'text-primary',
			icon: HeartPulse,
			gender: 'female'
		},
		{
			icon: Info,
			label: m.profile_menu_help(),
			href: '/profile/support',
			color: 'text-info',
			gradient: 'from-info/20 to-blue-500/20'
		}
	];
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Header with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/5 via-transparent to-accent/5 p-6 lg:p-8"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-3xl animate-breathe"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-accent/10 blur-3xl animate-breathe"
				style="animation-delay: -2s"
			></div>

			<h1 class="relative z-10 text-3xl font-bold lg:text-4xl">{m.profile_title()}</h1>
		</header>

		<!-- Profile Card with Gradient Banner -->
		<div
			class="glass-card overflow-hidden rounded-3xl"
			in:fly={{ y: 20, duration: 800, delay: 100 }}
		>
			<!-- Gradient Banner -->
			<div class="relative h-32 bg-linear-to-r from-primary via-purple-500 to-secondary">
				<div class="absolute inset-0 bg-black/10"></div>
				<!-- Decorative elements -->
				<div
					class="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
				></div>
				<div
					class="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-black/10 blur-2xl"
				></div>
			</div>

			<div class="relative z-10 -mt-16 px-6 pb-6">
				<div class="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
					<!-- Avatar with Ring -->
					<div class="relative">
						<div class="inline-block rounded-full bg-base-100 p-1 shadow-xl">
							<Avatar
								src={user?.image ? user?.image : `https://i.pravatar.cc/150?u=${user?.name}`}
								alt={user?.name}
								size="xl"
								class="ring-4 rounded-full ring-base-100"
							/>
						</div>
						{#if user?.isPremium}
							<div
								class="absolute -bottom-1 -right-1 rounded-full bg-warning p-2 text-warning-content shadow-lg"
								title="Premium Member"
								in:scale={{ duration: 300, delay: 200 }}
							>
								<Crown class="size-4" />
							</div>
						{/if}
					</div>

					<!-- User Info -->
					<div class="flex-1 space-y-1 text-center md:text-left">
						<h2 class="text-2xl capitalize font-bold">{user?.name}</h2>
						<p class="text-base-content/60">{user?.email}</p>
						{#if user?.isPremium}
							<Badge class="badge-warning mt-2 gap-1">
								<Crown class="size-3" />
								{m.profile_premium_badge()}
							</Badge>
						{/if}
					</div>

					<!-- Edit Button -->
					<Button
						size="sm"
						class="gap-2 rounded-full"
						onclick={() => (window.location.href = '/profile/edit')}
					>
						<Settings class="size-4" />
						{m.profile_menu_edit()}
					</Button>
				</div>
			</div>
		</div>

		<!-- Menu Items -->
		<div class="space-y-3">
			{#each menuItems as item, i}
				{#if !item.gender || item.gender === user?.gender}
					<a
						href={item.href}
						class="glass-card group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg"
						in:fly={{ x: -20, duration: 500, delay: 200 + i * 80 }}
					>
						<div
							class="flex size-12 items-center justify-center rounded-xl bg-linear-to-br {item.gradient} transition-transform duration-300 group-hover:scale-110"
						>
							<item.icon class="size-6 {item.color}" />
						</div>
						<span class="flex-1 text-lg font-medium">{item.label}</span>
						<ChevronRight
							class="size-5 text-base-content/30 transition-all group-hover:translate-x-1 group-hover:text-primary"
						/>
					</a>
				{/if}
			{/each}
		</div>

		<!-- Logout Button -->
		<form action="/dashboard?/logout" method="POST" use:enhance class="pt-2">
			<button
				type="submit"
				class="btn btn-ghost w-full gap-2 rounded-2xl text-error hover:bg-error/10"
			>
				<LogOut class="size-5" />
				{m.profile_logout_button()}
			</button>
		</form>
	</div>
</div>

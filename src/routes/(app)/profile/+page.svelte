<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		User,
		Settings,
		LogOut,
		ChevronRight,
		Bell,
		Shield,
		CircleHelp,
		Crown,
		Palette
	} from 'lucide-svelte';
	import { Button, Avatar } from '$lib/components/ui';
	import { page } from '$app/state';
	import * as m from '$lib/paraglide/messages.js';

	let { data } = $props();
	const user = $derived(page.data.user);

	const menuItems = [
		{
			icon: User,
			label: m.profile_menu_edit(),
			href: '/profile/edit',
			color: 'text-primary'
		},
		{
			icon: Bell,
			label: m.profile_menu_notifications(),
			href: '/profile/notifications',
			color: 'text-secondary'
		},
		{
			icon: Palette,
			label: m.profile_menu_preferences(),
			href: '/profile/settings',
			color: 'text-accent'
		},
		{
			icon: Shield,
			label: m.profile_menu_security(),
			href: '/profile/security',
			color: 'text-success'
		},
		{
			icon: CircleHelp,
			label: m.profile_menu_help(),
			href: '/profile/support',
			color: 'text-info'
		}
	];
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-8">
		<!-- Header -->
		<div
			class="flex items-center justify-between"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<h1 class="text-3xl font-bold">{m.profile_title()}</h1>
		</div>

		<!-- Profile Card -->
		<div
			class="card bg-base-100 shadow-xl border border-base-content/5 overflow-hidden relative group"
			in:fly={{ y: 20, duration: 800, delay: 100 }}
		>
			<div
				class="absolute top-0 left-0 w-full h-32 bg-linear-to-r from-primary/20 to-secondary/20"
			></div>

			<div class="card-body pt-20 relative">
				<div class="flex flex-col md:flex-row items-center md:items-end gap-6">
					<div class="relative">
						<div class="p-1 bg-base-100 rounded-full">
							<Avatar
								src={user?.image}
								alt={user?.name}
								size="xl"
								class="ring-4 ring-base-100 shadow-lg"
							/>
						</div>
						{#if user?.isPremium}
							<div
								class="absolute -bottom-2 -right-2 bg-warning text-warning-content p-1.5 rounded-full shadow-sm"
								title="Premium Member"
							>
								<Crown class="size-4" />
							</div>
						{/if}
					</div>

					<div class="flex-1 text-center md:text-left space-y-1">
						<h2 class="text-2xl font-bold">{user?.name}</h2>
						<p class="text-base-content/60">{user?.email}</p>
						{#if user?.isPremium}
							<div class="badge badge-warning gap-1 mt-2">
								<Crown class="size-3" />
								{m.profile_premium_badge()}
							</div>
						{/if}
					</div>

					<Button size="sm" class="gap-2" onclick={() => (window.location.href = '/profile/edit')}>
						<Settings class="size-4" />
						{m.profile_menu_edit()}
					</Button>
				</div>
			</div>
		</div>

		<!-- Menu -->
		<div class="space-y-4">
			<div class="grid gap-3">
				{#each menuItems as item, i}
					<a
						href={item.href}
						class="card bg-base-100 shadow-sm border border-base-content/5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
						in:fly={{ x: -20, duration: 500, delay: 200 + i * 100 }}
					>
						<div class="card-body p-4 flex-row items-center gap-4">
							<div
								class="size-10 rounded-xl bg-base-200/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
							>
								<item.icon class="size-5 {item.color}" />
							</div>
							<div class="flex-1 font-medium text-lg">
								{item.label}
							</div>
							<ChevronRight
								class="size-5 text-base-content/30 group-hover:text-primary group-hover:translate-x-1 transition-all"
							/>
						</div>
					</a>
				{/each}
			</div>

			<form action="/auth/signout" method="POST" class="pt-4">
				<button type="submit" class="btn btn-ghost btn-block text-error hover:bg-error/10 gap-2">
					<LogOut class="size-5" />
					{m.profile_logout_button()}
				</button>
			</form>
		</div>
	</div>
</div>

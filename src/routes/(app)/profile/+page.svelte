<script>
	import { page } from '$app/state';
	import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Camera, Activity } from 'lucide-svelte';
	import { enhance } from '$app/forms';
	import { Card, Button } from '$lib/components/ui';

	const listProfile = [
		{
			title: 'Edit Profil',
			svg: User,
			path: '/profile/edit',
			bg: 'bg-info/10',
			text: 'text-info'
		},
		{
			title: 'Notifikasi',
			svg: Bell,
			path: '/profile/notifications',
			bg: 'bg-primary/10',
			text: 'text-primary'
		},
		{
			title: 'Preferensi',
			svg: Settings,
			path: '/profile/settings',
			bg: 'bg-success/10',
			text: 'text-success'
		},
		{
			title: 'Keamanan & Privasi',
			svg: Shield,
			path: '/profile/security',
			bg: 'bg-error/10',
			text: 'text-error'
		},
		{
			title: 'Bantuan & Support',
			svg: HelpCircle,
			path: '/profile/support',
			bg: 'bg-warning/10',
			text: 'text-warning'
		}
	]
</script>

<div class="space-y-6 animate-fade-in-up max-w-2xl mx-auto pb-20">
	<!-- Header -->
	<header>
		<h1 class="text-2xl font-bold text-base-content">Profil Saya</h1>
	</header>

	<!-- User Card -->
	<Card class="border-base-content/5">
		<div class="flex items-center gap-5">
			<div class="relative">
				<div class="flex h-20 w-20 items-center justify-center rounded-full bg-base-200 text-base-content/30 overflow-hidden border-2 border-base-100 shadow-sm">
					{#if page.data.user.image}
						<img src={page.data.user.image} alt="user mage" class="h-full w-full object-cover" />
					{:else}
						<User size={40} />
					{/if}
				</div>
				<button class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content shadow-md hover:bg-primary-focus transition-colors hover:scale-105 active:scale-95">
					<Camera size={14} />
				</button>
			</div>
			<div>
				<h2 class="text-lg font-bold text-base-content">{page.data.user.name}</h2>
				<p class="text-sm text-base-content/60">{page.data.user.email}</p>
				<span class="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
					Anggota Premium
				</span>
			</div>
		</div>
	</Card>

	<!-- Settings List -->
	<Card class="border-base-content/5 overflow-hidden">
		<div class="divide-y divide-base-content/5 p-0">
			{#each listProfile as item}
			<a href={item.path} class="flex w-full items-center justify-between py-4 transition-colors hover:bg-base-200/50 group">
				<div class="flex items-center gap-3">
					<div class="rounded-xl {item.bg} p-2.5 {item.text} transition-transform group-hover:scale-110">
						<item.svg size={20} />
					</div>
					<span class="font-medium text-base-content group-hover:text-primary transition-colors">{item.title}</span>
				</div>
				<ChevronRight size={18} class="text-base-content/30 group-hover:text-primary transition-colors" />
			</a>
			{/each}
		</div>
	</Card>

	<!-- Logout Button -->
	<form action="/dashboard/?/logout" method="POST" use:enhance class="w-full">
		<Button 
			type="submit"
			variant="error"
			outline
			block
			class="gap-2 font-bold hover:bg-error hover:text-error-content"
		>
			<LogOut size={20} />
			Keluar Aplikasi
		</Button>
	</form>
</div>

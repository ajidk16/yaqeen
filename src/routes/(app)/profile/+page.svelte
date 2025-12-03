<script>
	import { page } from '$app/state';
	import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Camera, Activity } from 'lucide-svelte';
	import { enhance } from '$app/forms';



	const listProfile = [
		{
			title: 'Edit Profil',
			svg: User,
			path: '/profile/edit',
			bg: 'bg-blue-50',
			text: 'text-blue-500'
		},
		{
			title: 'Notifikasi',
			svg: Bell,
			path: '/profile/notifications',
			bg: 'bg-purple-50',
			text: 'text-purple-500'
		},
		{
			title: 'Preferensi',
			svg: Settings,
			path: '/profile/settings',
			bg: 'bg-emerald-50',
			text: 'text-emerald-500'
		},
		{
			title: 'Keamanan & Privasi',
			svg: Shield,
			path: '/profile/security',
			bg: 'bg-rose-50',
			text: 'text-rose-500'
		},
		{
			title: 'Bantuan & Support',
			svg: HelpCircle,
			path: '/profile/support',
			bg: 'bg-orange-50',
			text: 'text-orange-500'
		}
	]
</script>

<div class="space-y-6 animate-fade-in-up">
	<!-- Header -->
	<header>
		<h1 class="text-2xl font-bold text-slate-800">Profil Saya</h1>
	</header>

	<!-- User Card -->
	<section class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
		<div class="relative">
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
				{#if page.data.user.image}
					<img src={page.data.user.image} alt="user mage" class="h-full w-full rounded-full object-cover" />
				{:else}
					<User size={40} />
				{/if}
			</div>
			<button class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-600 transition-colors">
				<Camera size={14} />
			</button>
		</div>
		<div>
			<h2 class="text-lg font-bold text-slate-800">{page.data.user.name}</h2>
			<p class="text-sm text-slate-500">{page.data.user.email}</p>
			<span class="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
				Premium Member
			</span>
		</div>
	</section>

	<!-- Settings List -->
	<section class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
		<div class="divide-y divide-slate-50">
			{#each listProfile as item}
			<a href={item.path} class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg {item.bg} p-2 {item.text}">
						<item.svg size={20} />
					</div>
					<span class="font-medium {item.text}">{item.title}</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</a>
			{/each}
		</div>
	</section>

	<!-- Logout Button -->
	<form action="/logout" method="POST" use:enhance class="w-full">
		<button 
			type="submit"
			class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 font-bold text-red-500 transition-all hover:bg-red-100 active:scale-95"
		>
			<LogOut size={20} />
			Keluar Aplikasi
		</button>
	</form>
</div>

<script>
	import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Camera, Activity } from 'lucide-svelte';
	import { authClient } from '$lib/auth-client';

	let userProfile = {
		name: 'Fatih',
		email: 'fatih@example.com',
		avatar: null
	};

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/login';
				}
			}
		});
	};
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
				{#if userProfile.avatar}
					<img src={userProfile.avatar} alt="Avatar" class="h-full w-full rounded-full object-cover" />
				{:else}
					<User size={40} />
				{/if}
			</div>
			<button class="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-600 transition-colors">
				<Camera size={14} />
			</button>
		</div>
		<div>
			<h2 class="text-lg font-bold text-slate-800">{userProfile.name}</h2>
			<p class="text-sm text-slate-500">{userProfile.email}</p>
			<span class="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
				Premium Member
			</span>
		</div>
	</section>

	<!-- Settings List -->
	<section class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
		<div class="divide-y divide-slate-50">
			<button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-blue-50 p-2 text-blue-500">
						<User size={20} />
					</div>
					<span class="font-medium text-slate-700">Edit Profil</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</button>
			<button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-purple-50 p-2 text-purple-500">
						<Bell size={20} />
					</div>
					<span class="font-medium text-slate-700">Notifikasi</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</button>
			<button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-emerald-50 p-2 text-emerald-500">
						<Settings size={20} />
					</div>
					<span class="font-medium text-slate-700">Preferensi (Mazhab, Lokasi)</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</button>
			
			<!-- Period Mode Toggle -->
			<div class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-rose-50 p-2 text-rose-500">
						<Activity size={20} />
					</div>
					<div class="text-left">
						<span class="block font-medium text-slate-700">Mode Haid (Udzur Syar'i)</span>
						<span class="text-xs text-slate-400">Pause streak ibadah otomatis</span>
					</div>
				</div>
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" value="" class="peer sr-only">
					<div class="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300"></div>
				</label>
			</div>

			<button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-orange-50 p-2 text-orange-500">
						<Shield size={20} />
					</div>
					<span class="font-medium text-slate-700">Keamanan & Privasi</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</button>
			<button class="flex w-full items-center justify-between p-4 transition-colors hover:bg-slate-50">
				<div class="flex items-center gap-3">
					<div class="rounded-lg bg-slate-100 p-2 text-slate-500">
						<HelpCircle size={20} />
					</div>
					<span class="font-medium text-slate-700">Bantuan & Support</span>
				</div>
				<ChevronRight size={18} class="text-slate-400" />
			</button>
		</div>
	</section>

	<!-- Logout Button -->
	<button 
		onclick={handleLogout}
		class="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 font-bold text-red-500 transition-all hover:bg-red-100 active:scale-95"
	>
		<LogOut size={20} />
		Keluar Aplikasi
	</button>
</div>

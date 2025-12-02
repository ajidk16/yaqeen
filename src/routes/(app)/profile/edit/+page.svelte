<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Camera, User, Mail, MapPin, Save, ArrowLeft, Moon, Sun, Bell, Smartphone } from 'lucide-svelte';
	import { Card, Button, Input, Textarea } from '$lib/components/ui';

	// Mock User Data
	let user = $state({
		fullName: 'Fatih Ar-Rasyid',
		username: '@fatihrasyid',
		email: 'fatih@example.com',
		bio: 'Seeking knowledge and striving for consistency.',
		location: 'Jakarta, Indonesia',
		avatar: 'https://i.pravatar.cc/150?u=fatih',
		preferences: {
			theme: 'light',
			notifications: true,
			emailUpdates: false
		}
	});

	let isSaving = $state(false);

	function handleSave() {
		isSaving = true;
		// Simulate API call
		setTimeout(() => {
			isSaving = false;
			// Navigate back or show success toast (mock)
			alert('Profile updated successfully!');
		}, 1500);
	}

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				user.avatar = e.target?.result as string;
			};
			reader.readAsDataURL(input.files[0]);
		}
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-8">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" href="/profile">
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Edit Profil</h1>
				<p class="text-base-content/60 text-sm">Update your personal information</p>
			</div>
		</header>

		<!-- Avatar Section -->
		<div class="flex flex-col items-center gap-4" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
			<div class="relative group">
				<div class="size-32 rounded-full overflow-hidden ring-4 ring-base-100 shadow-xl">
					<img src={user.avatar} alt="Profile" class="w-full h-full object-cover" />
				</div>
				<label class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg cursor-pointer hover:bg-primary-focus transition-colors transform hover:scale-105 active:scale-95">
					<Camera class="size-5" />
					<input type="file" accept="image/*" class="hidden" onchange={handleAvatarChange} />
				</label>
			</div>
			<p class="text-xs text-base-content/40">Tap icon to change photo</p>
		</div>

		<!-- Form Section -->
		<div class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 200 }}>
			<!-- Personal Info -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 space-y-4">
					<h3 class="font-bold text-lg flex items-center gap-2 mb-2">
						<User class="size-5 text-primary" />
						Personal Info
					</h3>
					
					<div class="grid gap-4">
						<div class="form-control w-full">
							<label class="label">
								<span class="label-text font-medium">Full Name</span>
							</label>
							<Input placeholder="Enter your full name" bind:value={user.fullName} class="bg-base-200/50" />
						</div>

						<div class="form-control w-full">
							<label class="label">
								<span class="label-text font-medium">Username</span>
							</label>
							<Input placeholder="@username" bind:value={user.username} class="bg-base-200/50" />
						</div>

						<div class="form-control w-full">
							<label class="label">
								<span class="label-text font-medium">Bio</span>
							</label>
							<Textarea placeholder="Tell us about yourself..." bind:value={user.bio} class="bg-base-200/50 min-h-[100px]" />
						</div>

						<div class="form-control w-full">
							<label class="label">
								<span class="label-text font-medium">Location</span>
							</label>
							<div class="relative">
								<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
								<Input placeholder="City, Country" bind:value={user.location} class="pl-10 bg-base-200/50" />
							</div>
							<label class="label">
								<span class="label-text-alt text-base-content/40">Used for prayer times calculation</span>
							</label>
						</div>
					</div>
				</div>
			</Card>

			<!-- Preferences -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 space-y-4">
					<h3 class="font-bold text-lg flex items-center gap-2 mb-2">
						<Smartphone class="size-5 text-secondary" />
						App Preferences
					</h3>

					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
									{#if user.preferences.theme === 'dark'}
										<Moon class="size-5" />
									{:else}
										<Sun class="size-5" />
									{/if}
								</div>
								<div>
									<p class="font-medium">Dark Mode</p>
									<p class="text-xs text-base-content/40">Adjust app appearance</p>
								</div>
							</div>
							<input 
								type="checkbox" 
								class="toggle toggle-primary" 
								checked={user.preferences.theme === 'dark'} 
								onclick={() => user.preferences.theme = user.preferences.theme === 'dark' ? 'light' : 'dark'}
							/>
						</div>

						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
									<Bell class="size-5" />
								</div>
								<div>
									<p class="font-medium">Push Notifications</p>
									<p class="text-xs text-base-content/40">Reminders for prayers & habits</p>
								</div>
							</div>
							<input 
								type="checkbox" 
								class="toggle toggle-secondary" 
								bind:checked={user.preferences.notifications} 
							/>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Actions -->
		<div class="sticky bottom-6 flex gap-3 pt-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
			<Button variant="ghost" class="flex-1" href="/profile">Cancel</Button>
			<Button 
				variant="primary" 
				class="flex-[2] gap-2 shadow-lg shadow-primary/20" 
				onclick={handleSave}
				disabled={isSaving}
			>
				{#if isSaving}
					<span class="loading loading-spinner loading-sm"></span>
					Saving...
				{:else}
					<Save class="size-4" />
					Save Changes
				{/if}
			</Button>
		</div>
	</div>
</div>

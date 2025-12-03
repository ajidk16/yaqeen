<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Camera, User, MapPin, Save, ArrowLeft, Moon, Sun, Bell, Smartphone } from 'lucide-svelte';
	import { Card, Button, Input, Textarea } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props<{ data: PageData }>();

	const profile = $derived(page.data.user)

	let isSaving = $state(false);

	let theme = $state(data.user.preferences?.theme || 'light');
	
	let avatar = $state(data.user.image || 'https://i.pravatar.cc/150?u=' + data.user.id);

	function handleAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const reader = new FileReader();
			reader.onload = (e) => {
				avatar = e.target?.result as string;
				// Note: Actual upload logic would go here or in form submission
			};
			reader.readAsDataURL(input.files[0]);
		}
	}

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-8">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={()=>goto('/profile')}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Edit Profil</h1>
				<p class="text-base-content/60 text-sm">Update your personal information</p>
			</div>
		</header>

		<form 
			method="POST" 
			action="?/update" 
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'success') {
						toast.add('Profile updated successfully!', 'success');
						triggerConfetti();
						await update();
					} else {
						toast.add('Failed to update profile.', 'error');
					}
				};
			}}
			class="space-y-8"
		>
			<!-- Avatar Section -->
			<div class="flex flex-col items-center gap-4" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
				<div class="relative group">
					<div class="size-32 rounded-full overflow-hidden ring-4 ring-base-100 shadow-xl">
						<img src={avatar} alt="Profile" class="w-full h-full object-cover" />
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
								<label class="label" for="fullName">
									<span class="label-text font-medium">Full Name</span>
								</label>
								<Input name="fullName" placeholder="Enter your full name" bind:value={profile.name} class="bg-base-200/50" />
							</div>

							<div class="form-control w-full">
								<label class="label" for="username">
									<span class="label-text font-medium">Username</span>
								</label>
								<Input name="username" placeholder="@username" bind:value={profile.username} class="bg-base-200/50" />
							</div>

							<div class="form-control w-full">
								<label class="label" for="bio">
									<span class="label-text font-medium">Bio</span>
								</label>
								<Textarea name="bio" placeholder="Tell us about yourself..." bind:value={profile.bio} class="bg-base-200/50 min-h-[100px]" />
							</div>

							<div class="form-control w-full">
								<label class="label" for="location">
									<span class="label-text font-medium">Location</span>
								</label>
								<div class="relative">
									<MapPin class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
									<Input name="location" placeholder="City, Country" bind:value={profile.location.city} class="pl-10 bg-base-200/50" />
								</div>
								<label class="label" for="">
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
										{#if theme === 'dark'}
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
								<input type="hidden" name="theme" value={profile.preferences.theme} />
								<input 
									type="checkbox" 
									class="toggle toggle-primary" 
									checked={profile.preferences.theme === 'dark'} 
									onclick={() => profile.preferences.theme = profile.preferences.theme === 'dark' ? 'light' : 'dark'}
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
									name="notifications"
									class="toggle toggle-secondary" 
									bind:checked={profile.preferences.notifications} 
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>

			<!-- Actions -->
			<div class="sticky bottom-6 flex gap-3 pt-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
				<Button variant="ghost" class="flex-1" onclick={()=>goto('/profile')}>Cancel</Button>
				<Button 
					type="submit"
					variant="primary" 
					class="flex-[2] gap-2 shadow-lg shadow-primary/20" 
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
		</form>
	</div>
</div>

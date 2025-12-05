<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Globe, MapPin, Moon, Smartphone, Save } from 'lucide-svelte';
	import { Card, Button, Input } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';

	const profile = page.data.user

	let isSaving = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	let location = $state(profile?.location.method ?? false)
	let longitude = $state(profile?.location.longitude ?? null)
	let latitude = $state(profile?.location.latitude ?? null)

	const handleLocationToggle = () => {
		location = !location;

		if (location) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					longitude = position.coords.longitude;
					latitude = position.coords.latitude;
				},
				(err) => {
					console.error(err);
					toast.add("Gagal mengambil lokasi otomatis.", "error");
					location = false;
				}
			);
		}
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={()=>goto('/profile')}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Preferensi</h1>
				<p class="text-base-content/60 text-sm">Sesuaikan pengalaman aplikasi Anda</p>
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
						toast.add('Settings saved successfully!', 'success');
						triggerConfetti();
						update();
					} else {
						toast.add('Failed to save settings.', 'error');
					}
				};
			}}
			class="space-y-6"
		>
			<!-- Content -->
			<div class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 100 }}>
				<!-- General -->
				<Card class="bg-base-100 shadow-sm border border-base-content/10">
					<div class="space-y-6">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Globe class="size-5 text-primary" />
							Umum
						</h3>
						
						<div class="form-control w-full">
							<label class="label" for="language">
								<span class="label-text font-medium">Bahasa / Language</span>
							</label>
							<select name="language" class="select select-bordered w-full bg-base-200/50" bind:value={profile.preferences.language}>
								<option value="id">Bahasa Indonesia</option>
								<option value="en">English</option>
							</select>
						</div>

						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
									<Smartphone class="size-5" />
								</div>
								<div>
									<p class="font-medium">Data Saver</p>
									<p class="text-xs text-base-content/40">Kurangi animasi & gambar</p>
								</div>
							</div>
							<input 
								type="checkbox" 
								name="dataSaver"
								class="toggle toggle-primary" 
								bind:checked={profile.settings.dataSaver} 
							/>
						</div>
					</div>
				</Card>

				<!-- Ibadah Settings -->
				<Card class="bg-base-100 shadow-sm border border-base-content/10">
					<div class="space-y-6">
						<h3 class="font-bold text-lg flex items-center gap-2">
							<Moon class="size-5 text-secondary" />
							Pengaturan Ibadah
						</h3>
						
						<div class="form-control w-full">
							<label class="label" for="mazhab">
								<span class="label-text font-medium">Metode Perhitungan (Mazhab)</span>
							</label>
							<select name="mazhab" class="select select-bordered w-full bg-base-200/50" bind:value={profile.mazhab}>
								<option value="shafi">Syafi'i (Standard)</option>
								<option value="hanafi">Hanafi</option>
							</select>
							<label class="label" for="">
								<span class="label-text-alt text-base-content/40">Mempengaruhi waktu Ashar</span>
							</label>
						</div>

						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-3">
									<div class="p-2 rounded-lg bg-base-200 text-base-content/60">
										<MapPin class="size-5" />
									</div>
									<div>
										<p class="font-medium">Deteksi Lokasi Otomatis</p>
										<p class="text-xs text-base-content/40">Untuk jadwal sholat akurat</p>
									</div>
								</div>
								<input type="hidden" name="locationMethod" value={location ? true : false} />
								<input type="hidden" name="longitude" value={longitude} />
								<input type="hidden" name="latitude" value={latitude} />
								<input 
									type="checkbox" 
									class="toggle toggle-secondary" 
									checked={location} 
									onclick={handleLocationToggle}
								/>
							</div>

							{#if location === false}
								<div class="form-control w-full" transition:fade>
									<label class="label" for="manualLocation">
										<span class="label-text font-medium">Kota Manual</span>
									</label>
									<Input name="manualLocation" placeholder="Masukkan nama kota..." bind:value={profile.location.city} class="bg-base-200/50" />
								</div>
							{/if}
						</div>
					</div>
				</Card>
			</div>

			<!-- Save Action -->
			<div class="sticky bottom-6 pt-4" in:fly={{ y: 20, duration: 800, delay: 200 }}>
				<Button 
					type="submit"
					variant="primary" 
					class="w-full gap-2 shadow-lg shadow-primary/20" 
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-sm"></span>
						Menyimpan...
					{:else}
						<Save class="size-4" />
						Simpan Perubahan
					{/if}
				</Button>
			</div>
		</form>
	</div>
</div>

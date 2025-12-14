<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { setLocale } from '$lib/paraglide/runtime';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Globe, MapPin, Moon, Smartphone, Save } from 'lucide-svelte';
	import { Button, Input } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	const profile = page.data.user;

	let isSaving = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	let location = $state(false);
	let longitude = $state<number | null>(null);
	let latitude = $state<number | null>(null);

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
					toast.add('Gagal mengambil lokasi otomatis.', 'error');
					location = false;
				}
			);
		}
	};

	onMount(() => {
		if (profile.location.method === 'auto') {
			location = profile.location.method;
			longitude = profile.location.lng;
			latitude = profile.location.lat;
		}
	});
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Header with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-linear-to-br from-accent/5 via-transparent to-primary/5 p-6"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-accent/10 blur-3xl animate-breathe"
			></div>

			<div class="relative z-10 flex items-center gap-4">
				<Button variant="ghost" circle size="sm" onclick={() => goto('/profile')}>
					<ArrowLeft class="size-5" />
				</Button>
				<div>
					<h1 class="text-2xl font-bold">Preferensi</h1>
					<p class="text-sm text-base-content/60">Sesuaikan pengalaman aplikasi Anda</p>
				</div>
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
					} else {
						toast.add('Failed to save settings.', 'error');
					}
					setTimeout(() => {
						setLocale(page.data.language);
					}, 500);
				};
			}}
			class="space-y-6"
		>
			<!-- General Settings -->
			<div
				class="glass-card space-y-6 rounded-2xl p-6"
				in:fly={{ y: 20, duration: 800, delay: 100 }}
			>
				<h3 class="flex items-center gap-2 text-lg font-bold">
					<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
						<Globe class="size-4 text-primary" />
					</div>
					Umum
				</h3>

				<div class="form-control w-full">
					<label class="label" for="language">
						<span class="label-text font-medium">Bahasa / Language</span>
					</label>
					<select
						name="language"
						class="select select-bordered w-full bg-base-200/50"
						bind:value={page.data.language}
					>
						<option value="id">Bahasa Indonesia</option>
						<option value="en">English</option>
					</select>
				</div>

				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-lg bg-base-200 p-2 text-base-content/60">
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

			<!-- Ibadah Settings -->
			<div
				class="glass-card space-y-6 rounded-2xl p-6"
				in:fly={{ y: 20, duration: 800, delay: 200 }}
			>
				<h3 class="flex items-center gap-2 text-lg font-bold">
					<div class="flex size-8 items-center justify-center rounded-lg bg-secondary/10">
						<Moon class="size-4 text-secondary" />
					</div>
					Pengaturan Ibadah
				</h3>

				<div class="form-control w-full">
					<label class="label" for="mazhab">
						<span class="label-text font-medium">Metode Perhitungan (Mazhab)</span>
					</label>
					<select
						name="mazhab"
						class="select select-bordered w-full bg-base-200/50"
						bind:value={profile.mazhab}
					>
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
							<div class="rounded-lg bg-base-200 p-2 text-base-content/60">
								<MapPin class="size-5" />
							</div>
							<div>
								<p class="font-medium">Deteksi Lokasi Otomatis</p>
								<p class="text-xs text-base-content/40">Untuk jadwal sholat akurat</p>
							</div>
						</div>
						<input type="hidden" name="locationMethod" value={location ? 'auto' : 'manual'} />
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
							<Input
								name="manualLocation"
								placeholder="Masukkan nama kota..."
								bind:value={profile.location.city}
								class="bg-base-200/50"
							/>
						</div>
					{/if}
				</div>
			</div>

			<!-- Save Action -->
			<div class="sticky bottom-6 pt-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
				<Button
					type="submit"
					variant="primary"
					class="w-full gap-2 rounded-2xl shadow-lg shadow-primary/20"
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

<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, Globe, MapPin, Moon, Smartphone, Save } from 'lucide-svelte';
	import { Card, Button, Input } from '$lib/components/ui';

	let settings = $state({
		mazhab: 'shafi',
		locationMethod: 'auto',
		manualLocation: 'Jakarta',
		language: 'id',
		dataSaver: false
	});

	let isSaving = $state(false);

	function handleSave() {
		isSaving = true;
		setTimeout(() => {
			isSaving = false;
			alert('Settings saved!');
		}, 1000);
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" href="/profile">
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Preferensi</h1>
				<p class="text-base-content/60 text-sm">Sesuaikan pengalaman aplikasi Anda</p>
			</div>
		</header>

		<!-- Content -->
		<div class="space-y-6" in:fly={{ y: 20, duration: 800, delay: 100 }}>
			<!-- General -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 space-y-6">
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Globe class="size-5 text-primary" />
						Umum
					</h3>
					
					<div class="form-control w-full">
						<label class="label">
							<span class="label-text font-medium">Bahasa / Language</span>
						</label>
						<select class="select select-bordered w-full bg-base-200/50" bind:value={settings.language}>
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
						<input type="checkbox" class="toggle toggle-primary" bind:checked={settings.dataSaver} />
					</div>
				</div>
			</Card>

			<!-- Ibadah Settings -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<div class="p-6 space-y-6">
					<h3 class="font-bold text-lg flex items-center gap-2">
						<Moon class="size-5 text-secondary" />
						Pengaturan Ibadah
					</h3>
					
					<div class="form-control w-full">
						<label class="label">
							<span class="label-text font-medium">Metode Perhitungan (Mazhab)</span>
						</label>
						<select class="select select-bordered w-full bg-base-200/50" bind:value={settings.mazhab}>
							<option value="shafi">Syafi'i (Standard)</option>
							<option value="hanafi">Hanafi</option>
						</select>
						<label class="label">
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
							<input 
								type="checkbox" 
								class="toggle toggle-secondary" 
								checked={settings.locationMethod === 'auto'} 
								onclick={() => settings.locationMethod = settings.locationMethod === 'auto' ? 'manual' : 'auto'}
							/>
						</div>

						{#if settings.locationMethod === 'manual'}
							<div class="form-control w-full" transition:fade>
								<label class="label">
									<span class="label-text font-medium">Kota Manual</span>
								</label>
								<Input placeholder="Masukkan nama kota..." bind:value={settings.manualLocation} class="bg-base-200/50" />
							</div>
						{/if}
					</div>
				</div>
			</Card>
		</div>

		<!-- Save Action -->
		<div class="sticky bottom-6 pt-4" in:fly={{ y: 20, duration: 800, delay: 200 }}>
			<Button 
				variant="primary" 
				class="w-full gap-2 shadow-lg shadow-primary/20" 
				onclick={handleSave}
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
	</div>
</div>

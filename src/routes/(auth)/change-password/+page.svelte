<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fly, scale } from 'svelte/transition';
	import { backOut, elasticOut } from 'svelte/easing';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { Lock, Eye, EyeOff, Check, X, ArrowRight, ShieldCheck } from 'lucide-svelte';
	import { Input, Button } from '$lib/components/ui';

	let { data } = $props();

	let newPassword = $state('');
	let confirmPassword = $state('');
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isLoading = $state(false);
	let isSuccess = $state(false);

	// Password strength calculation
	let passwordStrength = $derived(() => {
		let score = 0;
		if (newPassword.length >= 8) score++;
		if (newPassword.length >= 12) score++;
		if (/[A-Z]/.test(newPassword)) score++;
		if (/[a-z]/.test(newPassword)) score++;
		if (/[0-9]/.test(newPassword)) score++;
		if (/[^A-Za-z0-9]/.test(newPassword)) score++;
		return score;
	});

	let strengthLabel = $derived(() => {
		const score = passwordStrength();
		if (score <= 2) return { text: 'Lemah', color: 'bg-error', textColor: 'text-error' };
		if (score <= 4) return { text: 'Sedang', color: 'bg-warning', textColor: 'text-warning' };
		return { text: 'Kuat', color: 'bg-success', textColor: 'text-success' };
	});

	let passwordsMatch = $derived(newPassword === confirmPassword && confirmPassword.length > 0);
	let isValid = $derived(newPassword.length >= 8 && passwordsMatch);

	// Password requirements
	let requirements = $derived([
		{ label: 'Minimal 8 karakter', met: newPassword.length >= 8 },
		{ label: 'Huruf besar (A-Z)', met: /[A-Z]/.test(newPassword) },
		{ label: 'Huruf kecil (a-z)', met: /[a-z]/.test(newPassword) },
		{ label: 'Angka (0-9)', met: /[0-9]/.test(newPassword) },
		{ label: 'Karakter khusus (!@#$%)', met: /[^A-Za-z0-9]/.test(newPassword) }
	]);

	function fireConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#6EE7B7']
		});
	}
</script>

<svelte:head>
	<title>Ubah Password - Yaa Qeen</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-base-200">
	<div 
		class="w-full max-w-md"
		in:fly={{ y: 30, duration: 500, easing: backOut }}
	>
		<!-- Card -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body gap-6">
				<!-- Icon -->
				<div class="flex justify-center" in:scale={{ duration: 400, delay: 100, easing: elasticOut }}>
					<div class="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
						{#if isSuccess}
							<svg 
								class="w-10 h-10 text-primary-content" 
								fill="none" 
								viewBox="0 0 24 24" 
								stroke="currentColor"
								in:scale={{ duration: 300, easing: elasticOut }}
							>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							<Lock class="w-10 h-10 text-primary-content" />
						{/if}
					</div>
				</div>

				<!-- Header -->
				<div class="text-center space-y-2" in:fly={{ y: 15, duration: 400, delay: 150 }}>
					<h1 class="text-2xl font-bold">
						{isSuccess ? 'Password Diubah!' : 'Buat Password Baru'}
					</h1>
					<p class="text-base-content/60 text-sm">
						{#if isSuccess}
							Password Anda telah berhasil diperbarui
						{:else}
							Buat password baru yang kuat untuk akun Anda
						{/if}
					</p>
				</div>

				{#if !isSuccess}
					<!-- Password Form -->
					<form 
						method="POST"
						use:enhance={() => {
							isLoading = true;
							return async ({ result }) => {
								isLoading = false;
								if (result.type === 'success') {
									isSuccess = true;
									toast.add('Password berhasil diubah! 🎉', 'success', 3000);
									fireConfetti();
									setTimeout(() => {
										goto('/login');
									}, 2500);
								} else if (result.type === 'failure') {
									toast.add('Gagal mengubah password', 'error', 3000);
								}
							};
						}}
						class="space-y-6"
						in:fly={{ y: 15, duration: 400, delay: 200 }}
					>
						<!-- New Password -->
						<div class="form-control">
							<div class="relative">
								<Input
									label="Password Baru"
									id="new-password"
									type={showNewPassword ? 'text' : 'password'}
									name="password"
									bind:value={newPassword}
									placeholder="Masukkan password baru"
									disabled={isLoading}
									endIcon
								/>
								<button
									type="button"
									class="absolute right-3 top-[3.2rem] -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
									onclick={() => showNewPassword = !showNewPassword}
								>
									{#if showNewPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>

							<!-- Password Strength -->
							{#if newPassword.length > 0}
								<div class="mt-3 space-y-2" in:fly={{ y: -10, duration: 200 }}>
									<div class="flex items-center justify-between text-sm">
										<span class="text-base-content/60">Kekuatan Password</span>
										<span class={strengthLabel().textColor}>{strengthLabel().text}</span>
									</div>
									<div class="flex gap-1">
										{#each Array(6) as _, i}
											<div 
												class="h-1.5 flex-1 rounded-full transition-all duration-300 {i < passwordStrength() ? strengthLabel().color : 'bg-base-300'}"
											></div>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<!-- Confirm Password -->
						<div class="form-control">
							<div class="relative">
								<Input
									label="Konfirmasi Password"
									id="confirm-password"
									type={showConfirmPassword ? 'text' : 'password'}
									name="confirmPassword"
									bind:value={confirmPassword}
									placeholder="Ulangi password baru"
									error={confirmPassword.length > 0 && !passwordsMatch ? 'Password tidak cocok' : undefined}
									disabled={isLoading}
									endIcon
								/>
								<button
									type="button"
									class="absolute right-3 top-[3.2rem] -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
									onclick={() => showConfirmPassword = !showConfirmPassword}
								>
									{#if showConfirmPassword}
										<EyeOff class="w-5 h-5" />
									{:else}
										<Eye class="w-5 h-5" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Password Requirements -->
						<div class="bg-base-200 rounded-lg p-4 space-y-2" in:fly={{ y: 15, duration: 400, delay: 250 }}>
							<p class="text-sm font-medium text-base-content/80">Persyaratan Password:</p>
							<ul class="space-y-1">
								{#each requirements as req}
									<li class="flex items-center gap-2 text-sm transition-all duration-200">
										{#if req.met}
											<Check class="w-4 h-4 text-success" />
											<span class="text-success">{req.label}</span>
										{:else}
											<X class="w-4 h-4 text-base-content/40" />
											<span class="text-base-content/40">{req.label}</span>
										{/if}
									</li>
								{/each}
							</ul>
						</div>

						<!-- Submit Button -->
						<Button 
							type="submit" 
							variant="primary" 
							block 
							disabled={!isValid || isLoading}
							loading={isLoading}
						>
							{#if !isLoading}
								Simpan Password
								<ArrowRight class="w-4 h-4 ml-2" />
							{/if}
						</Button>
					</form>
				{:else}
					<!-- Success State -->
					<div 
						class="text-center py-4"
						in:scale={{ duration: 400, easing: elasticOut }}
					>
						<span class="loading loading-dots loading-md text-primary"></span>
						<p class="text-base-content/60 mt-2">Mengalihkan ke halaman login...</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Footer -->
		<p class="text-center text-base-content/50 text-xs mt-6" in:fly={{ y: 15, duration: 400, delay: 300 }}>
			&copy; {new Date().getFullYear()} Yaa Qeen. All rights reserved.
		</p>
	</div>
</div>

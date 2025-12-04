<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fly, scale } from 'svelte/transition';
	import { backOut, elasticOut } from 'svelte/easing';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';
	import { ShieldCheck, ArrowRight, Mail } from 'lucide-svelte';

	let { data } = $props();

	let otpInputs: HTMLInputElement[] = [];
	let otp = $state(['', '', '', '', '', '']);
	let isLoading = $state(false);
	let isResending = $state(false);
	let isSuccess = $state(false);
	let shake = $state(false);
	let countdown = $state(0);
	let canResend = $state(true);

	function handleInput(index: number, event: Event) {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		if (!/^\d*$/.test(value)) {
			target.value = otp[index];
			return;
		}

		otp[index] = value.slice(-1);

		if (value && index < 5) {
			otpInputs[index + 1]?.focus();
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace' && !otp[index] && index > 0) {
			otpInputs[index - 1]?.focus();
		}
		if (event.key === 'ArrowLeft' && index > 0) {
			otpInputs[index - 1]?.focus();
		}
		if (event.key === 'ArrowRight' && index < 5) {
			otpInputs[index + 1]?.focus();
		}
	}

	function handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		const pastedData = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) || '';
		
		for (let i = 0; i < 6; i++) {
			otp[i] = pastedData[i] || '';
		}
		
		const lastFilledIndex = pastedData.length - 1;
		otpInputs[Math.min(lastFilledIndex, 5)]?.focus();
	}

	function startResendCountdown() {
		canResend = false;
		countdown = 60;
		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				canResend = true;
			}
		}, 1000);
	}

	function triggerShake() {
		shake = true;
		setTimeout(() => shake = false, 500);
	}

	function fireConfetti() {
		const duration = 3000;
		const animationEnd = Date.now() + duration;
		const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

		function randomInRange(min: number, max: number) {
			return Math.random() * (max - min) + min;
		}

		const interval = setInterval(function() {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);
			
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
				colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#ffffff']
			});
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
				colors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#ffffff']
			});
		}, 250);
	}
</script>

<svelte:head>
	<title>Verifikasi OTP - Yaa Qeen</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-base-200">
	<div 
		class="w-full max-w-md"
		in:fly={{ y: 30, duration: 500, easing: backOut }}
	>
		<!-- Card -->
		<div 
			class="card bg-base-100 shadow-xl"
			class:animate-shake={shake}
		>
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
							<ShieldCheck class="w-10 h-10 text-primary-content" />
						{/if}
					</div>
				</div>

				<!-- Header -->
				<div class="text-center space-y-2" in:fly={{ y: 15, duration: 400, delay: 150 }}>
					<h1 class="text-2xl font-bold">
						{isSuccess ? 'Verifikasi Berhasil!' : 'Verifikasi OTP'}
					</h1>
					<p class="text-base-content/60 text-sm">
						{#if isSuccess}
							Selamat datang kembali di Yaa Qeen
						{:else}
							<span class="inline-flex items-center gap-2">
								<Mail class="w-4 h-4" />
								Kode dikirim ke {data.email}
							</span>
						{/if}
					</p>
				</div>

				{#if !isSuccess}
					<!-- OTP Form -->
					<form 
						method="POST"
                        action="?/confirm"
						use:enhance={() => {
							isLoading = true;
							return async ({ result }) => {
								isLoading = false;
								if (result.type === 'success') {
									isSuccess = true;
									toast.add('Verifikasi berhasil! 🎉', 'success', 3000);
									fireConfetti();
									setTimeout(() => {
										goto('/change-password');
									}, 2500);
								} else if (result.type === 'failure') {
									toast.add('Kode OTP tidak valid', 'error', 3000);
									triggerShake();
									otp = ['', '', '', '', '', ''];
									otpInputs[0]?.focus();
								}
							};
						}}
						class="space-y-6"
						in:fly={{ y: 15, duration: 400, delay: 200 }}
					>
						<!-- OTP Inputs -->
						<div class="flex justify-center gap-2">
							{#each otp as digit, i}
								<input
									type="text"
									inputmode="numeric"
									maxlength="1"
									name="otp-{i}"
									bind:this={otpInputs[i]}
									bind:value={otp[i]}
									oninput={(e) => handleInput(i, e)}
									onkeydown={(e) => handleKeydown(i, e)}
									onpaste={handlePaste}
									disabled={isLoading}
									class="input input-bordered w-12 h-14 text-center text-xl font-bold 
										   focus:input-primary transition-all duration-200"
									in:scale={{ duration: 250, delay: 50 * i, easing: backOut }}
								/>
							{/each}
						</div>

						<input type="hidden" name="otp" value={otp.join('')} />

						<!-- Submit Button -->
						<button 
							type="submit" 
							class="btn btn-primary w-full gap-2"
							disabled={otp.some(d => !d) || isLoading}
						>
							{#if isLoading}
								<span class="loading loading-spinner loading-sm"></span>
								Memverifikasi...
							{:else}
								Verifikasi
								<ArrowRight class="w-4 h-4" />
							{/if}
						</button>
					</form>

					<!-- Resend Code Form -->
					<form 
						method="POST" 
						action="?/resend"
						use:enhance={() => {
							isResending = true;
							return async ({ result }) => {
								isResending = false;
								if (result.type === 'success') {
									toast.add('Kode OTP baru telah dikirim ke email Anda', 'success', 3000);
									startResendCountdown();
								} else if (result.type === 'failure') {
									toast.add('Gagal mengirim ulang kode', 'error', 3000);
								}
							};
						}}
						class="text-center"
					>
						<span class="text-base-content/60 text-sm">Tidak menerima kode? </span>
						<button 
							type="submit" 
							class="link link-primary text-sm"
							disabled={!canResend || isResending}
						>
							{#if isResending}
								<span class="loading loading-spinner loading-xs"></span>
							{:else if canResend}
								Kirim Ulang
							{:else}
								Tunggu {countdown}s
							{/if}
						</button>
					</form>
				{:else}
					<!-- Success State -->
					<div 
						class="text-center py-4"
						in:scale={{ duration: 400, easing: elasticOut }}
					>
						<span class="loading loading-dots loading-md text-primary"></span>
						<p class="text-base-content/60 mt-2">Mengalihkan ke dashboard...</p>
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

<style>
	@keyframes shake {
		0%, 100% { transform: translateX(0); }
		20%, 60% { transform: translateX(-6px); }
		40%, 80% { transform: translateX(6px); }
	}
	
	.animate-shake {
		animation: shake 0.4s ease-in-out;
	}
</style>

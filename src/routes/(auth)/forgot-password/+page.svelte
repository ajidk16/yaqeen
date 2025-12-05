<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-svelte';
	import { Input, Button, Alert } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props<{ form: ActionData }>();

	let email = $state('');
	let isLoading = $state(false);

	let error = $derived(form?.error || null);
	let success = $derived(form?.success || null);

	const features = $derived([
		m.forgotPasswordFeatureEncryption(),
		m.forgotPasswordFeatureDataProtection(),
		m.forgotPasswordFeatureSecureAccess(),
		m.forgotPasswordFeatureFastRecovery()
	]);
</script>

<div class="min-h-screen w-full grid lg:grid-cols-2">
	<!-- Left Side: Form -->
	<div
		class="flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 bg-base-100 relative overflow-hidden"
	>
		<!-- Mobile Background Decoration -->
		<div
			class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 lg:hidden"
		>
			<div
				class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px] animate-pulse"
			></div>
			<div
				class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] animate-pulse delay-700"
			></div>
		</div>

		<div class="w-full max-w-md z-10 space-y-8" in:fly={{ y: 20, duration: 800, easing: quintOut }}>
			<div class="text-center lg:text-left">
				<a
					href="/login"
					class="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors mb-8 group"
				>
					<ArrowLeft class="size-4 group-hover:-translate-x-1 transition-transform" />
					{m.forgotPasswordBackToLogin()}
				</a>

				<div
					class="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-6"
				>
					<KeyRound class="size-6" />
				</div>
				<h1 class="text-3xl font-bold tracking-tight">{m.forgotPasswordTitle()}</h1>
				<p class="text-base-content/60 mt-2">{m.forgotPasswordSubtitle()}</p>
			</div>

			{#if error}
				<div in:fade>
					<Alert variant="error" title={m.forgotPasswordErrorTitle()}>
						{error}
					</Alert>
				</div>
			{/if}

			{#if success}
				<div in:fade>
					<Alert variant="success" title={m.forgotPasswordSuccessTitle()}>
						{success}
					</Alert>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ result, update }) => {
						isLoading = false;
						await update();
						goto('/verify');
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-4">
					<Input
						label={m.forgotPasswordEmailLabel()}
						type="email"
						name="email"
						placeholder={m.forgotPasswordEmailPlaceholder()}
						bind:value={email}
						startIcon={Mail}
						required
						class="bg-base-200/50 focus:bg-base-100"
					/>
				</div>

				<Button
					type="submit"
					variant="primary"
					block
					size="lg"
					loading={isLoading}
					class="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
				>
					{m.forgotPasswordSubmit()}
				</Button>
			</form>
		</div>
	</div>

	<!-- Right Side: Decorative -->
	<div
		class="hidden lg:flex relative flex-col justify-center items-center bg-base-200 text-base-content p-12 overflow-hidden"
	>
		<div
			class="absolute inset-0 w-full h-full bg-linear-to-br from-primary/10 to-secondary/10 z-0"
		></div>
		<div
			class="absolute -top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] animate-pulse"
		></div>
		<div
			class="absolute -bottom-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-secondary/10 blur-[120px] animate-pulse delay-1000"
		></div>

		<div
			class="relative z-10 max-w-lg text-center space-y-8"
			in:fly={{ x: 20, duration: 1000, delay: 200, easing: quintOut }}
		>
			<div class="relative">
				<div
					class="w-64 h-64 mx-auto bg-linear-to-tr from-primary to-secondary rounded-3xl -rotate-3 shadow-2xl flex items-center justify-center mb-12 group transition-transform hover:rotate-0 duration-500"
				>
					<div
						class="w-[98%] h-[98%] bg-base-100 rounded-[22px] flex items-center justify-center overflow-hidden relative"
					>
						<div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
						<KeyRound
							class="size-24 text-primary group-hover:scale-110 transition-transform duration-500"
						/>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<h2 class="text-4xl font-bold tracking-tight">{m.forgotPasswordBrandTitle()}</h2>
				<p class="text-lg text-base-content/70">{m.forgotPasswordBrandDescription()}</p>
			</div>

			<div class="grid grid-cols-2 gap-4 text-left pt-8">
				{#each features as feature}
					<div
						class="flex items-center gap-2 bg-base-100/50 backdrop-blur-sm p-3 rounded-lg border border-base-content/5"
					>
						<CheckCircle2 class="size-5 text-primary" />
						<span class="font-medium text-sm">{feature}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

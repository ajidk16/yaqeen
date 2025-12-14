<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { User, Mail, Lock, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-svelte';
	import { Card, Input, Button, Checkbox, Alert, RadioGroup } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { form } = $props<{ form: ActionData }>();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let gender = $state('male');
	let agreeTerms = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let isLoading = $state(false);

	let error = $derived(form?.message || null);

	const features = $derived([
		m.registerFeatureCommunity(),
		m.registerFeatureExpertTips(),
		m.registerFeatureChallenges(),
		m.registerFeatureSync()
	]);

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

<div class="min-h-screen w-full grid lg:grid-cols-2">
	<!-- Left Side: Register Form -->
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
				<div
					class="inline-flex items-center justify-center size-12 rounded-xl bg-secondary/10 text-secondary mb-6 lg:mb-8"
				>
					<UserPlus class="size-6" />
				</div>
				<h1 class="text-3xl font-bold tracking-tight">{m.registerTitle()}</h1>
				<p class="text-base-content/60 mt-2">{m.registerSubtitle()}</p>
			</div>

			{#if error}
				<div in:fade>
					<Alert variant="error" title={m.registerErrorTitle()}>
						{error}
					</Alert>
				</div>
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					isLoading = true;
					return async ({ update }) => {
						isLoading = false;
						update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-4">
					<Input
						label={m.registerNameLabel()}
						type="text"
						name="name"
						placeholder={m.registerNamePlaceholder()}
						bind:value={name}
						startIcon={User}
						required
						class="bg-base-200/50 focus:bg-base-100"
					/>

					<Input
						label={m.registerEmailLabel()}
						type="email"
						name="email"
						placeholder={m.registerEmailPlaceholder()}
						bind:value={email}
						startIcon={Mail}
						required
						class="bg-base-200/50 focus:bg-base-100"
					/>

					<div class="relative">
						<Input
							label={m.registerPasswordLabel()}
							type={showPassword ? 'text' : 'password'}
							placeholder={m.registerPasswordPlaceholder()}
							name="password"
							bind:value={password}
							startIcon={Lock}
							endIcon={showPassword ? EyeOff : Eye}
							onendIconClick={togglePasswordVisibility}
							required
							class="bg-base-200/50 focus:bg-base-100"
						/>
					</div>

					<div class="relative">
						<Input
							label={m.registerConfirmPasswordLabel()}
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder={m.registerPasswordPlaceholder()}
							bind:value={confirmPassword}
							name="confirmPassword"
							startIcon={Lock}
							endIcon={showConfirmPassword ? EyeOff : Eye}
							onendIconClick={toggleConfirmPasswordVisibility}
							required
							class="bg-base-200/50 focus:bg-base-100"
						/>
					</div>

					<RadioGroup
						label="Gender"
						name="gender"
						bind:value={gender}
						options={[
							{ value: 'male', label: 'Male' },
							{ value: 'female', label: 'Female' }
						]}
						direction="row"
					/>
				</div>

				<div class="flex items-start">
					<Checkbox label={m.registerAgreeTerms()} bind:checked={agreeTerms} required />
				</div>

				<Button
					type="submit"
					variant="secondary"
					block
					size="lg"
					loading={isLoading}
					class="shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all duration-300"
				>
					{m.registerSubmit()}
				</Button>
			</form>

			<div class="text-center text-sm text-base-content/60">
				{m.registerHasAccount()}
				<a href="/login" class="link link-secondary link-hover font-medium ml-1">
					{m.registerLoginLink()}
				</a>
			</div>
		</div>
	</div>

	<!-- Right Side: Decorative/Branding -->
	<div
		class="hidden lg:flex relative flex-col justify-center items-center bg-base-200 text-base-content p-12 overflow-hidden"
	>
		<div
			class="absolute inset-0 w-full h-full bg-linear-to-bl from-secondary/10 to-primary/10 z-0"
		></div>
		<div
			class="absolute -top-[20%] -left-[20%] w-[80%] h-[80%] rounded-full bg-secondary/10 blur-[120px] animate-pulse"
		></div>
		<div
			class="absolute -bottom-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-primary/10 blur-[120px] animate-pulse delay-1000"
		></div>

		<div
			class="relative z-10 max-w-lg text-center space-y-8"
			in:fly={{ x: -20, duration: 1000, delay: 200, easing: quintOut }}
		>
			<div class="relative">
				<div
					class="w-64 h-64 mx-auto bg-linear-to-tl from-secondary to-primary rounded-3xl -rotate-3 shadow-2xl flex items-center justify-center mb-12 group transition-transform hover:-rotate-6 duration-500"
				>
					<div
						class="w-[98%] h-[98%] bg-base-100 rounded-[22px] flex items-center justify-center overflow-hidden relative"
					>
						<div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
						<UserPlus
							class="size-24 text-secondary group-hover:scale-110 transition-transform duration-500"
						/>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<h2 class="text-4xl font-bold tracking-tight">{m.registerBrandTitle()}</h2>
				<p class="text-lg text-base-content/70">{m.registerBrandDescription()}</p>
			</div>

			<div class="grid grid-cols-2 gap-4 text-left pt-8">
				{#each features as feature}
					<div
						class="flex items-center gap-2 bg-base-100/50 backdrop-blur-sm p-3 rounded-lg border border-base-content/5"
					>
						<CheckCircle2 class="size-5 text-secondary" />
						<span class="font-medium text-sm">{feature}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

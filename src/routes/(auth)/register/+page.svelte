<script>
	import { ArrowRight, Loader2 } from 'lucide-svelte';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let { form } = $props();
	
	let name = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	const handleRegister = async (e) => {
		e.preventDefault();
		loading = true;
		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name,
			callbackURL: '/dashboard'
		});
		loading = false;
		if (error) {
			alert(error.message); // Ideally use a toast notification
		} else {
			goto('/dashboard');
		}
	};
</script>

<div class="text-center animate-fade-in-up">
	<h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
	<p class="mt-2 text-sm text-slate-600">
		Already have an account? <a href="/login" class="font-medium text-primary hover:text-primary-600 transition-colors">Sign in</a>
	</p>
</div>

<form class="mt-8 space-y-6 animate-fade-in-up" style="animation-delay: 0.1s;" onsubmit={handleRegister}>
	<div class="space-y-4">
		<div>
			<label for="name" class="sr-only">Full Name</label>
			<input id="name" name="name" type="text" autocomplete="name" required bind:value={name} class="block w-full rounded-xl border-0 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all" placeholder="Full Name" />
		</div>
		<div>
			<label for="email-address" class="sr-only">Email address</label>
			<input id="email-address" name="email" type="email" autocomplete="email" required bind:value={email} class="block w-full rounded-xl border-0 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all" placeholder="Email address" />
		</div>
		<div>
			<label for="password" class="sr-only">Password</label>
			<input id="password" name="password" type="password" autocomplete="new-password" required bind:value={password} class="block w-full rounded-xl border-0 py-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all" placeholder="Password" />
		</div>
	</div>

	<div>
		<button type="submit" disabled={loading} class="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-primary px-3 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-600 hover:scale-[1.02] hover:shadow-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed">
			{#if loading}
				<Loader2 size={18} class="animate-spin" />
			{:else}
				Sign up <ArrowRight size={18} class="transition-transform group-hover:translate-x-1" />
			{/if}
		</button>
	</div>
</form>

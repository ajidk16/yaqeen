<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input, Alert } from '$lib/components/ui';
	import AuthLayout from '../AuthLayout.svelte';
	import { ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
	let notification = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Auto-dismiss notification
	$effect(() => {
		if (notification) {
			const timer = setTimeout(() => {
				notification = null;
			}, 5000);
			return () => clearTimeout(timer);
		}
	});

	// Handle form prop updates (from verify action)
	$effect(() => {
		if (form?.message) {
			// Check if it's a success or failure
			// Verify action returns fail(400) or redirect. If fail, form.message is error.
			// If redirect, we don't see it here usually.
			// But if we want to show standardized alert:
			// We'll rely on the template block below for form.message as before, or consolidate.
		}
	});
</script>

<AuthLayout>
	<div class="card bg-base-100 shadow-xl border border-base-200">
		<div class="card-body items-center text-center p-8">
			<div class="mb-6 relative">
				<div
					class="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-2 mx-auto"
				>
					<ShieldCheck size={32} />
				</div>
			</div>

			<h2 class="card-title text-2xl font-bold mb-2">Masukkan Kode Verifikasi</h2>
			<p class="text-base-content/60 mb-8 max-w-xs">
				Kami telah mengirimkan kode 6 digit ke email Anda. Masukkan kode tersebut di bawah ini.
			</p>

			{#if notification}
				<div class="w-full mb-4 text-left">
					<Alert
						variant={notification.type === 'success' ? 'success' : 'error'}
						title={notification.type === 'success' ? 'Berhasil' : 'Gagal'}
					>
						<div class="flex gap-2">
							{#if notification.type === 'success'}
								<CheckCircle2 size={18} />
							{:else}
								<AlertCircle size={18} />
							{/if}
							{notification.message}
						</div>
					</Alert>
				</div>
			{/if}

			{#if form?.message && !notification}
				<div role="alert" class="alert alert-error mb-4 text-sm py-2">
					<span>{form.message}</span>
				</div>
			{/if}

			<form
				method="POST"
				action="?/verify"
				use:enhance={() => {
					loading = true;
					notification = null;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="w-full space-y-4"
			>
				<div class="form-control w-full">
					<Input
						name="code"
						type="text"
						placeholder="123456"
						class="text-center text-2xl tracking-[0.5em] font-mono h-14"
						maxlength={6}
						required
						autocomplete="one-time-code"
					/>
				</div>

				<div class="form-control w-full">
					<Button type="submit" variant="primary" class="w-full gap-2" {loading} disabled={loading}>
						{#if loading}
							<Loader2 class="animate-spin" size={18} />
						{:else}
							Verifikasi
						{/if}
					</Button>
				</div>
			</form>

			<div class="mt-6 flex flex-col gap-2 items-center">
				<p class="text-sm text-base-content/60">Tidak menerima kode?</p>
				<form
					method="POST"
					action="/email-send?noredirect=true"
					use:enhance={() => {
						loading = true;
						notification = null;
						return async ({ result }) => {
							loading = false;
							if (result.type === 'success' || result.type === 'failure') {
								// @ts-ignore
								const msg = result.data?.message;
								if (result.type === 'success') {
									notification = { type: 'success', message: msg || 'Email berhasil dikirim' };
								} else {
									notification = { type: 'error', message: msg || 'Gagal mengirim email' };
								}
							} else if (result.type === 'error') {
								notification = {
									type: 'error',
									message: result.error?.message || 'Terjadi kesalahan sistem.'
								};
							}
						};
					}}
				>
					<Button
						variant="link"
						size="sm"
						class="text-primary p-0 h-auto font-normal hover:no-underline"
					>
						Kirim Ulang Kode
					</Button>
				</form>
			</div>
		</div>
	</div>
</AuthLayout>

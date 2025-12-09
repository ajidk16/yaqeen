<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui';
	import AuthLayout from '../AuthLayout.svelte';
	import { Mail, ArrowRight, ShieldCheck } from 'lucide-svelte';

	let loading = $state(false);
</script>

<AuthLayout>
	<div class="card bg-base-100 shadow-xl border border-base-200">
		<div class="card-body items-center text-center p-8">
			<div class="mb-6 relative">
				<div
					class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 mx-auto"
				>
					<Mail size={32} />
				</div>
				<div class="absolute -bottom-1 -right-1 bg-base-100 rounded-full p-1">
					<ShieldCheck size={20} class="text-success" />
				</div>
			</div>

			<h2 class="card-title text-2xl font-bold mb-2">Verifikasi Email Anda</h2>
			<p class="text-base-content/60 mb-8 max-w-xs">
				Untuk menjaga keamanan akun Anda, kami perlu memverifikasi alamat email Anda sebelum
				melanjutkan.
			</p>

			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
				class="w-full"
			>
				<div class="form-control w-full">
					<Button
						type="submit"
						variant="primary"
						class="w-full gap-2 group"
						{loading}
						disabled={loading}
					>
						{#if !loading}
							Kirim Kode Verifikasi
							<ArrowRight size={18} class="group-hover:translate-x-1 transition-transform" />
						{/if}
					</Button>
				</div>
			</form>

			<div class="mt-6 text-sm text-base-content/40">
				<p>Tidak melihat email? Cek folder spam Anda.</p>
			</div>
		</div>
	</div>
</AuthLayout>

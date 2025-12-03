<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { toast } from '$lib/stores/toast';
	import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-svelte';

	const icons = {
		success: CheckCircle,
		error: AlertCircle,
		info: Info,
		warning: AlertTriangle
	};

	const colors = {
		success: 'alert-success',
		error: 'alert-error',
		info: 'alert-info',
		warning: 'alert-warning'
	};
</script>

<div class="toast toast-top toast-center z-50 w-full max-w-md p-4 space-y-2 pointer-events-none">
	{#each $toast as t (t.id)}
		<div
			animate:flip={{ duration: 300 }}
			in:fly={{ y: -20, duration: 300 }}
			out:fly={{ y: -20, duration: 300 }}
			class="alert {colors[t.type]} shadow-lg flex items-start gap-3 pointer-events-auto"
		>
			<svelte:component this={icons[t.type]} class="size-5 mt-0.5 shrink-0" />
			<div class="flex-1">
				<span class="font-medium">{t.message}</span>
			</div>
			<button class="btn btn-ghost btn-xs btn-circle" onclick={() => toast.remove(t.id)}>
				<X class="size-4" />
			</button>
		</div>
	{/each}
</div>

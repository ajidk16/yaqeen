<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		containerClass?: string;
	}

	let {
		label,
		error,
		checked = $bindable(),
		class: className,
		containerClass = '',
		...rest
	}: Props = $props();
</script>

<div class="form-control {containerClass}">
	<label class="label cursor-pointer justify-start gap-3">
		<input
			type="checkbox"
			class="toggle toggle-primary {error ? 'toggle-error' : ''} {className}"
			bind:checked
			{...rest}
		/>
		{#if label}
			<span class="label-text font-medium">{label}</span>
		{/if}
	</label>
	{#if error}
		<label class="label" for={rest.id}>
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>

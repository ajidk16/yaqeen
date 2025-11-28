<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		label?: string;
		error?: string;
		helperText?: string;
		containerClass?: string;
	}

	let {
		label,
		error,
		helperText,
		value = $bindable(),
		class: className,
		containerClass = '',
		...rest
	}: Props = $props();
</script>

<div class="form-control w-full {containerClass}">
	{#if label}
		<label class="label" for={rest.id}>
			<span class="label-text font-medium">{label}</span>
		</label>
	{/if}
	<textarea
		class="textarea textarea-bordered w-full h-24 transition-all focus:textarea-primary {error ? 'textarea-error' : ''} {className}"
		bind:value
		{...rest}
	></textarea>
	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{:else if helperText}
		<label class="label">
			<span class="label-text-alt text-base-content/60">{helperText}</span>
		</label>
	{/if}
</div>

<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Option {
		value: string | number;
		label: string;
		disabled?: boolean;
	}

	interface Props extends HTMLSelectAttributes {
		label?: string;
		error?: string;
		helperText?: string;
		containerClass?: string;
		options?: Option[];
		placeholder?: string;
	}

	let {
		label,
		error,
		helperText,
		value = $bindable(),
		class: className,
		containerClass = '',
		options = [],
		placeholder = 'Select an option',
		children,
		...rest
	}: Props = $props();
</script>

<div class="form-control w-full {containerClass}">
	{#if label}
		<label class="label" for={rest.id}>
			<span class="label-text font-medium">{label}</span>
		</label>
	{/if}
	<select
		class="select select-bordered w-full transition-all focus:select-primary {error ? 'select-error' : ''} {className}"
		bind:value
		{...rest}
	>
		{#if placeholder}
			<option value="" disabled selected>{placeholder}</option>
		{/if}
		{#if options.length > 0}
			{#each options as option}
				<option value={option.value} disabled={option.disabled}>
					{option.label}
				</option>
			{/each}
		{:else}
			{@render children?.()}
		{/if}
	</select>
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

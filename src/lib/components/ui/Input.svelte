<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		helperText?: string;
		containerClass?: string;
		startIcon?: any; // Component type or snippet
		endIcon?: any;
		onendIconClick?: () => void;
	}

	let {
		label,
		error,
		helperText,
		value = $bindable(),
		class: className,
		containerClass = '',
		startIcon,
		endIcon,
		onendIconClick,
		...rest
	}: Props = $props();
</script>

<div class="form-control w-full {containerClass}">
	{#if label}
		<label class="label" for={rest.id}>
			<span class="label-text font-medium">{label}</span>
		</label>
	{/if}
	
	<div class="relative">
		{#if startIcon}
			<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10 text-base-content/50">
				<!-- svelte-ignore svelte_component_deprecated -->
				<svelte:component this={startIcon} class="size-5" />
			</div>
		{/if}

		<input
			class="input input-bordered w-full transition-all focus:input-primary 
			{error ? 'input-error' : ''} 
			{startIcon ? 'pl-10' : ''} 
			{endIcon ? 'pr-10' : ''} 
			{className}"
			bind:value
			{...rest}
		/>

		{#if endIcon}
			<button type="button" class="absolute right-0 pr-3 flex items-center inset-y-0 z-10 cursor-pointer text-base-content/50 hover:text-base-content transition-colors" onclick={onendIconClick}>
				<!-- svelte-ignore svelte_component_deprecated -->
				<svelte:component this={endIcon} class="size-5" />
			</button>
		{/if}
	</div>

	{#if error}
		<label class="label" for="{rest.id}">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{:else if helperText}
		<label class="label" for="{rest.id}">
			<span class="label-text-alt text-base-content/60">{helperText}</span>
		</label>
	{/if}
</div>

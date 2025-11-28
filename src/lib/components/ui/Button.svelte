<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'neutral';
		size?: 'lg' | 'md' | 'sm' | 'xs';
		outline?: boolean;
		active?: boolean;
		disabled?: boolean;
		glass?: boolean;
		loading?: boolean;
		noAnimation?: boolean;
		wide?: boolean;
		block?: boolean;
		circle?: boolean;
		square?: boolean;
		children?: Snippet;
	}

	let {
		variant,
		size,
		outline,
		active,
		disabled,
		glass,
		loading,
		noAnimation,
		wide,
		block,
		circle,
		square,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<button
	class="btn
	{variant ? `btn-${variant}` : ''}
	{size ? `btn-${size}` : ''}
	{outline ? 'btn-outline' : ''}
	{active ? 'btn-active' : ''}
	{glass ? 'glass' : ''}
	{noAnimation ? 'no-animation' : ''}
	{wide ? 'btn-wide' : ''}
	{block ? 'btn-block' : ''}
	{circle ? 'btn-circle' : ''}
	{square ? 'btn-square' : ''}
	{className}"
	{disabled}
	{...rest}
>
	{#if loading}
		<span class="loading loading-spinner"></span>
	{/if}
	{@render children?.()}
</button>

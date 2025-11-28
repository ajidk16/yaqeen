<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
		outline?: boolean;
		size?: 'lg' | 'md' | 'sm' | 'xs';
		class?: string;
		children?: Snippet;
	}

	let {
		variant,
		outline,
		size,
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class="badge
	{variant ? `badge-${variant}` : ''}
	{outline ? 'badge-outline' : ''}
	{size ? `badge-${size}` : ''}
	{className}"
>
	{@render children?.()}
</div>

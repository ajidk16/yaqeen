<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		tip: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		variant?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error';
		open?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		tip,
		position,
		variant,
		open,
		class: className = '',
		children
	}: Props = $props();
</script>

<div
	class="tooltip
	{position ? `tooltip-${position}` : ''}
	{variant ? `tooltip-${variant}` : ''}
	{open ? 'tooltip-open' : ''}
	{className}"
	data-tip={tip}
>
	{@render children?.()}
</div>

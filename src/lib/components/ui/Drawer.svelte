<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		open?: boolean;
		side?: 'left' | 'right';
		class?: string;
		content?: Snippet;
		sidebar?: Snippet;
	}

	let {
		id = 'drawer-' + Math.random().toString(36).substr(2, 9),
		open = $bindable(false),
		side = 'left',
		class: className = '',
		content,
		sidebar
	}: Props = $props();
</script>

<div class="drawer {side === 'right' ? 'drawer-end' : ''} {className}">
	<input {id} type="checkbox" class="drawer-toggle" bind:checked={open} />
	<div class="drawer-content">
		{@render content?.()}
	</div>
	<div class="drawer-side z-50">
		<label for={id} aria-label="close sidebar" class="drawer-overlay"></label>
		<div class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
			{@render sidebar?.()}
		</div>
	</div>
</div>

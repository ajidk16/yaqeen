<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		bordered?: boolean;
		compact?: boolean;
		glass?: boolean;
		imageFull?: boolean;
		class?: string;
		children?: Snippet;
		figure?: Snippet;
		actions?: Snippet;
	}

	let {
		title,
		bordered = true,
		compact = false,
		glass = false,
		imageFull = false,
		class: className = '',
		children,
		figure,
		actions,
	}: Props = $props();
</script>

<div
	class="card bg-base-100 w-full shadow-sm transition-all duration-300
	{bordered ? 'card-bordered' : ''}
	{compact ? 'card-compact' : ''}
	{glass ? 'glass' : ''}
	{imageFull ? 'image-full' : ''}
	{className}"
>
	{#if figure}
		<figure>{@render figure()}</figure>
	{/if}

	<div class="card-body">
		{#if title}
			<h2 class="card-title">{title}</h2>
		{/if}

		{@render children?.()}

		{#if actions}
			<div class="card-actions justify-end">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		bordered?: boolean;
		compact?: boolean;
		glass?: boolean;
		imageFull?: boolean;
		hover?: boolean;
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
		hover,
		class: className = '',
		children,
		figure,
		actions,
		...rest // Added rest props for forwarding to the div
	}: Props = $props();
</script>

<div
	class="card bg-base-100 shadow-sm
	{bordered ? 'card-bordered' : ''}
	{compact ? 'card-compact' : ''}
	{glass ? 'glass border-white/20 shadow-xl backdrop-blur-md' : ''}
	{imageFull ? 'image-full' : ''}
	{hover ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : ''}
	{className}"
	{...rest}
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

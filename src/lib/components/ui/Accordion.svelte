<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		group?: string;
		open?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		title,
		group,
		open = $bindable(false),
		class: className = '',
		children
	}: Props = $props();
</script>

<div class="collapse collapse-arrow bg-base-200 {className}">
	{#if group}
		<input type="radio" name={group} checked={open} />
	{:else}
		<input type="checkbox" bind:checked={open} />
	{/if}
	<div class="collapse-title text-xl font-medium">
		{title}
	</div>
	<div class="collapse-content">
		{@render children?.()}
	</div>
</div>

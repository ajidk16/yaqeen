<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string; // Optional label for the button
		open?: boolean;
		hover?: boolean;
		end?: boolean;
		top?: boolean;
		bottom?: boolean;
		left?: boolean;
		right?: boolean;
		class?: string;
		trigger?: Snippet; // Custom trigger element
		children?: Snippet; // Dropdown content
	}

	let {
		label,
		open = false,
		hover = false,
		end = false,
		top = false,
		bottom = true,
		left = false,
		right = false,
		class: className = '',
		trigger,
		children
	}: Props = $props();
</script>

<div
	class="dropdown
	{open ? 'dropdown-open' : ''}
	{hover ? 'dropdown-hover' : ''}
	{end ? 'dropdown-end' : ''}
	{top ? 'dropdown-top' : ''}
	{bottom ? 'dropdown-bottom' : ''}
	{left ? 'dropdown-left' : ''}
	{right ? 'dropdown-right' : ''}
	{className}"
>
	{#if trigger}
		<div tabindex="0" role="button" class="m-1">
			{@render trigger()}
		</div>
	{:else}
		<div tabindex="0" role="button" class="btn m-1">{label ?? 'Dropdown'}</div>
	{/if}
	
	<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
		{@render children?.()}
	</ul>
</div>

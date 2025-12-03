<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title?: string;
		class?: string;
		children?: Snippet;
		actions?: Snippet;
		closeOnClickOutside?: boolean;
	}

	let {
		open = $bindable(false),
		title,
		class: className = '',
		children,
		actions,
		closeOnClickOutside = true
	}: Props = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open && dialog && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog && dialog.open) {
			dialog.close();
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialog}
	class="modal {className}"
	onclose={() => (open = false)}
	onclick={(e) => {
		if (closeOnClickOutside && e.target === dialog) open = false;
	}}
>
	<div class="modal-box">
		{#if title}
			<h3 class="font-bold text-lg mb-4">{title}</h3>
		{/if}

		{@render children?.()}

		<div class="modal-action">
			{#if actions}
				{@render actions()}
			<!-- {:else}
				<form method="dialog">
					<button class="btn" onclick={() => (open = false)}>Close</button>
				</form> -->
			{/if}
		</div>
	</div>
	{#if closeOnClickOutside}
		<form method="dialog" class="modal-backdrop">
			<button onclick={() => (open = false)}>close</button>
		</form>
	{/if}
</dialog>

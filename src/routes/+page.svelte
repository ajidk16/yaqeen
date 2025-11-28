<script lang="ts">
	import { Card, Modal, Drawer, Accordion, Input, Select, Checkbox, Toggle, RadioGroup, Textarea } from '$lib/components/ui';
	
	let modalOpen = $state(false);
	let drawerOpen = $state(false);
</script>

<div class="p-8 space-y-12 max-w-4xl mx-auto">
	<section>
		<h1 class="text-3xl font-bold mb-6">Structural Components Demo</h1>
		<p class="mb-4">A showcase of the structural components built with daisyUI and Svelte 5.</p>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Cards</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card title="Basic Card">
				<p>This is a basic card with some content.</p>
				{#snippet actions()}
					<button class="btn btn-primary">Action</button>
				{/snippet}
			</Card>

			<Card title="Glass Card" glass>
				<p>This card has a glass effect (visible on colorful backgrounds).</p>
				{#snippet actions()}
					<button class="btn btn-secondary">Glass Action</button>
				{/snippet}
			</Card>

			<Card title="Image Full" imageFull>
				{#snippet figure()}
					<img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" />
				{/snippet}
				<p>If a dog chews shoes whose shoes does he choose?</p>
				{#snippet actions()}
					<button class="btn btn-primary">Buy Now</button>
				{/snippet}
			</Card>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Modal</h2>
		<button class="btn btn-primary" onclick={() => modalOpen = true}>Open Modal</button>
		
		<Modal bind:open={modalOpen} title="Hello!">
			<p class="py-4">Press ESC key or click the button below to close</p>
			{#snippet actions()}
				<button class="btn" onclick={() => modalOpen = false}>Close</button>
				<button class="btn btn-primary" onclick={() => modalOpen = false}>Confirm</button>
			{/snippet}
		</Modal>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Accordion</h2>
		<div class="space-y-2">
			<Accordion title="Accordion Item 1" group="my-accordion" open>
				<p>Content for item 1</p>
			</Accordion>
			<Accordion title="Accordion Item 2" group="my-accordion">
				<p>Content for item 2</p>
			</Accordion>
			<Accordion title="Accordion Item 3" group="my-accordion">
				<p>Content for item 3</p>
			</Accordion>
		</div>

		<h3 class="text-xl font-semibold mt-6">Independent Collapse</h3>
		<Accordion title="Click me to toggle">
			<p>I can be toggled independently.</p>
		</Accordion>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Drawer</h2>
		<div class="border rounded-lg h-64 relative overflow-hidden">
			<Drawer bind:open={drawerOpen} class="absolute inset-0 h-full">
				{#snippet content()}
					<div class="flex flex-col items-center justify-center h-full bg-base-100">
						<button class="btn btn-primary drawer-button" onclick={() => drawerOpen = true}>Open Drawer</button>
						<p class="mt-4">Content area</p>
					</div>
				{/snippet}
				{#snippet sidebar()}
					<li><a>Sidebar Item 1</a></li>
					<li><a>Sidebar Item 2</a></li>
				{/snippet}
			</Drawer>
		</div>
	</section>
</div>

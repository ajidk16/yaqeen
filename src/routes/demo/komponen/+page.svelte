<script lang="ts">
	import { 
		Card, Modal, Drawer, Accordion, 
		Input, Select, Checkbox, Toggle, RadioGroup, Textarea,
		Button, Dropdown, Alert, Badge, Tooltip, Avatar, Loading
	} from '$lib/components/ui';
	
	let modalOpen = $state(false);
	let drawerOpen = $state(false);
	let loading = $state(false);

	function toggleLoading() {
		loading = true;
		setTimeout(() => loading = false, 2000);
	}
</script>

<div class="p-8 space-y-12 max-w-4xl mx-auto pb-32">
	<section>
		<h1 class="text-3xl font-bold mb-6">Component Library Demo</h1>
		<p class="mb-4">A comprehensive showcase of UI components built with daisyUI and Svelte 5.</p>
	</section>

	<div class="divider">Interaction Components</div>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Buttons</h2>
		<div class="flex flex-wrap gap-2">
			<Button variant="primary">Primary</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="accent">Accent</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
		<div class="flex flex-wrap gap-2 items-center">
			<Button size="lg">Large</Button>
			<Button size="md">Normal</Button>
			<Button size="sm">Small</Button>
			<Button size="xs">Tiny</Button>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="primary" outline>Outline</Button>
			<Button variant="primary" glass>Glass</Button>
			<Button variant="error" wide>Wide</Button>
			<Button variant="success" {loading} onclick={toggleLoading}>
				{loading ? 'Loading...' : 'Click to Load'}
			</Button>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Dropdowns</h2>
		<div class="flex gap-4 h-32">
			<Dropdown label="Click Me">
				<li><a href='#12'>Item 1</a></li>
				<li><a href='#12'>Item 2</a></li>
			</Dropdown>
			
			<Dropdown label="Hover Me" hover variant="accent">
				<li><a href='#12'>Item A</a></li>
				<li><a href='#12'>Item B</a></li>
			</Dropdown>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Alerts</h2>
		<Alert variant="info" title="New Software Update Available.">
			<p>You have a new software update available for download.</p>
		</Alert>
		<Alert variant="success" title="Order Confirmed">
			<p>Your order has been confirmed and is being processed.</p>
		</Alert>
		<Alert variant="warning" title="Warning: Invalid Email Address!">
			<p>Please enter a valid email address.</p>
		</Alert>
		<Alert variant="error" title="Error! Task failed successfully.">
			<p>Something went wrong, but we're not sure what.</p>
		</Alert>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Badges</h2>
		<div class="flex gap-2">
			<Badge variant="primary">Primary</Badge>
			<Badge variant="secondary" outline>Secondary Outline</Badge>
			<Badge variant="accent" size="lg">Large Accent</Badge>
			<Badge variant="ghost">Ghost</Badge>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Tooltips</h2>
		<div class="flex gap-4 mt-8">
			<Tooltip tip="Hello!" position="top">
				<Button>Hover Top</Button>
			</Tooltip>
			<Tooltip tip="I'm on the right" position="right" variant="secondary">
				<Button variant="secondary">Hover Right</Button>
			</Tooltip>
			<Tooltip tip="Open by default" open position="bottom" variant="accent">
				<Button variant="accent">Force Open</Button>
			</Tooltip>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Avatars</h2>
		<div class="flex gap-4 items-end">
			<Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" size="lg" online />
			<Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" size="md" offline shape="squircle" />
			<Avatar placeholder="DK" size="md" circle />
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Loading</h2>
		<div class="flex gap-4">
			<Loading variant="spinner" size="lg" />
			<Loading variant="dots" size="md" />
			<Loading variant="ring" size="lg" />
			<Loading variant="ball" size="lg" />
			<Loading variant="bars" size="lg" />
			<Loading variant="infinity" size="lg" />
		</div>
	</section>

	<div class="divider">Structural Components</div>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Cards</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card title="Basic Card">
				<p>This is a basic card with some content.</p>
				{#snippet actions()}
					<Button variant="primary">Action</Button>
				{/snippet}
			</Card>

			<Card title="Glass Card" glass>
				<p>This card has a glass effect (visible on colorful backgrounds).</p>
				{#snippet actions()}
					<Button variant="secondary">Glass Action</Button>
				{/snippet}
			</Card>
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Modal</h2>
		<Button variant="primary" onclick={() => modalOpen = true}>Open Modal</Button>
		
		<Modal bind:open={modalOpen} title="Hello!">
			<p class="py-4">Press ESC key or click the button below to close</p>
			{#snippet actions()}
				<Button onclick={() => modalOpen = false}>Close</Button>
				<Button variant="primary" onclick={() => modalOpen = false}>Confirm</Button>
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
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Drawer</h2>
		<div class="border rounded-lg h-64 relative overflow-hidden">
			<Drawer bind:open={drawerOpen} class="absolute inset-0 h-full">
				{#snippet content()}
					<div class="flex flex-col items-center justify-center h-full bg-base-100">
						<Button variant="primary" onclick={() => drawerOpen = true}>Open Drawer</Button>
						<p class="mt-4">Content area</p>
					</div>
				{/snippet}
				{#snippet sidebar()}
					<li><a href="#ba1">Sidebar Item 1</a></li>
					<li><a href="#ba2">Sidebar Item 2</a></li>
				{/snippet}
			</Drawer>
		</div>
	</section>
</div>

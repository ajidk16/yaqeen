<script lang="ts">
	import { Target } from 'lucide-svelte';
	import { Button, Card } from '$lib/components/ui';
	import { fly } from 'svelte/transition';

	let { progress, target, onUpdate, onUpdateTarget } = $props<{
		progress: number;
		target: number;
		onUpdate: (newProgress: number) => void;
		onUpdateTarget: (newTarget: number) => void;
	}>();

	let isEditingTarget = $state(false);
	let tempTarget = $state(target);

	// Derived
	let percentage = $derived(Math.min((progress / target) * 100, 100));
	let circumference = 251.2;
	let dashOffset = $derived(circumference - (circumference * percentage) / 100);

	function handleSaveTarget() {
		isEditingTarget = false;
		if (tempTarget !== target) {
			onUpdateTarget(tempTarget);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleSaveTarget();
		}
	}
</script>

<Card
	class="border-primary/20 bg-linear-to-br from-base-100 to-primary/5 overflow-visible shadow-sm"
>
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<Target class="size-5 text-primary" />
				Tilawah Harian
			</h2>
			{#if isEditingTarget}
				<div class="flex items-center gap-2">
					<input
						type="number"
						class="input input-xs input-bordered w-16 text-center font-mono"
						bind:value={tempTarget}
						onblur={handleSaveTarget}
						onkeydown={handleKeyDown}
						aria-label="Edit target tilawah"
						min="1"
					/>
					<span class="text-xs text-base-content/60">Halaman</span>
				</div>
			{:else}
				<button
					class="badge font-mono cursor-pointer hover:bg-base-200 transition-colors"
					onclick={() => {
						tempTarget = target;
						isEditingTarget = true;
					}}
					aria-label="Ubah target tilawah"
				>
					Target: {target} Halaman
				</button>
			{/if}
		</div>

		<div class="flex justify-center py-4">
			<div class="relative size-48">
				<svg class="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
					<circle
						class="text-base-200 stroke-current"
						stroke-width="8"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
					></circle>
					<circle
						class="text-primary stroke-current transition-all duration-1000 ease-out"
						stroke-width="8"
						stroke-linecap="round"
						cx="50"
						cy="50"
						r="40"
						fill="transparent"
						stroke-dasharray={circumference}
						stroke-dashoffset={dashOffset}
					></circle>
				</svg>
				<div class="absolute inset-0 flex flex-col items-center justify-center">
					<span class="text-4xl font-bold">{progress}</span>
					<span class="text-xs text-base-content/60 uppercase tracking-widest">Halaman</span>
				</div>
			</div>
		</div>

		<div class="flex gap-3">
			<Button
				class="flex-1"
				onclick={() => onUpdate(Math.max(0, progress - 1))}
				disabled={progress === 0}
				aria-label="Kurangi 1 halaman"
			>
				-1 Halaman
			</Button>
			<Button
				variant="primary"
				class="flex-1"
				onclick={() => onUpdate(progress + 1)}
				disabled={progress >= target}
				aria-label="Tambah 1 halaman"
			>
				+1 Halaman
			</Button>
		</div>
	</div>
</Card>

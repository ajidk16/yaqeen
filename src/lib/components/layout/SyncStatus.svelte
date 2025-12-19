<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Check, AlertCircle } from 'lucide-svelte';
	import { getNetworkStatus } from '$lib/stores/networkStatus.svelte';
	import { fullSync } from '$lib/offline/syncEngine';
	import { onMount } from 'svelte';

	interface Props {
		userId?: string;
	}

	let { userId }: Props = $props();

	const network = getNetworkStatus();
	let isExpanded = $state(false);
	let mounted = $state(false);

	onMount(() => {
		mounted = true;

		// Listen for manual sync trigger
		window.addEventListener('habbitrax:trigger-sync', handleSync);

		return () => {
			window.removeEventListener('habbitrax:trigger-sync', handleSync);
		};
	});

	async function handleSync() {
		if (!userId || network.isSyncing || !network.isOnline) return;

		try {
			await fullSync(userId);
		} catch (error) {
			console.error('Sync failed:', error);
		}
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}
</script>

{#if mounted}
	<!-- Floating Sync Status Indicator -->
	<div
		class="fixed bottom-20 right-4 z-40 sm:bottom-6"
		in:fly={{ y: 20, duration: 400, easing: quintOut }}
	>
		<!-- Main Button -->
		<button
			onclick={toggleExpanded}
			class="relative flex items-center gap-2 rounded-full glass-card px-3 py-2 shadow-lg transition-all duration-300 hover:shadow-xl {isExpanded
				? 'pr-4'
				: ''}"
		>
			<!-- Status Icon -->
			<div class="relative">
				{#if !network.isOnline}
					<WifiOff class="size-4 text-warning" />
				{:else if network.isSyncing}
					<RefreshCw class="size-4 text-info animate-spin" />
				{:else if network.pendingCount > 0}
					<Cloud class="size-4 text-warning" />
				{:else}
					<Check class="size-4 text-success" />
				{/if}

				<!-- Pending Badge -->
				{#if network.pendingCount > 0 && !network.isSyncing}
					<span
						class="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-content"
						in:scale={{ duration: 200 }}
					>
						{network.pendingCount > 9 ? '9+' : network.pendingCount}
					</span>
				{/if}
			</div>

			<!-- Status Text (shown when expanded) -->
			{#if isExpanded}
				<span class="text-xs font-medium {network.statusColor}" in:fly={{ x: -10, duration: 200 }}>
					{network.statusText}
				</span>
			{/if}
		</button>

		<!-- Expanded Panel -->
		{#if isExpanded}
			<div
				class="absolute bottom-full right-0 mb-2 w-64 glass-card overflow-hidden rounded-2xl shadow-xl"
				in:fly={{ y: 10, duration: 200, easing: quintOut }}
			>
				<!-- Header -->
				<div class="flex items-center justify-between border-b border-base-content/10 p-3">
					<div class="flex items-center gap-2">
						{#if network.isOnline}
							<Wifi class="size-4 text-success" />
							<span class="text-sm font-medium">Online</span>
						{:else}
							<WifiOff class="size-4 text-warning" />
							<span class="text-sm font-medium">Offline</span>
						{/if}
					</div>
					{#if network.isOnline && network.pendingCount > 0}
						<button
							onclick={handleSync}
							disabled={network.isSyncing}
							class="btn btn-xs btn-primary gap-1"
						>
							<RefreshCw class="size-3 {network.isSyncing ? 'animate-spin' : ''}" />
							Sync
						</button>
					{/if}
				</div>

				<!-- Details -->
				<div class="space-y-2 p-3">
					<!-- Sync Progress -->
					{#if network.isSyncing && network.syncProgress.total > 0}
						<div class="space-y-1">
							<div class="flex justify-between text-xs text-base-content/60">
								<span>Menyinkronkan...</span>
								<span>{network.syncProgress.current}/{network.syncProgress.total}</span>
							</div>
							<progress
								class="progress progress-primary h-1"
								value={network.syncProgress.current}
								max={network.syncProgress.total}
							></progress>
						</div>
					{/if}

					<!-- Pending Count -->
					{#if network.pendingCount > 0}
						<div class="flex items-center gap-2 text-xs">
							<Cloud class="size-3 text-warning" />
							<span class="text-base-content/60">
								{network.pendingCount} perubahan menunggu
							</span>
						</div>
					{/if}

					<!-- Last Sync -->
					<div class="flex items-center gap-2 text-xs">
						<RefreshCw class="size-3 text-base-content/40" />
						<span class="text-base-content/50">
							Terakhir sync: {network.lastSyncFormatted}
						</span>
					</div>

					<!-- Offline Notice -->
					{#if !network.isOnline}
						<div class="mt-2 rounded-lg bg-warning/10 p-2">
							<div class="flex items-start gap-2 text-xs text-warning">
								<AlertCircle class="size-4 shrink-0" />
								<p>Kamu sedang offline. Perubahan akan disinkronkan saat online kembali.</p>
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Click outside to close -->
	{#if isExpanded}
		<button
			class="fixed inset-0 z-30"
			onclick={() => (isExpanded = false)}
			aria-label="Close sync panel"
		></button>
	{/if}
{/if}

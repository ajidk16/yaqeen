<script>
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import AddHabitModal from '$lib/components/habits/AddHabitModal.svelte';
	import SyncStatus from '$lib/components/layout/SyncStatus.svelte';

	let { children, data } = $props();
</script>

<div class="min-h-screen bg-surface-200 pb-20 font-body text-content-primary md:pb-0 md:pl-20">
	<Sidebar />

	<!-- Main Content Area -->
	<main class="mx-auto max-w-md py-6 md:max-w-4xl">
		{@render children()}
	</main>

	<BottomNav class="md:hidden" />

	<AddHabitModal />

	<!-- Offline Sync Status -->
	<SyncStatus userId={data?.user?.id} />
</div>

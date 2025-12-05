<script>
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import BottomNav from '$lib/components/layout/BottomNav.svelte';
	import AddHabitModal from '$lib/components/habits/AddHabitModal.svelte';
	import PrayerCountdown from '$lib/components/prayer/PrayerCountdown.svelte';

	let { children } = $props();
</script>

<div class="min-h-screen bg-surface-200 pb-20 font-body text-content-primary md:pb-0 md:pl-20">
	<Sidebar />

	<!-- Main Content Area -->
	<main class="mx-auto max-w-md px-4 py-6 md:max-w-4xl">
		{@render children()}
	</main>

	<BottomNav class="md:hidden" />

	<AddHabitModal />
	<!-- <PrayerCountdown
		prayerTimes={data.prayerTimes}
		soundPreference={data.user?.preferences?.notificationSettings?.sound}
	/> -->
</div>

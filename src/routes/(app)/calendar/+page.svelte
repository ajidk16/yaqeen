<script lang="ts">
	import { enhance } from '$app/forms';
	import dayjs from 'dayjs';
	import { ChevronLeft, ChevronRight, Droplets, History } from 'lucide-svelte';
	import { Button, Modal, Card, Input } from '$lib/components/ui';

	let { data } = $props();

	// State
	let currentDate = $state(dayjs());
	let selectedDate = $state<dayjs.Dayjs | null>(null);
	let isModalOpen = $state(false);

	// Derived
	let year = $derived(currentDate.format('YYYY'));
	let monthName = $derived(currentDate.format('MMMM'));
	let daysInMonth = $derived(currentDate.daysInMonth());
	let startDay = $derived(currentDate.startOf('month').day()); // 0 (Sun) to 6 (Sat)

	let logs = $derived(data.menstruationLogs || []);

	// Helper to check if a date is within a period range
	function getPeriodStatus(d: dayjs.Dayjs) {
		// format to 'YYYY-MM-DD' for comparison
		const dateStr = d.format('YYYY-MM-DD');

		for (const log of logs) {
			const start = log.startDate;
			const end = log.endDate;

			if (dateStr >= start && (!end || dateStr <= end)) {
				return 'active'; // In a period
			}
		}
		return null;
	}

	function isPeriodStart(d: dayjs.Dayjs) {
		const dateStr = d.format('YYYY-MM-DD');
		return logs.some((l) => l.startDate === dateStr);
	}

	// Methods
	function prevMonth() {
		currentDate = currentDate.subtract(1, 'month');
	}
	function nextMonth() {
		currentDate = currentDate.add(1, 'month');
	}
	function resetToday() {
		currentDate = dayjs();
	}

	function onDateClick(day: number) {
		selectedDate = currentDate.date(day);
		//  jika start_date sampai end_date data logs sudah ada, maka tidak perlu buka modal
		// if(logs.some(log => {
		// 	const dateStr = selectedDate!.format('YYYY-MM-DD');
		// 	return dateStr >= log.startDate && ( !log.endDate || dateStr <= log.endDate);
		// })) {
		// 	return;
		// }

		isModalOpen = true;
	}

	// Grid generation
	function getCalendarDays() {
		let days = [];
		// Empty slots for start of month
		for (let i = 0; i < startDay; i++) {
			days.push(null);
		}
		// Actual days
		for (let i = 1; i <= daysInMonth; i++) {
			days.push(i);
		}
		return days;
	}

	// Check if there is an active period currently running (without end date)
	let activeLog = $derived(logs.find((l) => !l.endDate));
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Jadwal Haid</h1>
			<p class="text-base-content/60">Track your cycle and health</p>
		</div>

		<div
			class="flex items-center gap-2 bg-base-100 p-2 rounded-xl shadow-sm border border-base-200"
		>
			<button class="btn btn-sm btn-ghost btn-square" onclick={prevMonth}>
				<ChevronLeft class="size-4" />
			</button>
			<div class="font-medium min-w-[120px] text-center">
				{monthName}
				{year}
			</div>
			<button class="btn btn-sm btn-ghost btn-square" onclick={nextMonth}>
				<ChevronRight class="size-4" />
			</button>
			<div class="w-px h-6 bg-base-300 mx-1"></div>
			<button class="btn btn-sm btn-ghost" onclick={resetToday}> Today </button>
		</div>
	</div>

	<!-- Calendar Grid -->
	<Card class="overflow-hidden border-none shadow-xl shadow-primary/5">
		<div class="p-6">
			<!-- Days Header -->
			<div class="grid grid-cols-7 mb-4">
				{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as d}
					<div class="text-center text-sm font-semibold text-base-content/40 py-2">
						{d}
					</div>
				{/each}
			</div>

			<!-- Days -->
			<div class="grid grid-cols-7 gap-2">
				{#each getCalendarDays() as day}
					{#if day === null}
						<div class="aspect-square"></div>
					{:else}
						{@const date = currentDate.date(day)}
						{@const isToday = date.isSame(dayjs(), 'day')}
						{@const status = getPeriodStatus(date)}
						{@const isStart = isPeriodStart(date)}

						<button
							class="relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group
                                {isToday
								? 'bg-primary text-primary-content shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-base-100'
								: 'bg-base-100 hover:bg-base-200'}
                                {status === 'active' && !isToday ? 'bg-error/10 text-error' : ''}
                            "
							onclick={() => onDateClick(day)}
						>
							<span class="text-lg font-medium relative z-10">{day}</span>

							{#if status === 'active'}
								<div
									class="absolute inset-0 rounded-2xl border-2 border-error/20 {isStart
										? 'bg-error/10'
										: ''}"
								></div>
								{#if isStart}
									<div class="absolute top-1 right-2 w-5 h-5 rounded-full bg-error"></div>
								{/if}
							{/if}

							{#if isToday && status !== 'active'}
								<div class="absolute bottom-2 w-2 h-2 rounded-full bg-primary-content/50"></div>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		</div>
	</Card>

	<!-- Legend / Quick Stats -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<Card>
			<div class="flex items-center gap-4">
				<div class="p-3 bg-error/10 text-error rounded-xl">
					<Droplets class="size-6" />
				</div>
				<div>
					<div class="text-sm font-medium text-base-content/60">Current Status</div>
					<div class="text-lg font-bold">
						{#if activeLog}
							Period Day {dayjs().diff(activeLog.startDate, 'day') + 1}
						{:else}
							Not on period
						{/if}
					</div>
				</div>
			</div>
		</Card>

		<Card class="hover:bg-base-100/50 transition-colors cursor-pointer">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div class="p-3 bg-secondary/10 text-secondary rounded-xl">
						<History class="size-6" />
					</div>
					<div>
						<div class="text-lg font-bold">History</div>
						<div class="text-sm text-base-content/60">View past cycles</div>
					</div>
				</div>
				<ChevronRight class="size-5 text-base-content/30" />
			</div>
		</Card>
	</div>
</div>

<!-- Interaction Modal -->
<Modal bind:open={isModalOpen} title={`Date: ${selectedDate?.format('D MMMM YYYY')}`}>
	<div class="space-y-6 py-4">
		{#if selectedDate}
			{@const dateStr = selectedDate.format('YYYY-MM-DD')}

			<p class="text-base-content/70">Manage your logs for this date.</p>

			<form
				method="POST"
				action="?/logPeriod"
				use:enhance={() => {
					isModalOpen = false;
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<input type="hidden" name="date" value={dateStr} />

				<div class="grid grid-cols-1 gap-3">
					{#if !activeLog}
						<Button type="submit" name="type" value="start" variant="primary" size="lg">
							Start Period Here
						</Button>
					{:else}
						<!-- If there is an active log, allow ending it -->
						<Button type="submit" name="type" value="end" variant="error" outline size="lg">
							End Period (Today)
						</Button>
						<p class="text-xs text-center text-base-content/50 mt-2">
							(Ends the period started on {dayjs(activeLog.startDate).format('D MMM')})
						</p>
					{/if}
				</div>
			</form>
		{/if}
	</div>
</Modal>

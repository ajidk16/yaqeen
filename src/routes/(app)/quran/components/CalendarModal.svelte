<script lang="ts">
	import { Modal } from '$lib/components/ui';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import dayjs from 'dayjs';
	import 'dayjs/locale/id'; // Import locale if needed, assuming 'id' for Indonesian context
	import { formatDate } from '$lib/utils/format';

	let {
		open = $bindable(false),
		currentDate,
		onSelect
	} = $props<{
		open: boolean;
		currentDate: Date;
		onSelect: (date: Date) => void;
	}>();

	let viewDate = $state(dayjs(currentDate));

	// Sync viewDate when modal opens or currentDate changes
	$effect(() => {
		if (open) {
			viewDate = dayjs(currentDate);
		}
	});

	function nextMonth() {
		viewDate = viewDate.add(1, 'month');
	}

	function prevMonth() {
		viewDate = viewDate.subtract(1, 'month');
	}

	function selectDate(date: dayjs.Dayjs) {
		onSelect(date.toDate());
		open = false;
	}

	// Generate calendar grid
	let days = $derived.by(() => {
		const startOfMonth = viewDate.startOf('month');
		const endOfMonth = viewDate.endOf('month');
		const startDay = startOfMonth.day(); // 0 (Sunday) to 6 (Saturday)
		const daysInMonth = viewDate.daysInMonth();

		const grid = [];

		// Previous month padding
		for (let i = 0; i < startDay; i++) {
			grid.push({ date: startOfMonth.subtract(startDay - i, 'day'), currentMonth: false });
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			grid.push({ date: startOfMonth.date(i), currentMonth: true });
		}

		// Next month padding to fill 6 rows (42 cells)
		const remainingCells = 42 - grid.length;
		for (let i = 1; i <= remainingCells; i++) {
			grid.push({ date: endOfMonth.add(i, 'day'), currentMonth: false });
		}

		return grid;
	});

	const weekDays = ['Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
</script>

<Modal bind:open title="Pilih Tanggal">
	<div class="p-4">
		<!-- Header -->
		<div class="flex items-center justify-between mb-4">
			<button class="btn btn-sm btn-circle btn-ghost" onclick={prevMonth}>
				<ChevronLeft class="size-5" />
			</button>
			<span class="font-bold text-lg capitalize">
				{viewDate.format('MMMM YYYY')}
			</span>
			<button class="btn btn-sm btn-circle btn-ghost" onclick={nextMonth}>
				<ChevronRight class="size-5" />
			</button>
		</div>

		<!-- Weekday Headers -->
		<div class="grid grid-cols-7 gap-1 mb-2 text-center">
			{#each weekDays as day}
				<div class="text-xs font-medium text-base-content/60">{day}</div>
			{/each}
		</div>

		<!-- Days Grid -->
		<div class="grid grid-cols-7 gap-1">
			{#each days as { date, currentMonth }}
				{@const isSelected = date.isSame(dayjs(currentDate), 'day')}
				{@const isToday = date.isSame(dayjs(), 'day')}
				<button
					class="btn btn-sm btn-square w-full h-10 font-normal relative
					{currentMonth ? 'text-base-content' : 'text-base-content/30'}
					{isSelected ? 'btn-primary text-primary-content' : 'btn-ghost'}
					{isToday && !isSelected ? 'border border-primary text-primary' : ''}"
					onclick={() => selectDate(date)}
				>
					{date.date()}
				</button>
			{/each}
		</div>
	</div>
</Modal>

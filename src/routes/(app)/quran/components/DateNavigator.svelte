<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { formatDate, hijriDate } from '$lib/utils/format.js';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import * as m from '$lib/paraglide/messages.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { children } = $props();

	let currentDate = $state(new Date()) as Date;

	$effect(() => {
		currentDate = new Date(page?.data.date);
	});

	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		const newDateStr = newDate.toISOString().split('T')[0];
		goto(`?date=${newDateStr}`);
	}
</script>

<div
	class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
	in:fly={{ y: -20, duration: 800, easing: quintOut }}
>
	<div>
		<h1 class="text-3xl font-bold flex items-center gap-3">
			{@render children?.()}
		</h1>
		<p class="text-base-content/60">{m.quran_subtitle()}</p>
	</div>

	<div
		class="flex items-center justify-between w-full gap-4 bg-base-100 shadow-sm border border-base-content/10 rounded-full p-1 max-w-full md:max-w-xs"
	>
		<button
			class="btn btn-circle btn-sm btn-ghost"
			onclick={() => changeDate(-1)}
			aria-label={m.quran_prev_day()}
		>
			<ChevronLeft class="size-5" />
		</button>

		<div class="flex flex-col items-end">
			<span class="font-bold text-sm">{formatDate(currentDate)}</span>
			<span class="text-xs text-primary font-medium">{hijriDate(currentDate)}</span>
		</div>
		<button
			class="btn btn-circle btn-sm btn-ghost"
			onclick={() => changeDate(1)}
			aria-label={m.quran_next_day()}
		>
			<ChevronRight class="size-5" />
		</button>
	</div>
</div>

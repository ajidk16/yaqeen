<script lang="ts">
	import { fly } from 'svelte/transition';
	import * as m from '$lib/paraglide/messages.js';

	let { stats } = $props<{
		stats: {
			totalKhatam: number;
			currentStreak: number;
			totalPages: number;
			ayahsMemorized: number;
		};
	}>();
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-4" in:fly={{ y: 20, duration: 800, delay: 300 }}>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">{m.quran_stats_khatam()}</div>
			<div class="stat-value text-primary text-2xl">{stats?.totalKhatam ?? 0}</div>
			<div class="stat-desc">{m.quran_stats_khatam_desc()}</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">{m.quran_stats_streak()}</div>
			<div class="stat-value text-secondary text-2xl">
				{stats?.currentStreak ?? 0}
			</div>
			<div class="stat-desc">{m.quran_stats_streak_desc()}</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">{m.quran_stats_pages()}</div>
			<div class="stat-value text-accent text-2xl">{stats?.totalPages ?? 0}</div>
			<div class="stat-desc">{m.quran_stats_pages_desc()}</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">{m.quran_stats_ayahs()}</div>
			<div class="stat-value text-info text-2xl">{stats?.ayahsMemorized ?? 0}</div>
			<div class="stat-desc">{m.quran_stats_ayahs_desc()}</div>
		</div>
	</div>
</div>

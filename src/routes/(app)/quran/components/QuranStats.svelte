<script lang="ts">
	import { fly } from 'svelte/transition';

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
			<div class="stat-title text-xs">Total Khatam</div>
			<div class="stat-value text-primary text-2xl">{stats?.totalKhatam ?? 0}</div>
			<div class="stat-desc">Kali tahun ini</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">Streak Saat Ini</div>
			<div class="stat-value text-secondary text-2xl">
				{stats?.currentStreak ?? 0}
			</div>
			<div class="stat-desc">Hari</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">Total Halaman</div>
			<div class="stat-value text-accent text-2xl">{stats?.totalPages ?? 0}</div>
			<div class="stat-desc">Dibaca sepanjang waktu</div>
		</div>
	</div>
	<div class="stats shadow bg-base-100 border border-base-content/5">
		<div class="stat place-items-center p-4">
			<div class="stat-title text-xs">Ayat Dihafal</div>
			<div class="stat-value text-info text-2xl">{stats?.ayahsMemorized ?? 0}</div>
			<div class="stat-desc">Total ayat</div>
		</div>
	</div>
</div>

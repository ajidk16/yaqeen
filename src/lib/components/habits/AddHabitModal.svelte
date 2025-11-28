<script lang="ts">
	import { X, Moon, Activity, BookOpen } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { isAddHabitModalOpen } from '$lib/stores/ui';

	const onClose = () => {
		$isAddHabitModalOpen = false;
	};
</script>

{#if $isAddHabitModalOpen}
	<div class="fixed inset-0 z-50 flex items-end justify-center p-4 backdrop-blur-sm md:items-center" transition:fade={{ duration: 200 }}>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-slate-900/40" onclick={onClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && onClose()}></div>

		<!-- Modal Content -->
		<div class="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" transition:fly={{ y: 20, duration: 300 }}>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-bold text-slate-800">Tambah Kebiasaan Baru</h2>
				<button onclick={onClose} class="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
					<X size={20} />
				</button>
			</div>

			<!-- Category Selection -->
			<div class="mb-6 grid grid-cols-3 gap-3">
				<button class="flex flex-col items-center gap-2 rounded-xl border-2 border-ibadah bg-ibadah-bg p-3 text-ibadah transition-transform hover:scale-105">
					<Moon size={24} />
					<span class="text-xs font-bold">Ibadah</span>
				</button>
				<button class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300">
					<Activity size={24} />
					<span class="text-xs font-medium">Health</span>
				</button>
				<button class="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-3 text-slate-500 transition-all hover:bg-slate-50 hover:border-slate-300">
					<BookOpen size={24} />
					<span class="text-xs font-medium">Ilmu</span>
				</button>
			</div>

			<!-- Form Fields -->
			<div class="space-y-4">
				<div>
					<label for="habit-name" class="mb-1 block text-sm font-medium text-slate-700">Nama Kebiasaan</label>
					<input type="text" id="habit-name" placeholder="Contoh: Baca Al-Kahfi" class="w-full rounded-xl border-none bg-slate-50 px-4 py-3 focus:ring-2 focus:ring-primary/50 transition-all" />
				</div>
				
				<!-- Additional fields can go here -->
			</div>

			<button class="mt-8 w-full rounded-xl bg-primary py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:scale-[1.02] hover:shadow-primary/40 active:scale-95">
				Simpan Kebiasaan
			</button>
		</div>
	</div>
{/if}

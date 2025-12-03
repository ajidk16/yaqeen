<script lang="ts">
	import { X, Moon, Activity, BookOpen, Check, Dumbbell } from 'lucide-svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { isAddHabitModalOpen } from '$lib/stores/ui';
	import { Input } from '../ui';
	import Button from '../ui/Button.svelte';
	import { categories, icons, type Category } from '$lib/utils/global';

	let selectedCategory = $state<Category>('Mubah');
	let selectedIcon = $state<any>(Dumbbell);

	const onClose = () => {
		$isAddHabitModalOpen = false;
	};
</script>

<dialog class="modal modal-bottom sm:modal-end" class:modal-open={$isAddHabitModalOpen} transition:fade>
	<div class="modal-box w-full sm:max-w-xl p-0 overflow-hidden bg-base-100">
		<!-- Modal Header -->
		<div class="p-4 sm:p-6 border-b border-base-content/10 flex justify-between items-center bg-base-100/50 backdrop-blur-sm sticky top-0 z-10">
			<h3 class="font-bold text-xl">Tambah Kebiasaan</h3>
			<button class="btn btn-sm btn-circle btn-ghost" onclick={onClose}>
				<X class="size-5" />
			</button>
		</div>

		<div class="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
			<!-- Name Input -->
			<div class="form-control w-full">
				<label class="label" for="habit-name">
					<span class="label-text font-medium">Habit Name</span>
				</label>
				<Input 
					id="habit-name"
					placeholder="e.g., Read Surah Al-Kahf" 
					class="input-lg"
				/>
			</div>

			<!-- Category Selection -->
			<div class="space-y-3">
				<span class="label-text font-medium block">Category</span>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{#each categories as cat}
						<button 
							class="relative p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] h-full flex flex-col
							{selectedCategory === cat.label 
								? `border-${cat.color} bg-${cat.color}/5 ring-1 ring-${cat.color}/20` 
								: 'border-base-content/10 hover:border-base-content/20'}"
							onclick={() => selectedCategory = cat.label}
						>
							<div class="flex items-center justify-between mb-1">
								<span class="font-bold {selectedCategory === cat.label ? `text-${cat.color}` : ''}">{cat.label}</span>
								{#if selectedCategory === cat.label}
									<div class="size-5 rounded-full bg-{cat.color} text-white flex items-center justify-center" in:scale>
										<Check class="size-3" />
									</div>
								{/if}
							</div>
							<p class="text-xs text-base-content/60 leading-tight">{cat.description}</p>
						</button>
					{/each}
				</div>
			</div>

			<!-- Icon Selection -->
            <div class="space-y-3">
                <span class="label-text font-medium block">Icon</span>
                <div class="flex flex-wrap gap-3">
                    {#each icons as icon}
                        <button 
                            class="size-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200
                            {selectedIcon === icon.component 
                                ? `border-primary bg-primary text-primary-content scale-110 shadow-lg shadow-primary/20` 
                                : 'border-base-content/10 hover:border-base-content/30 text-base-content/60'}"
                            onclick={() => selectedIcon = icon.component}
                            title={icon.label}
                        >
							<icon.component size='24' />
                        </button>
                    {/each}
                </div>
            </div>
		</div>

		<!-- Modal Actions -->
		<div class="p-4 sm:p-6 border-t border-base-content/10 bg-base-100 flex justify-end gap-3">
			<Button variant="ghost" onclick={onClose}>Cancel</Button>
			<Button variant="primary" >
				<Check class="size-4" />
				Save Habit
			</Button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={onClose}>close</button>
	</form>
</dialog>

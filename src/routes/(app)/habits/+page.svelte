<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { Plus, Trash2, Dumbbell, Book, GlassWater, Sparkles, Check, Filter, Search, Flame, BookOpen, Coffee, Briefcase, Heart, Star, Zap, Pencil, X, AlertTriangle } from 'lucide-svelte';
	import { Card, Button, Input, Badge } from '$lib/components/ui';

	// Types
	type Category = 'Wajib' | 'Sunnah' | 'Mubah';
	
	interface Habit {
		id: string;
		name: string;
		category: Category;
		icon: any;
		createdAt: Date;
	}

	// State
	let habits = $state<Habit[]>([
		{ id: '1', name: 'Sholat Dhuha', category: 'Sunnah', icon: Sparkles, createdAt: new Date() },
		{ id: '2', name: 'Read Quran', category: 'Wajib', icon: BookOpen, createdAt: new Date() },
		{ id: '3', name: 'Morning Jog', category: 'Mubah', icon: Dumbbell, createdAt: new Date() }
	]);

	let newHabitName = $state('');
	let selectedCategory = $state<Category>('Mubah');
	let selectedIcon = $state<any>(Dumbbell);
	let filter = $state<Category | 'All'>('All');
	let searchQuery = $state('');
	
	// Modal State
	let isModalOpen = $state(false);
	let editingHabitId = $state<string | null>(null);
	let modalTitle = $derived(editingHabitId ? 'Edit Habit' : 'Create New Habit');

	// Delete Confirmation State
	let isDeleteModalOpen = $state(false);
	let habitToDeleteId = $state<string | null>(null);

	// Toast State
	let toastMessage = $state('');
	let showToast = $state(false);

	// Constants
	const categories: { label: Category; color: string; description: string }[] = [
		{ label: 'Wajib', color: 'primary', description: 'Obligatory acts that must be done.' },
		{ label: 'Sunnah', color: 'secondary', description: 'Recommended acts for extra reward.' },
		{ label: 'Mubah', color: 'accent', description: 'Permissible daily activities.' }
	];

	const icons = [
		{ component: Dumbbell, label: 'Exercise' },
		{ component: BookOpen, label: 'Read' },
		{ component: GlassWater, label: 'Drink' },
		{ component: Coffee, label: 'Relax' },
		{ component: Briefcase, label: 'Work' },
		{ component: Heart, label: 'Health' },
		{ component: Star, label: 'Goal' },
		{ component: Zap, label: 'Energy' }
	];

	// Derived State
	let filteredHabits = $derived(
		habits
			.filter(h => filter === 'All' || h.category === filter)
			.filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
	);

	// Actions
	function openModal(habit?: Habit) {
		if (habit) {
			editingHabitId = habit.id;
			newHabitName = habit.name;
			selectedCategory = habit.category;
			selectedIcon = habit.icon;
		} else {
			editingHabitId = null;
			newHabitName = '';
			selectedCategory = 'Mubah';
			selectedIcon = Dumbbell;
		}
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		// Small delay to reset state after animation
		setTimeout(() => {
			editingHabitId = null;
			newHabitName = '';
		}, 300);
	}

	function saveHabit() {
		if (!newHabitName.trim()) return;

		if (editingHabitId) {
			// Update existing
			const index = habits.findIndex(h => h.id === editingHabitId);
			if (index !== -1) {
				habits[index] = {
					...habits[index],
					name: newHabitName,
					category: selectedCategory,
					icon: selectedIcon
				};
				triggerToast('Habit updated successfully');
			}
		} else {
			// Create new
			const newHabit: Habit = {
				id: crypto.randomUUID(),
				name: newHabitName,
				category: selectedCategory,
				icon: selectedIcon,
				createdAt: new Date()
			};
			habits = [newHabit, ...habits];
			triggerToast('Habit created successfully');
		}
		
		closeModal();
	}

	function requestDelete(id: string) {
		habitToDeleteId = id;
		isDeleteModalOpen = true;
	}

	function confirmDelete() {
		if (habitToDeleteId) {
			habits = habits.filter(h => h.id !== habitToDeleteId);
			triggerToast('Habit deleted successfully');
			closeDeleteModal();
		}
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		setTimeout(() => {
			habitToDeleteId = null;
		}, 300);
	}

	function triggerToast(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	function getCategoryColor(category: Category) {
		switch (category) {
			case 'Wajib': return 'text-primary bg-primary/10 border-primary/20';
			case 'Sunnah': return 'text-secondary bg-secondary/10 border-secondary/20';
			case 'Mubah': return 'text-accent bg-accent/10 border-accent/20';
			default: return 'text-base-content bg-base-200';
		}
	}
	
	function getBadgeColor(category: Category) {
		switch (category) {
			case 'Wajib': return 'badge-primary';
			case 'Sunnah': return 'badge-secondary';
			case 'Mubah': return 'badge-accent';
			default: return 'badge-ghost';
		}
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-4xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold">Manage Habits</h1>
				<p class="text-base-content/60">Customize your daily routine and spiritual goals.</p>
			</div>
			
			<Button 
				variant="primary" 
				class="rounded-full shadow-lg shadow-primary/20 gap-2"
				onclick={() => openModal()}
			>
				<Plus class="size-5" />
				New Habit
			</Button>
		</div>

		<!-- Filters & Search -->
		<div class="space-y-4 sticky top-0 z-10 bg-base-100/95 backdrop-blur-md py-4 -my-4">
			<div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<!-- Tabs Lifted -->
				<div role="tablist" class="tabs tabs-lifted w-full sm:w-auto">
					<button 
						role="tab" 
						class="tab {filter === 'All' ? 'tab-active [--tab-bg:theme(colors.base-100)]' : ''} text-base font-medium" 
						onclick={() => filter = 'All'}
					>
						All
					</button>
					{#each categories as cat}
						<button 
							role="tab" 
							class="tab {filter === cat.label ? 'tab-active [--tab-bg:theme(colors.base-100)]' : ''} text-base font-medium"
							onclick={() => filter = cat.label}
						>
							<span class={filter === cat.label ? `text-${cat.color}` : ''}>{cat.label}</span>
						</button>
					{/each}
				</div>
				
				<div class="relative w-full sm:w-64">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Search class="size-4 text-base-content/40" />
					</div>
					<input 
						type="text" 
						placeholder="Search habits..." 
						class="input input-bordered input-sm w-full pl-10 rounded-full"
						bind:value={searchQuery}
					/>
				</div>
			</div>
		</div>

		<!-- Habits List -->
		<div class="grid gap-4 min-h-[300px] content-start">
			{#if filteredHabits.length === 0}
				<div class="text-center py-12 text-base-content/40" in:fade>
					<div class="inline-flex items-center justify-center size-16 rounded-full bg-base-200 mb-4">
						<Flame class="size-8" />
					</div>
					<p class="text-lg font-medium">No habits found</p>
					<p class="text-sm">Create a new habit to get started!</p>
				</div>
			{:else}
				{#each filteredHabits as habit (habit.id)}
					<div 
						animate:flip={{ duration: 300, easing: quintOut }}
						in:fly={{ y: 20, duration: 400 }}
						out:scale={{ duration: 200 }}
					>
						<div class="card bg-base-100 shadow-sm border border-base-content/10 hover:shadow-md transition-all duration-300 group">
							<div class="card-body p-4 flex-row items-center gap-4">
								<!-- Icon -->
								<div class="size-12 rounded-2xl flex items-center justify-center shrink-0 {getCategoryColor(habit.category)}">
									<svelte:component this={habit.icon} class="size-6" />
								</div>

								<!-- Content -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg truncate">{habit.name}</h3>
										<div class="badge {getBadgeColor(habit.category)} badge-sm">{habit.category}</div>
									</div>
									<p class="text-xs text-base-content/50">Created {habit.createdAt.toLocaleDateString()}</p>
								</div>

								<!-- Actions -->
								<div class="flex items-center gap-1 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">
									<button 
										class="btn btn-ghost btn-circle btn-sm"
										onclick={() => openModal(habit)}
										title="Edit Habit"
									>
										<Pencil class="size-4" />
									</button>
									<button 
										class="btn btn-ghost btn-circle btn-sm text-error"
										onclick={() => requestDelete(habit.id)}
										title="Delete Habit"
									>
										<Trash2 class="size-4" />
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Create/Edit Modal -->
<dialog class="modal modal-bottom sm:modal-end" class:modal-open={isModalOpen}>
	<div class="modal-box w-full sm:max-w-xl p-0 overflow-hidden bg-base-100">
		<!-- Modal Header -->
		<div class="p-4 sm:p-6 border-b border-base-content/10 flex justify-between items-center bg-base-100/50 backdrop-blur-sm sticky top-0 z-10">
			<h3 class="font-bold text-xl">{modalTitle}</h3>
			<button class="btn btn-sm btn-circle btn-ghost" onclick={closeModal}>
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
					bind:value={newHabitName} 
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
                            <svelte:component this={icon.component} class="size-6" />
                        </button>
                    {/each}
                </div>
            </div>
		</div>

		<!-- Modal Actions -->
		<div class="p-4 sm:p-6 border-t border-base-content/10 bg-base-100 flex justify-end gap-3">
			<Button variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button variant="primary" onclick={saveHabit} disabled={!newHabitName.trim()}>
				{editingHabitId ? 'Save Changes' : 'Create Habit'}
			</Button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeModal}>close</button>
	</form>
</dialog>

<!-- Delete Confirmation Modal -->
<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={isDeleteModalOpen}>
	<div class="modal-box">
		<div class="flex flex-col items-center text-center gap-4">
			<div class="size-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
				<AlertTriangle class="size-8" />
			</div>
			<h3 class="font-bold text-xl">Delete Habit?</h3>
			<p class="text-base-content/60">Are you sure you want to delete this habit? This action cannot be undone.</p>
		</div>
		<div class="modal-action justify-center mt-8">
			<Button variant="ghost" onclick={closeDeleteModal}>Cancel</Button>
			<Button class="btn-error text-white" onclick={confirmDelete}>Delete</Button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeDeleteModal}>close</button>
	</form>
</dialog>

<!-- Toast Notification -->
{#if showToast}
	<div class="toast toast-end z-50" transition:fly={{ y: 20, duration: 300 }}>
		<div class="alert alert-success shadow-lg text-white">
			<Check class="size-5" />
			<span>{toastMessage}</span>
		</div>
	</div>
{/if}

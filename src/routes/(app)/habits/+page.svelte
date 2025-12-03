<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { Plus, Trash2, Dumbbell, BookOpen, GlassWater, Coffee, Briefcase, Heart, Star, Zap, Pencil, X, AlertTriangle, Check, Search, Flame } from 'lucide-svelte';
	import { Button, Input, Badge } from '$lib/components/ui';
    import { enhance } from '$app/forms';
	import { page } from '$app/state';


	// Types
	type Category = 'Wajib' | 'Sunnah' | 'Mubah';
	
	// State
    // habits is now derived from data
    let habits = $derived(page.data.habits || []);

	let newHabitName = $state('');
	let selectedCategory = $state<Category>('Mubah');
	let selectedIconName = $state('Exercise'); // Store name instead of component
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
		{ label: 'Wajib', color: 'primary', description: 'Ibadah wajib yang harus dilakukan.' },
		{ label: 'Sunnah', color: 'secondary', description: 'Amalan anjuran untuk pahala tambahan.' },
		{ label: 'Mubah', color: 'accent', description: 'Aktivitas harian yang diperbolehkan.' }
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

    function getIconComponent(name: string) {
        return icons.find(i => i.label === name)?.component || Star;
    }

	// Derived State
	let filteredHabits = $derived(
		habits
			.filter((h: { category: string; }) => filter === 'All' || h.category === filter)
			.filter((h: { title: string; }) => h.title.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort((a: { createdAt: string; }, b: { createdAt: string; }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
	);

	// Actions
	function openModal(habit?: any) {
		if (habit) {
			editingHabitId = habit.id;
			newHabitName = habit.title;
			selectedCategory = habit.category as Category;
			selectedIconName = habit.icon || 'Goal';
		} else {
			editingHabitId = null;
			newHabitName = '';
			selectedCategory = 'Mubah';
			selectedIconName = 'Exercise';
		}
		isModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		setTimeout(() => {
			editingHabitId = null;
			newHabitName = '';
		}, 300);
	}

	function requestDelete(id: string) {
		habitToDeleteId = id;
		isDeleteModalOpen = true;
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

	function getCategoryColor(category: string) {
		switch (category) {
			case 'Wajib': return 'text-primary bg-primary/10 border-primary/20';
			case 'Sunnah': return 'text-secondary bg-secondary/10 border-secondary/20';
			case 'Mubah': return 'text-accent bg-accent/10 border-accent/20';
			default: return 'text-base-content bg-base-200';
		}
	}
	
	function getBadgeColor(category: string) {
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
				<h1 class="text-3xl font-bold">Kelola Kebiasaan</h1>
				<p class="text-base-content/60">Sesuaikan rutinitas harian dan target spiritualmu.</p>
			</div>
			
			<Button 
				variant="primary" 
				class="rounded-full shadow-lg shadow-primary/20 gap-2"
				onclick={() => openModal()}
			>
				<Plus class="size-5" />
				Kebiasaan Baru
			</Button>
		</div>

		<!-- Filters & Search -->
		<div class="space-y-4 sticky top-0 z-10 bg-base-100/95 backdrop-blur-md py-4 -my-4">
			<div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<!-- Tabs Lifted -->
				<div role="tablist" class="tabs tabs-lifted w-full sm:w-auto">
					<button 
						role="tab" 
						class="tab {filter === 'All' ? 'tab-active [--tab-bg:var(--color-base-100)]' : ''} text-base font-medium" 
						onclick={() => filter = 'All'}
					>
						Semua
					</button>
					{#each categories as cat}
						<button 
							role="tab" 
							class="tab {filter === cat.label ? 'tab-active [--tab-bg:var(--color-base-100)]' : ''} text-base font-medium"
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
						placeholder="Cari kebiasaan..." 
						class="input input-bordered input-sm w-full pl-10 rounded-full"
						bind:value={searchQuery}
					/>
				</div>
			</div>
		</div>

		<!-- Habits List -->
		<div class="grid gap-4 min-h-[300px] content-start mt-6">
			{#if filteredHabits.length === 0}
				<div class="text-center py-12 text-base-content/40" in:fade>
					<div class="inline-flex items-center justify-center size-16 rounded-full bg-base-200 mb-4">
						<Flame class="size-8" />
					</div>
					<p class="text-lg font-medium">Tidak ada kebiasaan ditemukan</p>
					<p class="text-sm">Buat kebiasaan baru untuk memulai!</p>
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
                                <!-- Toggle Checkbox -->
                                <form action="?/toggle" method="POST" use:enhance>
                                    <input type="hidden" name="habitId" value={habit.id} />
                                    <button 
                                        class="size-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300
                                        {habit.completed 
                                            ? 'bg-success text-white scale-105 shadow-lg shadow-success/30' 
                                            : `${getCategoryColor(habit.category)} hover:bg-base-200`}"
                                    >
                                        {#if habit.completed}
                                            <Check class="size-6" />
                                        {:else}
                                            <!-- svelte-ignore svelte_component_deprecated -->
                                            <svelte:component this={getIconComponent(habit.icon)} class="size-6" />
                                        {/if}
                                    </button>
                                </form>

								<!-- Content -->
								<div class="flex-1 min-w-0">
									<div class="flex items-center gap-2 mb-1">
										<h3 class="font-bold text-lg truncate {habit.completed ? 'line-through opacity-50' : ''}">{habit.title}</h3>
										<div class="badge {getBadgeColor(habit.category)} badge-sm">{habit.category}</div>
									</div>
									<p class="text-xs text-base-content/50">
                                        {habit.completed ? 'Selesai hari ini' : 'Belum selesai'}
                                    </p>
								</div>

								<!-- Actions -->
								<div class="flex items-center gap-1 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity">
									<button 
										class="btn btn-ghost btn-circle btn-sm"
										onclick={() => openModal(habit)}
										title="Ubah Kebiasaan"
									>
										<Pencil class="size-4" />
									</button>
									<button 
										class="btn btn-ghost btn-circle btn-sm text-error"
										onclick={() => requestDelete(habit.id)}
										title="Hapus Kebiasaan"
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
        <form 
            method="POST" 
            action={editingHabitId ? '?/update' : '?/create'} 
            use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === 'success') {
                        triggerToast(editingHabitId ? 'Kebiasaan diperbarui' : 'Kebiasaan dibuat');
                        closeModal();
						await update()
                    }
                };
            }}
        >
            <input type="hidden" name="id" value={editingHabitId} />
            <input type="hidden" name="type" value="custom" />
            <input type="hidden" name="category" value={selectedCategory} />
            <input type="hidden" name="icon" value={selectedIconName} />
            
            <!-- Modal Header -->
            <div class="p-4 sm:p-6 border-b border-base-content/10 flex justify-between items-center bg-base-100/50 backdrop-blur-sm sticky top-0 z-10">
                <h3 class="font-bold text-xl">{editingHabitId ? 'Ubah Kebiasaan' : 'Buat Kebiasaan Baru'}</h3>
                <button type="button" class="btn btn-sm btn-circle btn-ghost" onclick={closeModal}>
                    <X class="size-5" />
                </button>
            </div>

            <div class="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <!-- Name Input -->
                <div class="form-control w-full">
                    <label class="label" for="habit-name">
                        <span class="label-text font-medium">Nama Kebiasaan</span>
                    </label>
                    <Input 
                        id="habit-name"
                        name="title"
                        placeholder="Contoh: Baca Surah Al-Kahfi" 
                        bind:value={newHabitName} 
                        class="input-lg"
                    />
                </div>

                <!-- Category Selection -->
                <div class="space-y-3">
                    <span class="label-text font-medium block">Kategori</span>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {#each categories as cat}
                            <button 
                                type="button"
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
                    <span class="label-text font-medium block">Ikon</span>
                    <div class="flex flex-wrap gap-3">
                        {#each icons as icon}
                            <button 
                                type="button"
                                class="size-12 rounded-xl flex items-center justify-center border-2 transition-all duration-200
                                {selectedIconName === icon.label 
                                    ? `border-primary bg-primary text-primary-content scale-110 shadow-lg shadow-primary/20` 
                                    : 'border-base-content/10 hover:border-base-content/30 text-base-content/60'}"
                                onclick={() => selectedIconName = icon.label}
                                title={icon.label}
                            >
								<icon.component class="size-6" />
                            </button>
                        {/each}
                    </div>
                </div>
            </div>

            <!-- Modal Actions -->
            <div class="p-4 sm:p-6 border-t border-base-content/10 bg-base-100 flex justify-end gap-3">
                <Button type="button" variant="ghost" onclick={closeModal}>Batal</Button>
                <Button type="submit" variant="primary" disabled={!newHabitName.trim()}>
                    {editingHabitId ? 'Simpan Perubahan' : 'Buat Kebiasaan'}
                </Button>
            </div>
        </form>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeModal}>close</button>
	</form>
</dialog>

<!-- Delete Confirmation Modal -->
<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={isDeleteModalOpen}>
	<div class="modal-box">
        <form 
            method="POST" 
            action="?/delete" 
            use:enhance={() => {
                return async ({ result, update }) => {
                    if (result.type === 'success') {
                        triggerToast('Kebiasaan dihapus');
                        closeDeleteModal();
						await update()
                    }
                };
            }}
        >
            <input type="hidden" name="id" value={habitToDeleteId} />
            <div class="flex flex-col items-center text-center gap-4">
                <div class="size-16 rounded-full bg-error/10 flex items-center justify-center text-error mb-2">
                    <AlertTriangle class="size-8" />
                </div>
                <h3 class="font-bold text-xl">Hapus Kebiasaan?</h3>
                <p class="text-base-content/60">Apakah Anda yakin ingin menghapus kebiasaan ini? Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div class="modal-action justify-center mt-8">
                <Button type="button" variant="ghost" onclick={closeDeleteModal}>Batal</Button>
                <Button type="submit" class="btn-error text-white">Hapus</Button>
            </div>
        </form>
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

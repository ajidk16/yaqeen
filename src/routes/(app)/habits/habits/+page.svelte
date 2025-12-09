<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import {
		Plus,
		Trash2,
		Dumbbell,
		BookOpen,
		GlassWater,
		Coffee,
		Briefcase,
		Heart,
		Star,
		Zap,
		Pencil,
		X,
		AlertTriangle,
		Check,
		Search,
		Flame,
		ChevronLeft
	} from 'lucide-svelte';
	import { Button, Input, Badge } from '$lib/components/ui';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	// Types
	type Category = 'Wajib' | 'Sunnah' | 'Mubah';

	// State
	let habits = $derived(page.data.habits || []);

	let newHabitName = $state('');
	let selectedCategory = $state<Category>('Mubah');
	let selectedIconName = $state('Exercise');
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
		return icons.find((i) => i.label === name)?.component || Star;
	}

	// Derived State
	let filteredHabits = $derived(
		habits
			.filter((h: { category: string }) => filter === 'All' || h.category === filter)
			.filter((h: { title: string }) => h.title.toLowerCase().includes(searchQuery.toLowerCase()))
			.sort(
				(a: { createdAt: string }, b: { createdAt: string }) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			)
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
			case 'Wajib':
				return 'from-primary/20 to-purple-500/20';
			case 'Sunnah':
				return 'from-secondary/20 to-pink-500/20';
			case 'Mubah':
				return 'from-accent/20 to-teal-500/20';
			default:
				return 'from-base-200 to-base-300';
		}
	}

	function getCategoryTextColor(category: string) {
		switch (category) {
			case 'Wajib':
				return 'text-primary';
			case 'Sunnah':
				return 'text-secondary';
			case 'Mubah':
				return 'text-accent';
			default:
				return 'text-base-content';
		}
	}

	function getBadgeColor(category: string) {
		switch (category) {
			case 'Wajib':
				return 'badge-primary';
			case 'Sunnah':
				return 'badge-secondary';
			case 'Mubah':
				return 'badge-accent';
			default:
				return 'badge-ghost';
		}
	}
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Header with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 p-6 lg:p-8"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-secondary/10 blur-3xl animate-breathe"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-accent/10 blur-3xl animate-breathe"
				style="animation-delay: -2s"
			></div>

			<div
				class="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
			>
				<div>
					<button
						class="mb-2 flex items-center gap-1 text-sm text-base-content/60 transition-colors hover:text-primary"
						onclick={() => goto('/habits')}
					>
						<ChevronLeft class="size-4" />
						Kembali
					</button>
					<h1 class="text-3xl font-bold lg:text-4xl">Kelola Kebiasaan</h1>
					<p class="mt-2 text-base-content/60">
						Sesuaikan rutinitas harian dan target spiritualmu.
					</p>
				</div>

				<Button
					variant="primary"
					class="gap-2 rounded-full shadow-lg shadow-primary/20"
					onclick={() => openModal()}
				>
					<Plus class="size-5" />
					Kebiasaan Baru
				</Button>
			</div>
		</header>

		<!-- Filters & Search -->
		<div class="space-y-4">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<!-- Glass Filter Tabs -->
				<div class="glass-card inline-flex gap-1 rounded-2xl p-1.5">
					<button
						class="rounded-xl px-4 py-2 text-sm font-medium transition-all
							{filter === 'All' ? 'bg-base-100 shadow-sm' : 'hover:bg-base-content/5'}"
						onclick={() => (filter = 'All')}
					>
						Semua
					</button>
					{#each categories as cat}
						<button
							class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all
								{filter === cat.label ? 'bg-base-100 shadow-sm' : 'hover:bg-base-content/5'}"
							onclick={() => (filter = cat.label)}
						>
							<div class="size-2 rounded-full bg-{cat.color}"></div>
							<span class={filter === cat.label ? `text-${cat.color}` : ''}>{cat.label}</span>
						</button>
					{/each}
				</div>

				<!-- Search -->
				<div class="relative w-full sm:w-64">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Search class="size-4 text-base-content/40" />
					</div>
					<input
						type="text"
						placeholder="Cari kebiasaan..."
						class="input input-bordered input-sm w-full rounded-full pl-10"
						bind:value={searchQuery}
					/>
				</div>
			</div>
		</div>

		<!-- Habits List -->
		<div class="mt-6 grid min-h-[300px] content-start gap-3">
			{#if filteredHabits.length === 0}
				<div class="py-12 text-center text-base-content/40" in:fade>
					<div
						class="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-base-100"
					>
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
						<div
							class="glass-card group rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
						>
							<div class="flex items-center gap-4">
								<!-- Toggle Checkbox -->
								<form action="?/toggle" method="POST" use:enhance>
									<input type="hidden" name="habitId" value={habit.id} />
									<button
										class="flex size-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300
											{habit.completed
											? 'scale-105 bg-success text-white shadow-lg shadow-success/30'
											: `bg-gradient-to-br ${getCategoryColor(habit.category)} ${getCategoryTextColor(habit.category)} hover:scale-105`}"
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
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-2">
										<h3
											class="truncate text-lg font-bold {habit.completed
												? 'line-through opacity-50'
												: ''}"
										>
											{habit.title}
										</h3>
										<div class="badge {getBadgeColor(habit.category)} badge-sm">
											{habit.category}
										</div>
									</div>
									<p class="text-xs text-base-content/50">
										{habit.completed ? '✓ Selesai hari ini' : 'Belum selesai'}
									</p>
								</div>

								<!-- Actions -->
								<div
									class="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
								>
									<button
										class="btn btn-circle btn-ghost btn-sm"
										onclick={() => openModal(habit)}
										title="Ubah Kebiasaan"
									>
										<Pencil class="size-4" />
									</button>
									<button
										class="btn btn-circle btn-ghost btn-sm text-error"
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
<dialog class="modal modal-bottom sm:modal-middle" class:modal-open={isModalOpen}>
	<div class="modal-box w-full overflow-hidden bg-base-100 p-0 sm:max-w-xl">
		<form
			method="POST"
			action={editingHabitId ? '?/update' : '?/create'}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						triggerToast(editingHabitId ? 'Kebiasaan diperbarui' : 'Kebiasaan dibuat');
						closeModal();
						await update();
					}
				};
			}}
		>
			<input type="hidden" name="id" value={editingHabitId} />
			<input type="hidden" name="type" value="custom" />
			<input type="hidden" name="category" value={selectedCategory} />
			<input type="hidden" name="icon" value={selectedIconName} />

			<!-- Modal Header -->
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-base-content/10 bg-base-100/50 p-4 backdrop-blur-sm sm:p-6"
			>
				<h3 class="text-xl font-bold">
					{editingHabitId ? 'Ubah Kebiasaan' : 'Buat Kebiasaan Baru'}
				</h3>
				<button type="button" class="btn btn-circle btn-ghost btn-sm" onclick={closeModal}>
					<X class="size-5" />
				</button>
			</div>

			<div class="max-h-[70vh] space-y-6 overflow-y-auto p-4 sm:p-6">
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
					<span class="label-text block font-medium">Kategori</span>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{#each categories as cat}
							<button
								type="button"
								class="relative flex h-full flex-col rounded-xl border-2 p-3 text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] sm:p-4
									{selectedCategory === cat.label
									? `border-${cat.color} bg-${cat.color}/5 ring-1 ring-${cat.color}/20`
									: 'border-base-content/10 hover:border-base-content/20'}"
								onclick={() => (selectedCategory = cat.label)}
							>
								<div class="mb-1 flex items-center justify-between">
									<span
										class="font-bold {selectedCategory === cat.label ? `text-${cat.color}` : ''}"
										>{cat.label}</span
									>
									{#if selectedCategory === cat.label}
										<div
											class="flex size-5 items-center justify-center rounded-full bg-{cat.color} text-white"
											in:scale
										>
											<Check class="size-3" />
										</div>
									{/if}
								</div>
								<p class="text-xs leading-tight text-base-content/60">{cat.description}</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- Icon Selection -->
				<div class="space-y-3">
					<span class="label-text block font-medium">Ikon</span>
					<div class="flex flex-wrap gap-3">
						{#each icons as icon}
							<button
								type="button"
								class="flex size-12 items-center justify-center rounded-xl border-2 transition-all duration-200
									{selectedIconName === icon.label
									? `scale-110 border-primary bg-primary text-primary-content shadow-lg shadow-primary/20`
									: 'border-base-content/10 text-base-content/60 hover:border-base-content/30'}"
								onclick={() => (selectedIconName = icon.label)}
								title={icon.label}
							>
								<icon.component class="size-6" />
							</button>
						{/each}
					</div>
				</div>
			</div>

			<!-- Modal Actions -->
			<div class="flex justify-end gap-3 border-t border-base-content/10 bg-base-100 p-4 sm:p-6">
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
						await update();
					}
				};
			}}
		>
			<input type="hidden" name="id" value={habitToDeleteId} />
			<div class="flex flex-col items-center gap-4 text-center">
				<div
					class="mb-2 flex size-16 items-center justify-center rounded-full bg-error/10 text-error"
				>
					<AlertTriangle class="size-8" />
				</div>
				<h3 class="text-xl font-bold">Hapus Kebiasaan?</h3>
				<p class="text-base-content/60">
					Apakah Anda yakin ingin menghapus kebiasaan ini? Tindakan ini tidak dapat dibatalkan.
				</p>
			</div>
			<div class="modal-action mt-8 justify-center">
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
		<div class="alert alert-success text-white shadow-lg">
			<Check class="size-5" />
			<span>{toastMessage}</span>
		</div>
	</div>
{/if}

<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Smile, Frown, Meh, Heart, Coffee, Calendar, Plus, Save, Trash2, Sparkles, BookHeart, ChevronLeft, ChevronRight, Pencil } from 'lucide-svelte';
	import { Card, Button, Textarea, Modal, Input, Loading } from '$lib/components/ui';
	import confetti from 'canvas-confetti';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import { page } from '$app/state';



	// Types
	type MoodType = 'happy' | 'blessed' | 'neutral' | 'tired' | 'sad';

	// State
	let currentDate = $state(new Date());
	let selectedMood = $state<MoodType>('happy');
	let gratitudeText = $state('');
	let isSubmitting = $state(false);

	// Edit State
	let isEditModalOpen = $state(false);
	let editingLog = $state<{ id: string, mood: MoodType, gratitude: string } | null>(null);

	// Delete State
	let isDeleteModalOpen = $state(false);
	let deletingLogId = $state<string | null>(null);

	// Derived
	let filteredLogs = $derived(
		page?.data?.logs?.filter((log : {date:Date}) => {
			const logDate = new Date(log.date);
			return logDate.getDate() === currentDate.getDate() &&
			logDate.getMonth() === currentDate.getMonth() &&
			logDate.getFullYear() === currentDate.getFullYear();
		})
	);

	let formattedDate = $derived(new Intl.DateTimeFormat('id-ID', { 
		weekday: 'long', 
		day: 'numeric', 
		month: 'long', 
		year: 'numeric' 
	}).format(currentDate));

	// Constants
	const moods: { type: MoodType; icon: any; label: string; color: string, bg: string }[] = [
		{ type: 'happy', icon: Smile, label: 'Senang', color: 'text-success', bg: 'bg-green-50 ring-2 ring-green-500 ring-offset-2 text-green-500' },
		{ type: 'blessed', icon: Heart, label: 'Berkah', color: 'text-error', bg: 'bg-red-50 ring-2 ring-red-500 ring-offset-2 text-red-500' },
		{ type: 'neutral', icon: Meh, label: 'Biasa', color: 'text-warning', bg: 'bg-yellow-50 ring-2 ring-yellow-500 ring-offset-2 text-yellow-500' },
		{ type: 'tired', icon: Coffee, label: 'Lelah', color: 'text-neutral', bg: 'bg-gray-50 ring-2 ring-gray-500 ring-offset-2 text-gray-500' },
		{ type: 'sad', icon: Frown, label: 'Sedih', color: 'text-info', bg: 'bg-blue-50 ring-2 ring-blue-500 ring-offset-2 text-blue-500' }
	];

	// Actions
	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		currentDate = newDate;
	}

	function openEditModal(log: any) {
		editingLog = { id: log.id, mood: log.mood as MoodType, gratitude: log.gratitude };
		isEditModalOpen = true;
	}

	function openDeleteModal(id: string) {
		deletingLogId = id;
		isDeleteModalOpen = true;
	}

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	function getMoodColor(type: string) {
		const mood = moods.find(m => m.type === type);
		return mood ? mood.color : 'text-base-content';
	}

	function getMoodIcon(type: string) {
		const mood = moods.find(m => m.type === type);
		return mood ? mood.icon : Smile;
	}

	function formatTime(date: Date | string) {
		return new Intl.DateTimeFormat('id-ID', { 
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(date));
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-8">
		<!-- Header -->
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<div>
				<h1 class="text-3xl font-bold flex items-center gap-3">
					<BookHeart class="size-8 text-primary" />
					Jurnal Syukur
				</h1>
				<p class="text-base-content/60">Renungkan harimu dan hitung nikmat-Nya.</p>
			</div>

			<!-- Date Navigation -->
			<div class="flex items-center gap-4 bg-base-100 shadow-sm border border-base-content/10 rounded-full p-1 pr-6">
				<div class="flex gap-1">
					<button class="btn btn-circle btn-sm btn-ghost" onclick={() => changeDate(-1)}>
						<ChevronLeft class="size-5" />
					</button>
					<button class="btn btn-circle btn-sm btn-ghost" onclick={() => changeDate(1)}>
						<ChevronRight class="size-5" />
					</button>
				</div>
				<span class="font-bold text-sm min-w-[120px] text-center">{formattedDate}</span>
			</div>
		</div>

		<!-- Input Section -->
		<div class="card bg-base-100 shadow-lg border border-primary/10 overflow-visible" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
			<div class="card-body p-6 space-y-6">
				<form 
					method="POST" 
					action="?/create" 
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								toast.add('Catatan jurnal tersimpan!', 'success');
								triggerConfetti();
								gratitudeText = '';
								selectedMood = 'happy';
								await update();
							} else {
								toast.add('Gagal menyimpan catatan.', 'error');
							}
						};
					}}
					class="space-y-6"
				>
					<input type="hidden" name="date" value={currentDate.toISOString()} />
					<input type="hidden" name="mood" value={selectedMood} />

					<!-- Mood Selector -->
					<div class="space-y-3">
						<label class="label" for="">
							<span class="label-text font-medium text-base">Apa yang kamu rasakan?</span>
						</label>
						<div class="flex justify-between overflow-x-auto p-2 gap-2">
							{#each moods as mood}
								<button 
									type="button"
									class="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all
									{selectedMood === mood.type ? mood.bg : 'bg-slate-50 hover:bg-slate-100'}"
									onclick={() => selectedMood = mood.type}
								>
									<div class="size-10 flex items-center justify-center transition-transform duration-300 {selectedMood === mood.type ? 'scale-110' : ''}">
										<mood.icon class="size-8 {selectedMood === mood.type ? mood.color : 'text-base-content/30'}" 
											strokeWidth={selectedMood === mood.type ? 2.5 : 2}/>
									</div>
									<span class="text-xs font-medium {selectedMood === mood.type ? mood.color : 'text-base-content/50'}">
										{mood.label}
									</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Gratitude Input -->
					<div class="space-y-3">
						<label class="label" for="gratitude">
							<span class="label-text font-medium text-base">Apa yang kamu syukuri hari ini?</span>
						</label>
						<div class="relative">
							<Textarea 
								name="gratitude"
								placeholder="Hari ini, aku bersyukur karena..." 
								class="min-h-[120px] text-lg leading-relaxed resize-none bg-base-100 border-base-content/10 focus:border-primary/50"
								bind:value={gratitudeText}
							/>
							<div class="absolute bottom-3 right-3">
								<Sparkles class="size-5 text-primary/20" />
							</div>
						</div>
					</div>

					<!-- Action -->
					<div class="flex justify-end">
						<Button 
							type="submit"
							variant="primary" 
							class="gap-2 px-8 rounded-full shadow-lg shadow-primary/20"
							disabled={!gratitudeText.trim() || isSubmitting}
							loading={isSubmitting}
						>
							{#if isSubmitting}
								<Loading variant='infinity' />
								memuat
							{:else}
								<Save class="size-4" />
								Simpan Catatan
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</div>

		<!-- History Log -->
		<div class="space-y-4">
			<h2 class="text-xl font-bold flex items-center gap-2 px-1" in:fly={{ y: 20, duration: 600, delay: 200 }}>
				<Calendar class="size-5 text-base-content/60" />
				Catatan untuk {formattedDate}
			</h2>

			<div class="space-y-4">
				{#if filteredLogs.length === 0}
					<div class="text-center py-12 text-base-content/40 bg-base-100 rounded-3xl border border-dashed border-base-content/10" in:fade>
						<Sparkles class="size-8 mx-auto mb-2 opacity-50" />
						<p>Belum ada catatan hari ini. Mulai menulis!</p>
					</div>
				{:else}
					{#each filteredLogs as log, i (log.id)}
						<div 
							class="card bg-base-100 shadow-sm border border-base-content/5 hover:shadow-md transition-all duration-300 group"
							in:fly={{ y: 20, duration: 500, delay: 300 + (i * 100) }}
							out:slide|local
						>
							<div class="card-body p-5">
								<div class="flex items-start justify-between gap-4">
									<div class="flex items-start gap-4">
										<div class="mt-1 p-2 rounded-xl bg-base-200/50">
											<!-- svelte-ignore svelte_component_deprecated -->
											<svelte:component 
												this={getMoodIcon(log.mood)} 
												class="size-6 {getMoodColor(log.mood)}" 
											/>
											
										</div>
										<div class="space-y-1">
											<p class="text-base-content/80 leading-relaxed whitespace-pre-wrap">{log.gratitude}</p>
											<p class="text-xs text-base-content/40 font-medium pt-1">{formatTime(log.createdAt || new Date())}</p>
										</div>
									</div>
									
									<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<button 
											class="btn btn-ghost btn-xs btn-circle text-base-content/60"
											onclick={() => openEditModal(log)}
											title="Ubah Catatan"
										>
											<Pencil class="size-4" />
										</button>
										<button 
											class="btn btn-ghost btn-xs btn-circle text-error"
											onclick={() => openDeleteModal(log.id)}
											title="Hapus Catatan"
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
</div>

<!-- Edit Modal -->
<Modal bind:open={isEditModalOpen} title="Ubah Catatan Jurnal">
	{#if editingLog}
		<form 
			method="POST" 
			action="?/update" 
			use:enhance={() => {
				isSubmitting = true
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.add('Catatan berhasil diperbarui!', 'success');
						isEditModalOpen = false;
						triggerConfetti();
						isSubmitting = false
						await update();
					} else {
						toast.add('Gagal memperbarui catatan.', 'error');
					}
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="id" value={editingLog.id} />
			<input type="hidden" name="mood" value={editingLog.mood} />

			<!-- Mood Selector -->
			<div class="space-y-3">
				<label class="label" for="">
					<span class="label-text font-medium text-base">Perasaan</span>
				</label>
				<div class="flex justify-between overflow-x-auto p-2 gap-2">
					{#each moods as mood}
						<button 
							type="button"
							class="flex flex-1 flex-col items-center gap-2 rounded-xl p-3 transition-all
							{editingLog.mood === mood.type ? mood.bg : 'bg-slate-50 hover:bg-slate-100'}"
							onclick={() => editingLog!.mood = mood.type}
						>
							<div class="size-8 flex items-center justify-center transition-transform duration-300 {editingLog.mood === mood.type ? 'scale-110' : ''}">
								<mood.icon class="size-6 {editingLog.mood === mood.type ? mood.color : 'text-base-content/30'}" />
							</div>
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-3">
				<label class="label" for="edit-gratitude">
					<span class="label-text font-medium">Rasa Syukur</span>
				</label>
				<Textarea 
					name="gratitude"
					bind:value={editingLog.gratitude}
					class="min-h-[120px]"
				/>
			</div>

			<div class="flex justify-end gap-3">
				<Button type="button" variant="ghost" onclick={() => isEditModalOpen = false}>Batal</Button>
				<Button type="submit" variant="primary" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loading variant='infinity' />
						memuat
					{:else}
						<Save class="size-4" />
						Perbarui
					{/if}
				</Button>
			</div>
		</form>
	{/if}
</Modal>

<!-- Delete Modal -->
<Modal bind:open={isDeleteModalOpen} title="Hapus Catatan">
	<div class="space-y-4">
		<p>Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.</p>
		<form 
			method="POST" 
			action="?/delete" 
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.add('Catatan berhasil dihapus.', 'info');
						isDeleteModalOpen = false;
						update();
					} else {
						toast.add('Gagal menghapus catatan.', 'error');
					}
				};
			}}
			class="flex justify-end gap-3"
		>
			<input type="hidden" name="id" value={deletingLogId} />
			<Button type="button" variant="ghost" onclick={() => isDeleteModalOpen = false}>Batal</Button>
			<Button type="submit" variant="error">Hapus</Button>
		</form>
	</div>
</Modal>

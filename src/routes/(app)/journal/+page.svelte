<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		Smile,
		Frown,
		Meh,
		Heart,
		Coffee,
		Calendar,
		Save,
		Trash2,
		Sparkles,
		BookHeart,
		ChevronLeft,
		ChevronRight,
		Pencil,
		AlertTriangle
	} from 'lucide-svelte';
	import { Button, Textarea, Modal, Loading } from '$lib/components/ui';
	import confetti from 'canvas-confetti';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import { page } from '$app/state';
	import { formatDate, formatTime } from '$lib/utils/format';
	import * as m from '$lib/paraglide/messages.js';

	// Types
	type MoodType = 'happy' | 'blessed' | 'neutral' | 'tired' | 'sad';

	// State
	let currentDate = $state(new Date());
	let selectedMood = $state<MoodType>('happy');
	let gratitudeText = $state('');
	let isSubmitting = $state(false);

	// Edit State
	let isEditModalOpen = $state(false);
	let editingLog = $state<{ id: string; mood: MoodType; gratitude: string } | null>(null);

	// Delete State
	let isDeleteModalOpen = $state(false);
	let deletingLogId = $state<string | null>(null);

	// Derived
	let filteredLogs = $derived(
		page?.data?.logs?.filter((log: { date: Date }) => {
			const logDate = new Date(log.date);
			return (
				logDate.getDate() === currentDate.getDate() &&
				logDate.getMonth() === currentDate.getMonth() &&
				logDate.getFullYear() === currentDate.getFullYear()
			);
		})
	);

	// Constants - Enhanced with gradients
	const moods: {
		type: MoodType;
		icon: any;
		label: string;
		color: string;
		bg: string;
		gradient: string;
		dotColor: string;
	}[] = [
		{
			type: 'happy',
			icon: Smile,
			label: m.journal_mood_happy(),
			color: 'text-success',
			bg: 'bg-success/10 ring-2 ring-success ring-offset-2 ring-offset-base-100 text-success',
			gradient: 'from-success/20 to-emerald-500/20',
			dotColor: 'bg-success'
		},
		{
			type: 'blessed',
			icon: Heart,
			label: m.journal_mood_blessed(),
			color: 'text-error',
			bg: 'bg-error/10 ring-2 ring-error ring-offset-2 ring-offset-base-100 text-error',
			gradient: 'from-error/20 to-pink-500/20',
			dotColor: 'bg-error'
		},
		{
			type: 'neutral',
			icon: Meh,
			label: m.journal_mood_neutral(),
			color: 'text-warning',
			bg: 'bg-warning/10 ring-2 ring-warning ring-offset-2 ring-offset-base-100 text-warning',
			gradient: 'from-warning/20 to-amber-500/20',
			dotColor: 'bg-warning'
		},
		{
			type: 'tired',
			icon: Coffee,
			label: m.journal_mood_tired(),
			color: 'text-gray-400',
			bg: 'bg-gray-400/10 ring-2 ring-gray-400 ring-offset-2 ring-offset-base-100 text-gray-400',
			gradient: 'from-gray-400/20 to-slate-500/20',
			dotColor: 'bg-gray-400'
		},
		{
			type: 'sad',
			icon: Frown,
			label: m.journal_mood_sad(),
			color: 'text-info',
			bg: 'bg-info/10 ring-2 ring-info ring-offset-2 ring-offset-base-100 text-info',
			gradient: 'from-info/20 to-blue-500/20',
			dotColor: 'bg-info'
		}
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

	function getMoodData(type: string) {
		return moods.find((m) => m.type === type) || moods[0];
	}
</script>

<div class="min-h-screen bg-base-200 p-4 pb-24 lg:p-8">
	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Header with Glassmorphism -->
		<header
			class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-error/5 via-transparent to-warning/5 p-6 lg:p-8"
			in:fly={{ y: -20, duration: 800, easing: quintOut }}
		>
			<!-- Animated background orbs -->
			<div
				class="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-error/10 blur-3xl animate-breathe"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 size-56 rounded-full bg-warning/10 blur-3xl animate-breathe"
				style="animation-delay: -2s"
			></div>

			<div
				class="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
			>
				<div>
					<h1 class="flex items-center gap-3 text-3xl font-bold lg:text-4xl">
						<div
							class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-error/20 to-warning/20"
						>
							<BookHeart class="size-6 text-error" />
						</div>
						{m.journal_title()}
					</h1>
					<p class="mt-2 text-base-content/60">{m.journal_subtitle()}</p>
				</div>

				<!-- Glass Date Navigator -->
				<div class="glass-card flex items-center gap-1 rounded-2xl p-1.5">
					<Button variant="ghost" size="sm" circle onclick={() => changeDate(-1)}>
						<ChevronLeft class="size-5" />
					</Button>
					<span class="min-w-[140px] px-4 py-2 text-center font-medium"
						>{formatDate(currentDate)}</span
					>
					<Button variant="ghost" size="sm" circle onclick={() => changeDate(1)}>
						<ChevronRight class="size-5" />
					</Button>
				</div>
			</div>
		</header>

		<!-- Input Section with Gradient Border Glow -->
		<div class="relative" in:scale={{ duration: 600, start: 0.95, delay: 100 }}>
			<!-- Gradient border glow -->
			<div
				class="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-error/20 via-warning/20 to-success/20 opacity-50 blur"
			></div>

			<div class="glass-card relative space-y-6 rounded-3xl p-6 lg:p-8">
				<form
					method="POST"
					action="?/create"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								toast.add(m.journal_toast_saved(), 'success');
								triggerConfetti();
								gratitudeText = '';
								selectedMood = 'happy';
								await update();
							} else {
								toast.add(m.journal_toast_failed(), 'error');
							}
						};
					}}
					class="space-y-6"
				>
					<input type="hidden" name="date" value={currentDate.toISOString()} />
					<input type="hidden" name="mood" value={selectedMood} />

					<!-- Mood Selector -->
					<div class="space-y-4">
						<label class="flex items-center gap-2 font-medium">
							<Sparkles class="size-4 text-warning" />
							{m.journal_mood_question()}
						</label>

						<div class="flex flex-wrap justify-center gap-3">
							{#each moods as mood}
								<button
									type="button"
									class="group flex flex-col items-center gap-2 rounded-2xl p-4 transition-all duration-300
										{selectedMood === mood.type
										? `${mood.bg} scale-105 shadow-lg`
										: 'glass-card hover:scale-102 hover:shadow-md'}"
									onclick={() => (selectedMood = mood.type)}
								>
									<div
										class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br {mood.gradient} transition-transform duration-300 group-hover:scale-110"
									>
										<mood.icon
											class="size-7 transition-all {selectedMood === mood.type
												? mood.color
												: 'text-base-content/40'}"
											strokeWidth={selectedMood === mood.type ? 2.5 : 2}
										/>
									</div>
									<span
										class="text-xs font-medium {selectedMood === mood.type
											? mood.color
											: 'text-base-content/50'}"
									>
										{mood.label}
									</span>
								</button>
							{/each}
						</div>
					</div>

					<!-- Gratitude Input with Character Count -->
					<div class="space-y-3">
						<label class="flex items-center justify-between">
							<span class="flex items-center gap-2 font-medium">
								<Heart class="size-4 text-error" />
								{m.journal_gratitude_question()}
							</span>
							<span class="text-xs text-base-content/40">{gratitudeText.length}/500</span>
						</label>

						<div class="relative">
							<Textarea
								name="gratitude"
								placeholder={m.journal_gratitude_placeholder()}
								class="min-h-[140px] resize-none rounded-2xl border-base-content/10 bg-transparent text-lg leading-relaxed focus:border-error/30"
								bind:value={gratitudeText}
								maxlength={500}
							/>
							<Sparkles class="absolute bottom-4 right-4 size-5 text-warning/30" />
						</div>
					</div>

					<!-- Save Button with Gradient -->
					<div class="flex justify-end">
						<Button
							type="submit"
							class="gap-2 rounded-full border-0 bg-gradient-to-r from-error to-warning px-8 text-white shadow-lg shadow-error/20 transition-all hover:shadow-xl hover:shadow-error/30"
							disabled={!gratitudeText.trim() || isSubmitting}
							loading={isSubmitting}
						>
							{#if isSubmitting}
								<Loading variant="infinity" />
								{m.journal_loading()}
							{:else}
								<Save class="size-4" />
								{m.journal_save_button()}
							{/if}
						</Button>
					</div>
				</form>
			</div>
		</div>

		<!-- History Log - Timeline Style -->
		<section class="space-y-4">
			<h2
				class="flex items-center gap-2 px-1 text-xl font-bold"
				in:fly={{ y: 20, duration: 600, delay: 200 }}
			>
				<div class="flex size-8 items-center justify-center rounded-lg bg-base-content/5">
					<Calendar class="size-4 text-base-content/60" />
				</div>
				{m.journal_history_title()}
				{formatDate(currentDate)}
			</h2>

			{#if filteredLogs.length === 0}
				<!-- Empty State with Illustration -->
				<div class="glass-card rounded-3xl p-12 text-center" in:fade>
					<div
						class="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-warning/10 to-error/10"
					>
						<Sparkles class="size-10 text-warning/50" />
					</div>
					<p class="text-lg text-base-content/50">{m.journal_no_logs()}</p>
					<p class="mt-2 text-sm text-base-content/30">Mulai tulis syukurmu hari ini!</p>
				</div>
			{:else}
				<!-- Timeline with connecting line -->
				<div class="relative pl-6">
					<div class="absolute bottom-0 left-[7px] top-0 w-0.5 bg-base-content/10"></div>

					{#each filteredLogs as log, i (log.id)}
						{@const moodData = getMoodData(log.mood)}
						<div
							class="glass-card group relative mb-4 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
							in:fly={{ y: 20, duration: 500, delay: 300 + i * 100 }}
							out:slide|local
						>
							<!-- Timeline dot with mood color -->
							<div
								class="absolute -left-[17px] top-6 size-3 rounded-full {moodData.dotColor} ring-4 ring-base-200"
							></div>

							<div class="flex items-start gap-4">
								<!-- Mood Icon -->
								<div
									class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br {moodData.gradient}"
								>
									<!-- svelte-ignore svelte_component_deprecated -->
									<svelte:component this={moodData.icon} class="size-6 {moodData.color}" />
								</div>

								<!-- Content -->
								<div class="min-w-0 flex-1">
									<p class="whitespace-pre-wrap leading-relaxed text-base-content/80">
										{log.gratitude}
									</p>
									<p class="mt-2 text-xs font-medium text-base-content/40">
										{formatTime(log.createdAt || new Date())}
									</p>
								</div>

								<!-- Actions -->
								<div class="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
									<button
										class="btn btn-circle btn-ghost btn-xs text-base-content/60"
										onclick={() => openEditModal(log)}
										title="Ubah Catatan"
									>
										<Pencil class="size-4" />
									</button>
									<button
										class="btn btn-circle btn-ghost btn-xs text-error"
										onclick={() => openDeleteModal(log.id)}
										title="Hapus Catatan"
									>
										<Trash2 class="size-4" />
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</div>
</div>

<!-- Edit Modal -->
<Modal bind:open={isEditModalOpen} title={m.journal_edit_title()}>
	{#if editingLog}
		<form
			method="POST"
			action="?/update"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.add(m.journal_toast_updated(), 'success');
						isEditModalOpen = false;
						triggerConfetti();
						isSubmitting = false;
						await update();
					} else {
						toast.add(m.journal_toast_update_failed(), 'error');
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
					<span class="label-text text-base font-medium">{m.journal_mood_label()}</span>
				</label>
				<div class="flex flex-wrap justify-center gap-2 p-2">
					{#each moods as mood}
						<button
							type="button"
							class="flex flex-col items-center gap-2 rounded-xl p-3 transition-all
								{editingLog.mood === mood.type ? mood.bg : 'bg-base-200 hover:bg-base-300'}"
							onclick={() => (editingLog!.mood = mood.type)}
						>
							<div
								class="flex size-10 items-center justify-center rounded-full bg-gradient-to-br {mood.gradient}"
							>
								<mood.icon
									class="size-6 {editingLog.mood === mood.type
										? mood.color
										: 'text-base-content/30'}"
								/>
							</div>
							<span
								class="text-xs {editingLog.mood === mood.type
									? mood.color
									: 'text-base-content/50'}">{mood.label}</span
							>
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-3">
				<label class="label" for="edit-gratitude">
					<span class="label-text font-medium">{m.journal_gratitude_label()}</span>
				</label>
				<Textarea name="gratitude" bind:value={editingLog.gratitude} class="min-h-[120px]" />
			</div>

			<div class="flex justify-end gap-3">
				<Button type="button" variant="ghost" onclick={() => (isEditModalOpen = false)}
					>{m.journal_cancel_button()}</Button
				>
				<Button type="submit" variant="primary" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loading variant="infinity" />
						{m.journal_loading()}
					{:else}
						<Save class="size-4" />
						{m.journal_update_button()}
					{/if}
				</Button>
			</div>
		</form>
	{/if}
</Modal>

<!-- Delete Modal -->
<Modal bind:open={isDeleteModalOpen} title={m.journal_delete_title()}>
	<div class="space-y-4">
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex size-16 items-center justify-center rounded-full bg-error/10 text-error">
				<AlertTriangle class="size-8" />
			</div>
			<p>{m.journal_delete_confirm()}</p>
		</div>
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						toast.add(m.journal_toast_deleted(), 'info');
						isDeleteModalOpen = false;
						update();
					} else {
						toast.add(m.journal_toast_delete_failed(), 'error');
					}
				};
			}}
			class="flex justify-center gap-3"
		>
			<input type="hidden" name="id" value={deletingLogId} />
			<Button type="button" variant="ghost" onclick={() => (isDeleteModalOpen = false)}
				>{m.journal_cancel_button()}</Button
			>
			<Button type="submit" class="btn-error text-white">{m.journal_delete_button()}</Button>
		</form>
	</div>
</Modal>

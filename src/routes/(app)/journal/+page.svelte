<script lang="ts">
	import { fade, fly, scale, slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Smile, Frown, Meh, Heart, Coffee, Calendar, Plus, Save, Trash2, Sparkles, BookHeart, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { Card, Button, Textarea } from '$lib/components/ui';
	import confetti from 'canvas-confetti';

	// Types
	type MoodType = 'happy' | 'blessed' | 'neutral' | 'tired' | 'sad';

	interface JournalLog {
		id: string;
		date: Date;
		mood: MoodType;
		gratitude: string;
	}

	// State
	let currentDate = $state(new Date());
	let selectedMood = $state<MoodType>('happy');
	let gratitudeText = $state('');
	let logs = $state<JournalLog[]>([
		{
			id: '1',
			date: new Date(Date.now() - 86400000), // Yesterday
			mood: 'blessed',
			gratitude: 'Alhamdulillah for the rain today, it felt so peaceful.'
		},
		{
			id: '2',
			date: new Date(Date.now() - 172800000), // 2 days ago
			mood: 'tired',
			gratitude: 'Grateful that I managed to finish my work deadlines.'
		}
	]);

	// Derived
	let filteredLogs = $derived(
		logs.filter(log => 
			log.date.getDate() === currentDate.getDate() &&
			log.date.getMonth() === currentDate.getMonth() &&
			log.date.getFullYear() === currentDate.getFullYear()
		).sort((a, b) => b.date.getTime() - a.date.getTime())
	);

	let formattedDate = $derived(new Intl.DateTimeFormat('en-GB', { 
		weekday: 'short', 
		day: 'numeric', 
		month: 'short', 
		year: 'numeric' 
	}).format(currentDate));

	// Constants
	const moods: { type: MoodType; icon: any; label: string; color: string }[] = [
		{ type: 'happy', icon: Smile, label: 'Happy', color: 'text-success', bg: 'bg-green-50 ring-2 ring-green-500 ring-offset-2 text-green-500' },
		{ type: 'blessed', icon: Heart, label: 'Blessed', color: 'text-error', bg: 'bg-red-50 ring-2 ring-red-500 ring-offset-2 text-red-500' },
		{ type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-warning', bg: 'bg-yellow-50 ring-2 ring-yellow-500 ring-offset-2 text-yellow-500' },
		{ type: 'tired', icon: Coffee, label: 'Tired', color: 'text-neutral', bg: 'bg-gray-50 ring-2 ring-gray-500 ring-offset-2 text-gray-500' },
		{ type: 'sad', icon: Frown, label: 'Sad', color: 'text-info', bg: 'bg-blue-50 ring-2 ring-blue-500 ring-offset-2 text-blue-500' }
	];

	// Actions
	function changeDate(days: number) {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + days);
		currentDate = newDate;
	}

	function saveLog() {
		if (!gratitudeText.trim()) return;

		const newLog: JournalLog = {
			id: crypto.randomUUID(),
			date: new Date(currentDate), // Use current selected date
			mood: selectedMood,
			gratitude: gratitudeText
		};

		logs = [newLog, ...logs];
		gratitudeText = '';
		selectedMood = 'happy';
		triggerConfetti();
	}

	function deleteLog(id: string) {
		if (confirm('Delete this journal entry?')) {
			logs = logs.filter(l => l.id !== id);
		}
	}

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}

	function getMoodColor(type: MoodType) {
		const mood = moods.find(m => m.type === type);
		return mood ? mood.color : 'text-base-content';
	}

	function getMoodIcon(type: MoodType) {
		const mood = moods.find(m => m.type === type);
		return mood ? mood.icon : Smile;
	}

	function formatTime(date: Date) {
		return new Intl.DateTimeFormat('en-US', { 
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
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
				<p class="text-base-content/60">Reflect on your day and count your blessings.</p>
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
				<!-- Mood Selector -->
				<div class="space-y-3">
					<label class="label" for="">
						<span class="label-text font-medium text-base">How are you feeling?</span>
					</label>
					<div class="flex justify-between overflow-x-auto p-2 gap-2">
						{#each moods as mood}
							<button 
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
					<label class="label">
						<span class="label-text font-medium text-base">What are you grateful for today?</span>
					</label>
					<div class="relative">
						<Textarea 
							placeholder="Today, I am grateful for..." 
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
						variant="primary" 
						class="gap-2 px-8 rounded-full shadow-lg shadow-primary/20"
						disabled={!gratitudeText.trim()}
						onclick={saveLog}
					>
						<Save class="size-4" />
						Save Entry
					</Button>
				</div>
			</div>
		</div>

		<!-- History Log -->
		<div class="space-y-4">
			<h2 class="text-xl font-bold flex items-center gap-2 px-1" in:fly={{ y: 20, duration: 600, delay: 200 }}>
				<Calendar class="size-5 text-base-content/60" />
				Entries for {formattedDate}
			</h2>

			<div class="space-y-4">
				{#if filteredLogs.length === 0}
					<div class="text-center py-12 text-base-content/40 bg-base-100 rounded-3xl border border-dashed border-base-content/10" in:fade>
						<Sparkles class="size-8 mx-auto mb-2 opacity-50" />
						<p>No entries for this day. Start your journal!</p>
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
											<svelte:component 
												this={getMoodIcon(log.mood)} 
												class="size-6 {getMoodColor(log.mood)}" 
											/>
										</div>
										<div class="space-y-1">
											<p class="text-base-content/80 leading-relaxed whitespace-pre-wrap">{log.gratitude}</p>
											<p class="text-xs text-base-content/40 font-medium pt-1">{formatTime(log.date)}</p>
										</div>
									</div>
									
									<button 
										class="btn btn-ghost btn-xs btn-circle text-error opacity-0 group-hover:opacity-100 transition-opacity"
										onclick={() => deleteLog(log.id)}
										title="Delete Entry"
									>
										<Trash2 class="size-4" />
									</button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

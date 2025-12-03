<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { ArrowLeft, HelpCircle, MessageCircle, Mail, Twitter, Instagram, ChevronDown } from 'lucide-svelte';
	import { Card, Button, Input, Textarea } from '$lib/components/ui';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from '$lib/stores/toast';
	import confetti from 'canvas-confetti';

	let faqs = [
		{ q: 'Bagaimana cara mengubah metode perhitungan sholat?', a: 'Anda dapat mengubahnya di menu Preferensi > Pengaturan Ibadah > Metode Perhitungan.' },
		{ q: 'Apakah data saya aman?', a: 'Ya, kami menggunakan enkripsi standar industri untuk melindungi data pribadi Anda.' },
		{ q: 'Bagaimana cara mereset streak?', a: 'Streak akan reset otomatis jika Anda melewatkan satu hari. Saat ini belum ada fitur reset manual.' }
	];

	let activeFaq = $state<number | null>(null);
	let isSubmitting = $state(false);

	function triggerConfetti() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10B981', '#34D399', '#FBBF24', '#F472B6']
		});
	}
</script>

<div class="min-h-screen bg-base-100 p-4 pb-24 lg:p-8">
	<div class="max-w-2xl mx-auto space-y-6">
		<!-- Header -->
		<header class="flex items-center gap-4" in:fly={{ y: -20, duration: 800, easing: quintOut }}>
			<Button variant="ghost" circle size="sm" onclick={()=>goto('/profile')}>
				<ArrowLeft class="size-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold">Bantuan & Support</h1>
				<p class="text-base-content/60 text-sm">Kami siap membantu Anda</p>
			</div>
		</header>

		<div class="space-y-8" in:fly={{ y: 20, duration: 800, delay: 100 }}>
			<!-- Contact Form -->
			<Card class="bg-base-100 shadow-sm border border-base-content/10">
				<form 
					method="POST" 
					action="?/submitTicket"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								toast.add('Message sent successfully!', 'success');
								triggerConfetti();
								update();
							} else {
								toast.add('Failed to send message.', 'error');
							}
						};
					}}
					class="p-6 space-y-4"
				>
					<h3 class="font-bold text-lg flex items-center gap-2">
						<MessageCircle class="size-5 text-primary" />
						Hubungi Kami
					</h3>
					
					<div class="space-y-3">
						<Input name="subject" placeholder="Subjek" class="bg-base-200/50" required />
						<Textarea name="message" placeholder="Tulis pesan Anda di sini..." class="bg-base-200/50 min-h-[120px]" required />
					</div>
					
					<div class="flex justify-end">
						<Button 
							type="submit" 
							variant="primary" 
							class="gap-2"
							disabled={isSubmitting}
						>
							{#if isSubmitting}
								<span class="loading loading-spinner loading-xs"></span>
							{:else}
								<Mail class="size-4" />
							{/if}
							Kirim Pesan
						</Button>
					</div>
				</form>
			</Card>

			<!-- FAQ -->
			<div class="space-y-4">
				<h3 class="font-bold text-lg px-2 flex items-center gap-2">
					<HelpCircle class="size-5 text-secondary" />
					Pertanyaan Umum (FAQ)
				</h3>
				
				<div class="join join-vertical w-full bg-base-100 border border-base-content/10 rounded-2xl shadow-sm">
					{#each faqs as faq, i}
						<div class="collapse collapse-arrow join-item border-base-content/10 border-b last:border-none">
							<input type="radio" name="my-accordion-4" checked={activeFaq === i} onclick={() => activeFaq = activeFaq === i ? null : i} /> 
							<div class="collapse-title text-base font-medium">
								{faq.q}
							</div>
							<div class="collapse-content text-sm text-base-content/70"> 
								<p>{faq.a}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Socials & Version -->
			<div class="text-center space-y-6 pt-4">
				<div class="flex justify-center gap-4">
					<Button variant="ghost" circle class="bg-base-200 hover:bg-base-300">
						<Instagram class="size-5" />
					</Button>
					<Button variant="ghost" circle class="bg-base-200 hover:bg-base-300">
						<Twitter class="size-5" />
					</Button>
					<Button variant="ghost" circle class="bg-base-200 hover:bg-base-300">
						<Mail class="size-5" />
					</Button>
				</div>
				
				<div class="text-xs text-base-content/40">
					<p>HabbiTrax v1.0.0 (Beta)</p>
					<p>&copy; 2025 HabbiTrax Team</p>
				</div>
			</div>
		</div>
	</div>
</div>

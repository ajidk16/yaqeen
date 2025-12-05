<script lang="ts">
	import { Check, Star } from 'lucide-svelte';
	import { inview } from '$lib/actions/inview';
	import { fly } from 'svelte/transition';

	let visible = $state(true);

	const features = {
		free: [
			'Unlimited Habits Tracking',
			'Basic Ibadah Tracker (Sholat & Fasting)',
			'Quran Journaling',
			'Ad-supported experience'
		],
		premium: [
			'Everything in Free',
			'No Ads (Distraction-free)',
			'AI Muhasabah Coach (Unlimited)',
			'Advanced Analytics & Insights',
			'Cloud Sync & Backup',
			'10% Infaq to Charity'
		]
	};
</script>

<section
	id="pricing"
	class="py-24 bg-slate-50 relative overflow-hidden"
	use:inview={{ threshold: 0.2 }}
>
	<!-- Background decoration -->
	<div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
		<div class="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
		<div class="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
	</div>

	<div class="container mx-auto px-4 relative z-10">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
				Invest in Your <span class="text-primary">Akhirat</span>
			</h2>
			<p class="text-lg text-slate-600">
				Choose the plan that fits your journey. Our premium plan includes a direct contribution to
				charity.
			</p>
		</div>

		{#if visible}
			<div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
				<!-- Free Plan -->
				<div
					in:fly={{ y: 50, duration: 800, delay: 0 }}
					class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group"
				>
					<div class="mb-8">
						<h3 class="text-xl font-bold text-slate-900 mb-2">Basic</h3>
						<div class="flex items-baseline gap-1">
							<span class="text-4xl font-bold text-slate-900">Free</span>
							<span class="text-slate-500">/ forever</span>
						</div>
						<p class="text-slate-500 mt-4">Essential tools for your daily spiritual habits.</p>
					</div>

					<ul class="space-y-4 mb-8">
						{#each features.free as feature}
							<li class="flex items-start gap-3 text-slate-600">
								<div
									class="mt-1 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0"
								>
									<Check size={12} class="text-slate-600" />
								</div>
								{feature}
							</li>
						{/each}
					</ul>

					<a
						href="/register"
						class="block w-full py-3 px-6 text-center rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
					>
						Mulai Hijrah
					</a>
				</div>

				<!-- Premium Plan -->
				<div
					in:fly={{ y: 50, duration: 800, delay: 200 }}
					class="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden"
				>
					<!-- Gradient Border Effect -->
					<div
						class="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
					></div>

					<div
						class="absolute top-0 right-0 bg-gradient-to-l from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl"
					>
						RECOMMENDED
					</div>

					<div class="mb-8 relative z-10">
						<h3 class="text-xl font-bold text-white mb-2 flex items-center gap-2">
							Premium <Star size={16} class="text-yellow-400 fill-yellow-400" />
						</h3>
						<div class="flex items-baseline gap-1">
							<span class="text-4xl font-bold text-white">Rp 29k</span>
							<span class="text-slate-400">/ month</span>
						</div>
						<p class="text-slate-400 mt-4">Supercharge your istiqomah with AI & insights.</p>
					</div>

					<ul class="space-y-4 mb-8 relative z-10">
						{#each features.premium as feature}
							<li class="flex items-start gap-3 text-slate-300">
								<div
									class="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/50"
								>
									<Check size={12} class="text-white" />
								</div>
								{feature}
							</li>
						{/each}
					</ul>

					<a
						href="/register?plan=premium"
						class="block w-full py-3 px-6 text-center rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] relative z-10"
					>
						Subscribe & Donate
					</a>
				</div>
			</div>
		{/if}
	</div>
</section>

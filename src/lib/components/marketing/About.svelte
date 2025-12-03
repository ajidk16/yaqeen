<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import { fade, fly } from 'svelte/transition';
	import { Heart, Brain, Zap, Check } from 'lucide-svelte';

	let visible = $state(false);
</script>

<section 
	id="about"
	class="py-24 bg-white relative overflow-hidden"
	use:inview={{ threshold: 0.3 }}
>
	<div class="container mx-auto px-4">

			<div class="flex flex-col lg:flex-row items-center gap-16">
				<!-- Text Content -->
				<div class="lg:w-1/2" in:fly={{ x: -50, duration: 800, delay: 0 }}>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
						<Heart size={14} class="fill-primary" />
						<span>Our Mission</span>
					</div>
					
					<h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
						Bridging the Gap Between <br />
						<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Deen & Dunya</span>
					</h2>
					
					<p class="text-lg text-slate-600 mb-6 leading-relaxed">
						We noticed a problem: productivity apps ignore our spiritual life, and religious apps often lack modern productivity features.
					</p>
					
					<p class="text-lg text-slate-600 mb-8 leading-relaxed">
						YaaQeen was built to solve this. We believe that true success (Falah) comes from balancing your worldly ambitions with your spiritual obligations.
					</p>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div class="flex gap-4">
							<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
								<Brain size={20} />
							</div>
							<div>
								<h4 class="font-bold text-slate-900 mb-1">AI Muhasabah</h4>
								<p class="text-sm text-slate-500">Smart reflection partner that helps you grow, not just track.</p>
							</div>
						</div>
						<div class="flex gap-4">
							<div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary">
								<Zap size={20} />
							</div>
							<div>
								<h4 class="font-bold text-slate-900 mb-1">Frictionless</h4>
								<p class="text-sm text-slate-500">Designed for speed. Log your habits in seconds.</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Visual/Image Side -->
				<div class="lg:w-1/2 w-full" in:fly={{ x: 50, duration: 800, delay: 200 }}>
					<div class="relative aspect-square md:aspect-video lg:aspect-square max-w-lg mx-auto">
						<!-- Abstract Composition -->
						<div class="absolute inset-0 bg-gradient-to-tr from-slate-100 to-slate-50 rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
							<!-- Decorative Circles -->
							<div class="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
							<div class="absolute bottom-10 left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;"></div>
							
							<!-- UI Mockup Placeholder -->
							<div class="absolute inset-8 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 flex flex-col gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
								<div class="flex items-center justify-between border-b border-slate-100 pb-4">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 rounded-full bg-slate-100"></div>
										<div class="space-y-2">
											<div class="w-24 h-3 bg-slate-100 rounded-full"></div>
											<div class="w-16 h-2 bg-slate-50 rounded-full"></div>
										</div>
									</div>
									<div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
										<Check size={16} />
									</div>
								</div>
								
								<div class="space-y-3">
									<div class="h-16 bg-slate-50 rounded-xl p-3 flex items-center gap-3">
										<div class="w-10 h-10 rounded-lg bg-primary/20"></div>
										<div class="flex-1">
											<div class="w-20 h-3 bg-slate-200 rounded-full mb-2"></div>
											<div class="w-full h-2 bg-slate-100 rounded-full"></div>
										</div>
									</div>
									<div class="h-16 bg-slate-50 rounded-xl p-3 flex items-center gap-3">
										<div class="w-10 h-10 rounded-lg bg-secondary/20"></div>
										<div class="flex-1">
											<div class="w-24 h-3 bg-slate-200 rounded-full mb-2"></div>
											<div class="w-3/4 h-2 bg-slate-100 rounded-full"></div>
										</div>
									</div>
								</div>

								<!-- AI Chat Bubble -->
								<div class="mt-auto bg-primary/5 p-4 rounded-xl border border-primary/10">
									<div class="flex gap-2 mb-2">
										<div class="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
										<div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.1s"></div>
										<div class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></div>
									</div>
									<div class="w-full h-2 bg-primary/10 rounded-full mb-2"></div>
									<div class="w-2/3 h-2 bg-primary/10 rounded-full"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

	</div>
</section>

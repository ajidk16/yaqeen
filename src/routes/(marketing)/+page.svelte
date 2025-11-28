<script>
	import { ArrowRight, Sparkles, CheckCircle } from 'lucide-svelte';
</script>

<section class="relative overflow-hidden pt-20 pb-32 md:pt-32">
	<!-- Background Gradients -->
	<div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
	</div>

	<div class="container mx-auto px-4 text-center">
		<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-8 animate-fade-in-up">
			<Sparkles size={16} class="text-primary" />
			<span class="text-sm font-medium text-slate-600">The #1 Muslim Habit Tracker</span>
		</div>

		<h1 class="mb-6 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-7xl animate-fade-in-up" style="animation-delay: 0.1s;">
			Build Habits that <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Last Forever</span>
			<br />
			<span class="text-secondary">Dunia & Akhirat</span>
		</h1>
		
		<p class="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl animate-fade-in-up" style="animation-delay: 0.2s;">
			The first habit tracker designed for the modern Muslim. Balance your spiritual duties with worldly productivity in a beautiful, distraction-free environment.
		</p>
		
		<div class="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up" style="animation-delay: 0.3s;">
			<a href="/register" class="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/40">
				Start Your Journey 
				<ArrowRight size={20} class="transition-transform group-hover:translate-x-1" />
			</a>
			<a href="#features" class="rounded-full bg-white px-8 py-4 text-lg font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50">
				Learn More
			</a>
		</div>

		<!-- Feature Highlights -->
		<div class="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in-up" style="animation-delay: 0.5s;">
			<div class="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
				<div class="w-12 h-12 rounded-xl bg-ibadah-bg text-ibadah flex items-center justify-center">
					<CheckCircle size={24} />
				</div>
				<h3 class="font-bold text-slate-800">Ibadah Tracking</h3>
				<p class="text-sm text-slate-500">Track prayers, fasting, and quran reading effortlessly.</p>
			</div>
			<div class="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
				<div class="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
					<Sparkles size={24} />
				</div>
				<h3 class="font-bold text-slate-800">AI Muhasabah</h3>
				<p class="text-sm text-slate-500">Get personalized spiritual insights from our AI coach.</p>
			</div>
			<div class="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
				<div class="w-12 h-12 rounded-xl bg-secondary-soft text-secondary flex items-center justify-center">
					<CheckCircle size={24} />
				</div>
				<h3 class="font-bold text-slate-800">Halal Gamification</h3>
				<p class="text-sm text-slate-500">Earn badges and streaks without compromising intention.</p>
			</div>
		</div>
	</div>
</section>

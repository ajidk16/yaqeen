<script lang="ts">
	import { Button } from '$lib/components/ui';
</script>

<footer class="border-t border-base-200 bg-base-100 pt-16 pb-8">
	<div class="container mx-auto px-4">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Brand -->
			<div class="space-y-4">
				<a href="/" class="flex items-center gap-2 text-xl font-bold text-primary">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
						H
					</div>
					<span>HabbiTrax</span>
				</a>
				<p class="text-sm text-base-content/70">
					Empowering your journey towards better habits and spiritual growth.
				</p>
			</div>

			<!-- Product -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">Product</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="/features" class="hover:text-primary">Features</a></li>
					<li><a href="/pricing" class="hover:text-primary">Pricing</a></li>
					<li><a href="/changelog" class="hover:text-primary">Changelog</a></li>
					<li><a href="/docs" class="hover:text-primary">Documentation</a></li>
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">Company</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="/about" class="hover:text-primary">About</a></li>
					<li><a href="/blog" class="hover:text-primary">Blog</a></li>
					<li><a href="/careers" class="hover:text-primary">Careers</a></li>
					<li><a href="/contact" class="hover:text-primary">Contact</a></li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">Legal</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="/privacy" class="hover:text-primary">Privacy</a></li>
					<li><a href="/terms" class="hover:text-primary">Terms</a></li>
					<li><a href="/cookies" class="hover:text-primary">Cookies</a></li>
				</ul>
			</div>
		</div>

		<div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-base-200 pt-8 md:flex-row">
			<p class="text-sm text-base-content/60">
				© {new Date().getFullYear()} HabbiTrax. All rights reserved.
			</p>
			<div class="flex gap-4">
				<!-- Social Links could go here -->
			</div>
		</div>
	</div>
</footer>

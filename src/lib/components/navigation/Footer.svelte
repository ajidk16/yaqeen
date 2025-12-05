<script>
	import * as m from '$lib/paraglide/messages.js';
</script>

<footer class="border-t border-base-200 bg-base-100 pt-16 pb-8">
	<div class="container mx-auto px-4">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Brand -->
			<div class="space-y-4">
				<a href="/" class="flex items-center gap-2 text-xl font-bold text-primary">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-content"
					>
						YQ
					</div>
					<span>YaaQeen</span>
				</a>
				<p class="text-sm text-base-content/70">
					{m.footerBrandDescription()}
				</p>
			</div>

			<!-- Product -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">
					{m.footerProductTitle()}
				</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="#features" class="hover:text-primary">{m.footerProductFeatures()}</a></li>
					<li><a href="#pricing" class="hover:text-primary">{m.footerProductPricing()}</a></li>
					<li><a href="#changelog" class="hover:text-primary">{m.footerProductChangelog()}</a></li>
					<li><a href="#docs" class="hover:text-primary">{m.footerProductDocs()}</a></li>
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">
					{m.footerCompanyTitle()}
				</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="#about" class="hover:text-primary">{m.footerCompanyAbout()}</a></li>
					<li><a href="#blog" class="hover:text-primary">{m.footerCompanyBlog()}</a></li>
					<li><a href="#careers" class="hover:text-primary">{m.footerCompanyCareers()}</a></li>
					<li><a href="#contact" class="hover:text-primary">{m.footerCompanyContact()}</a></li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-base-content">
					{m.footerLegalTitle()}
				</h4>
				<ul class="space-y-2 text-sm text-base-content/70">
					<li><a href="#privacy" class="hover:text-primary">{m.footerLegalPrivacy()}</a></li>
					<li><a href="#terms" class="hover:text-primary">{m.footerLegalTerms()}</a></li>
					<li><a href="#cookies" class="hover:text-primary">{m.footerLegalCookies()}</a></li>
				</ul>
			</div>
		</div>

		<div
			class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-base-200 pt-8 md:flex-row"
		>
			<p class="text-sm text-base-content/60">
				{m.footerCopyright({ year: new Date().getFullYear().toString() })}
			</p>
		</div>
	</div>
</footer>

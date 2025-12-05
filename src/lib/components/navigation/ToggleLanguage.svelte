<script lang="ts">
	import { locales, getLocale, setLocale } from '$lib/paraglide/runtime';
	import { page } from '$app/state';
	import { Globe, Check } from 'lucide-svelte';

	function getLanguageUrl(targetLang: string) {
		const currentLang = getLocale();
		const path = page.url.pathname;

		if (path.startsWith(`/${currentLang}`)) {
			// Current lang is explicit in URL.
			// If target is 'id' (base), assume it should be hidden -> remove prefix.
			if (targetLang === 'id') {
				return path.replace(`/${currentLang}`, '') || '/';
			}
			return path.replace(`/${currentLang}`, `/${targetLang}`);
		} else {
			// Current lang is implicit (hidden).
			// If target is 'id', it should also be implicit -> keep path.
			if (targetLang === 'id') return path;

			// If target is not 'id', prepend it.
			return `/${targetLang}${path === '/' ? '' : path}`;
		}
	}

	// Helper to get language name
	const languageNames: Record<string, string> = {
		id: 'Bahasa Indonesia',
		en: 'English'
	};
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-circle" aria-label="Select Language">
		<Globe class="size-5" />
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<ul
		tabindex="0"
		class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-xl border border-base-content/10"
	>
		{#each locales as lang}
			<li>
				<button
                    onclick={() => {
                        const url = getLanguageUrl(lang);
                        setLocale(lang);
                    }}
					data-sveltekit-reload
					class="flex items-center justify-between {getLocale() === lang ? 'active font-bold' : ''}"
				>
					<span>{languageNames[lang] || lang.toUpperCase()}</span>
					{#if getLocale() === lang}
						<Check class="size-4" />
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

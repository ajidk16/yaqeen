<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui';
	import { onMount } from 'svelte';
	import { Sun, Moon, Menu, X } from 'lucide-svelte';

	let isMenuOpen = $state(false);
	let theme = $state('light');

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
		} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
			theme = 'dark';
		}
	});

	onMount(() => {
		document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
			anchor.addEventListener('click', function (e) {
				e.preventDefault();
				const targetId = this.getAttribute('href').substring(1);
				const targetElement = document.getElementById(targetId);
				if (targetElement) {
					targetElement.scrollIntoView({
						behavior: 'smooth'
					});
				}
			});
		});
	});

	const navLinks = [
		{ href: '#features', label: 'Fitur Unggulan' },
		{ href: '#pricing', label: 'Investasi' },
		{ href: '#about', label: 'Tentang Kami' },
	];
</script>

<nav class="sticky top-0 z-50 w-full border-b border-base-200 bg-base-100/80 backdrop-blur-md">
	<div class="container mx-auto px-4">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo -->
			<a href="/" class="flex items-center gap-2 text-xl font-bold text-primary">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
					H
				</div>
				<span>HabbiTrax</span>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex md:items-center md:gap-6">
				{#each navLinks as link}
					<a
						href={link.href}
						class="text-sm font-medium transition-colors hover:text-primary
						{page.url.pathname === link.href ? 'text-primary' : 'text-base-content/70'}"
					>
						{link.label}
					</a>
				{/each}
			</div>

			<!-- Actions -->
			<div class="hidden md:flex md:items-center md:gap-4">
				<Button variant="ghost" size="sm" circle onclick={toggleTheme}>
					{#if theme === 'light'}
						<Moon class="h-5 w-5" />
					{:else}
						<Sun class="h-5 w-5" />
					{/if}
				</Button>
				{#if page.data.user}
					<a href="/dashboard" class="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary-600 hover:shadow-primary/40 active:scale-95">
						Dashboard Saya
					</a>
				{:else}
					<a href="/login" class="text-sm font-bold text-slate-600 transition-colors hover:text-primary">Masuk</a>
					<a href="/register" class="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:bg-primary-600 hover:shadow-primary/40 active:scale-95">
						Mulai Hijrah
					</a>
				{/if}
			</div>

			<!-- Mobile Menu Button -->
			<div class="flex md:hidden">
				<Button variant="ghost" size="sm" circle onclick={toggleMenu}>
					{#if isMenuOpen}
						<X class="h-6 w-6" />
					{:else}
						<Menu class="h-6 w-6" />
					{/if}
				</Button>
			</div>
		</div>
	</div>

	<!-- Mobile Menu -->
	{#if isMenuOpen}
		<div class="border-t border-base-200 bg-base-100 md:hidden">
			<div class="space-y-1 px-4 py-4">
				{#each navLinks as link}
					<a
						href={link.href}
						class="block rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-base-200 hover:text-primary
						{page.url.pathname === link.href ? 'bg-primary/10 text-primary' : 'text-base-content/70'}"
						onclick={() => (isMenuOpen = false)}
					>
						{link.label}
					</a>
				{/each}
				<div class="mt-4 flex items-center justify-between border-t border-base-200 pt-4">
					<span class="text-sm font-medium text-base-content/70">Theme</span>
					<Button variant="ghost" size="sm" circle onclick={toggleTheme}>
						{#if theme === 'light'}
							<Moon class="h-5 w-5" />
						{:else}
							<Sun class="h-5 w-5" />
						{/if}
					</Button>
				</div>
				<div class="mt-4">
					<Button variant="primary" block class="rounded-full">Get Started</Button>
				</div>
			</div>
		</div>
	{/if}
</nav>

<script lang='ts'>
	import { Moon, Sun } from "lucide-svelte";
	import Button from "../ui/Button.svelte";
	import { onMount } from "svelte";

	let theme = $state('light');

	function updateTheme(newTheme: string) {
		theme = newTheme;
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
	}

	async function toggleTheme(e: MouseEvent) {
		const newTheme = theme === 'light' ? 'dark' : 'light';

		// @ts-ignore
		if (!document.startViewTransition) {
			updateTheme(newTheme);
			return;
		}

		const x = e.clientX;
		const y = e.clientY;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y)
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			updateTheme(newTheme);
		});

		await transition.ready;

		document.documentElement.animate(
			{
				clipPath: [
					`circle(0px at ${x}px ${y}px)`,
					`circle(${endRadius}px at ${x}px ${y}px)`
				]
			},
			{
				duration: 500,
				easing: 'ease-in-out',
				pseudoElement: '::view-transition-new(root)'
			}
		);
	}

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			theme = savedTheme;
			document.documentElement.setAttribute('data-theme', theme);
		}
	});
</script>

<Button variant="ghost" size="sm" circle onclick={toggleTheme}>
    {#if theme === 'light'}
        <Moon class="h-5 w-5" />
    {:else}
        <Sun class="h-5 w-5" />
    {/if}
</Button>
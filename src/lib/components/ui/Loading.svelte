<script lang="ts">
	interface Props {
		variant?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
		size?: 'xs' | 'sm' | 'md' | 'lg';
		class?: string;
	}

	let {
		variant = 'spinner',
		size = 'md',
		class: className = ''
	}: Props = $props();
</script>

<span
	class="loading loading-{variant} loading-{size} {className}"
></span>

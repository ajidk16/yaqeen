<script lang="ts">
	interface Props {
		src?: string;
		alt?: string;
		placeholder?: string; // Initials or text if no image
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; // Custom size mapping or use w- classes
		shape?: 'circle' | 'square' | 'squircle' | 'hexagon' | 'triangle'; // Mask shapes
		online?: boolean;
		offline?: boolean;
		circle?: boolean;
		class?: string;
		containerClass?: string;
	}

	let {
		src,
		alt = 'Avatar',
		placeholder,
		size = 'md',
		shape,
		online,
		offline,
		circle,
		class: className = '',
		containerClass = ''
	}: Props = $props();

	const sizeClasses = {
		xs: 'w-8',
		sm: 'w-12',
		md: 'w-16',
		lg: 'w-24',
		xl: 'w-32'
	};
</script>

<div class="avatar {online ? 'online' : ''} {offline ? 'offline' : ''} {placeholder ? 'placeholder' : ''} {containerClass}">
	<div
		class="{sizeClasses[size]} {circle || shape === 'circle' ? 'rounded-full' : ''}
		{shape && shape !== 'circle' ? `mask mask-${shape}` : ''}
		{className}
		{placeholder ? 'bg-neutral text-neutral-content' : ''}"
	>
		{#if src}
			<img {src} {alt} />
		{:else if placeholder}
			<span class="text-xl">{placeholder}</span>
		{/if}
	</div>
</div>

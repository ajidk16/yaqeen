<script lang="ts">
	interface Option {
		value: string | number;
		label: string;
		disabled?: boolean;
	}

	interface Props {
		label?: string;
		error?: string;
		name: string;
		options: Option[];
		value?: string | number;
		containerClass?: string;
		direction?: 'row' | 'col';
	}

	let {
		label,
		error,
		name,
		options,
		value = $bindable(),
		containerClass = '',
		direction = 'col'
	}: Props = $props();
</script>

<div class="form-control {containerClass}">
	{#if label}
		<label class="label">
			<span class="label-text font-medium">{label}</span>
		</label>
	{/if}
	<div class="flex {direction === 'row' ? 'flex-row gap-4' : 'flex-col gap-2'}">
		{#each options as option}
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="radio"
					{name}
					class="radio radio-primary {error ? 'radio-error' : ''}"
					value={option.value}
					bind:group={value}
					disabled={option.disabled}
				/>
				<span class="label-text">{option.label}</span>
			</label>
		{/each}
	</div>
	{#if error}
		<label class="label">
			<span class="label-text-alt text-error">{error}</span>
		</label>
	{/if}
</div>

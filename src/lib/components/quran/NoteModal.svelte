<script lang="ts">
	import { X, Save, Trash2 } from 'lucide-svelte';
	import { Button, Modal, Textarea } from '$lib/components/ui';
	import { toast } from '$lib/stores/toast';
	import { fade } from 'svelte/transition';

	interface Props {
		open?: boolean;
		verse: any;
		surahNumber: number;
		surahName: string;
		existingNote?: string;
		onClose?: () => void;
		onSave?: (note: string) => void;
		onDelete?: () => void;
	}

	let {
		open = $bindable(false),
		verse,
		surahNumber,
		surahName,
		existingNote = '',
		onClose,
		onSave,
		onDelete
	}: Props = $props();

	let noteText = $state(existingNote);
	let isSaving = $state(false);
	let isDeleting = $state(false);

	// Sync note text when existingNote changes
	$effect(() => {
		noteText = existingNote;
	});

	async function handleSave() {
		if (!noteText.trim()) {
			toast.add('Catatan tidak boleh kosong', 'error');
			return;
		}

		isSaving = true;
		try {
			const formData = new FormData();
			formData.append('surahNumber', surahNumber.toString());
			formData.append('ayahNumber', verse.nomorAyat.toString());
			formData.append('text', noteText.trim());

			const response = await fetch('?/saveNote', { method: 'POST', body: formData });
			const result = await response.json();

			if (result.type === 'success') {
				toast.add('Catatan berhasil disimpan!', 'success');
				onSave?.(noteText.trim());
				open = false;
			} else {
				toast.add('Gagal menyimpan catatan', 'error');
			}
		} catch (e) {
			console.error(e);
			toast.add('Terjadi kesalahan', 'error');
		} finally {
			isSaving = false;
		}
	}

	async function handleDelete() {
		if (!existingNote) return;

		isDeleting = true;
		try {
			const formData = new FormData();
			formData.append('surahNumber', surahNumber.toString());
			formData.append('ayahNumber', verse.nomorAyat.toString());

			const response = await fetch('?/deleteNote', { method: 'POST', body: formData });
			const result = await response.json();

			if (result.type === 'success') {
				toast.add('Catatan dihapus', 'success');
				noteText = '';
				onDelete?.();
				open = false;
			} else {
				toast.add('Gagal menghapus catatan', 'error');
			}
		} catch (e) {
			console.error(e);
			toast.add('Terjadi kesalahan', 'error');
		} finally {
			isDeleting = false;
		}
	}

	function handleClose() {
		open = false;
		onClose?.();
	}
</script>

<Modal bind:open title="Catatan Pribadi" closeOnClickOutside={false}>
	<div class="space-y-4">
		<!-- Verse Reference -->
		<div class="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
			<div class="size-10 rounded-full bg-primary/20 flex items-center justify-center">
				<span class="text-sm font-bold text-primary">{verse?.nomorAyat}</span>
			</div>
			<div>
				<p class="font-semibold text-sm">QS. {surahName}: {verse?.nomorAyat}</p>
				<p class="text-xs text-base-content/60 line-clamp-1">{verse?.teksIndonesia}</p>
			</div>
		</div>

		<!-- Note Textarea -->
		<Textarea
			label="Catatan Anda"
			placeholder="Tulis catatan, refleksi, atau pengingat untuk ayat ini..."
			bind:value={noteText}
			class="min-h-32"
		/>

		<!-- Hint -->
		<p class="text-xs text-base-content/50">
			💡 Catatan ini hanya tersimpan untuk Anda dan tidak akan terlihat oleh orang lain.
		</p>
	</div>

	{#snippet actions()}
		<div class="flex items-center gap-2 w-full">
			{#if existingNote}
				<Button
					variant="error"
					outline
					size="sm"
					onclick={handleDelete}
					disabled={isDeleting}
					loading={isDeleting}
				>
					<Trash2 class="size-4 mr-1" />
					Hapus
				</Button>
			{/if}
			<div class="flex-1"></div>
			<Button variant="ghost" onclick={handleClose}>Batal</Button>
			<Button variant="primary" onclick={handleSave} disabled={isSaving} loading={isSaving}>
				<Save class="size-4 mr-1" />
				Simpan
			</Button>
		</div>
	{/snippet}
</Modal>

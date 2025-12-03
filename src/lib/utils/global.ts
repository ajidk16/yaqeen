import {  Dumbbell, GlassWater, BookOpen, Coffee, Briefcase, Heart, Star, Zap, } from 'lucide-svelte';
	// Types
export type Category = 'Wajib' | 'Sunnah' | 'Mubah';


export	const categories: { label: Category; color: string; description: string }[] = [
		{ label: 'Wajib', color: 'primary', description: 'Ibadah wajib yang harus ditunaikan.' },
		{ label: 'Sunnah', color: 'secondary', description: 'Amalan sunnah untuk pahala tambahan.' },
		{ label: 'Mubah', color: 'accent', description: 'Aktivitas harian yang bermanfaat.' }
	];

export const icons = [
		{ component: Dumbbell, label: 'Olahraga' },
		{ component: BookOpen, label: 'Membaca' },
		{ component: GlassWater, label: 'Minum' },
		{ component: Coffee, label: 'Santai' },
		{ component: Briefcase, label: 'Bekerja' },
		{ component: Heart, label: 'Kesehatan' },
		{ component: Star, label: 'Target' },
		{ component: Zap, label: 'Energi' }
	];


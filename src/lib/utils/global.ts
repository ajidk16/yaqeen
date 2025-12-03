import {  Dumbbell, GlassWater, BookOpen, Coffee, Briefcase, Heart, Star, Zap, } from 'lucide-svelte';
	// Types
export type Category = 'Wajib' | 'Sunnah' | 'Mubah';


export	const categories: { label: Category; color: string; description: string }[] = [
		{ label: 'Wajib', color: 'primary', description: 'Obligatory acts that must be done.' },
		{ label: 'Sunnah', color: 'secondary', description: 'Recommended acts for extra reward.' },
		{ label: 'Mubah', color: 'accent', description: 'Permissible daily activities.' }
	];

export const icons = [
		{ component: Dumbbell, label: 'Exercise' },
		{ component: BookOpen, label: 'Read' },
		{ component: GlassWater, label: 'Drink' },
		{ component: Coffee, label: 'Relax' },
		{ component: Briefcase, label: 'Work' },
		{ component: Heart, label: 'Health' },
		{ component: Star, label: 'Goal' },
		{ component: Zap, label: 'Energy' }
	];


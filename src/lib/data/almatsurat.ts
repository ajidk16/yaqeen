// Al-Matsurat Data Types (shared between server and client)

export interface DzikrVerse {
	note: string;
	arabic: string;
	translation: string;
}

export interface DzikrItem {
	index: number;
	name: string;
	verses: DzikrVerse[];
	repetition: number;
}

// These will be loaded from server via page.data
// Do not import ALMATSURAT_DATA directly in client components
// Use page.data.almatsuratData instead

// Placeholder exports for type compatibility (actual data comes from server)
export const ALMATSURAT_DATA: DzikrItem[] = [];
export const TOTAL_REPETITIONS = 0;

export function getArabicText(verse: DzikrVerse, _sessionType: 'morning' | 'evening'): string {
	return verse.arabic;
}

export function getTranslation(verse: DzikrVerse, _sessionType: 'morning' | 'evening'): string {
	return verse.translation;
}

// Custom parser for Al-Matsurat .toon file format
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { DzikrItem } from '$lib/data/almatsurat';

interface RawVerse {
	note: string;
	text: string;
	trans: string;
}

// Parse repetition from dzikr name or note
function parseRepetition(name: string, note?: string): number {
	// Check name for pattern like "(3x)"
	const nameMatch = name.match(/\((\d+)x\)/i);
	if (nameMatch) return parseInt(nameMatch[1], 10);
	
	// Check note for pattern like "Dibaca 3 Kali" or "Dibaca 10 Kali" or "Dibaca 100 Kali"
	if (note) {
		const noteMatch = note.match(/Dibaca\s+(\d+)\s+Kali/i);
		if (noteMatch) return parseInt(noteMatch[1], 10);
	}
	
	return 1;
}

// Clean the name by removing repetition suffix
function cleanName(name: string): string {
	return name.replace(/\s*-\s*\(\d+x\)/i, '').trim();
}

// Parse the custom .toon format
function parseToonContent(content: string): DzikrItem[] {
	const lines = content.split('\n');
	const items: DzikrItem[] = [];
	
	let currentItem: { name: string; verses: RawVerse[] } | null = null;
	let index = 0;
	
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		
		// Skip empty lines and header like [32],
		if (!trimmed || trimmed.match(/^\[\d+\],?$/)) continue;
		
		// New item starts with "  -"
		if (line.match(/^\s{2}-\s*$/)) {
			if (currentItem) {
				const firstNote = currentItem.verses[0]?.note || '';
				items.push({
					index: index++,
					name: cleanName(currentItem.name),
					verses: currentItem.verses.map(v => ({
						note: v.note,
						arabic: v.text,
						translation: v.trans
					})),
					repetition: parseRepetition(currentItem.name, firstNote)
				});
			}
			currentItem = { name: '', verses: [] };
			continue;
		}
		
		// dzikr_name line
		if (trimmed.startsWith('dzikr_name,')) {
			if (currentItem) {
				currentItem.name = trimmed.substring('dzikr_name,'.length);
			}
			continue;
		}
		
		// dzikr_list header - skip
		if (trimmed.startsWith('dzikr_list[')) continue;
		
		// Verse line - starts with spaces and has commas
		if (currentItem && line.match(/^\s{6}/) && trimmed.includes(',')) {
			// Format: note,arabic,translation (or ,arabic,translation if no note)
			// Some lines may have commas in the translation, so we need to be careful
			const parts = trimmed.split(',');
			
			if (parts.length >= 3) {
				const note = parts[0] || '';
				const text = parts[1] || '';
				// Join remaining parts as translation
				const trans = parts.slice(2).join(',').replace(/\\n/g, '\n').replace(/\\\\/g, "'");
				
				currentItem.verses.push({ note, text, trans });
			}
		}
		
		// Handle continuation lines that start with ",Ayat" - these are additional verses
		if (currentItem && trimmed.startsWith(',Ayat')) {
			const parts = trimmed.split(',');
			if (parts.length >= 4) {
				// Format: ,Ayat X,arabic,translation
				const note = parts[1] || '';
				const text = parts[2] || '';
				const trans = parts.slice(3).join(',').replace(/\\n/g, '\n').replace(/\\\\/g, "'");
				currentItem.verses.push({ note, text, trans });
			}
		}
	}
	
	// Don't forget the last item
	if (currentItem) {
		const firstNote = currentItem.verses[0]?.note || '';
		items.push({
			index: index++,
			name: cleanName(currentItem.name),
			verses: currentItem.verses.map(v => ({
				note: v.note,
				arabic: v.text,
				translation: v.trans
			})),
			repetition: parseRepetition(currentItem.name, firstNote)
		});
	}
	
	return items;
}

// Load and parse data from .toon file (server-side only)
export function loadAlmatsuratData(): DzikrItem[] {
	try {
		const filePath = resolve('src/lib/utils/almatsurat-sugro.toon');
		const content = readFileSync(filePath, 'utf-8');
		return parseToonContent(content);
	} catch (error) {
		console.error('Failed to load almatsurat data:', error);
		return [];
	}
}

// Calculate total repetitions
export function calculateTotalRepetitions(data: DzikrItem[]): number {
	return data.reduce((sum, item) => sum + item.repetition, 0);
}

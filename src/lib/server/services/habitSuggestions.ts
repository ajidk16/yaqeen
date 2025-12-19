import { db } from '$lib/server/db';
import { habitLogs, habits } from '$lib/server/db/schema';
import { count, eq, sql, desc, and, isNotNull } from 'drizzle-orm';

// Types
export interface TimePattern {
	hour: number;
	count: number;
	habitIds: string[];
}

export interface TimeSlot {
	id: string;
	label: string;
	labelEn: string;
	startHour: number;
	endHour: number;
	icon: string;
}

export interface HabitSuggestion {
	id: string;
	timeSlot: string;
	timeSlotLabel: string;
	message: string;
	successRate: number;
	completionCount: number;
	topHabits: string[];
}

export interface SuggestionsResult {
	suggestions: HabitSuggestion[];
	hasEnoughData: boolean;
	totalCompletions: number;
}

// Time slot definitions
const TIME_SLOTS: TimeSlot[] = [
	{ id: 'morning', label: 'Pagi Hari', labelEn: 'Morning', startHour: 5, endHour: 9, icon: '🌅' },
	{ id: 'midday', label: 'Siang Hari', labelEn: 'Midday', startHour: 9, endHour: 12, icon: '☀️' },
	{ id: 'afternoon', label: 'Sore Hari', labelEn: 'Afternoon', startHour: 12, endHour: 17, icon: '🌤️' },
	{ id: 'evening', label: 'Petang', labelEn: 'Evening', startHour: 17, endHour: 21, icon: '🌆' },
	{ id: 'night', label: 'Malam Hari', labelEn: 'Night', startHour: 21, endHour: 5, icon: '🌙' }
];

// total habit count


/**
 * Get the time slot for a given hour
 */
function getTimeSlotForHour(hour: number): TimeSlot {
	for (const slot of TIME_SLOTS) {
		if (slot.id === 'night') {
			// Night wraps around midnight
			if (hour >= slot.startHour || hour < slot.endHour) {
				return slot;
			}
		} else if (hour >= slot.startHour && hour < slot.endHour) {
			return slot;
		}
	}
	return TIME_SLOTS[0]; // Default to morning
}

/**
 * Analyze completion patterns from habit logs
 */
async function analyzeCompletionPatterns(userId: string): Promise<TimePattern[]> {
	// Query habit logs with their completion timestamps
	const logs = await db
		.select({
			createdAt: habitLogs.createdAt,
			habitId: habitLogs.habitId
		})
		.from(habitLogs)
		.where(
			and(
				eq(habitLogs.userId, userId),
				eq(habitLogs.status, 'completed'),
				isNotNull(habitLogs.createdAt)
			)
		)
		.orderBy(desc(habitLogs.createdAt))
		.limit(500); // Last 500 completions for analysis

	// Group by hour
	const hourlyPatterns: Map<number, { count: number; habitIds: Set<string> }> = new Map();

	for (const log of logs) {
		if (!log.createdAt) continue;

		const hour = new Date(log.createdAt).getHours();
		const existing = hourlyPatterns.get(hour) || { count: 0, habitIds: new Set() };
		existing.count++;
		existing.habitIds.add(log.habitId);
		hourlyPatterns.set(hour, existing);
	}

	// Convert to array
	const patterns: TimePattern[] = [];
	for (const [hour, data] of hourlyPatterns) {
		patterns.push({
			hour,
			count: data.count,
			habitIds: Array.from(data.habitIds)
		});
	}

	return patterns.sort((a, b) => b.count - a.count);
}

/**
 * Cluster patterns into time slots
 */
function clusterIntoTimeSlots(patterns: TimePattern[]): Map<string, { count: number; habitIds: Set<string> }> {
	const slots: Map<string, { count: number; habitIds: Set<string> }> = new Map();

	// Initialize all slots
	for (const slot of TIME_SLOTS) {
		slots.set(slot.id, { count: 0, habitIds: new Set() });
	}

	// Aggregate patterns into slots
	for (const pattern of patterns) {
		const slot = getTimeSlotForHour(pattern.hour);
		const existing = slots.get(slot.id)!;
		existing.count += pattern.count;
		pattern.habitIds.forEach(id => existing.habitIds.add(id));
	}

	return slots;
}

/**
 * Get habit titles by IDs
 */
async function getHabitTitles(habitIds: string[]): Promise<Map<string, string>> {
	if (habitIds.length === 0) return new Map();

	const habitsData = await db
		.select({ id: habits.id, title: habits.title })
		.from(habits)
		.where(sql`${habits.id} IN ${habitIds}`);

	return new Map(habitsData.map(h => [h.id, h.title]));
}

/**
 * Generate personalized suggestion message
 */
function generateMessage(slot: TimeSlot, topHabits: string[], successRate: number): string {
	const habitList = topHabits.slice(0, 2).join(' & ');

	if (successRate >= 80) {
		return `Kamu sangat konsisten di ${slot.label.toLowerCase()}! ${habitList} sering selesai di jam ini. Coba tambah habit baru di waktu yang sama? 🎯`;
	} else if (successRate >= 60) {
		return `${slot.label} adalah waktu produktifmu untuk ${habitList}. Pertahankan konsistensi ini! 💪`;
	} else {
		return `Kamu sudah mulai membangun kebiasaan di ${slot.label.toLowerCase()}. Terus semangat! 🌟`;
	}
}

/**
 * Main function to generate habit suggestions
 */
export async function generateSuggestions(userId: string): Promise<SuggestionsResult> {
	// Analyze patterns
	const patterns = await analyzeCompletionPatterns(userId);

	// Calculate total completions
	const totalCompletions = patterns.reduce((sum, p) => sum + p.count, 0);
	const MIN_COMPLETIONS_THRESHOLD = await db.select({ count: count() })
		.from(habits)
		.where(eq(habits.userId, userId))
		.then(res => res[0].count || 0);

	// Check minimum threshold
	if (totalCompletions < MIN_COMPLETIONS_THRESHOLD) {
		console.log('Not enough completions', MIN_COMPLETIONS_THRESHOLD);
		return {
			suggestions: [],
			hasEnoughData: false,
			totalCompletions
		};
	}

	// Cluster into time slots
	const slotData = clusterIntoTimeSlots(patterns);

	// Get all unique habit IDs
	const allHabitIds: Set<string> = new Set();
	for (const [, data] of slotData) {
		data.habitIds.forEach(id => allHabitIds.add(id));
	}

	// Fetch habit titles
	const habitTitles = await getHabitTitles(Array.from(allHabitIds));

	// Generate suggestions sorted by completion count
	const suggestions: HabitSuggestion[] = [];

	const sortedSlots = Array.from(slotData.entries())
		.filter(([, data]) => data.count > 0)
		.sort((a, b) => b[1].count - a[1].count);

	for (const [slotId, data] of sortedSlots) {
		const slot = TIME_SLOTS.find(s => s.id === slotId)!;
		const successRate = Math.round((data.count / totalCompletions) * 100);

		// Get top habit titles for this slot
		const topHabitIds = Array.from(data.habitIds).slice(0, 3);
		const topHabits = topHabitIds
			.map(id => habitTitles.get(id))
			.filter((t): t is string => !!t);

		const timeRange = slot.id === 'night'
			? `${slot.startHour.toString().padStart(2, '0')}:00 - 05:00`
			: `${slot.startHour.toString().padStart(2, '0')}:00 - ${slot.endHour.toString().padStart(2, '0')}:00`;

		suggestions.push({
			id: slotId,
			timeSlot: timeRange,
			timeSlotLabel: `${slot.icon} ${slot.label}`,
			message: generateMessage(slot, topHabits, successRate),
			successRate,
			completionCount: data.count,
			topHabits
		});
	}

	// Return top 3 suggestions
	return {
		suggestions: suggestions.slice(0, 3),
		hasEnoughData: true,
		totalCompletions
	};
}

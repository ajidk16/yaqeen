import { db } from '$lib/server/db';
import { habitLogs, habits } from '$lib/server/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

// Types
export interface DayData {
	date: string;
	completedCount: number;
	totalHabits: number;
	completionRate: number;
	level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapData {
	days: DayData[];
	totalDaysActive: number;
	currentStreak: number;
	bestStreak: number;
	startDate: string;
	endDate: string;
}

/**
 * Calculate intensity level based on completion rate
 */
function getLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
	if (rate === 0) return 0;
	if (rate <= 25) return 1;
	if (rate <= 50) return 2;
	if (rate <= 75) return 3;
	return 4;
}

/**
 * Generate array of dates for the heatmap grid
 */
function generateDateRange(months: number): string[] {
	const dates: string[] = [];
	const endDate = new Date();
	const startDate = new Date();
	startDate.setMonth(startDate.getMonth() - months);
	
	// Align to start of week (Sunday)
	startDate.setDate(startDate.getDate() - startDate.getDay());
	
	const current = new Date(startDate);
	while (current <= endDate) {
		dates.push(current.toISOString().split('T')[0]);
		current.setDate(current.getDate() + 1);
	}
	
	return dates;
}

/**
 * Calculate streak from array of active dates
 */
function calculateStreaks(activeDates: Set<string>): { current: number; best: number } {
	if (activeDates.size === 0) return { current: 0, best: 0 };
	
	const sortedDates = Array.from(activeDates).sort().reverse();
	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
	
	let currentStreak = 0;
	let bestStreak = 0;
	let tempStreak = 0;
	
	// Calculate current streak (must include today or yesterday)
	if (sortedDates[0] === today || sortedDates[0] === yesterday) {
		let expectedDate = new Date(sortedDates[0]);
		for (const dateStr of sortedDates) {
			const date = new Date(dateStr);
			const expected = expectedDate.toISOString().split('T')[0];
			if (dateStr === expected) {
				currentStreak++;
				expectedDate.setDate(expectedDate.getDate() - 1);
			} else {
				break;
			}
		}
	}
	
	// Calculate best streak
	const allSortedDates = Array.from(activeDates).sort();
	for (let i = 0; i < allSortedDates.length; i++) {
		if (i === 0) {
			tempStreak = 1;
		} else {
			const prev = new Date(allSortedDates[i - 1]);
			const curr = new Date(allSortedDates[i]);
			const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
			
			if (diffDays === 1) {
				tempStreak++;
			} else {
				tempStreak = 1;
			}
		}
		bestStreak = Math.max(bestStreak, tempStreak);
	}
	
	return { current: currentStreak, best: bestStreak };
}

/**
 * Get heatmap data for a user
 */
export async function getHeatmapData(userId: string, months: number = 12): Promise<HeatmapData> {
	const dateRange = generateDateRange(months);
	const startDate = dateRange[0];
	const endDate = dateRange[dateRange.length - 1];
	
	// Fetch all habit logs in the date range
	const logs = await db
		.select({
			date: habitLogs.date,
			habitId: habitLogs.habitId,
			status: habitLogs.status
		})
		.from(habitLogs)
		.where(
			and(
				eq(habitLogs.userId, userId),
				gte(habitLogs.date, startDate),
				lte(habitLogs.date, endDate)
			)
		);
	
	// Get total active habits count
	const activeHabits = await db
		.select({ id: habits.id })
		.from(habits)
		.where(and(eq(habits.userId, userId), eq(habits.archived, false)));
	
	const totalHabitsCount = activeHabits.length || 1; // Prevent division by zero
	
	// Group logs by date
	const logsByDate: Map<string, { completed: number; total: number }> = new Map();
	for (const log of logs) {
		const existing = logsByDate.get(log.date) || { completed: 0, total: 0 };
		existing.total++;
		if (log.status === 'completed') {
			existing.completed++;
		}
		logsByDate.set(log.date, existing);
	}
	
	// Generate day data for each date
	const days: DayData[] = [];
	const activeDates: Set<string> = new Set();
	
	for (const date of dateRange) {
		const dayLogs = logsByDate.get(date);
		const completedCount = dayLogs?.completed || 0;
		const totalHabits = totalHabitsCount;
		const completionRate = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
		
		if (completedCount > 0) {
			activeDates.add(date);
		}
		
		days.push({
			date,
			completedCount,
			totalHabits,
			completionRate,
			level: getLevel(completionRate)
		});
	}
	
	const { current: currentStreak, best: bestStreak } = calculateStreaks(activeDates);
	
	return {
		days,
		totalDaysActive: activeDates.size,
		currentStreak,
		bestStreak,
		startDate,
		endDate
	};
}

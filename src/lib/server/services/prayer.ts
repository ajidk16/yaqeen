import { user } from '$lib/server/db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type User = InferSelectModel<typeof user>;

const PRAYER_NAMES = {
	fajr: 'Subuh',
	dhuhr: 'Dzuhur',
	asr: 'Ashar',
	maghrib: 'Maghrib',
	isha: 'Isya'
} as const;

type PrayerName = keyof typeof PRAYER_NAMES;

export interface PrayerTime {
	id: string;
	name: string;
	time: string;
	timestamp: number;
	isNext: boolean;
	isPassed: boolean;
	notificationEnabled: boolean;
}

export async function fetchPrayerTimes(
	lat: number,
	lng: number,
	fetchFn: typeof fetch
) {
	const date = new Date();
	const method = 20; // Kemenag RI
	const url = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=${method}`;
	
	const response = await fetchFn(url);
	const data = await response.json();

	if (data.code !== 200) {
		throw new Error('Failed to fetch prayer times from API');
	}

	return {
		timings: data.data.timings,
		meta: data.data.meta
	};
}

export function formatPrayerTimes(timings: Record<string, string>, preferences: any): PrayerTime[] {
	return Object.entries(timings)
		.filter(([key]) => Object.keys(PRAYER_NAMES).includes(key.toLowerCase()))
		.map(([key, timeStr]) => {
			const [hours, minutes] = timeStr.split(':');
			const prayerDate = new Date();
			prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

			const prayerKey = key.toLowerCase();
			const isNotificationEnabled = preferences?.notificationSettings?.prayers?.[prayerKey] ?? false;

			return {
				id: key,
				name: PRAYER_NAMES[key as PrayerName],
				time: timeStr,
				timestamp: prayerDate.getTime(),
				isNext: false,
				isPassed: false,
				notificationEnabled: isNotificationEnabled ? true : false
			};
		})
		.sort((a, b) => a.timestamp - b.timestamp);
}

import type { LayoutServerLoad } from './$types';
import { fetchPrayerTimes, formatPrayerTimes, type PrayerTime } from '$lib/server/services/prayer';
import { db } from '$lib/server/db';
import { menstruationLogs } from '$lib/server/db/schema';
import { eq, and, isNull, lte, or, gte, sql } from 'drizzle-orm';

export const load: LayoutServerLoad = async ({ cookies, fetch, locals }) => {
	let prayerTimes: PrayerTime[] | null = null;
	const profile = locals.user;

	// 1. Try to get cached prayer times
	const cachedPrayers = cookies.get('prayer-times');
	if (cachedPrayers) {
		try {
			const parsed = JSON.parse(cachedPrayers);
			const today = new Date().toDateString();
			const cachedDate = new Date(parsed.timestamp).toDateString();

			// Check if data is for today and location matches (simple check)
			if (today === cachedDate &&
				parsed.lat === profile?.location.lat &&
				parsed.lng === profile?.location.lng) {
				prayerTimes = parsed.data;
			}
		} catch (e) {
			console.error('Error parsing prayer cache:', e);
		}
	}

	// 2. If no valid cache, fetch from API
	if (!prayerTimes && profile?.location) {
		try {
			const lat = Number(profile.location.lat);
			const lng = Number(profile.location.lng);

			const { timings, meta } = await fetchPrayerTimes(lat, lng, fetch);

			prayerTimes = formatPrayerTimes(timings, profile.preferences);

			// Save to cookie (30 days)
			cookies.set('prayer-times', JSON.stringify({
				data: prayerTimes,
				locationName: meta.timezone,
				timestamp: new Date().getTime(),
				lat,
				lng
			}), {
				path: '/',
				maxAge: 60 * 60 * 24 * 30,
				httpOnly: false
			});
		} catch (e) {
			console.error('Failed to fetch prayer times', e);
		}
	}

	// 3. Check menstruation status
	let isMenstruating = false;
	if (profile?.gender === 'female' && profile.id) {
		const activeLog = await db.query.menstruationLogs.findFirst({
			where: and(
				eq(menstruationLogs.userId, profile.id),
				lte(menstruationLogs.startDate, sql`CURRENT_DATE`),
				or(
					isNull(menstruationLogs.endDate),
					gte(menstruationLogs.endDate, sql`CURRENT_DATE`)
				)
			)
		});
		isMenstruating = !!activeLog;
	}

	return {
		prayerTimes: prayerTimes || [],
		user: profile,
		isMenstruating
	};
};

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, fetch, locals }) => {
	let prayerTimes = null;

	const profile = locals.user

	// 2. Try to get cached prayer times
	const cachedPrayers = cookies.get('prayer-times');
	if (cachedPrayers) {

		const parsed = JSON.parse(cachedPrayers);
		const today = new Date().toDateString();
		const cachedDate = new Date(parsed.timestamp).toDateString();

		// Check if data is for today
		if (today === cachedDate) {
			prayerTimes = parsed.data;
		}

	}

	// 3. If no valid cache, fetch from API
	if (!prayerTimes) {
		try {
			const date = new Date();
			const method = 20; // Kemenag RI
			const response = await fetch(`https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${profile?.location.lat}&longitude=${profile?.location.lng}&method=${method}`);
			const data = await response.json();

			if (data.code === 200) {
				const timings = data.data.timings;
				const meta = data.data.meta;

				const PRAYER_NAMES = {
					Fajr: 'Subuh',
					Dhuhr: 'Dzuhur',
					Asr: 'Ashar',
					Maghrib: 'Maghrib',
					Isha: 'Isya'
				};

				const prayerList = Object.entries(timings)
					.filter(([key]) => ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key))
					.map(([key, timeStr]) => {
						const [hours, minutes] = (timeStr as string).split(':');
						const prayerDate = new Date();
						prayerDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

						return {
							id: key,
							name: PRAYER_NAMES[key as keyof typeof PRAYER_NAMES],
							time: timeStr as string,
							timestamp: prayerDate.getTime(),
							isNext: false,
							isPassed: false,
							notificationEnabled: true
						};
					})
					.sort((a, b) => a.timestamp - b.timestamp);

				prayerTimes = prayerList;

				// Save to cookie (1 month)
				cookies.set('prayer-times', JSON.stringify({
					data: prayerList,
					locationName: meta.timezone,
					timestamp: new Date().getTime(),
					lat: profile?.location.lat,
					lng: profile?.location.lng
				}), {
					path: '/',
					maxAge: 60 * 60 * 24 * 30, // 30 days
					httpOnly: false
				});
			}
		} catch (e) {
			console.error('Failed to fetch prayer times', e);
		}
	}

	return {
		prayerTimes: prayerTimes || [],
		user: profile
	};
};

import { SvelteDate } from "svelte/reactivity";

export interface PrayerTime {
	id: string;
	name: string;
	time: string; // HH:mm
	timestamp: number; // Unix timestamp
	isNext: boolean;
	isPassed: boolean;
	notificationEnabled: boolean;
}

export class PrayerTimer {
	currentTime = $state(new SvelteDate());
	prayerTimes = $state<PrayerTime[]>([]);
	interval: ReturnType<typeof setInterval> | null = null;

	soundPreference = $state('notification');
	lastPlayedPrayerId = $state<string | null>(null);
	isMuted = $state(false);
	audio: HTMLAudioElement | null = null;

	constructor(initialPrayers: PrayerTime[] = [], soundPreference: string = 'notification') {
		this.prayerTimes = this.hydrateTimestamps(initialPrayers);
		this.soundPreference = soundPreference;
		
		// Initialize audio on client side
		if (typeof window !== 'undefined') {
			this.audio = new Audio();
		}

		$effect(() => {
			this.interval = setInterval(() => {
				this.currentTime = new SvelteDate();
				this.checkAudio();
			}, 1000);

			return () => {
				if (this.interval) clearInterval(this.interval);
			};
		});
	}

	private hydrateTimestamps(prayers: PrayerTime[]): PrayerTime[] {
		const now = new SvelteDate();
		return prayers.map(p => {
			const [hours, minutes] = p.time.split(':').map(Number);
			const date = new SvelteDate(now);
			date.setHours(hours, minutes, 0, 0);
			
			return {
				...p,
				timestamp: date.getTime()
			};
		});
	}

	audioSrc = $derived.by(() => {
		if (this.soundPreference === 'adzan') return '/audio/adzan.mp3';
		if (this.soundPreference === 'bird') return '/audio/bird.mp3';
		return '/audio/notification.mp3';
	});

	checkAudio() {
		if (!this.audio || this.isMuted) return;

		const now = this.currentTime.getTime();
		const activePrayer = this.currentActivePrayer;

		if (activePrayer) {
			const timeSinceStart = now - activePrayer.timestamp;
			// Play if within 5 seconds of start and hasn't played yet
			if (activePrayer.id !== this.lastPlayedPrayerId && timeSinceStart < 5000 && timeSinceStart >= 0) {
				this.playAudio();
				this.lastPlayedPrayerId = activePrayer.id;
			}
		} else {
			// Reset if far from any prayer (simple check)
			// Or we can rely on the fact that activePrayer is null
			// But we need to reset lastPlayedPrayerId eventually so it can play again tomorrow? 
			// Actually id includes prayer name, but not date. If ids are 'fajr', 'dhuhr', etc.
			// We should reset it when the prayer is no longer "active" (10 mins passed)
			// But currentActivePrayer returns null after 10 mins.
			
			// If we are far from the last played prayer, reset.
			// But we don't have reference to "last played prayer object" easily unless we store it.
			// For now, let's just reset if no active prayer.
			// Wait, if we reset immediately after 10 mins, it's fine.
			// But if we reset too early, it might replay? No, timeSinceStart < 5000 prevents replay after 5s.
			// So resetting when activePrayer is null is safe.
			if (this.lastPlayedPrayerId && !this.currentActivePrayer) {
				this.lastPlayedPrayerId = null;
			}
		}
	}

	playAudio() {
		if (this.audio) {
			this.audio.src = this.audioSrc;
			this.audio.currentTime = 0;
			this.audio.play().catch(e => console.error("Audio play failed", e));
		}
	}

	nextPrayer = $derived.by(() => {
		if (!this.prayerTimes.length) return null;

		const now = this.currentTime.getTime();
		
		// Find the next prayer for today that is strictly in the future
		const nextToday = this.prayerTimes.find((p) => p.timestamp > now);

		if (nextToday) {
			return nextToday;
		} else {
			// If all prayers for today have passed, consider the first prayer of the next day
			const firstPrayerTomorrow = this.prayerTimes[0];
			if (!firstPrayerTomorrow) return null;

			const [hours, minutes] = firstPrayerTomorrow.time.split(':').map(Number);
			const tomorrow = new SvelteDate(this.currentTime);
			tomorrow.setDate(tomorrow.getDate() + 1); // Move to next day
			tomorrow.setHours(hours, minutes, 0, 0);

			return {
				...firstPrayerTomorrow,
				timestamp: tomorrow.getTime(),
			};
		}
	});

	// This derived property finds the prayer that is currently active or just passed.
	// It's used to determine the "during prayer" state.
	currentActivePrayer = $derived.by(() => {
		if (!this.prayerTimes.length) return null;
		const now = this.currentTime.getTime();

		// Find the last prayer whose timestamp is less than or equal to now
		let activePrayer = this.prayerTimes.findLast((p) => p.timestamp <= now);

		// Special handling for Isha: if it's after Isha and before Fajr tomorrow, Isha is still active.
		// This assumes prayerTimes are sorted by time.
		const lastPrayerToday = this.prayerTimes[this.prayerTimes.length - 1];
		if (lastPrayerToday && lastPrayerToday.name === 'Isha' && now >= lastPrayerToday.timestamp) {
			// If current time is after Isha, and nextPrayer is Fajr tomorrow, then Isha is the active prayer.
			// This covers the period from Isha time until Fajr tomorrow.
			if (this.nextPrayer && this.nextPrayer.name === 'Fajr') {
				activePrayer = lastPrayerToday;
			}
		}

		return activePrayer;
	});

	countdown = $derived.by(() => {
		const now = this.currentTime.getTime();
		const FIVE_MINUTES_MS = 5 * 60 * 1000;
		const TEN_MINUTES_MS = 10 * 60 * 1000;

		// Determine the state based on the current time relative to the next prayer
		if (this.nextPrayer) {
			const diffToNext = this.nextPrayer.timestamp - now;

			// Pre-Prayer (< 5 mins before next prayer)
			if (diffToNext > 0 && diffToNext <= FIVE_MINUTES_MS) {
				const minutes = Math.floor((diffToNext % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((diffToNext % (1000 * 60)) / 1000);
				return `Menuju ${this.nextPrayer.name} - ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
			}
		}

		// During Prayer (0 - 10 mins after the *current active* prayer)
		if (this.currentActivePrayer) {
			const diffFromActive = now - this.currentActivePrayer.timestamp;
			if (diffFromActive >= 0 && diffFromActive <= TEN_MINUTES_MS) {
				return `Sedang Solat ${this.currentActivePrayer.name}`;
			}
		}

		// After Isha + 10 mins, countdown to Fajr (tomorrow)
		const lastPrayerToday = this.prayerTimes[this.prayerTimes.length - 1];
		if (lastPrayerToday && lastPrayerToday.name === 'Isha' && this.nextPrayer && this.nextPrayer.name === 'Fajr') {
			const diffFromIsha = now - lastPrayerToday.timestamp;
			if (diffFromIsha > TEN_MINUTES_MS) {
				// Countdown to Fajr tomorrow
				const diffToFajrTomorrow = this.nextPrayer.timestamp - now;
				if (diffToFajrTomorrow > 0) {
					const hours = Math.floor(diffToFajrTomorrow / (1000 * 60 * 60));
					const minutes = Math.floor((diffToFajrTomorrow % (1000 * 60 * 60)) / (1000 * 60));
					const seconds = Math.floor((diffToFajrTomorrow % (1000 * 60)) / 1000);
					return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
				}
			}
		}

		// Default: After Prayer (> 10 mins after) or general countdown to next prayer
		if (this.nextPrayer) {
			const diff = this.nextPrayer.timestamp - now;
			if (diff <= 0) return '00:00:00'; // Should ideally not happen if nextPrayer is always in future

			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}

		return ''; // No prayers or no next prayer found
	});

	updatePrayers(newPrayers: PrayerTime[]) {
		this.prayerTimes = this.hydrateTimestamps(newPrayers);
	}
	
	updatePreference(sound: string) {
		this.soundPreference = sound;
	}

	destroy() {
		if (this.interval) clearInterval(this.interval);
		if (this.audio) {
			this.audio.pause();
			this.audio = null;
		}
	}
}

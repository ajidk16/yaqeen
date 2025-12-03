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

	constructor(initialPrayers: PrayerTime[] = []) {
		this.prayerTimes = initialPrayers;
		
		$effect(() => {
			this.interval = setInterval(() => {
				this.currentTime = new SvelteDate();
			}, 1000);

			return () => {
				if (this.interval) clearInterval(this.interval);
			};
		});
	}

	nextPrayer = $derived.by(() => {
		if (!this.prayerTimes.length) return null;
		const now = this.currentTime.getTime();
		return this.prayerTimes.find((p) => p.timestamp > now) || null;
	});

	countdown = $derived.by(() => {
		if (!this.nextPrayer) return '';

		const now = this.currentTime.getTime();
		const diff = this.nextPrayer.timestamp - now;

		if (diff <= 0) return '00:00:00';

		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((diff % (1000 * 60)) / 1000);

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	});

	updatePrayers(newPrayers: PrayerTime[]) {
		this.prayerTimes = newPrayers;
	}

	destroy() {
		if (this.interval) clearInterval(this.interval);
	}
}

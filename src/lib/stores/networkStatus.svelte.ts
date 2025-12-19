import { getQueueCount } from '$lib/offline/syncQueue';
import { getSyncMeta } from '$lib/offline/offlineDb';
import { SYNC_EVENT, type SyncResult } from '$lib/offline/syncEngine';

/**
 * Network status Svelte 5 rune class
 * Tracks online/offline state and sync status
 */
export class NetworkStatus {
	isOnline = $state(true);
	isSyncing = $state(false);
	pendingCount = $state(0);
	lastSyncTime = $state<Date | null>(null);
	lastSyncResult = $state<SyncResult | null>(null);
	syncProgress = $state({ current: 0, total: 0 });

	private initialized = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.init();
		}
	}

	private async init() {
		if (this.initialized) return;
		this.initialized = true;

		// Set initial online state
		this.isOnline = navigator.onLine;

		// Listen for online/offline events
		window.addEventListener('online', () => {
			this.isOnline = true;
			this.triggerSync();
		});

		window.addEventListener('offline', () => {
			this.isOnline = false;
		});

		// Listen for sync events
		window.addEventListener(SYNC_EVENT, ((e: CustomEvent) => {
			const detail = e.detail;
			
			switch (detail.type) {
				case 'start':
					this.isSyncing = true;
					this.syncProgress = { current: 0, total: 0 };
					break;
				case 'progress':
					if (detail.progress) {
						this.syncProgress = detail.progress;
					}
					break;
				case 'complete':
					this.isSyncing = false;
					this.lastSyncTime = new Date();
					if (detail.result) {
						this.lastSyncResult = detail.result;
					}
					this.refreshPendingCount();
					break;
				case 'error':
					this.isSyncing = false;
					break;
			}
		}) as EventListener);

		// Initial load of pending count and last sync time
		await this.refreshPendingCount();
		await this.refreshLastSyncTime();
	}

	async refreshPendingCount() {
		try {
			this.pendingCount = await getQueueCount();
		} catch {
			// IndexedDB might not be available
		}
	}

	async refreshLastSyncTime() {
		try {
			const time = await getSyncMeta<string>('lastSyncTime');
			this.lastSyncTime = time ? new Date(time) : null;
		} catch {
			// IndexedDB might not be available
		}
	}

	private triggerSync() {
		// Dispatch event to trigger sync when coming back online
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new CustomEvent('habbitrax:trigger-sync'));
		}
	}

	/**
	 * Format last sync time for display
	 */
	get lastSyncFormatted(): string {
		if (!this.lastSyncTime) return 'Belum pernah';
		
		const now = new Date();
		const diff = now.getTime() - this.lastSyncTime.getTime();
		const minutes = Math.floor(diff / 60000);
		
		if (minutes < 1) return 'Baru saja';
		if (minutes < 60) return `${minutes} menit lalu`;
		
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours} jam lalu`;
		
		return this.lastSyncTime.toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'short'
		});
	}

	/**
	 * Get status text for UI
	 */
	get statusText(): string {
		if (!this.isOnline) return 'Offline';
		if (this.isSyncing) return 'Menyinkronkan...';
		if (this.pendingCount > 0) return `${this.pendingCount} pending`;
		return 'Tersinkron';
	}

	/**
	 * Get status color class
	 */
	get statusColor(): string {
		if (!this.isOnline) return 'text-warning';
		if (this.isSyncing) return 'text-info';
		if (this.pendingCount > 0) return 'text-warning';
		if (this.lastSyncResult && !this.lastSyncResult.success) return 'text-error';
		return 'text-success';
	}
}

// Singleton instance
let networkStatusInstance: NetworkStatus | null = null;

export function getNetworkStatus(): NetworkStatus {
	if (!networkStatusInstance) {
		networkStatusInstance = new NetworkStatus();
	}
	return networkStatusInstance;
}

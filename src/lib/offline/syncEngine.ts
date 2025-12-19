import { getQueue, removeFromQueue, markActionFailed, type SyncAction } from './syncQueue';
import { 
	saveLocalHabit, 
	saveLocalHabitLog, 
	saveLocalPrayerLog,
	getSyncMeta,
	setSyncMeta 
} from './offlineDb';

export interface SyncResult {
	success: boolean;
	synced: number;
	failed: number;
	conflicts: number;
	errors: string[];
}

interface SyncEventDetail {
	type: 'start' | 'progress' | 'complete' | 'error';
	result?: SyncResult;
	progress?: { current: number; total: number };
	error?: string;
}

// Custom event for sync status updates
export const SYNC_EVENT = 'habbitrax:sync';

function dispatchSyncEvent(detail: SyncEventDetail) {
	if (typeof window !== 'undefined') {
		window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail }));
	}
}

/**
 * Process a single sync action
 */
async function processAction(action: SyncAction): Promise<{ success: boolean; conflict: boolean; error?: string }> {
	const endpoint = getEndpoint(action.table, action.type, action.recordId);
	const method = getMethod(action.type);

	try {
		const response = await fetch(endpoint, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: action.type !== 'DELETE' ? JSON.stringify(action.data) : undefined
		});

		if (!response.ok) {
			// Check for conflict (409)
			if (response.status === 409) {
				return { success: false, conflict: true, error: 'Conflict detected' };
			}
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		// For updates, check if server version is newer (conflict)
		if (action.type === 'UPDATE') {
			const serverData = await response.json();
			if (serverData.updatedAt && action.data.updatedAt) {
				const serverTime = new Date(serverData.updatedAt).getTime();
				const localTime = new Date(action.data.updatedAt as string).getTime();
				
				if (serverTime > localTime) {
					// Server is newer - this is a conflict
					return { success: false, conflict: true, error: 'Server has newer data' };
				}
			}
		}

		return { success: true, conflict: false };
	} catch (error) {
		return { 
			success: false, 
			conflict: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		};
	}
}

/**
 * Get the API endpoint for a sync action
 */
function getEndpoint(table: SyncAction['table'], type: SyncAction['type'], recordId: string): string {
	const base = '/api/sync';
	
	switch (type) {
		case 'CREATE':
			return `${base}/${table}`;
		case 'UPDATE':
		case 'DELETE':
			return `${base}/${table}/${recordId}`;
	}
}

/**
 * Get the HTTP method for a sync action
 */
function getMethod(type: SyncAction['type']): string {
	switch (type) {
		case 'CREATE':
			return 'POST';
		case 'UPDATE':
			return 'PUT';
		case 'DELETE':
			return 'DELETE';
	}
}

/**
 * Process all pending sync actions
 */
export async function processQueue(): Promise<SyncResult> {
	const queue = await getQueue();
	
	if (queue.length === 0) {
		return { success: true, synced: 0, failed: 0, conflicts: 0, errors: [] };
	}

	dispatchSyncEvent({ type: 'start' });

	const result: SyncResult = {
		success: true,
		synced: 0,
		failed: 0,
		conflicts: 0,
		errors: []
	};

	for (let i = 0; i < queue.length; i++) {
		const action = queue[i];
		
		dispatchSyncEvent({ 
			type: 'progress', 
			progress: { current: i + 1, total: queue.length } 
		});

		const actionResult = await processAction(action);

		if (actionResult.success) {
			await removeFromQueue(action.id);
			result.synced++;
		} else if (actionResult.conflict) {
			// Mark as conflict and keep in queue for user resolution
			await markActionFailed(action.id, actionResult.error || 'Conflict');
			result.conflicts++;
			result.success = false;
		} else {
			// Regular failure - mark for retry
			await markActionFailed(action.id, actionResult.error || 'Unknown error');
			result.failed++;
			result.errors.push(actionResult.error || 'Unknown error');
			result.success = false;
		}
	}

	// Update last sync time
	await setSyncMeta('lastSyncTime', new Date().toISOString());
	await setSyncMeta('lastSyncResult', result);

	dispatchSyncEvent({ type: 'complete', result });

	return result;
}

/**
 * Fetch and cache data from server
 */
export async function pullFromServer(userId: string): Promise<void> {
	try {
		// Fetch habits
		const habitsResponse = await fetch(`/api/sync/habits?userId=${userId}`);
		if (habitsResponse.ok) {
			const habits = await habitsResponse.json();
			for (const habit of habits) {
				await saveLocalHabit({
					...habit,
					syncStatus: 'synced',
					updatedAt: habit.updatedAt || new Date().toISOString()
				});
			}
		}

		// Fetch today's logs
		const today = new Date().toISOString().split('T')[0];
		const logsResponse = await fetch(`/api/sync/habitLogs?userId=${userId}&date=${today}`);
		if (logsResponse.ok) {
			const logs = await logsResponse.json();
			for (const log of logs) {
				await saveLocalHabitLog({
					...log,
					syncStatus: 'synced',
					updatedAt: log.updatedAt || new Date().toISOString()
				});
			}
		}

		// Fetch today's prayer logs
		const prayerResponse = await fetch(`/api/sync/prayerLogs?userId=${userId}&date=${today}`);
		if (prayerResponse.ok) {
			const prayers = await prayerResponse.json();
			for (const prayer of prayers) {
				await saveLocalPrayerLog({
					...prayer,
					syncStatus: 'synced',
					updatedAt: prayer.updatedAt || new Date().toISOString()
				});
			}
		}

		await setSyncMeta('lastPullTime', new Date().toISOString());
	} catch (error) {
		console.error('Pull from server failed:', error);
		throw error;
	}
}

/**
 * Full sync: push local changes, then pull server data
 */
export async function fullSync(userId: string): Promise<SyncResult> {
	// First push local changes
	const pushResult = await processQueue();
	
	// Then pull server data (if push was successful or partial)
	if (pushResult.synced > 0 || pushResult.failed === 0) {
		await pullFromServer(userId);
	}

	return pushResult;
}

/**
 * Check if there are pending changes to sync
 */
export async function hasPendingChanges(): Promise<boolean> {
	const queue = await getQueue();
	return queue.length > 0;
}

/**
 * Get sync status info
 */
export async function getSyncStatus(): Promise<{
	lastSyncTime: string | null;
	pendingCount: number;
	hasConflicts: boolean;
}> {
	const queue = await getQueue();
	const lastSyncTime = await getSyncMeta<string>('lastSyncTime');
	const hasConflicts = queue.some(a => a.retries > 0 && a.error?.includes('Conflict'));

	return {
		lastSyncTime: lastSyncTime || null,
		pendingCount: queue.length,
		hasConflicts
	};
}

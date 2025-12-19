import { getDb } from './offlineDb';

export interface SyncAction {
	id: string;
	type: 'CREATE' | 'UPDATE' | 'DELETE';
	table: 'habits' | 'habitLogs' | 'prayerLogs';
	recordId: string;
	data: Record<string, unknown>;
	timestamp: number;
	retries: number;
	error?: string;
}

/**
 * Add an action to the sync queue
 */
export async function addToQueue(
	type: SyncAction['type'],
	table: SyncAction['table'],
	recordId: string,
	data: Record<string, unknown>
): Promise<string> {
	const db = await getDb();
	const id = crypto.randomUUID();
	
	const action: SyncAction = {
		id,
		type,
		table,
		recordId,
		data,
		timestamp: Date.now(),
		retries: 0
	};

	await db.put('syncQueue', action);
	return id;
}

/**
 * Get all pending actions from the queue, ordered by timestamp
 */
export async function getQueue(): Promise<SyncAction[]> {
	const db = await getDb();
	const actions = await db.getAllFromIndex('syncQueue', 'by-timestamp');
	return actions as SyncAction[];
}

/**
 * Get the count of pending actions
 */
export async function getQueueCount(): Promise<number> {
	const db = await getDb();
	return db.count('syncQueue');
}

/**
 * Remove an action from the queue (after successful sync)
 */
export async function removeFromQueue(id: string): Promise<void> {
	const db = await getDb();
	await db.delete('syncQueue', id);
}

/**
 * Update retry count and error for a failed action
 */
export async function markActionFailed(id: string, error: string): Promise<void> {
	const db = await getDb();
	const action = await db.get('syncQueue', id);
	
	if (action) {
		action.retries += 1;
		action.error = error;
		await db.put('syncQueue', action);
	}
}

/**
 * Clear all actions from the queue
 */
export async function clearQueue(): Promise<void> {
	const db = await getDb();
	await db.clear('syncQueue');
}

/**
 * Get actions that have failed too many times (> 3 retries)
 */
export async function getFailedActions(): Promise<SyncAction[]> {
	const queue = await getQueue();
	return queue.filter(action => action.retries > 3);
}

/**
 * Remove failed actions from queue and return them for user notification
 */
export async function extractFailedActions(): Promise<SyncAction[]> {
	const failed = await getFailedActions();
	
	for (const action of failed) {
		await removeFromQueue(action.id);
	}
	
	return failed;
}

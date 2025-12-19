import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

// Database schema definition
interface HabbiTraxDB extends DBSchema {
	habits: {
		key: string;
		value: {
			id: string;
			userId: string;
			title: string;
			type: string;
			category: string | null;
			frequency: unknown;
			targetValue: number | null;
			unit: string | null;
			time: string | null;
			icon: string | null;
			reminder: boolean;
			archived: boolean;
			createdAt: string;
			updatedAt: string;
			syncStatus: 'synced' | 'pending' | 'conflict';
		};
		indexes: { 'by-userId': string; 'by-syncStatus': string };
	};
	habitLogs: {
		key: string;
		value: {
			id: string;
			habitId: string;
			userId: string;
			date: string;
			status: string;
			value: number | null;
			notes: string | null;
			createdAt: string;
			updatedAt: string;
			syncStatus: 'synced' | 'pending' | 'conflict';
		};
		indexes: { 'by-date': string; 'by-habitId': string; 'by-syncStatus': string };
	};
	prayerLogs: {
		key: string;
		value: {
			id: string;
			userId: string;
			date: string;
			prayerName: string;
			status: string;
			notes: string | null;
			createdAt: string;
			updatedAt: string;
			syncStatus: 'synced' | 'pending' | 'conflict';
		};
		indexes: { 'by-date': string; 'by-syncStatus': string };
	};
	syncQueue: {
		key: string;
		value: {
			id: string;
			type: 'CREATE' | 'UPDATE' | 'DELETE';
			table: 'habits' | 'habitLogs' | 'prayerLogs';
			recordId: string;
			data: Record<string, unknown>;
			timestamp: number;
			retries: number;
			error?: string;
		};
		indexes: { 'by-timestamp': number };
	};
	syncMeta: {
		key: string;
		value: {
			key: string;
			value: unknown;
		};
	};
}

const DB_NAME = 'habbitrax-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<HabbiTraxDB> | null = null;

/**
 * Get or create the IndexedDB instance
 */
export async function getDb(): Promise<IDBPDatabase<HabbiTraxDB>> {
	if (dbInstance) return dbInstance;

	dbInstance = await openDB<HabbiTraxDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Habits store
			if (!db.objectStoreNames.contains('habits')) {
				const habitsStore = db.createObjectStore('habits', { keyPath: 'id' });
				habitsStore.createIndex('by-userId', 'userId');
				habitsStore.createIndex('by-syncStatus', 'syncStatus');
			}

			// Habit logs store
			if (!db.objectStoreNames.contains('habitLogs')) {
				const logsStore = db.createObjectStore('habitLogs', { keyPath: 'id' });
				logsStore.createIndex('by-date', 'date');
				logsStore.createIndex('by-habitId', 'habitId');
				logsStore.createIndex('by-syncStatus', 'syncStatus');
			}

			// Prayer logs store
			if (!db.objectStoreNames.contains('prayerLogs')) {
				const prayerStore = db.createObjectStore('prayerLogs', { keyPath: 'id' });
				prayerStore.createIndex('by-date', 'date');
				prayerStore.createIndex('by-syncStatus', 'syncStatus');
			}

			// Sync queue store
			if (!db.objectStoreNames.contains('syncQueue')) {
				const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
				queueStore.createIndex('by-timestamp', 'timestamp');
			}

			// Sync metadata store
			if (!db.objectStoreNames.contains('syncMeta')) {
				db.createObjectStore('syncMeta', { keyPath: 'key' });
			}
		}
	});

	return dbInstance;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}
}

// ==================== HABITS CRUD ====================

export async function getLocalHabits(userId: string) {
	const db = await getDb();
	return db.getAllFromIndex('habits', 'by-userId', userId);
}

export async function getLocalHabit(id: string) {
	const db = await getDb();
	return db.get('habits', id);
}

export async function saveLocalHabit(habit: HabbiTraxDB['habits']['value']) {
	const db = await getDb();
	await db.put('habits', habit);
}

export async function deleteLocalHabit(id: string) {
	const db = await getDb();
	await db.delete('habits', id);
}

// ==================== HABIT LOGS CRUD ====================

export async function getLocalHabitLogs(date: string) {
	const db = await getDb();
	return db.getAllFromIndex('habitLogs', 'by-date', date);
}

export async function getLocalHabitLogsByHabit(habitId: string) {
	const db = await getDb();
	return db.getAllFromIndex('habitLogs', 'by-habitId', habitId);
}

export async function saveLocalHabitLog(log: HabbiTraxDB['habitLogs']['value']) {
	const db = await getDb();
	await db.put('habitLogs', log);
}

export async function deleteLocalHabitLog(id: string) {
	const db = await getDb();
	await db.delete('habitLogs', id);
}

// ==================== PRAYER LOGS CRUD ====================

export async function getLocalPrayerLogs(date: string) {
	const db = await getDb();
	return db.getAllFromIndex('prayerLogs', 'by-date', date);
}

export async function saveLocalPrayerLog(log: HabbiTraxDB['prayerLogs']['value']) {
	const db = await getDb();
	await db.put('prayerLogs', log);
}

// ==================== SYNC METADATA ====================

export async function getSyncMeta<T>(key: string): Promise<T | undefined> {
	const db = await getDb();
	const meta = await db.get('syncMeta', key);
	return meta?.value as T | undefined;
}

export async function setSyncMeta(key: string, value: unknown) {
	const db = await getDb();
	await db.put('syncMeta', { key, value });
}

// ==================== PENDING SYNC ====================

export async function getPendingItems(table: 'habits' | 'habitLogs' | 'prayerLogs') {
	const db = await getDb();
	return db.getAllFromIndex(table, 'by-syncStatus', 'pending');
}

export async function getConflictItems(table: 'habits' | 'habitLogs' | 'prayerLogs') {
	const db = await getDb();
	return db.getAllFromIndex(table, 'by-syncStatus', 'conflict');
}

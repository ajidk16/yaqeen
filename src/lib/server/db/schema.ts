import { pgTable, text, integer, timestamp, boolean, jsonb, date } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	username: text('username').unique(),
	bio: text('bio'),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	preferences: jsonb('preferences'), // theme, notifications, etc.
	settings: jsonb('settings'), // periodMode, dataSaver, etc.
	mazhab: text('mazhab').default('shafi'),
	location: jsonb('location') // { city: string, lat: number, lng: number, method: 'auto' | 'manual' }
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id)
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

// --- Habits & Tracker ---

export const habits = pgTable('habits', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	title: text('title').notNull(),
	type: text('type').notNull(), // 'ibadah', 'custom', 'health'
	category: text('category'), // 'wajib', 'sunnah', 'mubah'
	frequency: jsonb('frequency'), // { type: 'daily' | 'weekly', days: [] }
	targetValue: integer('target_value'), // e.g., 10 (pages), 33 (dzikir)
	unit: text('unit'), // 'pages', 'minutes', 'times'
	time: text('time'), // '04:30'
	icon: text('icon'), // icon name
	reminder: boolean('reminder').default(false),
	archived: boolean('archived').default(false),
	createdAt: timestamp('created_at').defaultNow()
});

export const habitLogs = pgTable('habit_logs', {
	id: text('id').primaryKey(),
	habitId: text('habit_id').references(() => habits.id).notNull(),
	userId: text('user_id').references(() => user.id).notNull(),
	date: date('date').notNull(),
	status: text('status').notNull(), // 'completed', 'skipped', 'partial'
	value: integer('value'), // actual value achieved
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

// --- Ibadah Specific ---

export const prayerLogs = pgTable('prayer_logs', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	date: date('date').notNull(),
	prayerName: text('prayer_name').notNull(), // 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha'
	status: text('status').notNull(), // 'jamaah', 'munfarid', 'masbuk', 'late', 'missed', 'qadha'
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

// --- Quran Journal ---

export const quranProgress = pgTable('quran_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	date: date('date').notNull(),
	pagesRead: integer('pages_read').default(0),
	startPage: integer('start_page'),
	endPage: integer('end_page'),
	khatamCount: integer('khatam_count').default(0),
	createdAt: timestamp('created_at').defaultNow()
});

export const hafalanProgress = pgTable('hafalan_progress', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	surahName: text('surah_name').notNull(),
	ayahStart: integer('ayah_start').notNull(),
	ayahEnd: integer('ayah_end').notNull(),
	status: text('status').notNull(), // 'memorizing', 'completed', 'reviewing'
	lastReviewed: timestamp('last_reviewed'),
	createdAt: timestamp('created_at').defaultNow()
});

// --- Mood & Gratitude ---

export const moodLogs = pgTable('mood_logs', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	date: date('date').notNull(),
	mood: text('mood').notNull(), // 'happy', 'blessed', 'neutral', 'tired', 'sad'
	gratitude: text('gratitude'), // User's gratitude entry
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow()
});

// --- Support ---

export const supportTickets = pgTable('support_tickets', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	subject: text('subject').notNull(),
	message: text('message').notNull(),
	status: text('status').default('open'), // 'open', 'closed', 'in_progress'
	createdAt: timestamp('created_at').defaultNow()
});

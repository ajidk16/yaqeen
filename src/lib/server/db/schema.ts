import { pgTable, text, integer, timestamp, boolean, jsonb, date } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	preferences: jsonb('preferences'), // Keeping our custom field
	settings: jsonb('settings') // periodMode, etc.
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
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

export const habits = pgTable('habits', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id),
	title: text('title').notNull(),
	type: text('type').notNull(), // 'ibadah', 'adat', 'health'
	category: text('category'), // 'wajib', 'sunnah'
	frequency: jsonb('frequency'), // daily, weekly, specific days
	targetValue: integer('target_value'), // e.g., 10 (pages), 33 (dzikir)
	createdAt: timestamp('created_at').defaultNow()
});

export const logs = pgTable('logs', {
	id: text('id').primaryKey(),
	habitId: text('habit_id').references(() => habits.id),
	date: date('date').notNull(),
	status: text('status'), // 'completed', 'skipped', 'partial'
	value: integer('value'), // actual value achieved
	notes: text('notes')
});

export const reflections = pgTable('reflections', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id),
	date: date('date').notNull(),
	mood: text('mood'),
	content: text('content'), // user journal
	aiFeedback: text('ai_feedback'), // response from AI Coach
	createdAt: timestamp('created_at').defaultNow()
});

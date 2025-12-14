import { Lucia } from "lucia";
import { dev } from "$app/environment";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { user, session } from "./db/schema";

const adapter = new DrizzlePostgreSQLAdapter(db, session, user);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			// attributes has the type of DatabaseUserAttributes
			email: attributes.email,
			name: attributes.name,
			image: attributes.image,
			settings: attributes.settings ?? {},
			location: attributes.location ?? {},
			preferences: attributes.preferences ?? {},
			emailVerified: attributes.emailVerified ?? false,
			gender: attributes.gender
		};
	}
});

declare module "lucia" {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
	name: string;
	image: string;
	emailVerified: boolean;
	gender: string;
	settings: {
		darkMode: boolean;
		quranTarget: number;
	},
	location: {
		lat: number | null;
		lng: number | null;
	},
	preferences: {
		notifications: boolean;
		notificationSettings: {
			sound: string;
			habits: boolean;
			prayers: {
				asr: boolean;
				fajr: boolean;
				isha: boolean;
				dhuhr: boolean;
				maghrib: boolean;
			}
		}
	}
}

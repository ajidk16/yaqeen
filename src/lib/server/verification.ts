
import { db } from '$lib/server/db';
import { verification } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomInt } from 'node:crypto';

export function generateVerificationCodeString(): string {
    return Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
}

export async function saveVerificationCode(userId: string, email: string, code: string): Promise<void> {
	// Delete any existing codes for this user
	await db.delete(verification).where(eq(verification.identifier, email));

	// Expires in 15 minutes
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

	await db.insert(verification).values({
		id: userId, // Using userId ensures one code per user
		identifier: email,
		value: code,
		expiresAt
	})
}

// Keep this mainly for backward compatibility if used elsewhere, but ideally not used in new flow
export async function generateVerificationCode(userId: string, email: string): Promise<string> {
	const code = generateVerificationCodeString();
    await saveVerificationCode(userId, email, code);
	return code;
}

export async function verifyVerificationCode(email: string, code: string): Promise<boolean> {
	const [storedCode] = await db
		.select()
		.from(verification)
		.where(and(eq(verification.identifier, email), eq(verification.value, code)));

	if (!storedCode) {
		return false;
	}

	if (storedCode.expiresAt < new Date()) {
        await db.delete(verification).where(eq(verification.identifier, email));
		return false;
	}
    
    // Valid code, delete it
    await db.delete(verification).where(eq(verification.identifier, email));

	return true;
}

import crypto from 'crypto';

/**
 * Generate a secure 6-digit OTP
 */
export function generateOtp(): string {
	// Use crypto for secure random number generation
	const randomBytes = crypto.randomBytes(3);
	const number = parseInt(randomBytes.toString('hex'), 16) % 1000000;
	return number.toString().padStart(6, '0');
}

/**
 * Hash OTP for secure storage
 */
export function hashOtp(otp: string): string {
	return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Verify OTP by comparing hashes
 */
export function verifyOtp(inputOtp: string, hashedOtp: string): boolean {
	const hashedInput = hashOtp(inputOtp);
	return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedOtp));
}

/**
 * Generate OTP expiration time (default: 10 minutes)
 */
export function getOtpExpiration(minutes: number = 10): Date {
	return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Generate a unique verification ID
 */
export function generateVerificationId(): string {
	return crypto.randomUUID();
}

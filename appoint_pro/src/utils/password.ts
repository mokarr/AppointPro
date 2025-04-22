/**
 * Password Utilities
 * 
 * This module provides functions for hashing and verifying passwords.
 */

import bcrypt from 'bcryptjs';

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

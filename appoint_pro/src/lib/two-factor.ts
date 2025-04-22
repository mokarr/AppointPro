/**
 * Two-Factor Authentication Utilities
 * 
 * This module provides utilities for implementing two-factor authentication
 * using Time-based One-Time Passwords (TOTP) according to RFC 6238.
 */

import crypto from 'crypto';
import { authenticator } from 'otplib';
import { db } from '@/lib/db';
import { logger } from '@/utils/logger';
import * as qrcode from 'qrcode';
import { randomBytes, createHash } from 'crypto';

// Configure authenticator
authenticator.options = {
    window: 1, // Allow 1 step before and after for clock drift
    digits: 6, // 6-digit codes
};

const APP_NAME = 'AppointPro';

/**
 * Check if a user has 2FA enabled
 */
export const isTwoFactorEnabled = async (userId: string): Promise<boolean> => {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { twoFactorAuth: true }
    });

    return !!user?.twoFactorAuth?.isEnabled;
};

/**
 * Generate a new TOTP secret and QR code for a user
 */
export const generateTwoFactorSecret = async (userId: string) => {
    // Get user information for QR code
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Store the secret for later verification
    await db.twoFactorAuth.upsert({
        where: { userId },
        update: {
            secret,
            isEnabled: false // Not enabled until verified
        },
        create: {
            userId,
            secret,
            isEnabled: false
        }
    });

    // Create a QR code URL
    const appName = 'AppointPro';
    const accountName = user.email || user.name || userId;
    const otpauth = authenticator.keyuri(accountName, appName, secret);

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    return { secret, qrCodeUrl };
};

/**
 * Verify a 2FA token against a user's stored secret
 */
export const verifyTwoFactorToken = async (userId: string, token: string): Promise<boolean> => {
    try {
        // Get user's 2FA secret
        const twoFactorData = await db.twoFactorAuth.findUnique({
            where: { userId }
        });

        if (!twoFactorData?.secret) {
            return false;
        }

        // Verify the token
        return authenticator.verify({
            token,
            secret: twoFactorData.secret
        });
    } catch (error) {
        return false;
    }
};

/**
 * Enable 2FA for a user after token verification
 */
export const enableTwoFactor = async (userId: string, token: string): Promise<boolean> => {
    const isValid = await verifyTwoFactorToken(userId, token);

    if (!isValid) {
        return false;
    }

    // Enable 2FA
    await db.twoFactorAuth.update({
        where: { userId },
        data: { isEnabled: true }
    });

    return true;
};

/**
 * Disable 2FA for a user after token verification
 */
export const disableTwoFactor = async (userId: string, token: string): Promise<boolean> => {
    const isValid = await verifyTwoFactorToken(userId, token);

    if (!isValid) {
        return false;
    }

    // Disable 2FA and clean up
    await db.twoFactorAuth.update({
        where: { userId },
        data: { isEnabled: false }
    });

    // Delete backup codes
    await db.backupCode.deleteMany({
        where: { userId }
    });

    return true;
};

/**
 * Generate a set of backup codes for a user
 */
export const generateBackupCodes = async (userId: string): Promise<string[]> => {
    // First check that 2FA is enabled
    const twoFactorData = await db.twoFactorAuth.findUnique({
        where: { userId, isEnabled: true }
    });

    if (!twoFactorData) {
        throw new Error('2FA is not enabled for this user');
    }

    // Delete existing backup codes
    await db.backupCode.deleteMany({
        where: { userId }
    });

    // Generate 10 random backup codes
    const backupCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
        // Generate a 10-character alphanumeric code
        const code = randomBytes(5).toString('hex').toUpperCase();
        const formattedCode = `${code.substring(0, 5)}-${code.substring(5)}`;
        backupCodes.push(formattedCode);

        // Hash the code before storing
        const hashedCode = hashBackupCode(formattedCode);

        // Store in database
        await db.backupCode.create({
            data: {
                userId,
                code: hashedCode,
                isUsed: false
            }
        });
    }

    return backupCodes;
};

/**
 * Verify a backup code and mark it as used if valid
 */
export const verifyBackupCode = async (userId: string, backupCode: string): Promise<boolean> => {
    try {
        // Hash the provided code for comparison
        const hashedCode = hashBackupCode(backupCode);

        // Find the backup code
        const storedCode = await db.backupCode.findFirst({
            where: {
                userId,
                code: hashedCode,
                isUsed: false
            }
        });

        if (!storedCode) {
            return false;
        }

        // Mark the code as used
        await db.backupCode.update({
            where: { id: storedCode.id },
            data: { isUsed: true }
        });

        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Hash a backup code for secure storage
 */
const hashBackupCode = (code: string): string => {
    // Remove any dashes from the code for consistent hashing
    const cleanCode = code.replace(/-/g, '');
    return createHash('sha256').update(cleanCode).digest('hex');
}; 
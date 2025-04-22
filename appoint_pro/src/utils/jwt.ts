/**
 * JWT Utility Functions
 * 
 * This module provides utility functions for JWT token generation, validation,
 * refreshing, and blacklisting for secure authentication.
 */

import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';
import { db } from '@/lib/server';
import redis from '@/lib/redis';
import { logger } from './logger';

// JWT token types
export type JWTPayload = {
    jti: string;
    sub: string;
    role: string;
    organizationId?: string;
    exp: number;
    iat: number;
};

// Token blacklist TTL in seconds (matches token expiry)
const TOKEN_BLACKLIST_TTL = 60 * 60 * 24; // 24 hours

// JWT Secret key
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'supersecretjwtkey'
);

/**
 * Generate a JWT token for a user
 * 
 * @param userId User ID to include in the token
 * @param role User role
 * @param organizationId Optional organization ID
 * @param expiresIn Expiration time in seconds (default: 24 hours)
 * @returns The generated JWT token
 */
export async function generateToken(
    userId: string,
    role: string,
    organizationId?: string,
    expiresIn: number = 60 * 60 * 24 // 24 hours
): Promise<string> {
    try {
        const jti = nanoid();
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + expiresIn;

        const token = await new SignJWT({ role, organizationId })
            .setProtectedHeader({ alg: 'HS256' })
            .setJti(jti)
            .setIssuedAt(iat)
            .setExpirationTime(exp)
            .setSubject(userId)
            .sign(JWT_SECRET);

        return token;
    } catch (error) {
        logger.error('Error generating JWT token', {
            error: error instanceof Error ? error.message : String(error),
            userId
        });
        throw new Error('Failed to generate token');
    }
}

/**
 * Verify and decode a JWT token
 * 
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        // Check if token is blacklisted
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
            logger.warn('Attempt to use blacklisted token', { token: token.substring(0, 10) + '...' });
            return null;
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        return payload as unknown as JWTPayload;
    } catch (error) {
        logger.warn('Invalid token', {
            error: error instanceof Error ? error.message : String(error),
            token: token.substring(0, 10) + '...'
        });
        return null;
    }
}

/**
 * Generate a refresh token for a user
 * 
 * @param userId User ID to create refresh token for
 * @returns The generated refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
    try {
        const refreshToken = nanoid(64);

        // Store refresh token in database with expiration
        // Tokens expire after 30 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt
            }
        });

        return refreshToken;
    } catch (error) {
        logger.error('Error generating refresh token', {
            error: error instanceof Error ? error.message : String(error),
            userId
        });
        throw new Error('Failed to generate refresh token');
    }
}

/**
 * Use a refresh token to generate a new access token
 * 
 * @param refreshToken The refresh token
 * @returns New access token or null if refresh token is invalid
 */
export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
        // Find refresh token in database
        const storedToken = await db.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        // If token doesn't exist or is expired, return null
        if (!storedToken || storedToken.expiresAt < new Date() || !storedToken.user) {
            return null;
        }

        // Generate new access token
        const user = storedToken.user;
        const accessToken = await generateToken(
            user.id,
            user.role || 'CLIENT',
            user.organizationId || undefined
        );

        return accessToken;
    } catch (error) {
        logger.error('Error refreshing access token', {
            error: error instanceof Error ? error.message : String(error),
            refreshToken: refreshToken.substring(0, 10) + '...'
        });
        return null;
    }
}

/**
 * Revoke a refresh token
 * 
 * @param refreshToken The refresh token to revoke
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
        await db.refreshToken.delete({
            where: { token: refreshToken }
        });
    } catch (error) {
        logger.error('Error revoking refresh token', {
            error: error instanceof Error ? error.message : String(error),
            refreshToken: refreshToken.substring(0, 10) + '...'
        });
    }
}

/**
 * Blacklist a JWT token to prevent reuse
 * 
 * @param token The JWT token to blacklist
 */
export async function blacklistToken(token: string): Promise<void> {
    try {
        // Verify the token to get expiration time
        const payload = await verifyToken(token);
        if (!payload) {
            return;
        }

        // Calculate TTL for Redis (how long until token expires)
        const now = Math.floor(Date.now() / 1000);
        const ttl = Math.max(1, payload.exp - now);

        // Add token to blacklist with expiry matching token expiry
        const key = `token_blacklist:${payload.jti}`;
        await redis.setex(key, ttl, '1');

        logger.info('Token blacklisted', {
            jti: payload.jti,
            userId: payload.sub,
            expiresIn: ttl
        });
    } catch (error) {
        logger.error('Error blacklisting token', {
            error: error instanceof Error ? error.message : String(error),
            token: token.substring(0, 10) + '...'
        });
    }
}

/**
 * Check if a token is blacklisted
 * 
 * @param token The JWT token to check
 * @returns True if token is blacklisted, false otherwise
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
    try {
        // Extract the JTI (token ID) from the token without full verification
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            requiredClaims: ['jti']
        });

        // Check if token is in blacklist
        const key = `token_blacklist:${payload.jti}`;
        const exists = await redis.exists(key);

        return exists === 1;
    } catch (error) {
        // If verification fails, consider token invalid (but not blacklisted)
        return false;
    }
} 
/**
 * Session Management with Redis Storage
 * 
 * This module provides session management functionality using Redis as the session store
 * for improved scalability and security.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getIronSession, SessionOptions } from 'iron-session';
import { redisClient, getRedisValue, setRedisValue, deleteRedisValue } from './redis';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Session data type
export interface SessionData {
    userId?: string;
    sessionId: string;
    createdAt: number;
    expiresAt: number;
    ip?: string;
    userAgent?: string;
    lastActivity?: number;
    data?: Record<string, any>;
    csrfToken?: string;
    fingerprint?: string; // Added for browser fingerprinting
}

// Session options
const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET || 'complex-password-at-least-32-characters-long',
    cookieName: 'appoint_pro_session',
    ttl: 60 * 60 * 24 * 7, // 7 days in seconds
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict' as const, // Upgraded from 'lax' to 'strict' for better CSRF protection
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
    },
};

// Helper function to calculate session expiration time
const getExpirationTime = (ttlSeconds: number): number => {
    return Date.now() + (ttlSeconds * 1000);
};

// Generate a CSRF token with higher entropy using crypto
export function generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

// Generate browser fingerprint for additional security
function generateFingerprint(request: NextRequest): string {
    // Combine various browser characteristics for fingerprinting
    const data = [
        request.headers.get('user-agent') || '',
        request.headers.get('accept-language') || '',
        request.headers.get('accept-encoding') || '',
        request.headers.get('sec-ch-ua') || '',
    ].join('|');

    return crypto.createHash('sha256').update(data).digest('hex');
}

// Create a new session
export async function createSession(
    request: NextRequest,
    response: NextResponse,
    userId: string,
    extraData: Record<string, any> = {}
): Promise<SessionData> {
    try {
        // Generate a unique session ID
        const sessionId = uuidv4();

        // Get IP and user agent - fixed to avoid using request.ip which doesn't exist
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Generate a CSRF token
        const csrfToken = generateCsrfToken();

        // Generate browser fingerprint
        const fingerprint = generateFingerprint(request);

        // Create session data
        const now = Date.now();
        // Use helper function to avoid sessionOptions.ttl possibly undefined error
        const expiresAt = getExpirationTime(sessionOptions.ttl || 60 * 60 * 24 * 7);

        const sessionData: SessionData = {
            userId,
            sessionId,
            createdAt: now,
            expiresAt,
            ip,
            userAgent,
            lastActivity: now,
            csrfToken,
            fingerprint,
            data: extraData,
        };

        // Store session in Redis using helper function
        await setRedisValue(
            `session:${sessionId}`,
            JSON.stringify(sessionData),
            sessionOptions.ttl
        );

        // Get the iron session
        const ironSession = await getIronSession<SessionData>(request, response, sessionOptions);

        // Save to iron session
        Object.assign(ironSession, sessionData);
        await ironSession.save();

        logger.info('Session created', {
            userId,
            sessionId,
            ip,
        });

        return sessionData;
    } catch (error) {
        logger.error('Error creating session', {
            error: error instanceof Error ? error.message : String(error),
            userId,
        });
        throw error;
    }
}

// Get the current session
export async function getSession(
    request: NextRequest,
    response: NextResponse
): Promise<SessionData | null> {
    try {
        // Get the iron session
        const ironSession = await getIronSession<SessionData>(request, response, sessionOptions);

        // If no session ID, return null
        if (!ironSession.sessionId) {
            return null;
        }

        // Get session from Redis using helper function
        const redisSession = await getRedisValue(`session:${ironSession.sessionId}`);

        // If no redis session, clear iron session and return null
        if (!redisSession) {
            await ironSession.destroy();
            return null;
        }

        // Parse Redis session
        const sessionData: SessionData = JSON.parse(redisSession);

        // Check if session is expired
        const now = Date.now();
        if (sessionData.expiresAt < now) {
            // Delete expired session
            await deleteRedisValue(`session:${ironSession.sessionId}`);
            await ironSession.destroy();
            return null;
        }

        // Verify fingerprint to protect against session hijacking
        if (sessionData.fingerprint) {
            const currentFingerprint = generateFingerprint(request);
            if (sessionData.fingerprint !== currentFingerprint) {
                logger.warn('Session fingerprint mismatch, possible hijacking attempt', {
                    sessionId: sessionData.sessionId,
                    ip: request.headers.get('x-forwarded-for') || 'unknown',
                });

                // Delete potentially compromised session
                await deleteRedisValue(`session:${ironSession.sessionId}`);
                await ironSession.destroy();
                return null;
            }
        }

        // Update last activity
        sessionData.lastActivity = now;

        // Store updated session in Redis
        await setRedisValue(
            `session:${ironSession.sessionId}`,
            JSON.stringify(sessionData),
            sessionOptions.ttl
        );

        return sessionData;
    } catch (error) {
        logger.error('Error getting session', {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

// Update the session
export async function updateSession(
    request: NextRequest,
    response: NextResponse,
    updatedData: Partial<SessionData>
): Promise<boolean> {
    try {
        // Get current session
        const session = await getSession(request, response);

        // If no session, return false
        if (!session) {
            return false;
        }

        // Update session data
        const updatedSession: SessionData = {
            ...session,
            ...updatedData,
            lastActivity: Date.now(),
        };

        // Store updated session in Redis
        await setRedisValue(
            `session:${session.sessionId}`,
            JSON.stringify(updatedSession),
            sessionOptions.ttl
        );

        // Update iron session
        const ironSession = await getIronSession<SessionData>(request, response, sessionOptions);
        Object.assign(ironSession, updatedSession);
        await ironSession.save();

        return true;
    } catch (error) {
        logger.error('Error updating session', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// Destroy the session
export async function destroySession(
    request: NextRequest,
    response: NextResponse
): Promise<boolean> {
    try {
        // Get the iron session
        const ironSession = await getIronSession<SessionData>(request, response, sessionOptions);

        // If no session ID, return false
        if (!ironSession.sessionId) {
            return false;
        }

        // Delete session from Redis
        await deleteRedisValue(`session:${ironSession.sessionId}`);

        // Destroy iron session
        await ironSession.destroy();

        // Explicitly set a cleared cookie with immediate expiration for complete cookie removal
        response.headers.set(
            'Set-Cookie',
            `${sessionOptions.cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''
            }`
        );

        logger.info('Session destroyed', {
            sessionId: ironSession.sessionId,
        });

        return true;
    } catch (error) {
        logger.error('Error destroying session', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// Validate CSRF token
export async function validateCsrfToken(
    request: NextRequest,
    response: NextResponse,
    token: string
): Promise<boolean> {
    try {
        // Get current session
        const session = await getSession(request, response);

        // If no session or no CSRF token, return false
        if (!session || !session.csrfToken) {
            return false;
        }

        // Compare tokens using constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(session.csrfToken),
            Buffer.from(token)
        );
    } catch (error) {
        logger.error('Error validating CSRF token', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// Get current CSRF token
export async function getCsrfToken(
    request: NextRequest,
    response: NextResponse
): Promise<string | null> {
    try {
        // Get current session
        const session = await getSession(request, response);

        // If no session, return null
        if (!session) {
            return null;
        }

        // If no CSRF token, generate one
        if (!session.csrfToken) {
            const csrfToken = generateCsrfToken();

            // Update session with new CSRF token
            await updateSession(request, response, { csrfToken });

            return csrfToken;
        }

        return session.csrfToken;
    } catch (error) {
        logger.error('Error getting CSRF token', {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
}

// Rotate session (for security after significant events like password change)
export async function rotateSession(
    request: NextRequest,
    response: NextResponse
): Promise<SessionData | null> {
    try {
        // Get current session
        const session = await getSession(request, response);

        // If no session, return null
        if (!session) {
            return null;
        }

        // Delete old session from Redis
        await deleteRedisValue(`session:${session.sessionId}`);

        // Create new session with the same user ID and data
        const userId = session.userId;
        if (!userId) {
            await destroySession(request, response);
            return null;
        }

        // Carry over data but generate new IDs, tokens, etc.
        return createSession(request, response, userId, session.data || {});
    } catch (error) {
        logger.error('Error rotating session', {
            error: error instanceof Error ? error.message : String(error),
        });
        return null;
    }
} 
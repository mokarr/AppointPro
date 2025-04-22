/**
 * Session Security Utilities
 * 
 * This module provides utility functions for enhancing session security,
 * including protection against session fixation, hijacking, and other
 * session-related vulnerabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rotateSession, destroySession, getSession } from './session';
import { logger } from '@/utils/logger';

// Time window for rotating sessions (milliseconds)
const SESSION_ROTATION_WINDOW = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Automatically rotate the session after successful authentication 
 * to prevent session fixation attacks
 */
export async function rotateSessionAfterAuth(
    request: NextRequest,
    response: NextResponse,
    userId: string
): Promise<void> {
    try {
        const session = await getSession(request, response);

        // If there's no existing session, no need to rotate
        if (!session) {
            return;
        }

        // If session belongs to a different user, rotate immediately
        if (session.userId && session.userId !== userId) {
            logger.warn('User ID mismatch in session, possible session fixation attempt', {
                sessionUserId: session.userId,
                authenticatedUserId: userId,
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });

            await rotateSession(request, response);
            return;
        }

        // Rotate session if it's older than the rotation window
        const now = Date.now();
        if (now - session.createdAt > SESSION_ROTATION_WINDOW) {
            await rotateSession(request, response);
            logger.info('Session rotated after authentication (age-based)', {
                userId,
                sessionAge: Math.round((now - session.createdAt) / (1000 * 60 * 60)) + ' hours'
            });
        }
    } catch (error) {
        logger.error('Error in post-authentication session rotation', {
            error: error instanceof Error ? error.message : String(error),
            userId
        });
    }
}

/**
 * Validate the session and user IP against suspicious patterns
 * that might indicate session hijacking attempts
 */
export async function validateSessionIntegrity(
    request: NextRequest,
    response: NextResponse
): Promise<boolean> {
    try {
        const session = await getSession(request, response);

        // If no session, it's technically valid (just not authenticated)
        if (!session) {
            return true;
        }

        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check for IP mismatch (could indicate session hijacking)
        // Don't compare if original IP was 'unknown'
        if (session.ip && session.ip !== 'unknown' && session.ip !== clientIp) {
            logger.warn('IP address changed mid-session, possible hijacking attempt', {
                sessionId: session.sessionId,
                originalIp: session.ip,
                currentIp: clientIp,
            });

            // Destroy the potentially compromised session
            await destroySession(request, response);
            return false;
        }

        // Check for excessive session age
        const maxSessionAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        if (Date.now() - session.createdAt > maxSessionAge) {
            logger.info('Session exceeds maximum age, rotating', {
                sessionId: session.sessionId,
                userId: session.userId,
            });

            await rotateSession(request, response);
        }

        return true;
    } catch (error) {
        logger.error('Error validating session integrity', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

/**
 * Track and identify suspicious session activity that might
 * indicate an attack or compromise
 */
export async function monitorSessionActivity(
    request: NextRequest,
    response: NextResponse
): Promise<void> {
    try {
        const session = await getSession(request, response);
        if (!session) {
            return;
        }

        // Calculate time since last activity
        const now = Date.now();
        const timeSinceLastActivity = session.lastActivity ? now - session.lastActivity : 0;

        // Log rapid session usage (potential automation/scripting)
        if (session.lastActivity && timeSinceLastActivity < 500) { // Less than 500ms
            logger.warn('Suspicious rapid session activity detected', {
                sessionId: session.sessionId,
                userId: session.userId,
                timeSinceLastActivity,
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
        }

        // Check for unusual hour-of-day activity
        const hour = new Date().getHours();
        const isBusinessHours = hour >= 8 && hour <= 18;

        // If session has user data with typical access patterns
        if (session.data?.typicalAccessPattern === 'business-hours' && !isBusinessHours) {
            logger.info('Unusual access time for user', {
                sessionId: session.sessionId,
                userId: session.userId,
                hour,
                ip: request.headers.get('x-forwarded-for') || 'unknown'
            });
        }
    } catch (error) {
        logger.error('Error monitoring session activity', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
} 
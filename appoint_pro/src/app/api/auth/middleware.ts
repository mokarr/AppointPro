import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';
import redis from '@/lib/redis';

// Rate limiting configuration
const RATE_LIMIT_MAX = 10; // Maximum requests per window
const RATE_LIMIT_WINDOW = 60 * 5; // 5 minutes in seconds
const RATE_LIMIT_PENALTY = 60 * 15; // 15 minutes penalty in seconds for exceeding limit

/**
 * Helper function to check rate limits and apply penalties
 */
export async function rateLimit(
    request: NextRequest,
    endpointType: 'login' | 'register' | 'reset-password'
): Promise<{ limited: boolean; remaining: number; resetTime: Date | null }> {
    try {
        // Get client IP
        const clientIp = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Create a unique key for this IP and endpoint
        const key = `rate_limit:${endpointType}:${clientIp}`;

        // Check if this IP is currently blocked
        const blockedKey = `rate_limit:blocked:${clientIp}`;
        const isBlocked = await redis.exists(blockedKey);

        if (isBlocked) {
            const ttl = await redis.ttl(blockedKey);
            const resetTime = new Date();
            resetTime.setSeconds(resetTime.getSeconds() + ttl);

            return {
                limited: true,
                remaining: 0,
                resetTime
            };
        }

        // Increment the counter
        const count = await redis.incr(key);

        // Set expiry on first request
        if (count === 1) {
            await redis.expire(key, RATE_LIMIT_WINDOW);
        }

        // Get current TTL
        const ttl = await redis.ttl(key);
        const resetTime = new Date();
        resetTime.setSeconds(resetTime.getSeconds() + ttl);

        // Check if rate limit is exceeded
        if (count > RATE_LIMIT_MAX) {
            // Apply penalty by creating a block
            await redis.setex(blockedKey, RATE_LIMIT_PENALTY, '1');

            logger.warn(`Rate limit exceeded for ${endpointType}`, {
                ip: clientIp,
                count,
                endpoint: endpointType
            });

            return {
                limited: true,
                remaining: 0,
                resetTime: new Date(Date.now() + RATE_LIMIT_PENALTY * 1000)
            };
        }

        return {
            limited: false,
            remaining: RATE_LIMIT_MAX - count,
            resetTime: count === 0 ? null : resetTime
        };
    } catch (error) {
        // Log error but don't block request if Redis fails
        logger.error('Rate limiting error', {
            error: error instanceof Error ? error.message : String(error)
        });

        // Allow the request to proceed on error
        return { limited: false, remaining: RATE_LIMIT_MAX, resetTime: null };
    }
}

/**
 * Middleware function for auth rate limiting
 */
export async function authRateLimitMiddleware(
    request: NextRequest,
    endpointType: 'login' | 'register' | 'reset-password'
): Promise<NextResponse | null> {
    // Check rate limit
    const { limited, remaining, resetTime } = await rateLimit(request, endpointType);

    // If limited, return 429 Too Many Requests
    if (limited) {
        return NextResponse.json(
            {
                success: false,
                message: 'Te veel verzoeken. Probeer het later opnieuw.',
                retryAfter: resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / 1000) : RATE_LIMIT_PENALTY
            },
            {
                status: 429,
                headers: {
                    'Retry-After': resetTime ? String(Math.ceil((resetTime.getTime() - Date.now()) / 1000)) : String(RATE_LIMIT_PENALTY),
                    'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
                    'X-RateLimit-Remaining': String(remaining),
                    'X-RateLimit-Reset': resetTime ? resetTime.toISOString() : ''
                }
            }
        );
    }

    // If not limited, continue request processing
    return null;
} 
/**
 * Session Management Middleware
 * 
 * This module configures session management using express-session with Redis store
 * for persistent session storage. It implements secure cookie configuration
 * suitable for both development and production environments.
 */

import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import { redisClient } from '@/lib/redis';
import { logger } from '@/utils/logger';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Create Redis store with session
const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'appoint_pro:sess:',
});

// Session configuration
const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_WEEK = ONE_DAY * 7;

// Get environment variables
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret';
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_REMEMBER_ME = process.env.SESSION_REMEMBER_ME === 'true';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;

// Configure session options
const sessionOptions: session.SessionOptions = {
    store: redisStore,
    name: 'appoint_pro.sid', // Custom session ID cookie name
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on every response
    cookie: {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: NODE_ENV === 'production', // True in production, false in development
        sameSite: 'strict', // Tightened from 'lax' to 'strict' for better CSRF protection
        maxAge: SESSION_REMEMBER_ME ? ONE_WEEK : ONE_DAY,
        path: '/', // Specify the path for the cookie
        domain: COOKIE_DOMAIN || undefined, // Optional domain configuration
    },
    genid: (req: Request) => {
        // Generate a cryptographically strong random session ID
        return crypto.randomBytes(32).toString('hex');
    }
};

// Enable proxy trust if in production (for secure cookies behind proxy/load balancer)
if (NODE_ENV === 'production') {
    sessionOptions.proxy = true;
    // Force secure cookies in production even if accessed via HTTP
    sessionOptions.cookie!.secure = true;
}

// Session middleware
export const sessionMiddleware = session(sessionOptions);

// Add session activity logging
export const sessionLogger = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session;

    if (session && !session.__lastAccess) {
        logger.info('New session created', { sessionID: req.sessionID });
    } else if (session) {
        // Update last access time
        const currentTime = Date.now();
        const lastAccess = session.__lastAccess || currentTime;
        const inactiveTime = currentTime - lastAccess;

        // Log if user has been inactive for over 5 minutes
        if (inactiveTime > 5 * 60 * 1000) {
            logger.info('Session resumed after inactivity', {
                sessionID: req.sessionID,
                inactiveTime: Math.round(inactiveTime / 1000),
            });
        }

        session.__lastAccess = currentTime;
    }

    next();
};

// Middleware to detect and prevent session fixation attacks
export const sessionSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const session = req.session;

    // If this is a newly authenticated session but using an existing session ID
    if (session.user && !session.__isAuthenticated) {
        // Regenerate session ID on initial authentication
        const user = session.user;
        session.regenerate((err: Error | null) => {
            if (err) {
                logger.error('Session regeneration error', {
                    error: err.message,
                    sessionID: req.sessionID
                });
                return next(err);
            }

            // Restore user data to the new session
            req.session.user = user;
            req.session.__isAuthenticated = true;

            logger.info('Session ID regenerated after authentication', {
                newSessionID: req.sessionID
            });

            next();
        });
    } else {
        next();
    }
}; 
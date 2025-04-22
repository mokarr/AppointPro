/**
 * Security Middleware
 * 
 * This module configures security middleware for the application including:
 * - Helmet for security headers
 * - CSRF protection
 * - IP blocking for suspicious activity
 */

import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { csrfSync } from 'csrf-sync';
import { rateLimit } from 'express-rate-limit';
import { logger } from '@/utils/logger';

// CSRF Protection setup
export const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => {
        // Try to get the token from headers first, then from body
        return req.headers['x-csrf-token'] || req.body._csrf;
    },
});

// Setup security headers using Helmet
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            imgSrc: ["'self'", 'data:', 'https://*'],
            connectSrc: ["'self'", 'https://*'],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: {
        maxAge: 15552000,
        includeSubDomains: true,
        preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
});

// IP blocking for suspicious activity
const suspiciousIPs = new Set<string>();

export const blockSuspiciousIPs = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket.remoteAddress || '';

    if (suspiciousIPs.has(clientIP)) {
        logger.warn('Blocked suspicious IP', { ip: clientIP });
        return res.status(403).json({ message: 'Access denied' });
    }

    next();
};

// Add IP to blocked list
export const addToBlocklist = (ip: string) => {
    suspiciousIPs.add(ip);
    logger.info('Added IP to blocklist', { ip });
};

// Authentication endpoints rate limiting
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later' },
    handler: (req, res, _, options) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
        });
        res.status(429).json(options.message);
    },
});

// Generic API rate limiting
export const apiRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
    skip: (req) => {
        // Skip rate limiting for static assets
        return req.path.startsWith('/static/') || req.path.startsWith('/assets/');
    },
}); 
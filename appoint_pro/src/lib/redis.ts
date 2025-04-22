/**
 * Redis Client Configuration
 * 
 * This module sets up and exports a Redis client for use throughout the application,
 * particularly for session management and caching.
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

// Environment variables with defaults
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';

// Create Redis client
export const redisClient: RedisClientType = createClient({
    url: REDIS_URL,
    password: REDIS_PASSWORD || undefined,
});

// Set up event handlers
redisClient.on('connect', () => {
    logger.info('Redis client connected');
});

redisClient.on('error', (err: Error) => {
    logger.error('Redis client error', { error: err.message });
});

redisClient.on('reconnecting', () => {
    logger.warn('Redis client reconnecting');
});

// Connect to Redis server
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        logger.error('Failed to connect to Redis', { error: (error as Error).message });
    }
})();

/**
 * Helper function to get a value from Redis
 */
export const getRedisValue = async (key: string): Promise<string | null> => {
    try {
        return await redisClient.get(key);
    } catch (error) {
        logger.error('Redis get error', { key, error: (error as Error).message });
        return null;
    }
};

/**
 * Helper function to set a value in Redis
 */
export const setRedisValue = async (
    key: string,
    value: string,
    expiryInSeconds?: number
): Promise<boolean> => {
    try {
        if (expiryInSeconds) {
            await redisClient.set(key, value, { EX: expiryInSeconds });
        } else {
            await redisClient.set(key, value);
        }
        return true;
    } catch (error) {
        logger.error('Redis set error', { key, error: (error as Error).message });
        return false;
    }
};

/**
 * Helper function to delete a value from Redis
 */
export const deleteRedisValue = async (key: string): Promise<boolean> => {
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        logger.error('Redis delete error', { key, error: (error as Error).message });
        return false;
    }
}; 
/**
 * Logger utility for application-wide logging
 * 
 * This module provides a consistent logging interface with different levels
 * and structured logging capability.
 */

// Log levels
export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug',
}

// Default log level from environment or INFO
const DEFAULT_LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();

// Log level priorities (higher number = more verbose)
const LOG_LEVEL_PRIORITY = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3,
};

// Current log level
let currentLogLevel = DEFAULT_LOG_LEVEL as LogLevel;

// Check if a log level should be displayed based on the current setting
const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLogLevel];
};

// Format a log entry with timestamp, level, and optional metadata
const formatLogEntry = (level: LogLevel, message: string, meta?: Record<string, any>): string => {
    const timestamp = new Date().toISOString();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaString}`;
};

// The logger object with methods for each log level
export const logger = {
    // Set the current log level
    setLogLevel(level: LogLevel): void {
        currentLogLevel = level;
    },

    // Error level logging
    error(message: string, meta?: Record<string, any>): void {
        if (shouldLog(LogLevel.ERROR)) {
            console.error(formatLogEntry(LogLevel.ERROR, message, meta));
        }
    },

    // Warning level logging
    warn(message: string, meta?: Record<string, any>): void {
        if (shouldLog(LogLevel.WARN)) {
            console.warn(formatLogEntry(LogLevel.WARN, message, meta));
        }
    },

    // Info level logging
    info(message: string, meta?: Record<string, any>): void {
        if (shouldLog(LogLevel.INFO)) {
            console.info(formatLogEntry(LogLevel.INFO, message, meta));
        }
    },

    // Debug level logging
    debug(message: string, meta?: Record<string, any>): void {
        if (shouldLog(LogLevel.DEBUG)) {
            console.debug(formatLogEntry(LogLevel.DEBUG, message, meta));
        }
    },
}; 
import chalk from 'chalk';

// Define log levels with numeric values for comparison
export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}

// Map string level names to enum values
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
    'none': LogLevel.NONE,
    'error': LogLevel.ERROR,
    'warn': LogLevel.WARN,
    'info': LogLevel.INFO,
    'debug': LogLevel.DEBUG,
    'trace': LogLevel.TRACE
};

// Define type for log data
type LogData = string | number | boolean | null | undefined | object | Error | unknown;

// Get the current log level from environment variables or default to INFO
const getLogLevel = (): LogLevel => {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase() || 'info';
    return LOG_LEVEL_MAP[envLevel] || LogLevel.INFO;
};

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Format the message with a module/category prefix
const formatMessage = (module: string, message: string | object) => {
    const timestamp = new Date().toISOString();
    const formattedMessage = typeof message === 'object'
        ? JSON.stringify(message, null, isProduction ? 0 : 2)
        : message;

    return `[${timestamp}] [${module}] ${formattedMessage}`;
};

// Create a colored tag for log level
const getLogLevelTag = (level: LogLevel): string => {
    switch (level) {
        case LogLevel.ERROR:
            return chalk.red.bold('ERROR');
        case LogLevel.WARN:
            return chalk.yellow.bold('WARN');
        case LogLevel.INFO:
            return chalk.blue.bold('INFO');
        case LogLevel.DEBUG:
            return chalk.cyan('DEBUG');
        case LogLevel.TRACE:
            return chalk.gray('TRACE');
        default:
            return '';
    }
};

// Main logger creator function
export const createLogger = (module: string) => {
    const currentLogLevel = getLogLevel();

    // Generic log function
    const log = (level: LogLevel, message: string | object, ...args: LogData[]) => {
        if (level > currentLogLevel) return;

        const formattedMessage = formatMessage(module, message);
        const tag = getLogLevelTag(level);

        if (isProduction) {
            // In production, log as JSON for easier parsing
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: LogLevel[level],
                module,
                message: typeof message === 'object' ? message : message,
                ...(args.length > 0 ? { additionalInfo: args } : {})
            }));
        } else {
            // In development, log with colors
            console.log(`${tag} ${formattedMessage}`, ...args);
        }
    };

    return {
        error: (message: string | object, ...args: LogData[]) => log(LogLevel.ERROR, message, ...args),
        warn: (message: string | object, ...args: LogData[]) => log(LogLevel.WARN, message, ...args),
        info: (message: string | object, ...args: LogData[]) => log(LogLevel.INFO, message, ...args),
        debug: (message: string | object, ...args: LogData[]) => log(LogLevel.DEBUG, message, ...args),
        trace: (message: string | object, ...args: LogData[]) => log(LogLevel.TRACE, message, ...args),

        // Shorthand for specific categories
        http: (message: string | object, ...args: LogData[]) => {
            const enhancedMessage = typeof message === 'object'
                ? { type: 'http', ...message }
                : `[HTTP] ${message}`;
            log(LogLevel.INFO, enhancedMessage, ...args);
        },

        db: (message: string | object, ...args: LogData[]) => {
            const enhancedMessage = typeof message === 'object'
                ? { type: 'database', ...message }
                : `[DB] ${message}`;
            log(LogLevel.DEBUG, enhancedMessage, ...args);
        },

        payment: (message: string | object, ...args: LogData[]) => {
            const enhancedMessage = typeof message === 'object'
                ? { type: 'payment', ...message }
                : `[PAYMENT] ${message}`;
            log(LogLevel.INFO, enhancedMessage, ...args);
        }
    };
};

// Export a default logger for general use
export const logger = createLogger('app'); 
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        user: any;
        __lastAccess?: number;
        __isAuthenticated?: boolean;
    }
} 
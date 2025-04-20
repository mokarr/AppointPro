import type { NextConfig } from 'next';

const config: NextConfig = {
    // Enable React strict mode for improved development experience
    reactStrictMode: true,

    // Optimize images from these domains
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },

    // Enable experimental features
    experimental: {
        // Enable modern webpack optimizations
        optimizePackageImports: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
        ],
        // Enable server actions with allowed origins
        serverActions: {
            allowedOrigins: ['localhost:3000'],
        },
    },

    // Webpack configuration for handling Node.js modules in the browser
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Prevent Node.js modules from being included in client-side bundles
            config.resolve.fallback = {
                ...config.resolve.fallback,
                async_hooks: false,
                fs: false,
                'fs/promises': false,
                net: false,
                tls: false,
                child_process: false,
                dns: false,
                os: false,
                path: false,
            };
        }
        return config;
    },

    // TypeScript configuration
    typescript: {
        // Disable type checking in production for faster builds
        ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },

    // Enable more modern minification
    swcMinify: true,

    // Configure redirects if needed
    async redirects() {
        return [];
    },

    // Configure headers if needed
    async headers() {
        return [];
    },
};

export default config; 
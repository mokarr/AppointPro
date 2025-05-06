import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    webpack: (config, { isServer }) => {

        // Add PrismaPlugin for server builds
        if (isServer) {
            config.plugins = [...config.plugins, new PrismaPlugin()];
        }

        // Only apply in the browser build
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                async_hooks: false, // Provide an empty module for async_hooks
                fs: false,
                net: false,
                tls: false,
                pg: false,
            };
        }

        return config;
    },
    transpilePackages: ['@prisma/client', 'prisma'],
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default withNextIntl(nextConfig); 
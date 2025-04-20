const nextConfig = {
    webpack: (config, { isServer }) => {
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
    experimental: {
        serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
    },
};

export default nextConfig; 
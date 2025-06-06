import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on, config) {
            // Store data between tests
            const localStorage: Record<string, unknown> = {};

            on('task', {
                setLocalStorage: ({ key, value }: { key: string, value: unknown }) => {
                    localStorage[key] = value;
                    return null;
                },
                getLocalStorage: (key: string) => {
                    return localStorage[key] || null;
                },
                clearLocalStorage: () => {
                    Object.keys(localStorage).forEach(key => delete localStorage[key]);
                    return null;
                }
            });
        },
        experimentalModifyObstructiveThirdPartyCode: true,
        experimentalWebKitSupport: true,
        chromeWebSecurity: false,
    },
    // Add hosts mapping to resolve all *.localhost subdomains to localhost
    hosts: {
        "*.localhost": "127.0.0.1"
    }
}); 
import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        experimentalModifyObstructiveThirdPartyCode: true,
        experimentalWebKitSupport: true,
        chromeWebSecurity: false,
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
    // Add hosts mapping to resolve all *.localhost subdomains to localhost
    hosts: {
        "*.localhost": "127.0.0.1"
    }
}); 
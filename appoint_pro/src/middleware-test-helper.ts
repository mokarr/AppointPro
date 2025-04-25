/**
 * Helper function to detect if the request is coming from Cypress with a specific subdomain test
 * This will be used in the middleware to assist with subdomain testing
 */
export function getCypressTestSubdomain(userAgent?: string | null): string | null {
    if (!userAgent) return null;

    // Check if the request is from our Cypress test
    const match = userAgent.match(/Cypress Subdomain Test \((.*?)\)/);
    if (match && match[1]) {
        return match[1];
    }

    return null;
} 
// Import commands.js using ES2015 syntax:
// Alternatively you can use CommonJS syntax:
require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
    app.document.addEventListener('DOMContentLoaded', () => {
        // Save the original open method
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (
            this: XMLHttpRequest,
            method: string,
            url: string | URL,
            async: boolean = true,
            username?: string | null,
            password?: string | null
        ) {
            if (typeof url === 'string' && url.indexOf('hot-update.json') === -1) {
                return originalOpen.call(this, method, url, async, username, password);
            }
        };
    });
}

beforeEach(() => {
    // Reset any previous state before each test
    cy.window().then((win) => {
        win.sessionStorage.clear();
        win.localStorage.clear();
    });
}); 
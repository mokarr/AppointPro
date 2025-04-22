// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (app) {
    app.document.addEventListener('DOMContentLoaded', () => {
        // Hide fetch/XHR requests
        const xhr = new XMLHttpRequest();
        xhr.prototype.originalOpen = xhr.prototype.open;
        xhr.prototype.open = function (method, url) {
            if (url.indexOf('hot-update.json') === -1) {
                this.originalOpen.apply(this, arguments);
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
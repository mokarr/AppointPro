/// <reference types="cypress" />

// Custom command to check if translations are loaded
Cypress.Commands.add('waitForTranslations', () => {
    cy.get('[data-cy="translation-loader"]').should('not.exist');
});

// Custom command to switch language
Cypress.Commands.add('switchLanguage', (lang: 'nl' | 'en') => {
    cy.location('pathname').then((pathname) => {
        cy.visit(`${pathname}?lang=${lang}`);
    });
});

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
    cy.visit('/sign-in');
    cy.waitForTranslations();
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
    cy.url().should('include', '/dashboard');
});

// Extend Cypress interface
declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to wait for translations to be loaded
             * @example cy.waitForTranslations()
             */
            waitForTranslations(): Chainable<void>

            /**
             * Custom command to switch the application language
             * @example cy.switchLanguage('nl')
             */
            switchLanguage(lang: 'nl' | 'en'): Chainable<void>

            /**
             * Custom command to login to the application
             * @example cy.login('test@example.com', 'password123')
             */
            login(email: string, password: string): Chainable<void>
        }
    }
} 
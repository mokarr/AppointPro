/// <reference types="cypress" />

declare namespace Cypress {
    interface Chainable<Subject = any> {
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
    }
} 
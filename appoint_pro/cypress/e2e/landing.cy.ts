describe('Landing Pages Navigation', () => {
    beforeEach(() => {
        // Reset to default language before each test
        cy.visit('/landing/company');
        cy.waitForTranslations();
    });

    it('should navigate between company and user landing pages', () => {
        // Check if the main title is present and translated
        cy.get('h1').should('not.contain', 'company.hero.title');

        // Find and click the user landing page link
        cy.get('a[href="/landing/user"]').click();

        // URL should now include /landing/user
        cy.url().should('include', '/landing/user');

        // Check if we can navigate back to company page
        cy.get('a[href="/landing/company"]').click();
        cy.url().should('include', '/landing/company');
    });

    it('should load translations correctly', () => {
        // Check if key elements are translated (not showing translation keys)
        cy.get('h1').should('not.contain', 'company.hero.title');
        cy.get('h2').first().should('not.contain', 'company.features.title');

        // Check if features section is visible
        cy.get('#features').should('be.visible');
    });

    it('should handle language switching', () => {
        // Switch to English
        cy.switchLanguage('en');
        cy.waitForTranslations();
        cy.get('h1').should('be.visible');

        // Switch to Dutch
        cy.switchLanguage('nl');
        cy.waitForTranslations();
        cy.get('h1').should('be.visible');
    });

    it('should have working CTA buttons', () => {
        // Check primary CTA button
        cy.get('a[href="/register/company"]').first()
            .should('be.visible')
            .and('not.contain', 'company.hero.cta');

        // Check secondary CTA button
        cy.get('a[href="#features"]')
            .should('be.visible')
            .and('not.contain', 'company.hero.secondaryCta');
    });
}); 
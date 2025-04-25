describe('Booking Flow', () => {
    const testOrganization = 'sportcenter-pro';

    // Set a specific date for consistent testing
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3); // 3 days from now
    const formattedDate = testDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedTime = '14:00'; // 2:00 PM

    it('should complete the full booking process as a guest', () => {
        // Visit the booking page with the subdomain
        cy.visitSubdomain(testOrganization, '/book');

        // Verify we're on the booking page
        cy.contains('Kies een locatie').should('be.visible');

        // Select the first location
        cy.contains('Kies deze locatie').first().click();

        // Verify we're on the facilities page
        cy.url().should('include', '/book/facilities');
        cy.contains('Kies een faciliteit').should('be.visible');

        // Select the first facility
        cy.contains('Kies deze faciliteit').first().click();

        // Verify we're on the confirmation page
        cy.url().should('include', '/book/confirmation');
        cy.contains('Boeking bijna bevestigd!').should('be.visible');

        // Fill in the booking form
        cy.get('#firstName').type('Test');
        cy.get('#lastName').type('User');
        cy.get('#email').type('test@example.com');
        cy.get('#phone').type('1234567890');
        cy.get('#date').type(formattedDate);
        cy.get('#time').type(formattedTime);
        cy.get('#notes').type('This is a test booking from Cypress');

        // Submit the booking
        cy.contains('Bevestig Boeking').click();

        // Check for success message
        cy.contains('Boeking Succesvol!', { timeout: 10000 }).should('be.visible');

        // Verify we're redirected to the success page
        cy.url().should('include', '/book/confirmation/success', { timeout: 10000 });

        // Validate booking details are displayed correctly
        cy.contains('Boekingsdetails').should('be.visible');
        cy.contains('CONFIRMED').should('be.visible');
        cy.contains('Test User').should('be.visible');
        cy.contains('test@example.com').should('be.visible');
        cy.contains('1234567890').should('be.visible');
        cy.contains('This is a test booking from Cypress').should('be.visible');
    });

    it('should validate booking form fields', () => {
        // Go directly to the confirmation page
        cy.navigateToBookingConfirmation(testOrganization);

        // Try to submit the empty form
        cy.contains('Bevestig Boeking').click();

        // Check that validation prevents submission
        cy.url().should('include', '/book/confirmation');

        // Check validation on each required field
        cy.get('#firstName').should('have.attr', 'required');
        cy.get('#lastName').should('have.attr', 'required');
        cy.get('#email').should('have.attr', 'required');
        cy.get('#phone').should('have.attr', 'required');
        cy.get('#date').should('have.attr', 'required');
        cy.get('#time').should('have.attr', 'required');

        // Fill in only some fields and verify it still doesn't submit
        cy.get('#firstName').type('Test');
        cy.get('#email').type('invalid-email');

        cy.contains('Bevestig Boeking').click();
        cy.url().should('include', '/book/confirmation');

        // Check email validation
        cy.get('#email').clear().type('test@example.com');

        // Now the form should be able to submit once all required fields are filled
    });

    // Custom command to stub API responses for more controlled testing
    it('should handle server errors gracefully', () => {
        // Intercept the booking API call and return an error
        cy.intercept('POST', '/api/bookings', {
            statusCode: 500,
            body: {
                success: false,
                error: 'Server Error'
            }
        }).as('bookingError');

        // Go directly to the confirmation page
        cy.navigateToBookingConfirmation(testOrganization);

        // Fill in all required fields
        cy.get('#firstName').type('Test');
        cy.get('#lastName').type('User');
        cy.get('#email').type('test@example.com');
        cy.get('#phone').type('1234567890');
        cy.get('#date').type(formattedDate);
        cy.get('#time').type(formattedTime);

        // Submit the form
        cy.contains('Bevestig Boeking').click();

        // Wait for the intercepted request and check for error message
        cy.wait('@bookingError');
        cy.contains('Server Error').should('be.visible');
    });
}); 
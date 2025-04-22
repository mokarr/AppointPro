describe('Location Management', () => {
    beforeEach(() => {
        // Login as a company user
        cy.login('test@example.com', 'password123');
    });

    it('should create a new location successfully', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();
        cy.url().should('include', '/dashboard/locations');

        // Click on add new location button
        cy.contains('button', /Add|Toevoegen/).click();

        // Fill in the location form
        cy.get('input[name="name"]').type('Test Location');
        cy.get('input[name="street"]').type('Test Street');
        cy.get('input[name="houseNumber"]').type('123');
        cy.get('input[name="postalCode"]').type('1234 AB');
        cy.get('input[name="city"]').type('Test City');
        cy.get('input[name="country"]').type('Netherlands');

        // Optional fields
        cy.get('input[name="phoneNumber"]').type('0612345678');
        cy.get('textarea[name="description"]').type('This is a test location');

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Verify success
        cy.contains(/Location created successfully|Locatie succesvol aangemaakt/).should('be.visible');

        // Verify location appears in the list
        cy.contains('Test Location').should('be.visible');
    });

    it('should validate required fields', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();

        // Click on add new location button
        cy.contains('button', /Add|Toevoegen/).click();

        // Try to submit empty form
        cy.get('button[type="submit"]').click();

        // Verify error messages
        cy.contains(/Name is required|Naam is verplicht/).should('be.visible');
        cy.contains(/Street is required|Straat is verplicht/).should('be.visible');
        cy.contains(/House number is required|Huisnummer is verplicht/).should('be.visible');
        cy.contains(/Postal code is required|Postcode is verplicht/).should('be.visible');
        cy.contains(/City is required|Stad is verplicht/).should('be.visible');
        cy.contains(/Country is required|Land is verplicht/).should('be.visible');
    });

    it('should edit an existing location', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();

        // Find and click edit button for the first location
        cy.get('button[aria-label="Edit location"]').first().click();

        // Update location name
        cy.get('input[name="name"]').clear().type('Updated Location Name');

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Verify success
        cy.contains(/Location updated successfully|Locatie succesvol bijgewerkt/).should('be.visible');

        // Verify updated name appears in the list
        cy.contains('Updated Location Name').should('be.visible');
    });

    it('should delete a location', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();

        // Store the number of locations before deletion
        cy.get('[data-cy="location-item"]').its('length').as('initialCount');

        // Find and click delete button for the first location
        cy.get('button[aria-label="Delete location"]').first().click();

        // Confirm deletion in the modal
        cy.get('button').contains(/Delete|Verwijderen/).click();

        // Verify success message
        cy.contains(/Location deleted successfully|Locatie succesvol verwijderd/).should('be.visible');

        // Verify location count decreased
        cy.get('@initialCount').then((initialCount) => {
            cy.get('[data-cy="location-item"]').should('have.length', Number(initialCount) - 1);
        });
    });
}); 
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

        // Wait for the dialog to appear
        cy.wait(1000);
        cy.log('Looking for the location dialog inputs');

        // Fill in the location form with the exact field IDs from the dialog
        cy.get('#name').clear().type('Test Location', { force: true });
        cy.get('#address').clear().type('Test Street 123', { force: true });
        cy.get('#postalCode').clear().type('1234 AB', { force: true });
        cy.get('#country').clear().type('Netherlands', { force: true });

        // Submit the form using the submit button in the dialog footer
        cy.get('button[type="submit"]').click();

        // Wait for the API request to complete (201 created response)
        cy.wait(2000);

        // Instead of looking for a success message, check that the dialog has closed
        // and the new location appears in the list
        cy.get('dialog').should('not.exist');

        // Verify location appears in the list
        cy.contains('Test Location').should('be.visible');
    });

    it('should validate required fields', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();

        // Click on add new location button
        cy.contains('button', /Add|Toevoegen/).click();
        cy.wait(1000);

        // Clear any default values in required fields
        cy.get('#name').clear();
        cy.get('#address').clear();

        // Try to submit empty form
        cy.get('button[type="submit"]').click();

        // Check for validation error messages for required fields
        cy.get('[role="alert"]').should('have.length.at.least', 1);

        // More specific checks for each field's error
        cy.get('#name').should('have.attr', 'aria-invalid', 'true')
            .should('have.class', 'border-red-500');
        cy.get('#address').should('have.attr', 'aria-invalid', 'true')
            .should('have.class', 'border-red-500');

        // Input valid data for only one field to ensure both validations work
        cy.get('#name').type('Test Location');
        cy.get('button[type="submit"]').click();

        // Name should now be valid, but address should still show error
        cy.get('#name').should('not.have.attr', 'aria-invalid', 'true');
        cy.get('#address').should('have.attr', 'aria-invalid', 'true');
    });

    it('should edit an existing location', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();

        // Find and click edit button for the first location
        // This button is in the card footer with an Edit icon
        cy.get('button').find('svg').filter('[data-icon="edit"]').first().parent().click({ force: true });
        // Alternatively target by the icon class
        // cy.get('button').contains('.edit').first().click({ force: true });
        cy.wait(1000);

        // Update location name
        cy.get('#name').clear().type('Updated Location Name', { force: true });

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Wait for the API request to complete
        cy.wait(2000);

        // Instead of looking for a success message, check that the dialog has closed
        cy.get('dialog').should('not.exist');

        // Verify updated name appears in the list
        cy.contains('Updated Location Name').should('be.visible');
    });

    it('should delete a location', () => {
        // Navigate to locations page
        cy.get('a[href="/dashboard/locations"]').click();
        cy.wait(1000);

        // Store the number of locations before deletion
        cy.get('.card').its('length').as('initialCount');

        // Find and click delete button for the first location
        // This button is in the card footer with a Trash icon
        cy.get('button').find('svg').filter('[data-icon="trash"]').first().parent().click({ force: true });
        // Alternatively target by the icon class
        // cy.get('button').contains('.trash').first().click({ force: true });
        cy.wait(1000);

        // Confirm deletion in the modal
        cy.contains('button', /Delete|Verwijderen/i).click({ force: true });

        // Wait for the API request to complete
        cy.wait(2000);

        // Instead of looking for a success message, verify the location count has decreased
        cy.get('@initialCount').then((initialCount) => {
            if (Number(initialCount) > 0) {
                cy.get('.card').its('length').should('be.lessThan', Number(initialCount));
            }
        });
    });
}); 
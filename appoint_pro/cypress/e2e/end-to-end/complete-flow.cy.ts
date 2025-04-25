// Complete End-to-End Test
// This test covers creating a location, adding a facility, and making a booking

describe('Complete Business Flow', () => {
    // Test data
    const testOrganization = 'sportcenter-pro';
    const locationName = 'Test Location ' + Date.now();
    const facilityName = 'Test Facility ' + Date.now();

    // Customer data for booking
    const customerData = {
        firstName: 'Test',
        lastName: 'Customer',
        email: 'test@example.com',
        phone: '1234567890',
    };

    // Date information
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 3); // 3 days from now
    const formattedDate = testDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const formattedTime = '14:00'; // 2:00 PM

    it('should create a location, add a facility, and make a booking', () => {
        // Login as admin
        cy.login('test@example.com', 'password123');
        cy.url().should('include', '/dashboard');

        // Step 1: Create a new location
        cy.log('Creating a new location');
        cy.get('a[href="/dashboard/locations"]').click();
        cy.url().should('include', '/dashboard/locations');

        // Click the Add Location button
        cy.contains('button', /Add|Toevoegen/).click();
        cy.wait(500);

        // Fill in the location form
        cy.get('#name').clear().type(locationName);
        cy.get('#address').clear().type('Test Street 123');
        cy.get('#postalCode').clear().type('1234 AB');
        cy.get('#country').clear().type('Netherlands');

        // Submit the form
        cy.get('button[type="submit"]').click();
        cy.wait(1000);

        // Verify location was created and we're back on the locations list page
        cy.url().should('include', '/dashboard/locations');
        cy.contains(locationName).should('be.visible');

        // Step 2: Get the location ID for the newly created location
        let locationId: string | undefined;

        // Find the location's ID directly from the data-location-id attribute
        cy.contains(locationName)
            .closest('[data-location-id]')
            .invoke('attr', 'data-location-id')
            .then((id) => {
                locationId = id;
                cy.log(`Found location ID: ${locationId}`);

                // Now that we have the ID, find and click the facilities link for this location
                cy.contains(locationName)
                    .parents('[data-location-id]')
                    .find(`a[href*="/locations/${locationId}/facilities"]`)
                    .click();
            });

        // Verify we're now on the facilities page for this location
        cy.url().should('include', '/facilities');

        // Verify we're on the correct location's facilities page
        cy.contains(locationName).should('be.visible');

        // Click the Add Facility button using its ID
        cy.get('#add-facility-button').click();
        cy.wait(1000);

        // Fill in the facility form
        cy.get('#name').clear().type(facilityName);
        cy.get('#description').clear().type('Test facility description');
        cy.get('#price').clear().type('25.00');

        // Select at least one feature from each category by clicking the custom checkbox button
        cy.get('[id^="feature-"]').first().click();

        // Submit the form using the button ID
        cy.get('#submit-add-facility').click();
        cy.wait(1000);

        // Verify facility was created on the correct location's page
        cy.contains(facilityName).should('be.visible');
        cy.contains(locationName).should('be.visible');

        // Step 3: Go directly to the subdomain and make a booking
        cy.log('Visiting the subdomain to make a booking');

        // Visit the booking page with the subdomain
        cy.visitSubdomain(testOrganization, '/book');

        // Verify we're on the booking page
        cy.contains(/Kies een locatie|Choose a location/).should('be.visible');

        // Select our newly created location based on the actual structure
        cy.contains(locationName)
            .closest('div.bg-white')  // Target the location container div
            .find('a')                // Find the "Kies deze locatie" link
            .click();

        // On the facilities page, select our newly created facility
        cy.url().should('include', '/book/facilities');

        // Verify we're viewing the correct location's facilities
        cy.url().then(url => {
            expect(url).to.include('locationId=');
        });

        // Wait a moment for the facilities to load
        cy.wait(1000);

        // The facility should be visible since it was added to this location
        cy.contains(facilityName).should('be.visible');

        // Find and click the facility
        cy.contains(facilityName)
            .parents('div.bg-white, div.shadow-md, div.rounded-lg')
            .find('a, button')
            .contains(/Kies deze faciliteit|Choose this facility|Select|Kies/i)
            .click();

        // Verify we're on the confirmation page
        cy.url().should('include', '/book/confirmation');
        cy.contains(/Boeking bijna bevestigd!|Booking almost confirmed!/).should('be.visible');

        // Fill in the booking form
        cy.get('#firstName').type(customerData.firstName);
        cy.get('#lastName').type(customerData.lastName);
        cy.get('#email').type(customerData.email);
        cy.get('#phone').type(customerData.phone);
        cy.get('#date').type(formattedDate);
        cy.get('#time').type(formattedTime);
        cy.get('#notes').type('End-to-end test booking');

        // Submit the booking
        cy.contains(/Bevestig Boeking|Confirm Booking/).click();

        // Check for success message and redirection
        cy.contains(/Boeking Succesvol!|Booking Successful!/, { timeout: 10000 }).should('be.visible');
        cy.url().should('include', '/book/confirmation/success', { timeout: 10000 });

        // Validate booking details are displayed correctly
        cy.contains(/Boekingsdetails|Booking details/).should('be.visible');
        cy.contains('CONFIRMED').should('be.visible');
        cy.contains(`${customerData.firstName} ${customerData.lastName}`).should('be.visible');
        cy.contains(customerData.email).should('be.visible');
        cy.contains(customerData.phone).should('be.visible');
    });
}); 
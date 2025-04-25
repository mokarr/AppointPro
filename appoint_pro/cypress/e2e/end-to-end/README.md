# End-to-End Test for AppointPro

This test demonstrates a complete business flow in the AppointPro system:

1. **Create a Location** - Login as admin and create a new location
2. **Add a Facility** - Add a new facility to the created location
3. **Make a Booking** - Go to the subdomain booking page and book the new facility

## Prerequisites

Before running this test, make sure:

1. The application is running locally at `http://localhost:3000`
2. You have a user account with admin privileges and the credentials match those in the test:
   - Email: `test@example.com`
   - Password: `password123`
3. The organization with subdomain `sportcenter-pro` exists and your admin account has access to it

## Running the Test

```bash
# Run all end-to-end tests
npx cypress run --spec "cypress/e2e/end-to-end/complete-flow.cy.ts"

# Or open Cypress to run it interactively
npx cypress open
```

## Test Data

The test uses dynamically generated data to avoid collisions:
- Location name: "Test Location {timestamp}"
- Facility name: "Test Facility {timestamp}"
- Booking date: Current date + 3 days

## Notes

- This test cleans up after itself by using unique names for locations and facilities
- It demonstrates the full user journey from admin setup to customer booking
- The test passes data between steps using the Cypress tasks system 
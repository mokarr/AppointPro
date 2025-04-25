# Booking Flow Cypress Tests

This directory contains Cypress tests for the booking flow functionality in the AppointPro application.

## Prerequisites

Before running these tests, make sure:

1. The application is running locally at `http://localhost:3000`
2. The database has been seeded with at least one organization with the subdomain "sportcenter-pro"
3. The organization has at least one location and one facility

## Test Cases

The test suite includes the following scenarios:

1. **Complete Booking Flow** - Tests the entire guest booking process from selecting a location to confirming a booking
2. **Form Validation** - Tests the validation of the booking form fields
3. **Error Handling** - Tests the application's response to server errors

## Running the Tests

To run these tests:

```bash
# Open Cypress test runner
npx cypress open

# Or run the tests headlessly
npx cypress run --spec "cypress/e2e/booking/booking-flow.cy.ts"
```

## Test Data

The tests use:
- A test organization with the subdomain "sportcenter-pro"
- The current date + 3 days for booking dates
- Fixed test data for customer information

## How Subdomain Testing Works

The tests use a special approach to simulate subdomain access:

1. A custom `visitSubdomain` command sets a special User-Agent header in the request
2. The middleware detects this header using the `middleware-test-helper.ts` module
3. When detected, the middleware uses the subdomain specified in the User-Agent
4. This allows testing subdomain features without actually changing the host

## Notes

- The API responses can be mocked for testing error scenarios
- The tests expect Dutch language text in the UI (e.g., "Bevestig Boeking") 
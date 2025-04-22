import { faker } from '@faker-js/faker';

describe('Subscription Management', () => {
    beforeEach(() => {
        // Set up a mock user session
        cy.intercept('GET', '/api/auth/session', {
            body: {
                user: {
                    id: 'test-user-id',
                    organizationId: 'test-org-id',
                    email: 'test@example.com',
                    name: 'Test User',
                },
            },
        }).as('session');
    });

    describe('Without active subscription', () => {
        beforeEach(() => {
            // Stub the dashboard page with no active subscription data
            cy.intercept('GET', '/dashboard', (req) => {
                // First let the request go through to get the actual page
                req.continue((res) => {
                    // Modify the response to include test data
                    // This simulates a dashboard with no active subscription
                    const testDataScript = `
                        <script id="cypress-test-data">
                        window.cypressTestData = {
                            organization: {
                                name: 'Test Organization',
                                hasActiveSubscription: false
                            },
                            subscription: null
                        };
                        </script>
                    `;
                    // Insert the test data script into the page
                    res.body = res.body.replace('</head>', `${testDataScript}</head>`);
                });
            }).as('dashboardPage');

            // Visit the dashboard page
            cy.visit('/dashboard');
            cy.wait('@session');
            cy.wait('@dashboardPage');

            // Ensure our test data is injected and available
            cy.window().should('have.property', 'cypressTestData');
        });

        it('should display the no active subscription message', () => {
            // Find subscription section in the dashboard
            cy.get('#subscription-management-section').within(() => {
                cy.contains('No active subscription found for Test Organization');
                cy.contains('Your organization doesn\'t have an active subscription');
                cy.contains('View Subscription Plans');
            });
        });

        it('should navigate to plans page when "View Subscription Plans" is clicked', () => {
            cy.intercept('GET', '/subscription/plans*', { statusCode: 200 }).as('getPlans');
            cy.get('#subscription-management-section').within(() => {
                cy.contains('View Subscription Plans').click();
            });
            cy.url().should('include', '/subscription/plans');
        });

        it('should attempt to refresh subscription status', () => {
            // Mock the check-status API endpoint
            cy.intercept('POST', '/api/subscriptions/check-status*', {
                body: {
                    success: true,
                    hasActiveSubscription: false,
                    updated: false,
                    message: 'Subscription status is already correct',
                },
            }).as('checkStatus');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Refresh Status').click();
            });
            cy.wait('@checkStatus');
            cy.get('#subscription-management-section').contains('Subscription status is already correct');
        });

        it('should handle errors when refreshing subscription status', () => {
            // Mock a failed response
            cy.intercept('POST', '/api/subscriptions/check-status*', {
                statusCode: 500,
                body: {
                    success: false,
                    error: 'Internal server error',
                },
            }).as('checkStatusError');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Refresh Status').click();
            });
            cy.wait('@checkStatusError');
            cy.get('#subscription-management-section').contains('Failed to refresh subscription status');
        });
    });

    describe('With active subscription', () => {
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        beforeEach(() => {
            // Create mock subscription data
            const mockSubscription = {
                id: 'test-subscription-id',
                stripeSubscriptionId: 'sub_test123',
                status: 'active',
                priceId: 'price_test123',
                planName: 'Pro Plan',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: oneMonthFromNow.toISOString(),
                cancelAtPeriodEnd: false
            };

            // Stub the dashboard page with active subscription data
            cy.intercept('GET', '/dashboard', (req) => {
                // First let the request go through to get the actual page
                req.continue((res) => {
                    // Modify the response to include test data
                    // This simulates a dashboard with active subscription
                    const testDataScript = `
                        <script id="cypress-test-data">
                        window.cypressTestData = {
                            organization: {
                                name: 'Test Organization',
                                hasActiveSubscription: true
                            },
                            subscription: ${JSON.stringify(mockSubscription)}
                        };
                        </script>
                    `;
                    // Insert the test data script into the page
                    res.body = res.body.replace('</head>', `${testDataScript}</head>`);
                });
            }).as('dashboardPage');

            // Visit the dashboard page
            cy.visit('/dashboard');
            cy.wait('@session');
            cy.wait('@dashboardPage');

            // Apply our test data to the app components
            // This is a workaround since we can't directly modify server-side props
            cy.window().then(win => {
                if (win.cypressTestData) {
                    // Force re-render with test data
                    cy.get('#subscription-management-section').should('exist');
                }
            });
        });

        it('should display the active subscription information', () => {
            cy.get('#subscription-management-section').within(() => {
                cy.contains('Current subscription for Test Organization');
                cy.contains('Active Subscription');
                cy.contains('Your Pro Plan subscription is active and will renew automatically');
                cy.contains('Pro Plan');
                cy.contains('active');
                cy.contains('Manage Subscription');
            });
        });

        it('should attempt to refresh subscription status for active subscription', () => {
            // Mock the check-status API endpoint
            cy.intercept('POST', '/api/subscriptions/check-status*', {
                body: {
                    success: true,
                    hasActiveSubscription: true,
                    updated: false,
                    message: 'Subscription status is already correct',
                },
            }).as('checkStatus');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Refresh Status').click();
            });
            cy.wait('@checkStatus');
            cy.get('#subscription-management-section').contains('Subscription status is already correct');
        });

        it('should handle subscription status updates', () => {
            // Mock a status update
            cy.intercept('POST', '/api/subscriptions/check-status*', {
                body: {
                    success: true,
                    hasActiveSubscription: true,
                    updated: true,
                    message: 'Subscription status refreshed from Stripe',
                },
            }).as('checkStatus');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Refresh Status').click();
            });
            cy.wait('@checkStatus');
            cy.get('#subscription-management-section').contains('Subscription status refreshed from Stripe');
        });

        it('should redirect to Stripe portal when "Manage Subscription" is clicked', () => {
            // Mock the create-portal API endpoint
            cy.intercept('POST', '/api/subscriptions/create-portal', {
                body: {
                    url: 'https://billing.stripe.com/session/test',
                },
            }).as('createPortal');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Manage Subscription').click();
            });
            cy.wait('@createPortal');

            // Since Cypress can't follow redirects to external domains, 
            // we just verify the API was called
            cy.get('@createPortal.all').should('have.length', 1);
        });
    });

    describe('Edge cases', () => {
        it('should handle missing subscription details', () => {
            // Stub the dashboard page with edge case data
            cy.intercept('GET', '/dashboard', (req) => {
                req.continue((res) => {
                    const testDataScript = `
                        <script id="cypress-test-data">
                        window.cypressTestData = {
                            organization: {
                                name: 'Test Organization with Issues',
                                hasActiveSubscription: true
                            },
                            subscription: null
                        };
                        </script>
                    `;
                    res.body = res.body.replace('</head>', `${testDataScript}</head>`);
                });
            }).as('dashboardPage');

            cy.visit('/dashboard');
            cy.wait('@session');
            cy.wait('@dashboardPage');

            cy.window().should('have.property', 'cypressTestData');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Current subscription for Test Organization with Issues');
                cy.contains('Subscription details unavailable');
            });
        });

        it('should handle status discrepancy and fix it', () => {
            // Create mock subscription data with discrepancy
            const mockSubscription = {
                id: 'test-subscription-id',
                stripeSubscriptionId: 'sub_test123',
                status: 'active',
                priceId: 'price_test123',
                planName: 'Pro Plan',
                currentPeriodStart: new Date().toISOString(),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                cancelAtPeriodEnd: false
            };

            // Stub the dashboard with discrepancy data
            cy.intercept('GET', '/dashboard', (req) => {
                req.continue((res) => {
                    const testDataScript = `
                        <script id="cypress-test-data">
                        window.cypressTestData = {
                            organization: {
                                name: 'Test Organization',
                                hasActiveSubscription: false
                            },
                            subscription: ${JSON.stringify(mockSubscription)}
                        };
                        </script>
                    `;
                    res.body = res.body.replace('</head>', `${testDataScript}</head>`);
                });
            }).as('dashboardPage');

            // Mock the status check to fix the discrepancy
            cy.intercept('POST', '/api/subscriptions/check-status*', {
                body: {
                    success: true,
                    hasActiveSubscription: true, // Status was fixed
                    updated: true,
                    message: 'Subscription status fixed',
                },
            }).as('checkStatus');

            cy.visit('/dashboard');
            cy.wait('@session');
            cy.wait('@dashboardPage');

            cy.window().should('have.property', 'cypressTestData');

            cy.get('#subscription-management-section').within(() => {
                cy.contains('Refresh Status').click();
            });
            cy.wait('@checkStatus');
            cy.get('#subscription-management-section').contains('Subscription status fixed');
        });
    });
}); 
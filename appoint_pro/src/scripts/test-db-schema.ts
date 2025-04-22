/**
 * Database Schema Test Script
 * 
 * This script tests the database schema by running sample queries
 * to validate the schema design and relationships.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database schema test...');

    try {
        // Test 1: Count records in each table
        const organizationCount = await prisma.organization.count();
        const userCount = await prisma.user.count();
        const locationCount = await prisma.location.count();
        const facilityCount = await prisma.facility.count();
        const bookingCount = await prisma.booking.count();
        const notificationCount = await prisma.notification.count();

        console.log('\n--- Record Counts ---');
        console.log(`Organizations: ${organizationCount}`);
        console.log(`Users: ${userCount}`);
        console.log(`Locations: ${locationCount}`);
        console.log(`Facilities: ${facilityCount}`);
        console.log(`Bookings: ${bookingCount}`);
        console.log(`Notifications: ${notificationCount}`);

        // Test 2: Create a test notification
        if (userCount > 0 && bookingCount > 0) {
            // Get the first user and booking
            const user = await prisma.user.findFirst();
            const booking = await prisma.booking.findFirst();

            if (user && booking) {
                // Create notification
                const notification = await prisma.notification.create({
                    data: {
                        userId: user.id,
                        bookingId: booking.id,
                        type: 'BOOKING_CONFIRMATION',
                        title: 'Booking Confirmed',
                        content: `Your booking for ${booking.startTime.toLocaleString()} has been confirmed.`,
                        isRead: false,
                    },
                });

                console.log('\n--- Test Notification Created ---');
                console.log(notification);
            }
        }

        // Test 3: Test relationship queries
        // Get a user with their bookings and notifications
        const userWithRelations = await prisma.user.findFirst({
            include: {
                bookings: true,
                notifications: true,
                organization: true,
            },
        });

        console.log('\n--- User Relationships Test ---');
        console.log(`User ID: ${userWithRelations?.id}`);
        console.log(`Bookings Count: ${userWithRelations?.bookings.length}`);
        console.log(`Notifications Count: ${userWithRelations?.notifications.length}`);
        console.log(`Organization: ${userWithRelations?.organization?.name}`);

        // Test 4: Test facility bookings relationship
        const facilityWithBookings = await prisma.facility.findFirst({
            include: {
                bookings: true,
                location: true,
            },
        });

        console.log('\n--- Facility Relationships Test ---');
        console.log(`Facility: ${facilityWithBookings?.name}`);
        console.log(`Location: ${facilityWithBookings?.location.name}`);
        console.log(`Bookings Count: ${facilityWithBookings?.bookings.length}`);

        // Test 5: Test JOIN query performance with proper indexing
        console.log('\n--- Testing Query Performance ---');
        const startTime = performance.now();

        await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                startTime: {
                    gte: new Date(),
                },
            },
            include: {
                user: true,
                facility: {
                    include: {
                        location: true,
                    },
                },
            },
        });

        const endTime = performance.now();
        console.log(`Query execution time: ${(endTime - startTime).toFixed(2)}ms`);

        console.log('\nDatabase schema test completed successfully!');
    } catch (error) {
        console.error('Error during database schema test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error('Unhandled error in test script:', error);
    process.exit(1);
}); 
/**
 * Create Test Booking Script
 * 
 * This script creates a test booking to verify the database relationships 
 * and constraints.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating test booking...');

    try {
        // 1. Get first user
        const user = await prisma.user.findFirst();
        if (!user) {
            throw new Error('No users found in the database');
        }

        // 2. Get first facility with its location
        const facility = await prisma.facility.findFirst({
            include: {
                location: true,
            },
        });

        if (!facility) {
            throw new Error('No facilities found in the database');
        }

        // 3. Create a booking for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0); // 10:00 AM

        const tomorrowEnd = new Date(tomorrow);
        tomorrowEnd.setHours(12, 0, 0, 0); // 12:00 PM (2-hour booking)

        const booking = await prisma.booking.create({
            data: {
                startTime: tomorrow,
                endTime: tomorrowEnd,
                userId: user.id,
                facilityId: facility.id,
                locationId: facility.location.id,
                status: 'CONFIRMED',
            },
        });

        console.log('\n--- Booking Created Successfully ---');
        console.log(booking);

        // 4. Create a notification for this booking
        const notification = await prisma.notification.create({
            data: {
                userId: user.id,
                bookingId: booking.id,
                type: 'BOOKING_CONFIRMATION',
                title: 'Booking Confirmed',
                content: `Your booking for ${facility.name} on ${tomorrow.toLocaleDateString()} at ${tomorrow.toLocaleTimeString()} has been confirmed.`,
                isRead: false,
            },
        });

        console.log('\n--- Notification Created Successfully ---');
        console.log(notification);

        // 5. Verify the relationships by fetching the booking with related data
        const verifyBooking = await prisma.booking.findUnique({
            where: {
                id: booking.id,
            },
            include: {
                user: true,
                facility: {
                    include: {
                        location: true,
                    },
                },
                notifications: true,
            },
        });

        console.log('\n--- Verification of Relationships ---');
        console.log('Booking ID:', verifyBooking?.id);
        console.log('User:', verifyBooking?.user.name);
        console.log('Facility:', verifyBooking?.facility.name);
        console.log('Location:', verifyBooking?.facility.location.name);
        console.log('Notifications Count:', verifyBooking?.notifications.length);

        // 6. Test a complex query that joins multiple tables
        console.log('\n--- Complex Query Test ---');

        const userBookings = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                bookings: {
                    include: {
                        facility: true,
                        location: true,
                        notifications: true,
                    },
                },
                notifications: {
                    where: {
                        isRead: false,
                    },
                },
                organization: true,
            },
        });

        console.log('User Bookings Count:', userBookings?.bookings.length);
        console.log('User Unread Notifications:', userBookings?.notifications.length);

        console.log('\nTest completed successfully!');
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error('Unhandled error in script:', error);
    process.exit(1);
}); 
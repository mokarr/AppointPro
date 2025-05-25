import { BookingConfirmationInput } from '@/models/BookingConfirmationInput';
import { BookingConfirmationEmailData } from '@/models/BookingConfirmationEmailData';
import { getFacilityById } from '@/services/facility';
import { getLocationById } from '@/services/location';
import { getOrganizationById } from '@/services/organization';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import AppointProBookingConfirmationEmail from '../../emails/confirmedBooking';
import { ActivateAccountEmailData } from '@/models/ActivateAccountEmailData';
import { AppointProActivateAccountEmail } from '../../emails/AppointProActivateAccountEmail';



export const sendBookingConfirmationEmailServer = async (
    input: BookingConfirmationInput
): Promise<{ success: boolean; message: string }> => {
    // Fetch the booking once

    console.log('input', input);
    const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
    });

    console.log('booking', booking);
    if (!booking) {
        console.log('Booking not found.');
        return { success: false, message: 'Booking not found.' };
    }
    if (booking.emailSent) {
        console.log('Email already sent for this booking.');
        return { success: true, message: 'Email already sent for this booking.' };
    }

    // Fetch facility, location, and organization info
    let facility;
    if (input.facilityId) {
        facility = await getFacilityById(input.facilityId);
    }
    const location = await getLocationById(input.locationId);
    const organization = location?.organizationId
        ? await getOrganizationById(location.organizationId)
        : null;

    const emailData: BookingConfirmationEmailData = {
        bookingNumber: input.bookingId,
        date: input.bookingDate,
        timeslot: `${input.startTime} - ${input.endTime}`,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        facilityName: facility?.name || '',
        locationName: location?.name || '',
        organizationPhone: organization?.phone || '',
        organizationEmail: organization?.email || '',
        bookingLink: input.bookingLink,
        notes: input.notes,
    };

    const resend = new Resend(process.env.RESEND_API_KEY);
    // const emailFrom = 'AppointPro <appointpro@gmail.com>'; 
    // const testEmailFrom = 'Acme <onboarding@resend.dev>';

    const emailFrom = process.env.emailFrom ? process.env.emailFrom : 'Acme <onboarding@resend.dev>';
    try {
        const { error } = await resend.emails.send({
            from:emailFrom,
            to: [emailData.customerEmail],
            subject: 'Uw boeking is bevestigd!',
            html: await render(AppointProBookingConfirmationEmail({ bookingData: emailData })),
        });
        if (error) {
            console.log('Error sending email:', error);
            return { success: false, message: error.message };
        }
        // Update booking to set emailSent to true (use already-fetched booking)
        try {
            console.log('Updating booking to set emailSent to true.');
            await prisma.booking.update({
                where: { id: booking.id },
                data: { emailSent: true },
            });
        } catch (updateError: any) {
            // Optionally log or handle update error, but still return success for email
        }
        return { success: true, message: 'Email sent successfully' };
    } catch (err: any) {
        return { success: false, message: err?.message || 'Unknown error' };
    }
}; 

export const sendActivateAccountEmail = async (email: string, token: string, organizationName: string) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailFrom = process.env.EMAIL_FROM ? process.env.EMAIL_FROM : 'Acme <onboarding@resend.dev>';

    const emailData: ActivateAccountEmailData = {
        token: token,
        email: email,
        organizationName: organizationName,
    };

    try {
        const { error } = await resend.emails.send({
            from: emailFrom,
            to: [emailData.email],
            subject: 'Activeer uw account',
            html: await render(AppointProActivateAccountEmail({ emailData: emailData })),
        });
        if (error) {
            console.log('Error sending email:', error);
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Email sent successfully' };
    } catch (err: any) {
        return { success: false, message: err?.message || 'Unknown error' };
    }
}

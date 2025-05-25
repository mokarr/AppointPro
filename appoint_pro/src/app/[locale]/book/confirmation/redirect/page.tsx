import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function RedirectPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    //TODO: this does not work, when going back the browser doesnt go back to the redirect page
    // Resolve the searchParams Promise
    const resolvedSearchParams = await searchParams;
    const bookingId = typeof resolvedSearchParams.bookingId === 'string' ? resolvedSearchParams.bookingId : '';

    if (!bookingId) {
        redirect('/book');
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            emailSent: true
        }
    });

    console.log('booking', booking);

    if (!booking) {
        console.log('booking not found');
        redirect('/book');
    }

    // If email has been sent, redirect te booking page because use possible returnt to this page
    if (booking.emailSent) {
        console.log('email already sent');
        redirect('/book');
    }

    console.log('email not sent');
    // If email hasn't been sent, redirect to success page
    redirect(`/book/confirmation/success?bookingId=${bookingId}`);

}

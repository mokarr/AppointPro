import { sendBookingConfirmationEmailServer } from '@/services/email';
import { BookingConfirmationInput } from '@/models/BookingConfirmationInput';

export async function POST(req: Request) {
    const bookingData: BookingConfirmationInput = await req.json();
    const result = await sendBookingConfirmationEmailServer(bookingData);
    if (!result.success) {
        return new Response(result.message, { status: 500 });
    }
    return Response.json({ message: result.message });
}



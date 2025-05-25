export type BookingConfirmationInput = {
    bookingId: string;
    facilityId: string;
    locationId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    notes?: string;
    bookingLink: string;
    personCount: number | null;
}; 
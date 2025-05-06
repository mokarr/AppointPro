export type BookingConfirmationEmailData = {
    bookingNumber: string;
    date: string;
    timeslot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    facilityName: string;
    locationName: string;
    organizationPhone: string;
    organizationEmail: string;
    notes?: string;
    bookingLink: string;
}; 
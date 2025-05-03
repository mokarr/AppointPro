export interface Appointment {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    facilityId: string;
    locationId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    notes?: string;
    status: 'CONFIRMED' | 'CANCELLED' | 'PENDING';
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
} 
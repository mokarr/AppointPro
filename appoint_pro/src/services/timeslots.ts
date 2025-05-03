'use server';

import { prisma } from "@/lib/prisma";
import { addDays, addMinutes, format, isAfter, isBefore, isSameDay, setHours, setMinutes } from "date-fns";

/**
 * TimeslotService - Responsible for calculating and managing available timeslots
 * 
 * This service provides functionality to determine available booking timeslots for facilities,
 * considering:
 * - Facility business hours
 * - Existing bookings/appointments
 * - Organization-level settings
 * - Location-specific settings
 * - Facility-specific settings
 * - Custom blocking rules and availability rules
 * 
 * The core principle is that a timeslot is available only if it meets ALL the following criteria:
 * 1. Falls within the facility's business hours
 * 2. Doesn't overlap with any existing bookings
 * 3. Meets all organization, location, and facility level rules
 * 4. Has the requested duration available
 */

/**
 * Interface representing business hours for each day of the week
 */
interface BusinessHours {
    monday: { open: string; close: string } | null;
    tuesday: { open: string; close: string } | null;
    wednesday: { open: string; close: string } | null;
    thursday: { open: string; close: string } | null;
    friday: { open: string; close: string } | null;
    saturday: { open: string; close: string } | null;
    sunday: { open: string; close: string } | null;
}

/**
 * Interface for a time slot
 */
interface TimeSlot {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

/**
 * Default business hours used when no specific hours are defined
 */
const DEFAULT_BUSINESS_HOURS: BusinessHours = {
    monday: { open: "09:00", close: "17:00" },
    tuesday: { open: "09:00", close: "17:00" },
    wednesday: { open: "09:00", close: "17:00" },
    thursday: { open: "09:00", close: "17:00" },
    friday: { open: "09:00", close: "17:00" },
    saturday: { open: "10:00", close: "15:00" },
    sunday: null, // Closed by default
};

/**
 * Get the day of week as a string from a Date object
 * 
 * @param date - The date to get the day of week from
 * @returns The day of the week as a lowercase string (e.g. 'monday')
 */
function getDayOfWeek(date: Date): keyof BusinessHours {
    const days: (keyof BusinessHours)[] = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
    ];
    return days[date.getDay()];
}

/**
 * Parse time string to hours and minutes
 * 
 * @param timeString - Time in format "HH:MM"
 * @returns Object with hours and minutes
 */
function parseTime(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
}

/**
 * Retrieves all existing bookings for a facility on a specific date
 * 
 * @param facilityId - The ID of the facility
 * @param date - The date to check for bookings
 * @returns Array of bookings with start and end times
 */
async function getExistingBookings(facilityId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all bookings/appointments for the facility on the given date
    const bookings = await prisma.booking.findMany({
        where: {
            facilityId,
            startTime: { gte: startOfDay },
            endTime: { lte: endOfDay }
        },
        select: {
            startTime: true,
            endTime: true
        }
    });

    return bookings;
}

/**
 * Get business hours for a specific facility on a specific date
 * 
 * This takes into account the hierarchy of settings:
 * 1. Facility-specific business hours
 * 2. Location-level business hours
 * 3. Organization-level business hours
 * 4. Default business hours
 * 
 * @param facilityId - The ID of the facility
 * @param date - The date to get business hours for
 * @returns Business hours for the specific day
 */
async function getBusinessHours(facilityId: string, date: Date): Promise<{ open: string; close: string } | null> {
    // Get day of week from date
    const dayOfWeek = getDayOfWeek(date);

    try {
        // Get facility with its location and organization
        const facility = await prisma.facility.findUnique({
            where: { id: facilityId },
            include: {
                location: {
                    include: {
                        organization: true
                    }
                }
            }
        });

        if (!facility) {
            throw new Error(`Facility with ID ${facilityId} does not exist`);
        }

        // TODO: In the future, implement actual business hours in the database
        // Currently using default hours as a placeholder

        // For now, returning default business hours for the given day
        return DEFAULT_BUSINESS_HOURS[dayOfWeek];
    } catch (error) {
        console.error(`Error fetching business hours for facility ${facilityId}:`, error);
        // Return default hours for the day as fallback
        return DEFAULT_BUSINESS_HOURS[dayOfWeek];
    }
}

/**
 * Checks if a potential timeslot overlaps with any existing bookings
 * 
 * This function determines if a given time slot overlaps with any existing bookings
 * using a comprehensive check that considers all possible overlap scenarios:
 * 
 * 1. Start time is within an existing booking
 * 2. End time is within an existing booking
 * 3. Slot completely contains an existing booking
 * 4. Slot is completely contained by an existing booking
 * 5. Slot is exactly the same as an existing booking
 * 
 * @param startTime - Start time of the potential slot
 * @param endTime - End time of the potential slot
 * @param bookings - Array of existing bookings
 * @returns True if the slot overlaps with any booking
 */
function overlapWithBookings(
    startTime: Date,
    endTime: Date,
    bookings: { startTime: Date; endTime: Date }[]
): boolean {
    // Check if this time slot overlaps with any existing booking
    return bookings.some(booking => {
        // Case 1: Slot starts during an existing booking
        // startTime is >= booking.startTime AND startTime is < booking.endTime
        const startsDuringBooking =
            (startTime >= booking.startTime && startTime < booking.endTime);

        // Case 2: Slot ends during an existing booking
        // endTime is > booking.startTime AND endTime is <= booking.endTime
        const endsDuringBooking =
            (endTime > booking.startTime && endTime <= booking.endTime);

        // Case 3: Slot completely contains an existing booking
        // startTime is <= booking.startTime AND endTime is >= booking.endTime
        const containsBooking =
            (startTime <= booking.startTime && endTime >= booking.endTime);

        // Case 4: Slot is completely contained by an existing booking
        // startTime is >= booking.startTime AND endTime is <= booking.endTime
        const containedByBooking =
            (startTime >= booking.startTime && endTime <= booking.endTime);

        // If any of these cases are true, there is an overlap
        return startsDuringBooking || endsDuringBooking || containsBooking || containedByBooking;
    });
}

/**
 * Generate all possible time slots for a specific day with the given duration
 * 
 * @param date - The date to generate slots for
 * @param businessHours - Business hours for the day
 * @param durationMinutes - Duration of each slot in minutes
 * @param bookings - Existing bookings to check against
 * @returns Array of available time slots
 */
function generateTimeSlots(
    date: Date,
    businessHours: { open: string; close: string } | null,
    durationMinutes: number,
    bookings: { startTime: Date; endTime: Date }[]
): TimeSlot[] {
    // If no business hours (e.g. facility is closed), return empty array
    if (!businessHours) {
        return [];
    }

    const slots: TimeSlot[] = [];
    const { hours: openHour, minutes: openMinute } = parseTime(businessHours.open);
    const { hours: closeHour, minutes: closeMinute } = parseTime(businessHours.close);

    // Calculate last possible start time based on closing time and duration
    const lastPossibleStartDate = new Date(date);
    lastPossibleStartDate.setHours(closeHour, closeMinute, 0, 0);
    lastPossibleStartDate.setMinutes(lastPossibleStartDate.getMinutes() - durationMinutes);

    // Set current time at opening hour
    const currentDate = new Date(date);
    currentDate.setHours(openHour, openMinute, 0, 0);

    // Handle "today" - don't show past slots
    const now = new Date();
    if (isSameDay(now, date) && isAfter(now, currentDate)) {
        // Round up to the next 30-minute interval
        const minutes = now.getMinutes();
        const roundedMinutes = minutes < 30 ? 30 : 0;
        const roundedHour = minutes < 30 ? now.getHours() : now.getHours() + 1;

        currentDate.setHours(roundedHour, roundedMinutes, 0, 0);
    }

    // Generate slots at 30-minute intervals
    const timeSlotIntervalMinutes = 30;

    // Continue generating slots as long as we haven't passed the last possible start time
    while (!isAfter(currentDate, lastPossibleStartDate)) {
        // Calculate end time for this slot
        const slotEndTime = new Date(currentDate);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + durationMinutes);

        // Check if slot overlaps with any booking
        const overlaps = overlapWithBookings(currentDate, slotEndTime, bookings);

        // Add slot to the list
        slots.push({
            startTime: format(currentDate, 'HH:mm'),
            endTime: format(slotEndTime, 'HH:mm'),
            isAvailable: !overlaps
        });

        // Move to next slot
        currentDate.setMinutes(currentDate.getMinutes() + timeSlotIntervalMinutes);
    }

    return slots;
}

/**
 * Get all available time slots for a specific facility on a given date
 * 
 * @param facilityId - ID of the facility
 * @param date - Date for which to get available slots
 * @param durationMinutes - Duration of the booking in minutes
 * @returns Promise with array of available time slots
 */
export async function getAvailableTimeSlots(
    facilityId: string,
    date: Date,
    durationMinutes: number = 60 // Default 1 hour
): Promise<TimeSlot[]> {
    try {
        // Validate input parameters
        if (!facilityId) {
            throw new Error("Facility ID is required");
        }

        if (!date) {
            throw new Error("Date is required");
        }

        if (durationMinutes <= 0) {
            throw new Error("Duration must be positive");
        }

        // Step 1: Get business hours for the facility on that day
        const businessHours = await getBusinessHours(facilityId, date);

        // Step 2: Get existing bookings for the facility on that day
        const existingBookings = await getExistingBookings(facilityId, date);

        // Step 3: Generate all possible timeslots
        const allSlots = generateTimeSlots(date, businessHours, durationMinutes, existingBookings);

        // Step 4: Return only available slots or all slots with availability flag
        return allSlots;

        // Alternative: Return only available slots
        // return allSlots.filter(slot => slot.isAvailable);
    } catch (error) {
        console.error("Error getting available time slots:", error);
        throw error;
    }
}

/**
 * Get available time slots for multiple days
 * 
 * @param facilityId - ID of the facility
 * @param startDate - Start date of the range
 * @param days - Number of days to check (default: 7)
 * @param durationMinutes - Duration of each booking in minutes
 * @returns Map of dates to available time slots
 */
export async function getAvailableTimeSlotsForRange(
    facilityId: string,
    startDate: Date,
    days: number = 7,
    durationMinutes: number = 60
): Promise<{ [dateString: string]: TimeSlot[] }> {
    const results: { [dateString: string]: TimeSlot[] } = {};

    // Iterate through each day in the range
    for (let i = 0; i < days; i++) {
        const currentDate = addDays(startDate, i);
        const formattedDate = format(currentDate, 'yyyy-MM-dd');

        // Get slots for this day
        const slots = await getAvailableTimeSlots(facilityId, currentDate, durationMinutes);

        // Add to results
        results[formattedDate] = slots;
    }

    return results;
} 
import { NextResponse } from "next/server";
import { getAvailableTimeSlots, getAvailableTimeSlotsForRange } from "@/services/timeslots";

/**
 * GET /api/timeslots
 * 
 * Endpoint to get available timeslots for a specific facility
 * 
 * Query parameters:
 * - facilityId: string (required) - ID of the facility to check availability for
 * - date: string (optional) - Date in format "YYYY-MM-DD" to check (defaults to today)
 * - duration: number (optional) - Duration in minutes (defaults to 60)
 * - range: boolean (optional) - If true, returns timeslots for multiple days
 * - days: number (optional) - Number of days to check if range=true (defaults to 7)
 * 
 * Returns:
 * - Single date mode: Array of time slots with availability
 * - Range mode: Object with dates as keys and arrays of time slots as values
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Required parameters
        const facilityId = searchParams.get('facilityId');
        if (!facilityId) {
            return NextResponse.json(
                { error: "facilityId is required" },
                { status: 400 }
            );
        }

        // Optional parameters
        const dateParam = searchParams.get('date');
        const durationParam = searchParams.get('duration');
        const rangeParam = searchParams.get('range');
        const daysParam = searchParams.get('days');

        // Parse date (defaults to today)
        const date = dateParam
            ? new Date(dateParam)
            : new Date();

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return NextResponse.json(
                { error: "Invalid date format. Use YYYY-MM-DD." },
                { status: 400 }
            );
        }

        // Parse duration (defaults to 60 minutes)
        const duration = durationParam ? parseInt(durationParam) : 60;
        if (isNaN(duration) || duration <= 0) {
            return NextResponse.json(
                { error: "Duration must be a positive number" },
                { status: 400 }
            );
        }

        // Check if range mode is requested
        const isRangeMode = rangeParam === 'true';

        // Parse days for range mode
        let days = 7; // Default
        if (isRangeMode && daysParam) {
            days = parseInt(daysParam);
            if (isNaN(days) || days <= 0 || days > 30) {
                return NextResponse.json(
                    { error: "Days must be a positive number between 1 and 30" },
                    { status: 400 }
                );
            }
        }

        // Get timeslots based on mode
        if (isRangeMode) {
            const timeslots = await getAvailableTimeSlotsForRange(
                facilityId,
                date,
                days,
                duration
            );

            return NextResponse.json(timeslots);
        } else {
            const timeslots = await getAvailableTimeSlots(
                facilityId,
                date,
                duration
            );

            return NextResponse.json(timeslots);
        }
    } catch (error) {
        console.error("Error processing timeslots request:", error);

        // Return appropriate error response
        if (error instanceof Error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Failed to retrieve available timeslots" },
            { status: 500 }
        );
    }
} 
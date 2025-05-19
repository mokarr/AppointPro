import * as z from "zod";

export const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
] as const;

export type DayOfWeek = typeof daysOfWeek[number];

export const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    instructor: z.string().optional(),
    maxParticipants: z.coerce.number().min(1, "Must have at least 1 participant"),
    startDate: z.date({ required_error: "Start date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
    isRecurring: z.boolean(),
    recurrencePattern: z.enum(["daily", "weekly", "biweekly", "triweekly", "monthly", "bimonthly", "trimonthly"]).optional(),
    skipDay: z.array(z.enum(daysOfWeek)).optional(),
    endDate: z.date().optional(),
    isInFacility: z.boolean(),
    facilityId: z.string().optional(),
}).refine((data) => {
    if (data.isRecurring) {
        return !!data.recurrencePattern && !!data.endDate;
    }
    return true;
}, {
    message: "Recurrence pattern and end date are required for recurring classes",
    path: ["recurrencePattern"]
}).refine((data) => {
    if (data.isInFacility) {
        return !!data.facilityId;
    }
    return true;
}, {
    message: "Please select a facility",
    path: ["facilityId"]
});

export type FormValues = z.infer<typeof formSchema>; 
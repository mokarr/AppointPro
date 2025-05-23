'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addDays, addWeeks, addMonths } from 'date-fns';
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema, FormValues } from "./schema";
import { BasicInfoFields } from "./components/BasicInfoFields";
import { DateTimeFields } from "./components/DateTimeFields";
import { RecurringOptions } from "./components/RecurringOptions";
import { PreviewSessions } from "./components/PreviewSessions";
import { FacilityOption } from "./components/FacilityOption";
import { BookingConflictModal } from "./components/BookingConflictModal";
import { ClassConflictModal } from "./components/ClassConflictModal";

interface AddClassFormProps {
    locationId: string;
    facilities: {
        id: string;
        name: string;
        description: string;
        type: string;
    }[];
}

export function AddClassForm({ locationId, facilities }: AddClassFormProps) {
    const t = useTranslations('dashboard');
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!locationId) {
        router.push('/dashboard');
        return null;
    }

    const [previewSessions, setPreviewSessions] = useState<Date[]>([]);
    const [bookingConflicts, setBookingConflicts] = useState<any[]>([]);
    const [classConflicts, setClassConflicts] = useState<any[]>([]);
    const [showBookingConflictModal, setShowBookingConflictModal] = useState(false);
    const [showClassConflictModal, setShowClassConflictModal] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            instructor: "",
            maxParticipants: 10,
            startDate: undefined,
            startTime: "09:00",
            duration: 60,
            isRecurring: false,
            skipDay: [],
            isInFacility: false,
            facilityId: undefined,
        },
    });

    const isRecurring = form.watch("isRecurring");
    const recurrencePattern = form.watch("recurrencePattern");
    const endDate = form.watch("endDate");
    const skipDay = form.watch("skipDay");
    const startDate = form.watch("startDate");

    useEffect(() => {
        if (!isRecurring || !recurrencePattern || !endDate || !startDate) {
            setPreviewSessions([]);
            return;
        }

        const sessions: Date[] = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            const skipDayIndexes = (skipDay as string[] | undefined)?.map(day => ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf(day)) ?? [];

            if (!skipDayIndexes.includes(dayOfWeek)) {
                sessions.push(new Date(currentDate));
            }

            switch (recurrencePattern) {
                case "daily":
                    currentDate = addDays(currentDate, 1);
                    break;
                case "weekly":
                    currentDate = addWeeks(currentDate, 1);
                    break;
                case "biweekly":
                    currentDate = addWeeks(currentDate, 2);
                    break;
                case "triweekly":
                    currentDate = addWeeks(currentDate, 3);
                    break;
                case "monthly":
                    currentDate = addMonths(currentDate, 1);
                    break;
                case "bimonthly":
                    currentDate = addMonths(currentDate, 2);
                    break;
                case "trimonthly":
                    currentDate = addMonths(currentDate, 3);
                    break;
            }
        }

        setPreviewSessions(sessions);
    }, [isRecurring, recurrencePattern, endDate, skipDay, startDate]);

    const handleBookingConflictConfirm = async () => {
        try {
            // TODO: Implement the API call to cancel conflicting bookings
            const response = await fetch('/api/bookings/cancel-conflicts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingIds: bookingConflicts.map(conflict => conflict.id)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel conflicting bookings');
            }

            toast.success(t('classes.bookingConflicts.cancelled'));
            setShowBookingConflictModal(false);
            // Continue with class creation
            await submitClass(form.getValues());
        } catch (error) {
            console.error('Error cancelling conflicting bookings:', error);
            toast.error(t('classes.bookingConflicts.cancelError'));
        }
    };

    const submitClass = async (data: FormValues) => {
        const loadingToast = toast.loading(t('classes.creating'));
        try {
            const response = await fetch('/api/class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    instructor: data.instructor,
                    maxParticipants: data.maxParticipants,
                    locationId: locationId,
                    facilityId: data.isInFacility ? data.facilityId : undefined,
                    startTime: data.startTime,
                    duration: data.duration,
                    sessions: previewSessions.map(session => ({
                        date: session.toISOString().split('T')[0],
                        startTime: data.startTime,
                        endTime: new Date(session.setHours(
                            parseInt(data.startTime.split(':')[0]),
                            parseInt(data.startTime.split(':')[1]) + data.duration
                        )).toTimeString().slice(0, 5)
                    }))
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create class');
            }

            const result = await response.json();
            console.log('Class created successfully:', result);
            toast.dismiss(loadingToast);
            toast.success(t('classes.created'));
            router.push('/dashboard/classes');
        } catch (error) {
            console.error('Error creating class:', error);
            toast.dismiss(loadingToast);
            toast.error(t('classes.createError'));
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (previewSessions.length > 200) {
            toast.error(t('classes.tooManySessions', { max: 200 }));
            return;
        }

        if (data.isInFacility && data.facilityId) {
            try {
                const response = await fetch('/api/bookings/check-facility-availability', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        facilityId: data.facilityId,
                        sessions: previewSessions.map(session => ({
                            startTime: new Date(session.setHours(
                                parseInt(data.startTime.split(':')[0]),
                                parseInt(data.startTime.split(':')[1])
                            )),
                            endTime: new Date(session.setHours(
                                parseInt(data.startTime.split(':')[0]),
                                parseInt(data.startTime.split(':')[1]) + data.duration
                            ))
                        }))
                    })
                });

                const result = await response.json();
                
                if (result.conflictStatus) {
                    setBookingConflicts(result.conflicts);
                    setShowBookingConflictModal(true);
                    return;
                }

                if (result.classConflictsStatus) {
                    setClassConflicts(result.classConflicts);
                    setShowClassConflictModal(true);
                    return;
                }

                // If no conflicts, proceed with class creation
                await submitClass(data);
            } catch (error) {
                console.error('Error checking facility availability:', error);
                toast.error(t('classes.availabilityCheckError'));
            }
        } else {
            // If no facility selected, proceed with class creation
            await submitClass(data);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('classes.addClass')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('classes.addClassDescription')}
                    </p>
                </div>

                <Form {...form}>
                    <form 
                        onSubmit={form.handleSubmit(onSubmit)} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                //prevent submitting on enter
                                e.preventDefault();
                            }
                        }}
                        className="space-y-8"
                    >
                        <BasicInfoFields form={form} />
                        <DateTimeFields form={form} />
                        <FacilityOption form={form} facilities={facilities} />
                        <RecurringOptions form={form} />
                        <PreviewSessions 
                            previewSessions={previewSessions} 
                            startTime={form.getValues("startTime")} 
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit">
                                {t('common.save')}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <BookingConflictModal
                isOpen={showBookingConflictModal}
                onClose={() => setShowBookingConflictModal(false)}
                onConfirm={handleBookingConflictConfirm}
                conflicts={bookingConflicts}
            />

            <ClassConflictModal
                isOpen={showClassConflictModal}
                onClose={() => setShowClassConflictModal(false)}
                conflicts={classConflicts}
            />
        </div>
    );
} 
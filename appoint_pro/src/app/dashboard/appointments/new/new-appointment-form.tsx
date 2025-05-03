'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Facility, Location } from '@prisma/client';
import { useRouter } from 'next/navigation';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface NewAppointmentFormProps {
    _user: {
        id: string;
        email: string;
        organizationId: string;
        organization: {
            id: string;
            name: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            subdomain: string | null;
            branche: string;
            stripeCustomerId: string | null;
            hasActiveSubscription: boolean;
        };
    };
    _organization: {
        id: string;
        name: string;
    };
    _locations: (Location & {
        facilities: Facility[];
    })[];
    initialValues?: {
        startTime?: string;
        endTime?: string;
        facilityId?: string;
        locationId?: string;
    };
}

// Form schema for new appointment
const formSchema = z.object({
    customerName: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    customerEmail: z.string().email({
        message: "Please enter a valid email address.",
    }),
    customerPhone: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
    startTime: z.string(),
    endTime: z.string(),
    locationId: z.string(),
    facilityId: z.string(),
});

// Type definition for the form values
type FormValues = z.infer<typeof formSchema>;

export default function NewAppointmentForm({
    _user,
    _organization,
    _locations,
    initialValues = {}
}: NewAppointmentFormProps) {
    const { getTranslation } = useLanguage();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);

    // Set default location and facilities
    const defaultLocationId = initialValues.locationId || (_locations.length > 0 ? _locations[0].id : '');
    const defaultLocation = _locations.find(loc => loc.id === defaultLocationId);

    // Use useMemo to prevent defaultFacilities from changing on every render
    const defaultFacilities = useMemo(() =>
        defaultLocation?.facilities || [],
        [defaultLocation]
    );

    // Calculate default times if not provided
    const now = new Date();
    const roundedHour = new Date(now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0));
    const oneHourLater = new Date(roundedHour);
    oneHourLater.setHours(roundedHour.getHours() + 1);

    const defaultStartTime = initialValues.startTime || roundedHour.toISOString().slice(0, 16);
    const defaultEndTime = initialValues.endTime || oneHourLater.toISOString().slice(0, 16);
    const defaultFacilityId = initialValues.facilityId || (defaultFacilities.length > 0 ? defaultFacilities[0].id : '');

    // Initialize form with initial values - add type assertion
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            notes: "",
            status: "CONFIRMED" as "PENDING" | "CONFIRMED" | "CANCELLED",
            startTime: defaultStartTime,
            endTime: defaultEndTime,
            locationId: defaultLocationId,
            facilityId: defaultFacilityId,
        },
    });

    // Update facilities when location changes
    useEffect(() => {
        if (defaultLocationId) {
            setFacilities(defaultFacilities);
        }
    }, [defaultLocationId, defaultFacilities]);

    const handleLocationChange = (locationId: string) => {
        const location = _locations.find(loc => loc.id === locationId);
        if (location) {
            setFacilities(location.facilities);
            if (location.facilities.length > 0) {
                form.setValue("facilityId", location.facilities[0].id);
            } else {
                form.setValue("facilityId", "");
            }
        }
    };

    // Submit the new appointment
    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: values.customerName,
                    ...values
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create appointment');
            }

            const data = await response.json();

            // Navigate to the new appointment page
            router.push(`/dashboard/appointments/${data.data.id}`);
        } catch (error) {
            console.error('Error creating appointment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={getTranslation("common.newAppointment")}
                description={getTranslation("common.header.newAppointment.description")}
                action={
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {getTranslation("common.back")}
                    </Button>
                }
            />

            <DashboardContent>
                <Card>
                    <CardHeader>
                        <CardTitle>{getTranslation("common.newAppointment")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">{getTranslation("common.customerInformation")}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="customerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.customerName")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={getTranslation("common.enterName")} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customerEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.customerEmail")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={getTranslation("common.enterEmail")} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="customerPhone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.customerPhone")}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={getTranslation("common.enterPhone")} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.status")}</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={getTranslation("common.selectStatus")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="PENDING">{getTranslation("common.pending")}</SelectItem>
                                                            <SelectItem value="CONFIRMED">{getTranslation("common.confirmed")}</SelectItem>
                                                            <SelectItem value="CANCELLED">{getTranslation("common.cancelled")}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">{getTranslation("common.appointmentDetails")}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="startTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.startTime")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="endTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.endTime")}</FormLabel>
                                                    <FormControl>
                                                        <Input type="datetime-local" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="locationId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.location")}</FormLabel>
                                                    <Select
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            handleLocationChange(value);
                                                        }}
                                                        defaultValue={field.value}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={getTranslation("common.selectLocation")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {_locations.map((location) => (
                                                                <SelectItem key={location.id} value={location.id}>
                                                                    {location.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="facilityId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{getTranslation("common.facility")}</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        defaultValue={field.value}
                                                        disabled={facilities.length === 0}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={getTranslation("common.selectFacility")} />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {facilities.map((facility) => (
                                                                <SelectItem key={facility.id} value={facility.id}>
                                                                    {facility.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{getTranslation("common.notes")}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={getTranslation("common.enterNotes")}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                    >
                                        {getTranslation("common.cancel")}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? getTranslation("common.creating")
                                            : getTranslation("common.createAppointment")}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </DashboardContent>
        </DashboardLayout>
    );
} 
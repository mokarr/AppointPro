'use client';

import { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Facility, Location } from '@prisma/client';
import {
    Form,
    FormControl,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

// Define type for form values based on schema
type AppointmentFormValues = z.infer<typeof formSchema>;

interface AppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (values: AppointmentFormValues) => Promise<void>;
    locations: (Location & {
        facilities: Facility[];
    })[];
    initialValues: {
        startTime: string;
        endTime: string;
        locationId: string;
        facilityId: string;
    };
}

export default function AppointmentForm({
    isOpen,
    onClose,
    onSubmit,
    locations,
    initialValues
}: AppointmentFormProps) {
    const { getTranslation } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [appointmentFacilities, setAppointmentFacilities] = useState<Facility[]>(() => {
        // Initialize facilities based on selected location
        const location = locations.find(loc => loc.id === initialValues.locationId);
        return location?.facilities || [];
    });

    // Initialize form with initial values
    const form = useForm<AppointmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: "",
            customerEmail: "",
            customerPhone: "",
            notes: "",
            status: "CONFIRMED",
            startTime: initialValues.startTime,
            endTime: initialValues.endTime,
            locationId: initialValues.locationId,
            facilityId: initialValues.facilityId,
        },
    });

    // Handle location change in the appointment form
    const handleLocationChange = (locationId: string) => {
        const location = locations.find(loc => loc.id === locationId);
        if (location) {
            setAppointmentFacilities(location.facilities);
            if (location.facilities.length > 0) {
                form.setValue("facilityId", location.facilities[0].id);
            } else {
                form.setValue("facilityId", "");
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (values: AppointmentFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(values);
            form.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getTranslation("common.newAppointment")}</DialogTitle>
                    <DialogDescription>
                        {getTranslation("common.header.newAppointment.description")}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                                                    {locations.map((location) => (
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
                                                disabled={appointmentFacilities.length === 0}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={getTranslation("common.selectFacility")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {appointmentFacilities.map((facility) => (
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                {getTranslation("common.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? getTranslation("common.creating")
                                    : getTranslation("common.createAppointment")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// Export the type for use in other components
export type { AppointmentFormValues }; 
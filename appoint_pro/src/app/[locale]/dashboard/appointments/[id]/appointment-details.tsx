'use client';

import { useState } from 'react';
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    CalendarIcon,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    Building,
    Clipboard,
    Edit,
    Trash2,
    ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { Facility, Location, Booking } from '@prisma/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from 'next-intl';

// Define extended appointment type with included relations
interface AppointmentWithRelations extends Booking {
    facility: Facility | null;
    location: Location;
}

interface AppointmentDetailsProps {
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
    _appointment: AppointmentWithRelations; // The appointment/booking details with relations
    _locations: (Location & {
        facilities: Facility[];
    })[];
}

// Form schema
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

// Type definition for form values
type FormValues = z.infer<typeof formSchema>;

export default function AppointmentDetails({
    _user,
    _organization,
    _appointment,
    _locations
}: AppointmentDetailsProps) {
    const t = useTranslations('common');
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>(
        _locations.find(loc => loc.id === _appointment.locationId)?.facilities || []
    );

    // Initialize form with appointment data
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            customerName: _appointment.customerName || "",
            customerEmail: _appointment.customerEmail || "",
            customerPhone: _appointment.customerPhone || "",
            notes: _appointment.notes || "",
            status: _appointment.status as "PENDING" | "CONFIRMED" | "CANCELLED",
            startTime: format(new Date(_appointment.startTime), "yyyy-MM-dd'T'HH:mm"),
            endTime: format(new Date(_appointment.endTime), "yyyy-MM-dd'T'HH:mm"),
            locationId: _appointment.locationId,
            facilityId: _appointment.facilityId || "",
        },
    });

    // Format date for display
    const formatDate = (date: Date) => {
        return format(new Date(date), "PPP");
    };

    // Format time for display
    const formatTime = (date: Date) => {
        return format(new Date(date), "p");
    };

    // Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "CONFIRMED":
                return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
            case "CANCELLED":
                return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
        }
    };

    // Update available facilities when location changes
    const handleLocationChange = (locationId: string) => {
        const location = _locations.find(loc => loc.id === locationId);
        if (location) {
            setFacilities(location.facilities);
            form.setValue("facilityId", location.facilities[0]?.id || "");
        }
    };

    // Submit the edited appointment
    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/appointments`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: _appointment.id,
                    ...values,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update appointment");
            }

            // Close edit modal and refresh page
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating appointment:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete the appointment
    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/appointments?id=${_appointment.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete appointment");
            }

            // Navigate back to appointments page
            router.push("/dashboard/appointments");
        } catch (error) {
            console.error("Error deleting appointment:", error);
        } finally {
            setIsLoading(false);
            setIsDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t("appointmentDetails")}
                description={t("header.appointmentDetails.description")}
                action={
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t("back")}
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("edit")}
                        </Button>
                        <Button variant="destructive" onClick={() => setIsDeleting(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("delete")}
                        </Button>
                    </div>
                }
            />

            <DashboardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main appointment info */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{_appointment.customerName}</CardTitle>
                                <Badge className={getStatusBadgeColor(_appointment.status)}>
                                    {_appointment.status}
                                </Badge>
                            </div>
                            <CardDescription>
                                {t("appointmentDetails")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">{formatDate(_appointment.startTime)}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("date")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Clock className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">
                                        {formatTime(_appointment.startTime)} - {formatTime(_appointment.endTime)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {t("time")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Building className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">{_appointment.facility?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("facility")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">{_appointment.location?.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {_appointment.location?.address || ""}
                                    </p>
                                </div>
                            </div>

                            {_appointment.notes && (
                                <div className="flex items-start border-t pt-4 mt-4">
                                    <Clipboard className="h-5 w-5 mr-3 text-gray-500" />
                                    <div>
                                        <p className="font-medium">{t("notes")}</p>
                                        <p className="text-gray-700 mt-1">{_appointment.notes}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("customerInformation")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <User className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">{_appointment.customerName}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("name")}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                                <div>
                                    <p className="font-medium">{_appointment.customerEmail}</p>
                                    <p className="text-sm text-gray-500">
                                        {t("email")}
                                    </p>
                                </div>
                            </div>

                            {_appointment.customerPhone && (
                                <div className="flex items-center">
                                    <Phone className="h-5 w-5 mr-3 text-gray-500" />
                                    <div>
                                        <p className="font-medium">{_appointment.customerPhone}</p>
                                        <p className="text-sm text-gray-500">
                                            {t("phone")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <div className="w-full text-sm text-gray-500">
                                <div className="flex justify-between">
                                    <span>{t("created")}</span>
                                    <span>{format(new Date(_appointment.createdAt), "PPP")}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span>{t("updated")}</span>
                                    <span>{format(new Date(_appointment.updatedAt), "PPP")}</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </DashboardContent>

            {/* Edit Appointment Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{t("editAppointment")}</DialogTitle>
                        <DialogDescription>
                            {t("editAppointmentDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="customerName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("customerName")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>{t("customerEmail")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>{t("customerPhone")}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>{t("status")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("selectStatus")} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="PENDING">{t("pending")}</SelectItem>
                                                    <SelectItem value="CONFIRMED">{t("confirmed")}</SelectItem>
                                                    <SelectItem value="CANCELLED">{t("cancelled")}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t("startTime")}</FormLabel>
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
                                            <FormLabel>{t("endTime")}</FormLabel>
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
                                            <FormLabel>{t("location")}</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleLocationChange(value);
                                                }}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("selectLocation")} />
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
                                            <FormLabel>{t("facility")}</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={t("selectFacility")} />
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
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("notes")}</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                                    {t("cancel")}
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? t("saving") : t("save")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("confirmDelete")}</DialogTitle>
                        <DialogDescription>
                            {t("confirmDeleteDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleting(false)}>
                            {t("cancel")}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? t("deleting") : t("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
} 
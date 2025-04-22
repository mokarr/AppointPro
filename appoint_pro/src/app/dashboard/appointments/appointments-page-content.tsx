'use client';

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addHours, setHours, setMinutes, parse } from "date-fns";
import { Loader2, PlusCircle, Calendar as CalendarIcon, Clock, Info, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface Organization {
    id: string;
    name: string;
}

interface User {
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
}

interface Location {
    id: string;
    name: string;
}

interface Facility {
    id: string;
    name: string;
    price: number;
    locationId: string;
}

interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    facilityId: string;
    facility: {
        id: string;
        name: string;
    };
    locationId: string;
    location: {
        id: string;
        name: string;
    };
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    updatedAt: string;
}

interface AppointmentsPageContentProps {
    _user: User;
    _organization: Organization;
}

export default function AppointmentsPageContent({ _user, _organization }: AppointmentsPageContentProps) {
    const { getTranslation } = useLanguage();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [locations, setLocations] = useState<Location[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedFacility, setSelectedFacility] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New booking form state
    const [newBooking, setNewBooking] = useState({
        startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm"),
        facilityId: "",
        locationId: "",
        notes: ""
    });

    // Fetch locations and facilities for the organization
    useEffect(() => {
        const fetchLocationsAndFacilities = async () => {
            try {
                const locationsResponse = await fetch('/api/locations');
                if (locationsResponse.ok) {
                    const locationsData = await locationsResponse.json();
                    setLocations(locationsData.data || []);

                    // Set default selected location if available
                    if (locationsData.data && locationsData.data.length > 0) {
                        setSelectedLocation(locationsData.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
                toast.error(getTranslation('errors.fetchLocationsFailed'));
            }
        };

        fetchLocationsAndFacilities();
    }, [getTranslation]);

    // Fetch facilities when location changes
    useEffect(() => {
        const fetchFacilities = async () => {
            if (!selectedLocation) return;

            try {
                const facilitiesResponse = await fetch(`/api/locations/${selectedLocation}/facilities`);
                if (facilitiesResponse.ok) {
                    const facilitiesData = await facilitiesResponse.json();
                    setFacilities(facilitiesData.data || []);

                    // Reset selected facility
                    setSelectedFacility("");

                    // Set default facility if available
                    if (facilitiesData.data && facilitiesData.data.length > 0) {
                        setSelectedFacility(facilitiesData.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching facilities:', error);
                toast.error(getTranslation('errors.fetchFacilitiesFailed'));
            }
        };

        fetchFacilities();
    }, [selectedLocation, getTranslation]);

    // Fetch bookings when date, location, or facility changes
    useEffect(() => {
        const fetchBookings = async () => {
            if (!selectedDate) return;

            setIsLoading(true);

            try {
                const from = new Date(selectedDate);
                from.setHours(0, 0, 0, 0);

                const to = new Date(selectedDate);
                to.setHours(23, 59, 59, 999);

                let url = `/api/bookings?from=${from.toISOString()}&to=${to.toISOString()}`;

                if (selectedLocation) {
                    url += `&locationId=${selectedLocation}`;
                }

                if (selectedFacility) {
                    url += `&facilityId=${selectedFacility}`;
                }

                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();
                    setBookings(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                toast.error(getTranslation('errors.fetchBookingsFailed'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookings();
    }, [selectedDate, selectedLocation, selectedFacility, getTranslation]);

    // Handle create booking
    const handleCreateBooking = async () => {
        if (!newBooking.locationId || !newBooking.facilityId) {
            toast.error(getTranslation('errors.selectLocationAndFacility'));
            return;
        }

        setIsCreating(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newBooking)
            });

            if (response.ok) {
                toast.success(getTranslation('success.bookingCreated'));
                setIsDialogOpen(false);

                // Refetch bookings
                const from = new Date(selectedDate!);
                from.setHours(0, 0, 0, 0);

                const to = new Date(selectedDate!);
                to.setHours(23, 59, 59, 999);

                let url = `/api/bookings?from=${from.toISOString()}&to=${to.toISOString()}`;

                if (selectedLocation) {
                    url += `&locationId=${selectedLocation}`;
                }

                if (selectedFacility) {
                    url += `&facilityId=${selectedFacility}`;
                }

                const bookingsResponse = await fetch(url);

                if (bookingsResponse.ok) {
                    const data = await bookingsResponse.json();
                    setBookings(data.data || []);
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || getTranslation('errors.createBookingFailed'));
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error(getTranslation('errors.createBookingFailed'));
        } finally {
            setIsCreating(false);
        }
    };

    // Handle booking action (confirm, cancel, complete)
    const handleBookingAction = async (bookingId: string, action: "CONFIRMED" | "CANCELLED" | "COMPLETED") => {
        try {
            const response = await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: action })
            });

            if (response.ok) {
                toast.success(getTranslation(`success.booking${action}`));

                // Update booking in the list
                setBookings(prevBookings =>
                    prevBookings.map(booking =>
                        booking.id === bookingId
                            ? { ...booking, status: action }
                            : booking
                    )
                );
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || getTranslation(`errors.booking${action}Failed`));
            }
        } catch (error) {
            console.error(`Error ${action.toLowerCase()} booking:`, error);
            toast.error(getTranslation(`errors.booking${action}Failed`));
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {getTranslation('status.pending')}
                </Badge>;
            case 'CONFIRMED':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Info className="w-3 h-3 mr-1" />
                    {getTranslation('status.confirmed')}
                </Badge>;
            case 'COMPLETED':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {getTranslation('status.completed')}
                </Badge>;
            case 'CANCELLED':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    {getTranslation('status.cancelled')}
                </Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={getTranslation('common.appointments')}
                description={getTranslation('common.header.appointments.description')}
                action={
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                {getTranslation('common.header.appointments.new')}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                            <DialogHeader>
                                <DialogTitle>{getTranslation('appointments.createNew')}</DialogTitle>
                                <DialogDescription>
                                    {getTranslation('appointments.createDescription')}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">{getTranslation('common.location')}</Label>
                                        <Select
                                            value={newBooking.locationId}
                                            onValueChange={(value) => setNewBooking({
                                                ...newBooking,
                                                locationId: value,
                                                facilityId: "" // Reset facility when location changes
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={getTranslation('appointments.selectLocation')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map(location => (
                                                    <SelectItem key={location.id} value={location.id}>
                                                        {location.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="facility">{getTranslation('common.facility')}</Label>
                                        <Select
                                            value={newBooking.facilityId}
                                            onValueChange={(value) => setNewBooking({
                                                ...newBooking,
                                                facilityId: value
                                            })}
                                            disabled={!newBooking.locationId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={getTranslation('appointments.selectFacility')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {facilities
                                                    .filter(f => f.locationId === newBooking.locationId)
                                                    .map(facility => (
                                                        <SelectItem key={facility.id} value={facility.id}>
                                                            {facility.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="startTime">{getTranslation('appointments.startTime')}</Label>
                                        <div className="flex">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal"
                                                        type="button"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {newBooking.startTime ? format(new Date(newBooking.startTime), "PPP") :
                                                            <span>{getTranslation('appointments.pickDate')}</span>
                                                        }
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={newBooking.startTime ? new Date(newBooking.startTime) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const currentStart = newBooking.startTime ? new Date(newBooking.startTime) : new Date();
                                                                const hours = currentStart.getHours();
                                                                const minutes = currentStart.getMinutes();

                                                                const newDate = setMinutes(setHours(date, hours), minutes);
                                                                setNewBooking({
                                                                    ...newBooking,
                                                                    startTime: format(newDate, "yyyy-MM-dd'T'HH:mm"),
                                                                    endTime: format(addHours(newDate, 1), "yyyy-MM-dd'T'HH:mm")
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="mt-1">
                                            <Label htmlFor="startTimeHour">{getTranslation('appointments.time')}</Label>
                                            <div className="flex mt-1">
                                                <Input
                                                    id="startTimeHour"
                                                    type="time"
                                                    value={newBooking.startTime ? format(new Date(newBooking.startTime), "HH:mm") : "09:00"}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                                            const date = newBooking.startTime ? new Date(newBooking.startTime) : new Date();
                                                            const newDate = setMinutes(setHours(date, hours), minutes);
                                                            setNewBooking({
                                                                ...newBooking,
                                                                startTime: format(newDate, "yyyy-MM-dd'T'HH:mm"),
                                                                endTime: format(addHours(newDate, 1), "yyyy-MM-dd'T'HH:mm")
                                                            });
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="endTime">{getTranslation('appointments.endTime')}</Label>
                                        <div className="flex">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal"
                                                        type="button"
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {newBooking.endTime ? format(new Date(newBooking.endTime), "PPP") :
                                                            <span>{getTranslation('appointments.pickDate')}</span>
                                                        }
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={newBooking.endTime ? new Date(newBooking.endTime) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const currentEnd = newBooking.endTime ? new Date(newBooking.endTime) : addHours(new Date(), 1);
                                                                const hours = currentEnd.getHours();
                                                                const minutes = currentEnd.getMinutes();

                                                                const newDate = setMinutes(setHours(date, hours), minutes);
                                                                setNewBooking({
                                                                    ...newBooking,
                                                                    endTime: format(newDate, "yyyy-MM-dd'T'HH:mm")
                                                                });
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="mt-1">
                                            <Label htmlFor="endTimeHour">{getTranslation('appointments.time')}</Label>
                                            <div className="flex mt-1">
                                                <Input
                                                    id="endTimeHour"
                                                    type="time"
                                                    value={newBooking.endTime ? format(new Date(newBooking.endTime), "HH:mm") : "10:00"}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            const [hours, minutes] = e.target.value.split(':').map(Number);
                                                            const date = newBooking.endTime ? new Date(newBooking.endTime) : addHours(new Date(), 1);
                                                            const newDate = setMinutes(setHours(date, hours), minutes);
                                                            setNewBooking({
                                                                ...newBooking,
                                                                endTime: format(newDate, "yyyy-MM-dd'T'HH:mm")
                                                            });
                                                        }
                                                    }}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">{getTranslation('appointments.notes')}</Label>
                                    <Textarea
                                        id="notes"
                                        value={newBooking.notes}
                                        onChange={(e) => setNewBooking({
                                            ...newBooking,
                                            notes: e.target.value
                                        })}
                                        placeholder={getTranslation('appointments.notesPlaceholder')}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {getTranslation('common.cancel')}
                                </Button>
                                <Button type="button" onClick={handleCreateBooking} disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {getTranslation('common.create')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <DashboardContent>
                <Tabs defaultValue="calendar" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="calendar">{getTranslation('appointments.calendar')}</TabsTrigger>
                        <TabsTrigger value="list">{getTranslation('appointments.list')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="calendar" className="space-y-4 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{getTranslation('appointments.selectDate')}</CardTitle>
                                        <CardDescription>{getTranslation('appointments.filterDescription')}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="rounded-md border"
                                        />
                                        <div className="mt-4 space-y-3">
                                            <div className="space-y-1">
                                                <Label htmlFor="locationFilter">{getTranslation('common.location')}</Label>
                                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={getTranslation('appointments.selectLocation')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {locations.map(location => (
                                                            <SelectItem key={location.id} value={location.id}>
                                                                {location.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="facilityFilter">{getTranslation('common.facility')}</Label>
                                                <Select
                                                    value={selectedFacility}
                                                    onValueChange={setSelectedFacility}
                                                    disabled={!selectedLocation || facilities.length === 0}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={getTranslation('appointments.selectFacility')} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {facilities.map(facility => (
                                                            <SelectItem key={facility.id} value={facility.id}>
                                                                {facility.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="md:col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            {selectedDate && format(selectedDate, "PPPP")}
                                        </CardTitle>
                                        <CardDescription>
                                            {getTranslation('appointments.scheduledBookings')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-40">
                                                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                            </div>
                                        ) : bookings.length === 0 ? (
                                            <div className="text-center py-8">
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    {getTranslation('appointments.noBookings')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {bookings.map((booking) => (
                                                    <Card key={booking.id} className={cn(
                                                        "border-l-4",
                                                        booking.status === "CANCELLED" ? "border-l-red-400" :
                                                            booking.status === "CONFIRMED" ? "border-l-blue-400" :
                                                                booking.status === "COMPLETED" ? "border-l-green-400" :
                                                                    "border-l-yellow-400"
                                                    )}>
                                                        <CardHeader className="pb-2">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <CardTitle className="text-lg">
                                                                        {booking.facility.name}
                                                                    </CardTitle>
                                                                    <CardDescription>
                                                                        {booking.location.name}
                                                                    </CardDescription>
                                                                </div>
                                                                <div className="ml-4">
                                                                    {getStatusBadge(booking.status)}
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent className="pb-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center text-gray-600">
                                                                    <Clock className="h-4 w-4 mr-1" />
                                                                    <span>
                                                                        {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center text-gray-600">
                                                                    <span className="font-medium">
                                                                        {booking.user.name || booking.user.email}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="pt-0">
                                                            <div className="flex gap-2 w-full justify-end">
                                                                {booking.status === "PENDING" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                                                                        >
                                                                            {getTranslation('common.cancel')}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleBookingAction(booking.id, "CONFIRMED")}
                                                                        >
                                                                            {getTranslation('common.confirm')}
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {booking.status === "CONFIRMED" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                                                                        >
                                                                            {getTranslation('common.cancel')}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleBookingAction(booking.id, "COMPLETED")}
                                                                        >
                                                                            {getTranslation('common.complete')}
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="list" className="space-y-4 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{getTranslation('appointments.allBookings')}</CardTitle>
                                <CardDescription>{getTranslation('appointments.listDescription')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {getTranslation('appointments.noBookings')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-3 px-2">{getTranslation('common.facility')}</th>
                                                    <th className="text-left py-3 px-2">{getTranslation('common.location')}</th>
                                                    <th className="text-left py-3 px-2">{getTranslation('appointments.time')}</th>
                                                    <th className="text-left py-3 px-2">{getTranslation('common.user')}</th>
                                                    <th className="text-left py-3 px-2">{getTranslation('common.status')}</th>
                                                    <th className="text-right py-3 px-2">{getTranslation('common.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.map((booking) => (
                                                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-2">{booking.facility.name}</td>
                                                        <td className="py-3 px-2">{booking.location.name}</td>
                                                        <td className="py-3 px-2">
                                                            {format(new Date(booking.startTime), "PP h:mm a")} -
                                                            {format(new Date(booking.endTime), "h:mm a")}
                                                        </td>
                                                        <td className="py-3 px-2">{booking.user.name || booking.user.email}</td>
                                                        <td className="py-3 px-2">{getStatusBadge(booking.status)}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <div className="flex gap-2 justify-end">
                                                                {booking.status === "PENDING" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                                                                        >
                                                                            {getTranslation('common.cancel')}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleBookingAction(booking.id, "CONFIRMED")}
                                                                        >
                                                                            {getTranslation('common.confirm')}
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {booking.status === "CONFIRMED" && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="destructive"
                                                                            onClick={() => handleBookingAction(booking.id, "CANCELLED")}
                                                                        >
                                                                            {getTranslation('common.cancel')}
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleBookingAction(booking.id, "COMPLETED")}
                                                                        >
                                                                            {getTranslation('common.complete')}
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DashboardContent>
        </DashboardLayout>
    );
} 
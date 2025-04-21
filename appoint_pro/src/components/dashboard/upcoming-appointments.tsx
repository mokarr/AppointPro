"use client"

import * as React from "react"
import { format } from "date-fns"
import { nl } from "date-fns/locale"
import { Calendar, Clock, MapPin, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Location = {
    id: string
    name: string
    [key: string]: string
}

type Appointment = {
    id: string
    title: string
    description?: string
    startDateTime: Date
    endDateTime: Date
    location?: string | Location
    client?: {
        name: string
        email?: string
    }
    Employee?: {
        name: string
        email: string
    }
    status: "confirmed" | "pending" | "cancelled"
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface UpcomingAppointmentsProps extends React.HTMLAttributes<HTMLDivElement> {
    appointments: Appointment[]
    onViewAll?: () => void
    isLoading?: boolean
}

export function UpcomingAppointments({
    appointments,
    onViewAll,
    isLoading = false,
    className,
    ...props
}: UpcomingAppointmentsProps) {
    const formatDate = (date: Date) => {
        return format(date, "EEEE d MMMM", { locale: nl })
    }

    const formatTime = (date: Date) => {
        return format(date, "HH:mm")
    }

    const statusColors: Record<Appointment['status'], BadgeVariant> = {
        confirmed: "success",
        pending: "warning",
        cancelled: "destructive",
    }

    const statusLabels = {
        confirmed: "Bevestigd",
        pending: "In afwachting",
        cancelled: "Geannuleerd",
    }

    // Helper to get location name regardless of format
    const getLocationName = (location: Appointment['location']) => {
        if (!location) return 'Geen locatie';
        if (typeof location === 'string') return location;
        return location.name || 'Onbekende locatie';
    }

    return (
        <Card className={cn("shadow-sm", className)} {...props}>
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                    <CardTitle>Aankomende afspraken</CardTitle>
                    <CardDescription>Je hebt {appointments.length} aankomende afspraken</CardDescription>
                </div>
                {onViewAll && (
                    <Button variant="ghost" size="sm" onClick={onViewAll}>
                        Alles bekijken
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-24 animate-pulse bg-muted rounded-lg"></div>
                        <div className="h-24 animate-pulse bg-muted rounded-lg"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Geen aankomende afspraken gevonden.</p>
                        ) : (
                            appointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex flex-col space-y-2 p-4 border rounded-lg transition-all duration-200 hover:shadow-sm hover:border-primary/50"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{appointment.title}</h3>
                                        <Badge variant={statusColors[appointment.status]}>
                                            {statusLabels[appointment.status]}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(appointment.startDateTime)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            {formatTime(appointment.startDateTime)} - {formatTime(appointment.endDateTime)}
                                        </span>
                                    </div>

                                    {appointment.client && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{appointment.client.name}</span>
                                        </div>
                                    )}

                                    {appointment.Employee && !appointment.client && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <User className="h-4 w-4" />
                                            <span>{appointment.Employee.name}</span>
                                        </div>
                                    )}

                                    {appointment.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            <span>{getLocationName(appointment.location)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="outline" size="sm">Details</Button>
                                        {appointment.status !== "cancelled" && (
                                            <Button variant="outline" size="sm">Bewerken</Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 
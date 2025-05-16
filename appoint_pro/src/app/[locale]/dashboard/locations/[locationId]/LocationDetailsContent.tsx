'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Settings, Edit, Trash, Plus, Users, Clock, Euro } from "lucide-react";
import Link from "next/link";
import { LocationEditDialog } from "@/components/dashboard/locations/LocationEditDialog";
import { LocationDeleteDialog } from "@/components/dashboard/locations/LocationDeleteDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationWithFacilities } from "@/models/location/locationWithFacilities";

export function LocationDetailsContent({ locationWithFacilities }: { locationWithFacilities: LocationWithFacilities }) {
    const t = useTranslations('dashboard.locations');
    const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
    const [isDeleteLocationOpen, setIsDeleteLocationOpen] = useState(false);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex justify-between items-start border-b pb-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {locationWithFacilities.name}
                        </h1>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{locationWithFacilities.address}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditLocationOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('edit')}
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeleteLocationOpen(true)}>
                            <Trash className="h-4 w-4 mr-2" />
                            {t('delete')}
                        </Button>
                        <Button asChild>
                            <Link href={`/dashboard/locations/${locationWithFacilities.id}/settings`} className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                {t('settings')}
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Location Details Section */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t('locationDetails')}</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <h3 className="font-medium mb-1">{t('address')}</h3>
                                        <p className="text-muted-foreground">{locationWithFacilities.address}</p>
                                        {locationWithFacilities.postalCode && (
                                            <p className="text-muted-foreground">{locationWithFacilities.postalCode}</p>
                                        )}
                                        {locationWithFacilities.country && (
                                            <p className="text-muted-foreground">{locationWithFacilities.country}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Facilities Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{t('facilities')}</h2>
                            <Button asChild size="sm">
                                <Link href={`/dashboard/locations/${locationWithFacilities.id}/facilities/new`} className="flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('addFacility')}
                                </Link>
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {locationWithFacilities.facilities.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-lg text-muted-foreground">{t('noFacilities')}</p>
                                    <Button asChild variant="link" className="mt-2">
                                        <Link href={`/dashboard/locations/${locationWithFacilities.id}/facilities/new`}>
                                            {t('createFirstFacility')}
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                locationWithFacilities.facilities.map((facility) => (
                                    <Card key={facility.id} className="hover:bg-muted/50 transition-colors">
                                        <Link
                                            href={`/dashboard/facilities/${facility.id}`}
                                            className="block hover:bg-muted/50 rounded-lg transition-colors"
                                        >
                                            <CardHeader>
                                                <CardTitle>{facility.name}</CardTitle>
                                                {facility.description && (
                                                    <CardDescription>{facility.description}</CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Euro className="h-4 w-4" />
                                                        <span>€{facility.price.toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Building className="h-4 w-4" />
                                                        <span>{t(`facilityType.${facility.type.toLowerCase()}`)}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Link>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Location Dialog */}
            <LocationEditDialog
                location={locationWithFacilities}
                open={isEditLocationOpen}
                onOpenChange={setIsEditLocationOpen}
                onLocationUpdated={() => {}}
            />

            {/* Delete Location Dialog */}
            <LocationDeleteDialog
                location={locationWithFacilities}
                open={isDeleteLocationOpen}
                onOpenChange={setIsDeleteLocationOpen}
            />
        </div>
    );
} 
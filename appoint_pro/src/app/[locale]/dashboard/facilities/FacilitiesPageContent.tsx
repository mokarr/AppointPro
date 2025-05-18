'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Facility, Location } from "@prisma/client";
import { AddFacilityDialog } from "@/components/dashboard/facilities/AddFacilityDialog";

type LocationWithFacilities = Location & {
    facilities: Facility[];
}

interface FacilitiesPageContentProps {
    initialLocations: LocationWithFacilities[];
}

export function FacilitiesPageContent({ initialLocations }: FacilitiesPageContentProps) {
    const t = useTranslations('dashboard');
    const [locations, setLocations] = useState<LocationWithFacilities[]>(initialLocations);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

    useEffect(() => {
        if (initialLocations.length > 0) {
            setSelectedLocationId(initialLocations[0].id);
        }
    }, [initialLocations]);

    const filteredLocations = locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleFacilityAdded = (locationId: string, newFacility: Facility) => {
        setLocations(prevLocations =>
            prevLocations.map(location =>
                location.id === locationId
                    ? {
                        ...location,
                        facilities: [...(location.facilities || []), newFacility],
                    }
                    : location
            )
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('facilities.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('facilities.description')}
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <Input
                        placeholder={t('facilities.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                    />
                </div>

                <Tabs value={selectedLocationId || undefined} onValueChange={setSelectedLocationId}>
                    <TabsList className="w-full justify-start">
                        {filteredLocations.map((location) => (
                            <TabsTrigger
                                key={location.id}
                                value={location.id}
                                className="flex items-center gap-2"
                            >
                                <Building className="h-4 w-4" />
                                {location.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {filteredLocations.map((location) => (
                        <TabsContent key={location.id} value={location.id}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">{location.name}</h2>
                                <AddFacilityDialog 
                                    locationId={location.id}
                                    onFacilityAdded={(newFacility) => handleFacilityAdded(location.id, newFacility)}
                                />
                            </div>

                            {(!location.facilities || location.facilities.length === 0) ? (
                                <div className="text-center py-12 bg-muted/50 rounded-lg">
                                    <p className="text-lg text-muted-foreground mb-4">
                                        {t('facilities.noFacilitiesInLocation', { location: location.name })}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {location.facilities.map((facility) => (
                                        <Link 
                                            key={facility.id} 
                                            href={`/dashboard/facilities/${facility.id}`}
                                            className="block transition-colors hover:bg-muted/50"
                                        >
                                            <Card className="h-full">
                                                <CardHeader>
                                                    <CardTitle>{facility.name}</CardTitle>
                                                    <CardDescription>{facility.type}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground">
                                                        {facility.description}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

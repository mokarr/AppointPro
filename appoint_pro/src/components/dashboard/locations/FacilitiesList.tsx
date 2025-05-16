'use client';

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Clock, Users, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Facility = {
    id: string;
    name: string;
    description?: string;
    capacity?: number;
    duration?: number;
    locationId: string;
}

export function FacilitiesList({ locationId }: { locationId: string }) {
    const t = useTranslations('dashboard.facilities');
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const response = await fetch(`/api/locations/${locationId}/facilities`);
                if (!response.ok) throw new Error('Failed to fetch facilities');
                
                const facilitiesData = await response.json();
                setFacilities(facilitiesData);
            } catch (error) {
                console.error('Error fetching facilities:', error);
                toast.error(t('error.fetch'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchFacilities();
    }, [locationId, t]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">{t('loading')}</span>
            </div>
        );
    }

    if (facilities.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">{t('noFacilities')}</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href={`/dashboard/locations/${locationId}/facilities/new`}>
                        {t('createFirstFacility')}
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {facilities.map((facility) => (
                <Card key={facility.id} className="hover:bg-muted/50 transition-colors">
                    <Link href={`/dashboard/locations/${locationId}/facilities/${facility.id}`}>
                        <CardHeader>
                            <CardTitle>{facility.name}</CardTitle>
                            {facility.description && (
                                <CardDescription>{facility.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {facility.capacity && (
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{facility.capacity} {t('capacity')}</span>
                                    </div>
                                )}
                                {facility.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{facility.duration} {t('minutes')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            ))}
        </div>
    );
} 
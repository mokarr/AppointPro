'use client';

import { LocationsList } from "@/components/dashboard/locations/LocationsList"
import { useTranslations } from "next-intl";
export function LocationsPageContent() {
    const t = useTranslations('common');

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {t('dashboard.locations.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {t('dashboard.locations.description')}
                    </p>
                </div>
                <LocationsList />
            </div>
        </div>
    );
} 
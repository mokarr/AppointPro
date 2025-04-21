'use client';

import { LocationsList } from "@/components/dashboard/locations/LocationsList"
import { useLanguage } from "@/contexts/LanguageContext";

export function LocationsPageContent() {
    const { getTranslation } = useLanguage();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {getTranslation('dashboard.locations.title')}
                    </h1>
                    <p className="text-muted-foreground">
                        {getTranslation('dashboard.locations.description')}
                    </p>
                </div>
                <LocationsList />
            </div>
        </div>
    );
} 
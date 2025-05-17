'use client';
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { User } from "next-auth";
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { BusinessHoursSection } from '@/app/[locale]/dashboard/settings/components/business-hours-section';
import { SaveButton } from '@/app/[locale]/dashboard/settings/components/save-button';

interface Location {
    id: string;
    name: string;
    address: string;
    postalCode?: string;
    country?: string;
}

interface LocationSettingsContentProps {
    _user: User;
    _location: Location;
}

interface LocationSettings {
    openingHours: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;
}

const defaultSettings: LocationSettings = {
    openingHours: [
        { day: 'Maandag', open: '', close: '', isClosed: false },
        { day: 'Dinsdag', open: '', close: '', isClosed: false },
        { day: 'Woensdag', open: '', close: '', isClosed: false },
        { day: 'Donderdag', open: '', close: '', isClosed: false },
        { day: 'Vrijdag', open: '', close: '', isClosed: false },
        { day: 'Zaterdag', open: '', close: '', isClosed: false },
        { day: 'Zondag', open: '', close: '', isClosed: false },
    ]
};

export default function LocationSettingsContent({ _user, _location }: LocationSettingsContentProps) {
    const t = useTranslations('common');
    const [settings, setSettings] = useState<LocationSettings>(defaultSettings);
    const [originalSettings, setOriginalSettings] = useState<LocationSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notFilled, setNotFilled] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`/api/location/${_location.id}/settings`);
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            const settingsData = data.data as LocationSettings;
            setSettings(settingsData);
            setOriginalSettings(settingsData);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpeningHoursChange = (index: number, field: 'open' | 'close' | 'isClosed', value: string | boolean) => {
        setSettings(prev => {
            const updatedHours = prev.openingHours.map((hour, i) => {
                if (i === index) {
                    if (field === 'isClosed') {
                        return { 
                            ...hour, 
                            isClosed: value as boolean,
                            open: value ? '' : hour.open,
                            close: value ? '' : hour.close
                        };
                    }
                    return { ...hour, [field]: value };
                }
                return { ...hour };
            });
            return {
                ...prev,
                openingHours: updatedHours
            };
        });
    };

    const checkForChanges = () => {
        if (notFilled) {
            setHasChanges(false);
            window.removeEventListener('beforeunload', window.beforeUnloadHandler);
            return;
        }

        const hasChangesValue = JSON.stringify(settings.openingHours) !== JSON.stringify(originalSettings.openingHours);
        setHasChanges(hasChangesValue);

        if (hasChangesValue) {
            window.addEventListener('beforeunload', window.beforeUnloadHandler);
        } else {
            window.removeEventListener('beforeunload', window.beforeUnloadHandler);
        }
    };

    useEffect(() => {
        checkForChanges();
    }, [settings, notFilled]);

    const saveSettings = async () => {
        try {
            const payload = {
                openingHours: settings.openingHours
            };

            const response = await fetch(`/api/location/${_location.id}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            const updatedSettings = await response.json();
            setSettings(updatedSettings.data);
            setOriginalSettings(updatedSettings.data);
            setHasChanges(false);
            toast.success("Settings saved successfully");
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error("Failed to save settings");
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <DashboardLayout>
            <DashboardHeader
                heading={t('location.settings')}
                description={t('header.location.settings.description')}
            />

            <DashboardContent>
                <div className="space-y-8 w-full max-w-3xl mx-auto">
                    <BusinessHoursSection
                        settings={{ ...settings, branding: { primaryColor: '', secondaryColor: '', logo: null } }}
                        onOpeningHoursChange={handleOpeningHoursChange}
                        onNotFilledChange={setNotFilled}
                    />
                </div>

                {hasChanges && <SaveButton onSave={saveSettings} />}
            </DashboardContent>
        </DashboardLayout>
    );
} 
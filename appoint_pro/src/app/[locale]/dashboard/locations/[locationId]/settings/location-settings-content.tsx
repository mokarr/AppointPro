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
import { Location } from "@prisma/client";
import LocationSettings from "@/models/Settings/SettingModels/LocationSettings";
import LocationWithSettings from "@/models/Settings/LocationWithSettings";
interface LocationSettingsContentProps {
    _user: User;
    _location: LocationWithSettings;
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
    const [settings, setSettings] = useState<LocationSettings>(_location.LocationSettings?.data || defaultSettings);
    const [originalSettings, setOriginalSettings] = useState<LocationSettings>(_location.LocationSettings?.data || defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [notFilled, setNotFilled] = useState(false);

    useEffect(() => {
        setSettingsFromLocation();
    }, []);

    useEffect(() => {
        checkForChanges();
    }, [settings, notFilled]);

    const setSettingsFromLocation = async () => {
            setSettings(_location.LocationSettings?.data || defaultSettings);
            setOriginalSettings(_location.LocationSettings?.data || defaultSettings);
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
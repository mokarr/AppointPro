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
import { SaveButton } from '@/app/[locale]/dashboard/settings/components/save-button';
import { FacilityType } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Facility {
    id: string;
    name: string;
    description: string;
    type: FacilityType;
    locationId: string;
}

interface FacilitySettingsContentProps {
    _user: User;
    _facility: Facility;
}

interface FacilitySettings {
    type: FacilityType;
}

const defaultSettings: FacilitySettings = {
    type: FacilityType.PRIVATE
};

export default function FacilitySettingsContent({ _user, _facility }: FacilitySettingsContentProps) {
    const t = useTranslations('common');
    const [settings, setSettings] = useState<FacilitySettings>(defaultSettings);
    const [originalSettings, setOriginalSettings] = useState<FacilitySettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch(`/api/facility/${_facility.id}/settings`);
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            const settingsData = data.data as FacilitySettings;
            setSettings(settingsData);
            setOriginalSettings(settingsData);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error("Failed to load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeChange = (value: FacilityType) => {
        setSettings(prev => ({
            ...prev,
            type: value
        }));
    };

    const checkForChanges = () => {
        const hasChangesValue = settings.type !== originalSettings.type;
        setHasChanges(hasChangesValue);

        if (hasChangesValue) {
            window.addEventListener('beforeunload', window.beforeUnloadHandler);
        } else {
            window.removeEventListener('beforeunload', window.beforeUnloadHandler);
        }
    };

    useEffect(() => {
        checkForChanges();
    }, [settings]);

    const saveSettings = async () => {
        try {
            const payload = {
                type: settings.type
            };

            const response = await fetch(`/api/facility/${_facility.id}/settings`, {
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
                heading={t('facility.settings')}
                description={t('header.facility.settings.description')}
            />

            <DashboardContent>
                <div className="space-y-8 w-full max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Facility Type</CardTitle>
                            <CardDescription>
                                Set the type of this facility
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={settings.type}
                                onValueChange={(value) => handleTypeChange(value as FacilityType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select facility type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={FacilityType.PRIVATE}>Private</SelectItem>
                                    <SelectItem value={FacilityType.PUBLIC}>Public</SelectItem>
                                    <SelectItem value={FacilityType.CLASSES}>Classes</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                {hasChanges && <SaveButton onSave={saveSettings} />}
            </DashboardContent>
        </DashboardLayout>
    );
} 
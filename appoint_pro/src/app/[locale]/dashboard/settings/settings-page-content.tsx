'use client';
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { useTranslations } from "next-intl";
import { useState, useEffect } from 'react';
import { OrganizationSettings, SettingsPayload } from '@/types/settings';
import { toast } from "sonner"
import { BrandingSection } from './components/branding-section';
import { BusinessHoursSection } from './components/business-hours-section';
import { SaveButton } from './components/save-button';

declare global {
    interface Window {
        beforeUnloadHandler: (event: BeforeUnloadEvent) => void;
    }
}

interface Organization {
    id: string;
    name: string;
}

interface SettingsPageContentProps {
    _user: User;
    _organization: Organization;
}

const defaultSettings: OrganizationSettings = {
    branding: {
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        logo: null
    },
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

export default function SettingsPageContent({ _user, _organization }: SettingsPageContentProps) {
    const t = useTranslations('common');
    const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings);
    const [originalSettings, setOriginalSettings] = useState<OrganizationSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [notFilled, setNotFilled] = useState(false);

  
    useEffect(() => {
        fetchSettings();

      
        // this must be done to be able to remove the beforeunload handler
        window.beforeUnloadHandler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = 'Je hebt nog niet-opgeslagen wijzigingen in de openingstijden. Weet je zeker dat je de pagina wilt verlaten?';
            return event.returnValue;
        };
    }, []);



    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/organization/settings');
            if (!response.ok) {
                throw new Error('Failed to fetch settings');
            }
            const data = await response.json();
            const settingsData = data.data as OrganizationSettings;
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
                        // If marking as closed, clear the times
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

    const handleBrandingChange = (field: keyof OrganizationSettings['branding'], value: any) => {
        console.log('handleBrandingChange', field, value);
        setSettings(prev => ({
            ...prev,
            branding: {
                ...prev.branding,
                [field]: value
            }
        }));
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result as string;
                handleBrandingChange('logo', {
                    base64Data,
                    originalName: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogoDelete = async () => {
        if (settings.branding.logo && 'filename' in settings.branding.logo) {
            try {
                const response = await fetch('/api/logo', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: settings.branding.logo.filename,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete logo');
                }

                handleBrandingChange('logo', null);
            } catch (error) {
                console.error('Error deleting logo:', error);
                toast.error("Failed to delete logo");
            }
        } else {
            handleBrandingChange('logo', null);
        }
    };

    const checkForChanges = () => {
        console.log('checkForChanges', notFilled);
        if (notFilled) {
            setHasChanges(false);
            window.removeEventListener('beforeunload', window.beforeUnloadHandler);
            return;
        }

        const hasChangesValue = JSON.stringify(settings.branding) !== JSON.stringify(originalSettings.branding) ||
            JSON.stringify(settings.openingHours) !== JSON.stringify(originalSettings.openingHours);

        setHasChanges(hasChangesValue);

        // Add or remove beforeunload handler based on changes
        if (hasChangesValue) {
            console.log('hasChangesValue', hasChangesValue);
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
            const payload: SettingsPayload = {};

            if (JSON.stringify(settings.branding) !== JSON.stringify(originalSettings.branding)) {
                payload.branding = {};
                if (settings.branding.primaryColor !== originalSettings.branding.primaryColor) {
                    payload.branding.primaryColor = settings.branding.primaryColor;
                }
                if (settings.branding.secondaryColor !== originalSettings.branding.secondaryColor) {
                    payload.branding.secondaryColor = settings.branding.secondaryColor;
                }
                if (JSON.stringify(settings.branding.logo) !== JSON.stringify(originalSettings.branding.logo)) {
                    if (settings.branding.logo && 'base64Data' in settings.branding.logo) {
                        payload.branding.logo = {
                            base64Data: settings.branding.logo.base64Data,
                            originalName: settings.branding.logo.originalName
                        };
                    } else if (settings.branding.logo && 'url' in settings.branding.logo) {
                        payload.branding.logo = null;
                    } else {
                        payload.branding.logo = null;
                    }
                }
            }

            if (JSON.stringify(settings.openingHours) !== JSON.stringify(originalSettings.openingHours)) {
                payload.openingHours = settings.openingHours;
            }

            const response = await fetch('/api/organization/settings', {
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
                heading={t('settings')}
                description={t('header.settings.description')}
            />

            <DashboardContent>
                <div className="space-y-8 w-full max-w-3xl mx-auto">
                    <BrandingSection
                        settings={settings}
                        onBrandingChange={handleBrandingChange}
                        onLogoUpload={handleLogoUpload}
                        onLogoDelete={handleLogoDelete}
                    />

                    <BusinessHoursSection
                        settings={settings}
                        onOpeningHoursChange={handleOpeningHoursChange}
                        onNotFilledChange={setNotFilled}
                    />
                </div>

                {hasChanges && <SaveButton onSave={saveSettings} />}
            </DashboardContent>
        </DashboardLayout>
    );
} 
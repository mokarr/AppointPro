'use client';
import {
    DashboardContent,
    DashboardHeader,
    DashboardLayout
} from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import { useTranslations } from "next-intl";
interface Organization {
    id: string;
    name: string;
}
import { useState, useEffect, useCallback } from 'react';
import { OrganizationSettings, SettingsPayload } from '@/types/settings';
import { useToast } from "@/components/ui/use-toast";

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
        { day: 'Maandag', open: '', close: '' },
        { day: 'Dinsdag', open: '', close: '' },
        { day: 'Woensdag', open: '', close: '' },
        { day: 'Donderdag', open: '', close: '' },
        { day: 'Vrijdag', open: '', close: '' },
        { day: 'Zaterdag', open: '', close: '' },
        { day: 'Zondag', open: '', close: '' },
    ]
};

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label: string;
}

const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempColor, setTempColor] = useState(value);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTempColor(e.target.value);
    }, []);

    const handleClose = useCallback(() => {
        onChange(tempColor);
        setIsOpen(false);
    }, [tempColor, onChange]);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <div className="flex items-center space-x-2">
                <div 
                    className="w-12 h-12 border rounded cursor-pointer"
                    style={{ backgroundColor: value }}
                    onClick={() => setIsOpen(true)}
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-32 p-2 border rounded text-sm"
                />
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                            <input
                                type="color"
                                value={tempColor}
                                onChange={handleChange}
                                className="w-64 h-64"
                            />
                            <div className="mt-4 flex justify-end space-x-2">
                                <Button onClick={() => setIsOpen(false)} variant="outline">
                                    Annuleren
                                </Button>
                                <Button onClick={handleClose}>
                                    Toepassen
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SettingsPageContent({ _user, _organization }: SettingsPageContentProps) {
    const t = useTranslations('common');
    const { toast } = useToast();
    const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings);
    const [originalSettings, setOriginalSettings] = useState<OrganizationSettings>(defaultSettings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
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
            toast({
                title: "Error",
                description: "Failed to load settings",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpeningHoursChange = (index: number, field: 'open' | 'close', value: string) => {
        setSettings(prev => {
            const updatedHours = [...prev.openingHours];
            updatedHours[index][field] = value;
            return {
                ...prev,
                openingHours: updatedHours
            };
        });
        checkForChanges();
    };

    const handleBrandingChange = (field: keyof typeof settings.branding, value: any) => {
        setSettings(prev => ({
            ...prev,
            branding: {
                ...prev.branding,
                [field]: value
            }
        }));
        checkForChanges();
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
                toast({
                    title: "Error",
                    description: "Failed to delete logo",
                    variant: "destructive",
                });
            }
        } else {
            handleBrandingChange('logo', null);
        }
    };

    const checkForChanges = () => {
        const hasBrandingChanges = JSON.stringify(settings.branding) !== JSON.stringify(originalSettings.branding);
        const hasOpeningHoursChanges = JSON.stringify(settings.openingHours) !== JSON.stringify(originalSettings.openingHours);
        setHasChanges(hasBrandingChanges || hasOpeningHoursChanges);
    };

    const saveSettings = async () => {
        try {
            const payload: SettingsPayload = {};

            // Only include changed branding properties
            if (JSON.stringify(settings.branding) !== JSON.stringify(originalSettings.branding)) {
                payload.branding = {};
                if (settings.branding.primaryColor !== originalSettings.branding.primaryColor) {
                    payload.branding.primaryColor = settings.branding.primaryColor;
                }
                if (settings.branding.secondaryColor !== originalSettings.branding.secondaryColor) {
                    payload.branding.secondaryColor = settings.branding.secondaryColor;
                }
                if (JSON.stringify(settings.branding.logo) !== JSON.stringify(originalSettings.branding.logo)) {
                    payload.branding.logo = settings.branding.logo;
                }
            }

            // Only include changed opening hours
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
            toast({
                title: "Success",
                description: "Settings saved successfully",
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
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
                <div className="space-y-8">
                    {/* Branding Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            Organisatie Stijl
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Kleuren
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                                    <ColorPicker
                                        value={settings.branding.primaryColor}
                                        onChange={(color) => handleBrandingChange('primaryColor', color)}
                                        label="Primaire Kleur"
                                    />
                                    <ColorPicker
                                        value={settings.branding.secondaryColor}
                                        onChange={(color) => handleBrandingChange('secondaryColor', color)}
                                        label="Secundaire Kleur"
                                    />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                    Logo
                                </h3>
                                <div className="max-w-md">
                                    <div className="flex items-center space-x-4">
                                        {settings.branding.logo ? (
                                            <div className="relative w-32 h-32">
                                                <img
                                                    src={'path' in settings.branding.logo 
                                                        ? settings.branding.logo.path 
                                                        : settings.branding.logo.base64Data}
                                                    alt="Organization logo"
                                                    className="w-full h-full object-contain border rounded"
                                                />
                                                <button
                                                    onClick={handleLogoDelete}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                                                <span className="text-gray-400">Geen logo</span>
                                            </div>
                                        )}
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                className="hidden"
                                                id="logo-upload"
                                            />
                                            <label
                                                htmlFor="logo-upload"
                                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                            >
                                                Logo Uploaden
                                            </label>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Aanbevolen formaat: 200x200px
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                            Openingstijden
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <div className="grid grid-cols-1 gap-2 max-w-md">
                                    {settings.openingHours.map((hour, index) => (
                                        <div key={index} className="flex items-center space-x-4 p-2 border-b last:border-b-0">
                                            <span className="w-24 text-gray-600 dark:text-gray-400">
                                                {hour.day}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="time"
                                                    value={hour.open}
                                                    onChange={(e) => handleOpeningHoursChange(index, 'open', e.target.value)}
                                                    className="w-24 p-1 border rounded text-sm"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input
                                                    type="time"
                                                    value={hour.close}
                                                    onChange={(e) => handleOpeningHoursChange(index, 'close', e.target.value)}
                                                    className="w-24 p-1 border rounded text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Save Button */}
                {hasChanges && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 shadow-lg">
                        <div className="max-w-7xl mx-auto flex justify-end">
                            <Button 
                                onClick={saveSettings}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                            >
                                Opslaan
                            </Button>
                        </div>
                    </div>
                )}
            </DashboardContent>
        </DashboardLayout>
    );
} 
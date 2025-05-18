'use client';

import { ColorPicker } from './color-picker';
import OrganizationSettings from '@/models/Settings/SettingModels/OrganizationSettings';

interface BrandingSectionProps {
    settings: OrganizationSettings;
    onBrandingChange: (field: keyof OrganizationSettings['branding'], value: any) => void;
    onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onLogoDelete: () => void;
}

export const BrandingSection = ({
    settings,
    onBrandingChange,
    onLogoUpload,
    onLogoDelete
}: BrandingSectionProps) => {
    return (
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
                            onChange={(color) => onBrandingChange('primaryColor', color)}
                            label="Primaire Kleur"
                        />
                        <ColorPicker
                            value={settings.branding.secondaryColor}
                            onChange={(color) => onBrandingChange('secondaryColor', color)}
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
                                        src={settings.branding.logo && 'url' in settings.branding.logo 
                                            ? settings.branding.logo.url 
                                            : settings.branding.logo && 'base64Data' in settings.branding.logo 
                                                ? settings.branding.logo.base64Data 
                                                : ''}
                                        alt="Organization logo"
                                        className="w-full h-full object-contain border rounded"
                                    />
                                    <button
                                        onClick={onLogoDelete}
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
                                    onChange={onLogoUpload}
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
    );
}; 
export interface BrandingSettings {
    primaryColor: string;
    secondaryColor: string;
    logo: {
        path: string;
        filename: string;
    } | {
        base64Data: string;
        originalName: string;
    } | null;
}

export interface OpeningHours {
    day: string;
    open: string;
    close: string;
}

export interface OrganizationSettings {
    branding: BrandingSettings;
    openingHours: OpeningHours[];
}

export interface SettingsPayload {
    branding?: Partial<BrandingSettings>;
    openingHours?: OpeningHours[];
}

export interface SettingsResponse {
    id: string;
    type: 'ORGANIZATION' | 'LOCATION' | 'FACILITY';
    data: OrganizationSettings;
    updatedAt: Date;
    createdAt: Date;
} 
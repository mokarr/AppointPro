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
    branding: {
        primaryColor: string;
        secondaryColor: string;
        logo: {
            key: string;
            url: string;
        } |
        {
            base64Data: string;
            originalName: string;
        } | null;
    };
    openingHours: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;
}

export interface SettingsPayload {
    branding?: {
        primaryColor?: string;
        secondaryColor?: string;
        logo?: {
            base64Data: string;
            originalName: string;
        } | null;
    };
    openingHours?: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;
}

export interface SettingsResponse {
    id: string;
    type: 'ORGANIZATION' | 'LOCATION' | 'FACILITY';
    data: OrganizationSettings;
    updatedAt: Date;
    createdAt: Date;
} 
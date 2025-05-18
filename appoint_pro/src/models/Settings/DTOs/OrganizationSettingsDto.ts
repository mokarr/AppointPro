export interface OrganizationSettingsDto {
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

export default OrganizationSettingsDto;

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

export default OrganizationSettings;

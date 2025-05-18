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
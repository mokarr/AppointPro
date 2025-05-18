interface LocationSettings {
    openingHours: Array<{
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }>;
}

export default LocationSettings;

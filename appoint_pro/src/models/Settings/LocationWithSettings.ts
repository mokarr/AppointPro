import LocationSettings from "@/models/Settings/SettingModels/LocationSettings";
import { Location } from "@prisma/client";


interface LocationWithSettings extends Location {
    Settings: {
        data: LocationSettings;
    } | null;
}

export default LocationWithSettings;

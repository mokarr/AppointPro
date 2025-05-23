import LocationSettings from "@/models/Settings/SettingModels/LocationSettings";
import { Location } from "@prisma/client";


interface LocationWithSettings extends Location {
    LocationSettings: {
        data: LocationSettings;
    } | null;
}

export default LocationWithSettings;

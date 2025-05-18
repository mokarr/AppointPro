import LocationSettings from "@/models/Settings/SettingModels/LocationSettings";
import { Facility, Location } from "@prisma/client";
import FacilitySettings from "./SettingModels/FacilitySettings";


interface FacilityWithSettings extends Facility {
    Settings: {
        data: FacilitySettings;
    } | null;
}

export default FacilityWithSettings;

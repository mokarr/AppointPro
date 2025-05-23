import LocationSettings from "@/models/Settings/SettingModels/LocationSettings";
import { Facility, Location } from "@prisma/client";
import FacilitySettings from "./SettingModels/FacilitySettings";


interface FacilityWithSettings extends Facility {
    FacilitySettings: {
        data: FacilitySettings;
    } | null;
}

export default FacilityWithSettings;

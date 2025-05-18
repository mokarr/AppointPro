import { OrganizationSettings } from "@/models/Settings/SettingModels/OrganizationSettings";
import { Organization, Location } from "@prisma/client";

interface OrganizationWithSettings extends Organization {
    locations: Location[];
    Settings: {
        data: OrganizationSettings;
    } | null;
}

export default OrganizationWithSettings;

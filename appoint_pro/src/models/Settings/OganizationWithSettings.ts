import { OrganizationSettings } from "@/models/Settings/SettingModels/OrganizationSettings";
import { Organization, Location } from "@prisma/client";

interface OrganizationWithSettings extends Organization {
    locations: Location[];
    OrganizationSettings: {
        data: OrganizationSettings;
    } | null;
}

export default OrganizationWithSettings;

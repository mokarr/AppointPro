import { FacilityType } from "@prisma/client";

interface FacilitySettings {
    type: FacilityType;
    maxParticipants: number;
}

export default FacilitySettings;

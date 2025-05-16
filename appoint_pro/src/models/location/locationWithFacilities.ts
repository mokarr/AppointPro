import { FacilityType } from "@prisma/client";

export type Facility = {
    id: string;
    name: string;
    description: string;
    price: number;
    type: FacilityType;
    locationId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type LocationWithFacilities = {
    id: string;
    name: string;
    address: string;
    postalCode?: string;
    country?: string;
    facilitiesCount: number;
    facilities: Facility[];
}

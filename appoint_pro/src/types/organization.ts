export interface Location {
    id: string;
    name: string;
    address: string;
    postalCode?: string | null;
    country?: string | null;
    organizationId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OrganizationWithLocations {
    id: string;
    name: string;
    description: string;
    branche: string;
    subdomain: string | null;
    hasActiveSubscription: boolean;
    locations: Location[];
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: string | string[] | boolean | null | Location[] | Date | undefined;
} 
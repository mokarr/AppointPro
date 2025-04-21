'use server';

import { executeAction } from "../lib/executeAction";
import { prisma } from "../lib/prisma";

/**
 * Controleer of een organisatie met de gegeven naam bestaat.
 */
const checkOrganizationExists = async (organizationName: string) => {
    return executeAction({
        actionFn: async () => {
            const organization = await prisma.organization.findFirst({
                where: { name: organizationName }
            });
            if (!organization) {
                // Hier gooien we een error zodat executeAction dit opvangt en de error message teruggeeft.
                throw new Error("Organisatie bestaat niet");
            }
            return organization;
        },
        successMessage: "Organisatie bestaat",
    });
};

const getOrganizationById = async (organizationId: string) => {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });
    if (!organization) {
        throw new Error("Organisatie bestaat niet");
    }
    return organization;
}

/**
 * Find an organization by its subdomain
 */
const getOrganizationBySubdomain = async (subdomain: string) => {
    return executeAction({
        actionFn: async () => {
            // First check if the subdomain exists and organization has active subscription
            const organization = await prisma.organization.findFirst({
                where: {
                    subdomain,
                    hasActiveSubscription: true // Only find orgs with active subscription
                },
                include: {
                    locations: true,
                }
            });

            if (!organization) {
                throw new Error("No organization found with this subdomain");
            }

            return organization;
        },
        successMessage: "Organization found",
    });
};

/**
 * Generate a sanitized subdomain from organization name
 */
const generateSubdomainFromName = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, '')  // Remove special chars except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove duplicate hyphens
        .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};

/**
 * Create an organization with a subdomain automatically derived from its name
 */
const createOrganizationWithSubdomain = async (
    organizationData: { name: string; branche: string; description: string }
) => {
    return executeAction({
        actionFn: async () => {
            const { name, branche, description } = organizationData;
            const subdomain = generateSubdomainFromName(name);

            // Check if this subdomain is already in use
            const existingOrg = await prisma.organization.findFirst({
                where: { subdomain }
            });

            if (existingOrg) {
                throw new Error("An organization with a similar name already exists");
            }

            const organization = await prisma.organization.create({
                data: {
                    name,
                    branche,
                    description,
                    subdomain
                }
            });

            return organization;
        },
        successMessage: "Organization created successfully",
    });
};

/**
 * Update organization's subdomain when subscription activates
 */
const activateOrganizationSubdomain = async (organizationId: string) => {
    return executeAction({
        actionFn: async () => {
            const organization = await prisma.organization.findUnique({
                where: { id: organizationId }
            });

            if (!organization) {
                throw new Error("Organization not found");
            }

            // If the organization doesn't have a subdomain yet, create one
            if (!organization.subdomain) {
                const subdomain = generateSubdomainFromName(organization.name);

                // Check if this subdomain is already in use
                const existingOrg = await prisma.organization.findFirst({
                    where: {
                        subdomain,
                        id: { not: organizationId }
                    }
                });

                if (existingOrg) {
                    // If the subdomain is taken, add a random suffix
                    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                    const newSubdomain = `${subdomain}-${randomSuffix}`;

                    await prisma.organization.update({
                        where: { id: organizationId },
                        data: { subdomain: newSubdomain }
                    });
                } else {
                    await prisma.organization.update({
                        where: { id: organizationId },
                        data: { subdomain }
                    });
                }
            }

            return { success: true };
        },
        successMessage: "Organization subdomain activated",
    });
};

export {
    checkOrganizationExists,
    getOrganizationById,
    getOrganizationBySubdomain,
    createOrganizationWithSubdomain,
    generateSubdomainFromName,
    activateOrganizationSubdomain
};

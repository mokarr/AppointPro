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



export { checkOrganizationExists, getOrganizationById };

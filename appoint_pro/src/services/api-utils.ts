'use server';

import { prisma } from "@/lib/prisma";

// Safe API functions that can be called from client components
// These shouldn't expose db directly but wrap specific data access

/**
 * Get organization name for a given organization ID
 */
export async function getOrganizationName(organizationId: string): Promise<string | null> {
    try {
        const organization = await prisma.organization.findUnique({
            where: {
                id: organizationId
            },
            select: {
                name: true
            }
        });

        return organization?.name || null;
    } catch (error) {
        console.error('Error fetching organization name:', error);
        return null;
    }
}

/**
 * Get upcoming appointments for a user/organization
 */
export async function getUpcomingAppointments(organizationId: string, limit = 5) {
    try {
        const appointments = await prisma.booking.findMany({
            where: {
                facility: {
                    location: {
                        organizationId
                    }
                },
                startTime: {
                    gte: new Date()
                }
            },
            orderBy: {
                startTime: 'asc'
            },
            take: limit,
            include: {
                location: true,
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        return { success: true, data: appointments };
    } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        return { success: false, error: 'Failed to fetch appointments' };
    }
}

/**
 * Get statistics for organization dashboard
 */
export async function getDashboardStats() {
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    try {
        // These would be real queries in a complete implementation
        // For now we return static data
        return {
            success: true,
            data: {
                appointmentsToday: 3,
                appointmentsThisWeek: 12,
                activeClients: 42,
                openQuotes: 3240
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: 'Failed to fetch dashboard statistics' };
    }
} 
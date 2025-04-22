import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server";
import { logger } from "@/utils/logger";
import { requireRole } from "@/middlewares/role-auth";
import { z } from "zod";

// Validation schema for query parameters with proper return types
const querySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10).transform(val => Math.min(val, 100)),
    search: z.string().optional(),
    role: z.string().optional(),
    sort: z.enum(["name", "email", "role", "createdAt"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

type QueryParams = z.infer<typeof querySchema>;

/**
 * GET /api/admin/users - List all users with pagination, filtering, and sorting
 */
async function listUsersHandler(request: NextRequest) {
    try {
        // Parse and validate query parameters
        const { searchParams } = request.nextUrl;
        const queryParams = Object.fromEntries(searchParams.entries());

        const { page, limit, search, role, sort, order }: QueryParams = querySchema.parse(queryParams);

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Build filter conditions
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } }
            ];
        }

        if (role) {
            where.role = role;
        }

        // Count total users matching the filter
        const totalCount = await db.user.count({ where });

        // Query users with pagination, filtering, and sorting
        const users = await db.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
                organizationId: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { [sort]: order } as any,
            skip,
            take: limit
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        // Log admin user list access
        logger.info("Admin accessed user list", {
            page,
            limit,
            totalUsers: totalCount,
            filters: { search, role },
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        // Return users list with pagination metadata
        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    totalUsers: totalCount,
                    totalPages,
                    hasNextPage,
                    hasPrevPage
                }
            }
        }, { status: 200 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                message: "Invalid query parameters",
                errors: error.errors
            }, { status: 400 });
        }

        logger.error("Error listing users", {
            error: error instanceof Error ? error.message : String(error),
            ip: request.headers.get("x-forwarded-for") || "unknown"
        });

        return NextResponse.json({
            success: false,
            message: "Error listing users"
        }, { status: 500 });
    }
}

// Apply admin role middleware and handle the GET request
export const GET = (request: NextRequest) =>
    requireRole("ADMIN")(request, () => listUsersHandler(request)); 
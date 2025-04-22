/**
 * Base Controller
 * 
 * This module provides a base controller class with common CRUD operations
 * that can be extended by specific resource controllers.
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/utils/logger";

export interface BaseControllerOptions {
    resourceName: string;
    modelName?: string;
}

export class BaseController {
    protected resourceName: string;
    protected modelName: string;

    constructor(options: BaseControllerOptions) {
        this.resourceName = options.resourceName;
        this.modelName = options.modelName || options.resourceName;
    }

    /**
     * Get all resources
     */
    async getAll(request: NextRequest): Promise<NextResponse> {
        try {
            // Implement pagination logic here
            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get("page") || "1", 10);
            const limit = parseInt(url.searchParams.get("limit") || "10", 10);

            // Example response (to be implemented with actual db logic)
            return NextResponse.json({
                success: true,
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    pages: 0
                }
            });
        } catch (error) {
            logger.error(`Error getting ${this.resourceName} list`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return NextResponse.json({
                success: false,
                message: `Failed to retrieve ${this.resourceName} list`
            }, { status: 500 });
        }
    }

    /**
     * Get a single resource by ID
     */
    async getById(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Example response (to be implemented with actual db logic)
            return NextResponse.json({
                success: true,
                data: { id }
            });
        } catch (error) {
            logger.error(`Error getting ${this.resourceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return NextResponse.json({
                success: false,
                message: `Failed to retrieve ${this.resourceName}`
            }, { status: 500 });
        }
    }

    /**
     * Create a new resource
     */
    async create(request: NextRequest): Promise<NextResponse> {
        try {
            const data = await request.json();

            // Example response (to be implemented with actual db logic)
            return NextResponse.json({
                success: true,
                message: `${this.resourceName} created successfully`,
                data: { id: "new-id", ...data }
            }, { status: 201 });
        } catch (error) {
            logger.error(`Error creating ${this.resourceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return NextResponse.json({
                success: false,
                message: `Failed to create ${this.resourceName}`
            }, { status: 500 });
        }
    }

    /**
     * Update an existing resource
     */
    async update(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;
            const data = await request.json();

            // Example response (to be implemented with actual db logic)
            return NextResponse.json({
                success: true,
                message: `${this.resourceName} updated successfully`,
                data: { id, ...data }
            });
        } catch (error) {
            logger.error(`Error updating ${this.resourceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return NextResponse.json({
                success: false,
                message: `Failed to update ${this.resourceName}`
            }, { status: 500 });
        }
    }

    /**
     * Delete a resource
     */
    async delete(request: NextRequest, params: { id: string }): Promise<NextResponse> {
        try {
            const { id } = params;

            // Example response (to be implemented with actual db logic)
            return NextResponse.json({
                success: true,
                message: `${this.resourceName} deleted successfully`
            });
        } catch (error) {
            logger.error(`Error deleting ${this.resourceName}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            return NextResponse.json({
                success: false,
                message: `Failed to delete ${this.resourceName}`
            }, { status: 500 });
        }
    }
} 
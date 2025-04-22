/**
 * API Validation Utilities
 * 
 * This module provides validation utilities for API requests using Zod.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";
import { validationErrorResponse } from "./response";

/**
 * Format Zod validation errors into a standardized structure
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    for (const issue of error.errors) {
        const path = issue.path.join('.');
        const key = path || 'general';

        if (!errors[key]) {
            errors[key] = [];
        }

        errors[key].push(issue.message);
    }

    return errors;
}

/**
 * Validate request body against a schema
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
    try {
        const body = await request.json();
        const data = schema.parse(body);

        return { success: true, data };
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = formatZodErrors(error);
            return {
                success: false,
                response: validationErrorResponse(formattedErrors)
            };
        }

        return {
            success: false,
            response: validationErrorResponse({
                general: ['Invalid request body']
            })
        };
    }
}

/**
 * Validate request query parameters against a schema
 */
export function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
    try {
        const url = new URL(request.url);
        const queryObj: Record<string, string> = {};

        // Convert URLSearchParams to plain object
        url.searchParams.forEach((value, key) => {
            queryObj[key] = value;
        });

        const data = schema.parse(queryObj);

        return { success: true, data };
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors = formatZodErrors(error);
            return {
                success: false,
                response: validationErrorResponse(formattedErrors)
            };
        }

        return {
            success: false,
            response: validationErrorResponse({
                general: ['Invalid query parameters']
            })
        };
    }
}

/**
 * Higher-order function to validate a request against a schema
 */
export function withValidation<T, U = unknown>(
    schema: ZodSchema<T>,
    handler: (data: T, request: NextRequest) => Promise<NextResponse>,
    options: { type: 'body' | 'query' } = { type: 'body' }
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const validationResult = options.type === 'body'
            ? await validateBody(request, schema)
            : validateQuery(request, schema);

        if (!validationResult.success) {
            return validationResult.response;
        }

        return handler(validationResult.data, request);
    };
} 
/**
 * API Response Utilities
 * 
 * This module provides standardized response formatting for API endpoints.
 */

import { NextResponse } from "next/server";

export interface ApiResponseOptions {
    status?: number;
    headers?: Record<string, string>;
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface ApiSuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
    pagination?: PaginationData;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]> | string[];
    code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a successful API response
 */
export function successResponse<T = any>(
    data: T,
    message?: string,
    pagination?: PaginationData,
    options: ApiResponseOptions = {}
): NextResponse<ApiSuccessResponse<T>> {
    const { status = 200, headers = {} } = options;

    const response: ApiSuccessResponse<T> = {
        success: true,
        data
    };

    if (message) {
        response.message = message;
    }

    if (pagination) {
        response.pagination = pagination;
    }

    return NextResponse.json(response, { status, headers });
}

/**
 * Create an error API response
 */
export function errorResponse(
    message: string,
    errors?: Record<string, string[]> | string[],
    options: ApiResponseOptions & { code?: string } = {}
): NextResponse<ApiErrorResponse> {
    const { status = 400, headers = {}, code } = options;

    const response: ApiErrorResponse = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    if (code) {
        response.code = code;
    }

    return NextResponse.json(response, { status, headers });
}

/**
 * Create a not found error response
 */
export function notFoundResponse(resource: string): NextResponse<ApiErrorResponse> {
    return errorResponse(
        `The requested ${resource} was not found`,
        undefined,
        { status: 404, code: 'RESOURCE_NOT_FOUND' }
    );
}

/**
 * Create an unauthorized error response
 */
export function unauthorizedResponse(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return errorResponse(
        message,
        undefined,
        { status: 401, code: 'UNAUTHORIZED' }
    );
}

/**
 * Create a forbidden error response
 */
export function forbiddenResponse(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return errorResponse(
        message,
        undefined,
        { status: 403, code: 'FORBIDDEN' }
    );
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
    errors: Record<string, string[]>
): NextResponse<ApiErrorResponse> {
    return errorResponse(
        'Validation error',
        errors,
        { status: 422, code: 'VALIDATION_FAILED' }
    );
}

/**
 * Create a server error response
 */
export function serverErrorResponse(
    message = 'Internal server error'
): NextResponse<ApiErrorResponse> {
    return errorResponse(
        message,
        undefined,
        { status: 500, code: 'SERVER_ERROR' }
    );
} 
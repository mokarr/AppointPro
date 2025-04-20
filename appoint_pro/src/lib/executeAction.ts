'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";

type ActionResponse<T = any> = {
    success: boolean;
    message: string;
    data?: T;
}

export const executeAction = async <T>({
    actionFn,
    successMessage,
}: {
    actionFn: () => Promise<T>;
    successMessage: string;
}): Promise<ActionResponse<T>> => {
    try {
        const data = await actionFn();
        return {
            success: true,
            message: successMessage,
            data,
        };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        console.error("Action failed:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Er is een fout opgetreden",
        };
    }
};
import { object, string } from "zod"
import { passwordSchema } from "@/utils/password-validator"

export const signInSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(100, "Password must be less than 100 characters"),
})

export const signUpSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: passwordSchema,
    name: string({ required_error: "Name is required" })
        .min(1, "Name is required"),
    branche: string({ required_error: "Branche is required" })
        .min(1, "Branche is required"),
    address: string({ required_error: "Address is required" })
        .min(1, "Address is required"),
    postalcode: string({ required_error: "Postalcode is required" })
        .min(1, "Postalcode is required"),
    country: string({ required_error: "Country is required" })
        .min(1, "Country is required"),
})

// Schema for changing password
export const changePasswordSchema = object({
    currentPassword: string({ required_error: "Current password is required" })
        .min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: string({ required_error: "Confirm password is required" })
        .min(1, "Confirm password is required"),
}).refine(
    (data) => data.newPassword === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
)

// Schema for requesting password reset
export const requestPasswordResetSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
})

// Schema for confirming password reset
export const confirmPasswordResetSchema = object({
    token: string({ required_error: "Token is required" })
        .min(1, "Token is required"),
    password: passwordSchema,
    confirmPassword: string({ required_error: "Confirm password is required" })
        .min(1, "Confirm password is required"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
)
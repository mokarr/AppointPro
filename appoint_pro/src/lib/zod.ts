import { object, string } from "zod"

export const signInSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
})

export const signUpSchema = object({
    email: string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
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
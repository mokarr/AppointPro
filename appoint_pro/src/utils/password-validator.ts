/**
 * Password Validation Service
 * 
 * This module provides comprehensive password validation rules to ensure
 * password security and compliance with best practices.
 */

// Import zod for schema validation
import { z } from 'zod';

// Password strength levels
export enum PasswordStrength {
    WEAK = 'weak',
    MODERATE = 'moderate',
    STRONG = 'strong',
    VERY_STRONG = 'very_strong'
}

// Password validation schema with specific error messages
export const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password is too long, maximum 100 characters allowed")
    .refine(
        (password) => /[A-Z]/.test(password),
        "Password must contain at least one uppercase letter"
    )
    .refine(
        (password) => /[a-z]/.test(password),
        "Password must contain at least one lowercase letter"
    )
    .refine(
        (password) => /[0-9]/.test(password),
        "Password must contain at least one number"
    )
    .refine(
        (password) => /[^A-Za-z0-9]/.test(password),
        "Password must contain at least one special character"
    );

/**
 * Validates a password against the validation schema
 * 
 * @param password The password to validate
 * @returns An object with validation result and any error messages
 */
export function validatePassword(password: string): {
    isValid: boolean;
    errors: string[]
} {
    try {
        passwordSchema.parse(password);
        return { isValid: true, errors: [] };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                isValid: false,
                errors: error.errors.map(e => e.message)
            };
        }
        return {
            isValid: false,
            errors: ['An unexpected error occurred during password validation']
        };
    }
}

/**
 * Calculates the strength of a password
 * 
 * @param password The password to evaluate
 * @returns The password strength level
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
    // Start with a base score
    let score = 0;

    // Length check (0-4 points)
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 14) score += 1;

    // Character variety checks
    if (/[A-Z]/.test(password)) score += 1; // Uppercase
    if (/[a-z]/.test(password)) score += 1; // Lowercase
    if (/[0-9]/.test(password)) score += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Special characters

    // Variety checks
    const hasUpperAndLower = /[A-Z]/.test(password) && /[a-z]/.test(password);
    const hasLetterAndNumber = /[A-Za-z]/.test(password) && /[0-9]/.test(password);
    const hasLetterNumberSpecial = hasLetterAndNumber && /[^A-Za-z0-9]/.test(password);

    if (hasUpperAndLower) score += 1;
    if (hasLetterAndNumber) score += 1;
    if (hasLetterNumberSpecial) score += 1;

    // Determine strength based on score
    if (score < 5) return PasswordStrength.WEAK;
    if (score < 8) return PasswordStrength.MODERATE;
    if (score < 11) return PasswordStrength.STRONG;
    return PasswordStrength.VERY_STRONG;
}

/**
 * Checks if a password has been compromised in known data breaches
 * This is a placeholder for integration with services like "Have I Been Pwned"
 * 
 * @param password The password to check
 * @returns Promise resolving to true if compromised, false otherwise
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
    // In a real implementation, you would use a service like HIBP
    // For now, this is just a placeholder
    return Promise.resolve(false);
}

/**
 * Generates a secure password suggestion
 * 
 * @returns A randomly generated secure password
 */
export function generateSecurePasswordSuggestion(): string {
    // Character sets
    const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed similar-looking characters
    const lowerChars = 'abcdefghijkmnopqrstuvwxyz'; // Removed similar-looking characters
    const numbers = '23456789'; // Removed 0 and 1 (look like O and l)
    const specialChars = '!@#$%^&*()_-+=<>?';

    // Generate a random password with specific composition
    const length = 14; // Strong password length
    let password = '';

    // Ensure at least one character from each set
    password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
    password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    // Fill the rest with random characters from all sets
    const allChars = upperChars + lowerChars + numbers + specialChars;
    for (let i = 4; i < length; i++) {
        password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password characters
    password = password.split('')
        .sort(() => 0.5 - Math.random())
        .join('');

    return password;
} 
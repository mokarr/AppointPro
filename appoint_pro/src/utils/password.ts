import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10; // Recommended number of salt rounds

/**
 * Hashes a password using bcrypt with a salt derived from AUTH_SECRET.
 * @param password - The plaintext password to hash.
 * @returns The hashed password.
 */
export async function saltAndHashPassword(password: string): Promise<string> {
    if (!process.env.AUTH_SECRET) {
        throw new Error("AUTH_SECRET is not set in .env.local");
    }

    // Generate a salt using AUTH_SECRET
    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    // Hash the password using bcrypt
    return await bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password with a hashed password.
 * @param password - The plaintext password.
 * @param hash - The stored hashed password.
 * @returns `true` if the passwords match, otherwise `false`.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

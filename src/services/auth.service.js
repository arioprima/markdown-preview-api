import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import * as userRepo from "../repositories/user.repository.js";

/**
 * ===========================================
 * AUTH SERVICE
 * ===========================================
 * Business logic untuk authentication.
 * Service ini yang handle validasi, hashing password, generate JWT, dll.
 */

/**
 * Register user baru
 * 
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.username
 * @param {string} data.password
 * @returns {Promise<{user: User, token: string}>}
 */
export const register = async ({ email, username, password }) => {
    // 1. Cek email sudah dipakai?
    if (await userRepo.emailExists(email)) {
        const error = new Error("Email sudah dipakai");
        error.statusCode = 400;
        throw error;
    }

    // 2. Cek username sudah dipakai?
    if (await userRepo.usernameExists(username)) {
        const error = new Error("Username sudah dipakai");
        error.statusCode = 400;
        throw error;
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await userRepo.create({
        email,
        username,
        password: hashedPassword
    });

    // 5. Generate JWT token
    const token = generateToken(user.id);

    // 6. Return user tanpa password
    return {
        user: excludePassword(user),
        token
    };
};

/**
 * Login user
 * 
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {Promise<{user: User, token: string}>}
 */
export const login = async ({ email, password }) => {
    // 1. Cari user by email
    const user = await userRepo.findByEmail(email);
    if (!user) {
        const error = new Error("Email atau password salah");
        error.statusCode = 401;
        throw error;
    }

    // 2. Bandingkan password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        const error = new Error("Email atau password salah");
        error.statusCode = 401;
        throw error;
    }

    // 3. Generate JWT token
    const token = generateToken(user.id);

    // 4. Return user tanpa password
    return {
        user: excludePassword(user),
        token
    };
};

/**
 * Get current user profile
 * 
 * @param {string} userId
 * @returns {Promise<User>}
 */
export const getProfile = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    return excludePassword(user);
};

/**
 * Update user profile
 * 
 * @param {string} userId
 * @param {object} data
 * @param {string} data.username
 * @param {string} data.email
 * @returns {Promise<User>}
 */
export const updateProfile = async (userId, { username, email }) => {
    // 1. Cek user exists
    const user = await userRepo.findById(userId);
    if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    // 2. Cek email duplikat (exclude diri sendiri)
    if (email && email !== user.email) {
        if (await userRepo.emailExists(email, userId)) {
            const error = new Error("Email sudah dipakai user lain");
            error.statusCode = 400;
            throw error;
        }
    }

    // 3. Cek username duplikat (exclude diri sendiri)
    if (username && username !== user.username) {
        if (await userRepo.usernameExists(username, userId)) {
            const error = new Error("Username sudah dipakai user lain");
            error.statusCode = 400;
            throw error;
        }
    }

    // 4. Update user
    const updatedUser = await userRepo.update(userId, {
        ...(email && { email }),
        ...(username && { username })
    });

    return excludePassword(updatedUser);
};

/**
 * Change password
 * 
 * @param {string} userId
 * @param {object} data
 * @param {string} data.currentPassword
 * @param {string} data.newPassword
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
    // 1. Get user dengan password
    const user = await userRepo.findById(userId);
    if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    // 2. Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
        const error = new Error("Password saat ini salah");
        error.statusCode = 400;
        throw error;
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    await userRepo.update(userId, { password: hashedPassword });

    return { message: "Password berhasil diubah" };
};

/**
 * Delete account (soft delete)
 * 
 * @param {string} userId
 */
export const deleteAccount = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) {
        const error = new Error("User tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    await userRepo.softDelete(userId);
    return { message: "Akun berhasil dihapus" };
};


// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
};

/**
 * Exclude password from user object
 */
const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

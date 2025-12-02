import * as authService from "../services/auth.service.js";

/**
 * ===========================================
 * AUTH CONTROLLER
 * ===========================================
 * Handle HTTP request/response untuk authentication.
 * Controller HANYA handle:
 * - Parse request (body, params, query)
 * - Call service
 * - Format response
 * - Error handling
 */

/**
 * POST /api/auth/register
 * Register user baru
 */
export const register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;

        // Validasi input
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, username, dan password wajib diisi"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password minimal 6 karakter"
            });
        }

        const result = await authService.register({ email, username, password });

        res.status(201).json({
            success: true,
            message: "Register berhasil",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * Login user
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi"
            });
        }

        const result = await authService.login({ email, password });

        res.status(200).json({
            success: true,
            message: "Login berhasil",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/profile
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId; // Dari auth middleware

        const user = await authService.getProfile(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/profile
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { username, email } = req.body;

        const user = await authService.updateProfile(userId, { username, email });

        res.status(200).json({
            success: true,
            message: "Profile berhasil diupdate",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/auth/change-password
 * Change user password
 */
export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Validasi input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Password saat ini dan password baru wajib diisi"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password baru minimal 6 karakter"
            });
        }

        const result = await authService.changePassword(userId, {
            currentPassword,
            newPassword
        });

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/auth/account
 * Delete user account (soft delete)
 */
export const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await authService.deleteAccount(userId);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

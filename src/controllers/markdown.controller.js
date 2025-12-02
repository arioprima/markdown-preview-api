import * as markdownService from "../services/markdown.service.js";

/**
 * ===========================================
 * MARKDOWN CONTROLLER
 * ===========================================
 * Handle HTTP request/response untuk Markdown Files.
 */

/**
 * GET /api/files
 * Get all files milik user dengan pagination
 */
export const getFiles = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { page, limit, orderBy, order, search } = req.query;

        let result;
        if (search) {
            result = await markdownService.searchFiles(userId, search, { page, limit });
        } else {
            result = await markdownService.getFiles(userId, { page, limit, orderBy, order });
        }

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/files/:id
 * Get single file by ID
 */
export const getFileById = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const file = await markdownService.getFileById(userId, id);

        res.status(200).json({
            success: true,
            data: file
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/files
 * Create new markdown file
 */
export const createFile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { title, content } = req.body;

        const file = await markdownService.createFile(userId, { title, content });

        res.status(201).json({
            success: true,
            message: "File berhasil dibuat",
            data: file
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/files/:id
 * Update markdown file
 */
export const updateFile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, content } = req.body;

        const file = await markdownService.updateFile(userId, id, { title, content });

        res.status(200).json({
            success: true,
            message: "File berhasil diupdate",
            data: file
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/files/:id
 * Delete markdown file (soft delete)
 */
export const deleteFile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const result = await markdownService.deleteFile(userId, id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/files/count
 * Get file count for user
 */
export const getFileCount = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await markdownService.getFileCount(userId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

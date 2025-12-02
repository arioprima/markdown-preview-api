import * as markdownRepo from "../repositories/markdown.repository.js";

/**
 * ===========================================
 * MARKDOWN SERVICE
 * ===========================================
 * Business logic untuk Markdown Files.
 */

/**
 * Get all files milik user dengan pagination
 * 
 * @param {string} userId
 * @param {object} query - { page, limit, orderBy, order }
 */
export const getFiles = async (userId, query = {}) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const orderBy = query.orderBy || 'created_at';
    const order = query.order || 'desc';

    return markdownRepo.findManyByUserId(userId, {
        page,
        limit,
        orderBy,
        order
    });
};

/**
 * Search files by title
 * 
 * @param {string} userId
 * @param {string} keyword
 * @param {object} query - { page, limit }
 */
export const searchFiles = async (userId, keyword, query = {}) => {
    if (!keyword || keyword.trim() === '') {
        return getFiles(userId, query);
    }

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    return markdownRepo.searchByTitle(userId, keyword.trim(), { page, limit });
};

/**
 * Get single file by ID
 * 
 * @param {string} userId
 * @param {string} fileId
 */
export const getFileById = async (userId, fileId) => {
    const file = await markdownRepo.findByIdAndUserId(fileId, userId);

    if (!file) {
        const error = new Error("File tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    return file;
};

/**
 * Create new markdown file
 * 
 * @param {string} userId
 * @param {object} data - { title, content }
 */
export const createFile = async (userId, { title, content }) => {
    // Validasi
    if (!title || title.trim() === '') {
        const error = new Error("Title tidak boleh kosong");
        error.statusCode = 400;
        throw error;
    }

    return markdownRepo.create({
        title: title.trim(),
        content: content || '',
        user_id: userId
    });
};

/**
 * Update markdown file
 * 
 * @param {string} userId
 * @param {string} fileId
 * @param {object} data - { title?, content? }
 */
export const updateFile = async (userId, fileId, { title, content }) => {
    // 1. Cek ownership
    const file = await markdownRepo.findByIdAndUserId(fileId, userId);
    if (!file) {
        const error = new Error("File tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    // 2. Validasi title jika ada
    if (title !== undefined && title.trim() === '') {
        const error = new Error("Title tidak boleh kosong");
        error.statusCode = 400;
        throw error;
    }

    // 3. Update
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;

    return markdownRepo.update(fileId, updateData);
};

/**
 * Delete markdown file (soft delete)
 * 
 * @param {string} userId
 * @param {string} fileId
 */
export const deleteFile = async (userId, fileId) => {
    // 1. Cek ownership
    const file = await markdownRepo.findByIdAndUserId(fileId, userId);
    if (!file) {
        const error = new Error("File tidak ditemukan");
        error.statusCode = 404;
        throw error;
    }

    // 2. Soft delete
    await markdownRepo.softDelete(fileId);

    return { message: "File berhasil dihapus" };
};

/**
 * Get file count for user
 * 
 * @param {string} userId
 */
export const getFileCount = async (userId) => {
    const count = await markdownRepo.countByUserId(userId);
    return { count };
};

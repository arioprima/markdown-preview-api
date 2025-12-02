import { prisma } from "../config/database.js";

/**
 * ===========================================
 * MARKDOWN FILE REPOSITORY
 * ===========================================
 * Layer untuk akses data MarkdownFile ke database.
 * Semua query database untuk tabel `markdown_files` ada di sini.
 */

// ============================================
// HELPER: Filter untuk soft delete
// ============================================
const notDeleted = { deleted_at: null };


// ============================================
// READ OPERATIONS
// ============================================

/**
 * Cari markdown file berdasarkan ID
 * 
 * SQL Equivalent:
 * SELECT * FROM markdown_files 
 * WHERE id = 'xxx' AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {string} id
 * @returns {Promise<MarkdownFile|null>}
 */
export const findById = async (id) => {
    return prisma.markdownFile.findFirst({
        where: { id, ...notDeleted }
    });
};

/**
 * Cari markdown file berdasarkan ID + user_id (untuk validasi ownership)
 * 
 * SQL Equivalent:
 * SELECT * FROM markdown_files 
 * WHERE id = 'xxx' AND user_id = 'yyy' AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<MarkdownFile|null>}
 */
export const findByIdAndUserId = async (id, userId) => {
    return prisma.markdownFile.findFirst({
        where: { id, user_id: userId, ...notDeleted }
    });
};

/**
 * Cari satu file dengan kondisi fleksibel
 * 
 * @param {object} where - Kondisi pencarian
 * @param {object} options
 * @param {boolean} options.includeDeleted - Sertakan yang sudah dihapus?
 * @param {boolean} options.includeUser - Sertakan data user?
 */
export const findOne = async (where, options = {}) => {
    const { includeDeleted = false, includeUser = false } = options;

    return prisma.markdownFile.findFirst({
        where: {
            ...where,
            ...(includeDeleted ? {} : notDeleted)
        },
        include: includeUser ? { user: true } : undefined
    });
};

/**
 * Ambil semua file milik user dengan pagination
 * 
 * SQL Equivalent:
 * SELECT * FROM markdown_files 
 * WHERE user_id = 'xxx' AND deleted_at IS NULL
 * ORDER BY created_at DESC
 * LIMIT 10 OFFSET 0;
 * 
 * @param {string} userId
 * @param {object} options
 * @param {number} options.page - Halaman (default: 1)
 * @param {number} options.limit - Jumlah per halaman (default: 10)
 * @param {string} options.orderBy - Field untuk sorting (default: 'created_at')
 * @param {string} options.order - 'asc' atau 'desc' (default: 'desc')
 */
export const findManyByUserId = async (userId, options = {}) => {
    const {
        page = 1,
        limit = 10,
        orderBy = 'created_at',
        order = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.markdownFile.findMany({
            where: { user_id: userId, ...notDeleted },
            orderBy: { [orderBy]: order },
            take: limit,
            skip: skip
        }),
        prisma.markdownFile.count({
            where: { user_id: userId, ...notDeleted }
        })
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Search file by title
 * 
 * SQL Equivalent:
 * SELECT * FROM markdown_files 
 * WHERE user_id = 'xxx' 
 *   AND title ILIKE '%keyword%'
 *   AND deleted_at IS NULL
 * ORDER BY created_at DESC;
 * 
 * @param {string} userId
 * @param {string} keyword
 */
export const searchByTitle = async (userId, keyword, options = {}) => {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const where = {
        user_id: userId,
        title: { contains: keyword, mode: 'insensitive' },
        ...notDeleted
    };

    const [data, total] = await Promise.all([
        prisma.markdownFile.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: limit,
            skip
        }),
        prisma.markdownFile.count({ where })
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};


// ============================================
// CREATE OPERATION
// ============================================

/**
 * Buat markdown file baru
 * 
 * SQL Equivalent:
 * INSERT INTO markdown_files (id, title, content, user_id, created_at, updated_at)
 * VALUES (uuid(), 'Title', 'Content', 'user-id', NOW(), NOW())
 * RETURNING *;
 * 
 * @param {object} data
 * @param {string} data.title
 * @param {string} data.content
 * @param {string} data.user_id
 */
export const create = async (data) => {
    return prisma.markdownFile.create({
        data: {
            title: data.title,
            content: data.content,
            user_id: data.user_id
        }
    });
};


// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update markdown file
 * 
 * SQL Equivalent:
 * UPDATE markdown_files 
 * SET title = 'New Title', content = 'New Content', updated_at = NOW()
 * WHERE id = 'xxx'
 * RETURNING *;
 * 
 * @param {string} id
 * @param {object} data - { title?, content? }
 */
export const update = async (id, data) => {
    return prisma.markdownFile.update({
        where: { id },
        data
    });
};

/**
 * Soft delete markdown file
 * 
 * SQL Equivalent:
 * UPDATE markdown_files 
 * SET deleted_at = NOW(), updated_at = NOW()
 * WHERE id = 'xxx'
 * RETURNING *;
 * 
 * @param {string} id
 */
export const softDelete = async (id) => {
    return prisma.markdownFile.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
};

/**
 * Restore markdown file yang sudah di-soft delete
 * 
 * @param {string} id
 */
export const restore = async (id) => {
    return prisma.markdownFile.update({
        where: { id },
        data: { deleted_at: null }
    });
};


// ============================================
// HARD DELETE
// ============================================

/**
 * Hapus markdown file permanen
 * 
 * ⚠️ WARNING: Data tidak bisa dikembalikan!
 * 
 * @param {string} id
 */
export const hardDelete = async (id) => {
    return prisma.markdownFile.delete({
        where: { id }
    });
};

/**
 * Hapus semua file milik user (untuk delete account)
 * 
 * @param {string} userId
 */
export const deleteAllByUserId = async (userId) => {
    return prisma.markdownFile.deleteMany({
        where: { user_id: userId }
    });
};


// ============================================
// COUNT / STATISTICS
// ============================================

/**
 * Hitung jumlah file milik user
 * 
 * @param {string} userId
 */
export const countByUserId = async (userId) => {
    return prisma.markdownFile.count({
        where: { user_id: userId, ...notDeleted }
    });
};

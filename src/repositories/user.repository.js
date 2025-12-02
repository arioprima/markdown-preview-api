import { prisma } from "../config/database.js";

/**
 * ===========================================
 * USER REPOSITORY
 * ===========================================
 * Layer untuk akses data User ke database.
 * Semua query database untuk tabel `users` ada di sini.
 * 
 * Kenapa pakai Repository Pattern?
 * 1. Separation of Concerns - pisahkan logic database dari business logic
 * 2. Reusability - query bisa dipakai ulang di banyak service
 * 3. Testability - mudah di-mock saat testing
 * 4. Maintainability - kalau ganti ORM, cukup ubah di sini
 */

// ============================================
// HELPER: Filter untuk soft delete
// ============================================
/**
 * Kondisi default: hanya ambil data yang BELUM dihapus
 * 
 * SQL Equivalent:
 * WHERE deleted_at IS NULL
 */
const notDeleted = { deleted_at: null };


// ============================================
// READ OPERATIONS
// ============================================

/**
 * Cari user berdasarkan ID
 * 
 * SQL Equivalent:
 * SELECT * FROM users 
 * WHERE id = 'xxx-xxx-xxx' 
 *   AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {string} id - UUID user
 * @returns {Promise<User|null>}
 */
export const findById = async (id) => {
    return prisma.user.findFirst({
        where: { id, ...notDeleted }
    });
};

/**
 * Cari user berdasarkan email (untuk login)
 * 
 * SQL Equivalent:
 * SELECT * FROM users 
 * WHERE email = 'john@mail.com' 
 *   AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export const findByEmail = async (email) => {
    return prisma.user.findFirst({
        where: { email, ...notDeleted }
    });
};

/**
 * Cari user berdasarkan username
 * 
 * SQL Equivalent:
 * SELECT * FROM users 
 * WHERE username = 'johndoe' 
 *   AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {string} username
 * @returns {Promise<User|null>}
 */
export const findByUsername = async (username) => {
    return prisma.user.findFirst({
        where: { username, ...notDeleted }
    });
};

/**
 * Cari satu user dengan kondisi fleksibel
 * 
 * SQL Equivalent (contoh):
 * SELECT * FROM users 
 * WHERE email = 'x@mail.com' AND username = 'john'
 *   AND deleted_at IS NULL 
 * LIMIT 1;
 * 
 * @param {object} where - Kondisi pencarian { email: 'x', username: 'y' }
 * @param {object} options - Opsi tambahan
 * @param {boolean} options.includeDeleted - Sertakan yang sudah dihapus?
 * 
 * @example
 * // Cari by email DAN username
 * await findOne({ email: "john@mail.com", username: "john" })
 * 
 * // Cari termasuk yang sudah dihapus
 * await findOne({ email: "john@mail.com" }, { includeDeleted: true })
 */
export const findOne = async (where, options = {}) => {
    const { includeDeleted = false } = options;

    return prisma.user.findFirst({
        where: {
            ...where,
            ...(includeDeleted ? {} : notDeleted)
        }
    });
};


// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Cek apakah email sudah dipakai user lain
 * 
 * Kenapa ada excludeId?
 * - Saat UPDATE profile, user boleh keep email-nya sendiri
 * - Jadi kita exclude ID user yang sedang update
 * 
 * SQL Equivalent (tanpa excludeId):
 * SELECT COUNT(*) > 0 FROM users 
 * WHERE email = 'john@mail.com' 
 *   AND deleted_at IS NULL;
 * 
 * SQL Equivalent (dengan excludeId):
 * SELECT COUNT(*) > 0 FROM users 
 * WHERE email = 'john@mail.com' 
 *   AND id != 'current-user-id'
 *   AND deleted_at IS NULL;
 * 
 * @param {string} email
 * @param {string|null} excludeId - ID yang dikecualikan (untuk update)
 * @returns {Promise<boolean>} - true jika email sudah dipakai
 * 
 * @example
 * // Register: cek email sudah ada?
 * if (await emailExists("john@mail.com")) {
 *   throw new Error("Email sudah dipakai");
 * }
 * 
 * // Update: cek email sudah ada, tapi bukan milik sendiri?
 * if (await emailExists("new@mail.com", currentUserId)) {
 *   throw new Error("Email sudah dipakai user lain");
 * }
 */
export const emailExists = async (email, excludeId = null) => {
    const user = await prisma.user.findFirst({
        where: {
            email,
            ...notDeleted,
            ...(excludeId ? { id: { not: excludeId } } : {})
        },
        select: { id: true } // Optimasi: ambil id aja, bukan semua field
    });
    return user !== null;
};

/**
 * Cek apakah username sudah dipakai user lain
 * 
 * SQL Equivalent:
 * SELECT COUNT(*) > 0 FROM users 
 * WHERE username = 'johndoe' 
 *   AND id != 'exclude-id' -- opsional
 *   AND deleted_at IS NULL;
 * 
 * @param {string} username
 * @param {string|null} excludeId
 * @returns {Promise<boolean>}
 */
export const usernameExists = async (username, excludeId = null) => {
    const user = await prisma.user.findFirst({
        where: {
            username,
            ...notDeleted,
            ...(excludeId ? { id: { not: excludeId } } : {})
        },
        select: { id: true }
    });
    return user !== null;
};


// ============================================
// CREATE OPERATION
// ============================================

/**
 * Buat user baru
 * 
 * SQL Equivalent:
 * INSERT INTO users (id, email, username, password, created_at, updated_at)
 * VALUES (uuid_generate_v4(), 'john@mail.com', 'johndoe', 'hashed_pw', NOW(), NOW())
 * RETURNING *;
 * 
 * @param {object} data
 * @param {string} data.email
 * @param {string} data.username
 * @param {string} data.password - Sudah di-hash dari service
 * @returns {Promise<User>}
 */
export const create = async (data) => {
    return prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            password: data.password,
        }
    });
};


// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Update user berdasarkan ID
 * 
 * SQL Equivalent:
 * UPDATE users 
 * SET username = 'newname', updated_at = NOW()
 * WHERE id = 'xxx-xxx-xxx'
 * RETURNING *;
 * 
 * @param {string} id
 * @param {object} data - Field yang mau diupdate
 * @returns {Promise<User>}
 * 
 * @example
 * await update("user-id", { username: "newname" })
 * await update("user-id", { email: "new@mail.com", username: "new" })
 */
export const update = async (id, data) => {
    return prisma.user.update({
        where: { id },
        data
    });
};

/**
 * Soft delete user (set deleted_at, bukan hapus beneran)
 * 
 * SQL Equivalent:
 * UPDATE users 
 * SET deleted_at = NOW(), updated_at = NOW()
 * WHERE id = 'xxx-xxx-xxx'
 * RETURNING *;
 * 
 * Kenapa soft delete?
 * - Data tidak hilang permanen
 * - Bisa di-restore kalau salah hapus
 * - Audit trail tetap ada
 * - Relasi ke tabel lain tidak rusak
 * 
 * @param {string} id
 * @returns {Promise<User>}
 */
export const softDelete = async (id) => {
    return prisma.user.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
};

/**
 * Restore user yang sudah di-soft delete
 * 
 * SQL Equivalent:
 * UPDATE users 
 * SET deleted_at = NULL, updated_at = NOW()
 * WHERE id = 'xxx-xxx-xxx'
 * RETURNING *;
 * 
 * @param {string} id
 * @returns {Promise<User>}
 */
export const restore = async (id) => {
    return prisma.user.update({
        where: { id },
        data: { deleted_at: null }
    });
};


// ============================================
// HARD DELETE (Jarang dipakai, hati-hati!)
// ============================================

/**
 * Hapus user permanen dari database
 * 
 * ⚠️ WARNING: Data tidak bisa dikembalikan!
 * Gunakan softDelete() kecuali benar-benar perlu.
 * 
 * SQL Equivalent:
 * DELETE FROM users WHERE id = 'xxx-xxx-xxx';
 * 
 * @param {string} id
 * @returns {Promise<User>}
 */
export const hardDelete = async (id) => {
    return prisma.user.delete({
        where: { id }
    });
};
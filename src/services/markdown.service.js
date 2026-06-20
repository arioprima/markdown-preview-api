import { randomBytes } from "node:crypto";
import * as markdownRepo from "../repositories/markdown.repository.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/error.util.js";

export const getFiles = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const orderBy = query.orderBy || "created_at";
  const order = query.order || "desc";
  const ungrouped = query.ungrouped || false;
  const group_id = query.group_id;

  return markdownRepo.findManyByUserId(userId, {
    page,
    limit,
    orderBy,
    order,
    ungrouped,
    group_id,
  });
};

export const searchFiles = async (userId, keyword, query = {}) => {
  if (!keyword || keyword.trim() === "") {
    return getFiles(userId, query);
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const group_id = query.group_id;
  const ungrouped = query.ungrouped || false;

  return markdownRepo.search(userId, keyword.trim(), {
    page,
    limit,
    group_id,
    ungrouped,
  });
};

export const getFileById = async (userId, fileId) => {
  const file = await markdownRepo.findById(fileId, userId);

  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  return file;
};

export const getFileByIdWithUser = async (userId, fileId) => {
  const file = await markdownRepo.findByIdWithUser(fileId, userId);

  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  return file;
};

export const getRecentFiles = async (userId, limit = 10) => {
  return markdownRepo.getRecentByUserId(userId, limit);
};

export const createFile = async (userId, { title, content, group_id }) => {
  if (!title || title.trim() === "") {
    throw BadRequestError("Title tidak boleh kosong");
  }

  const exists = await markdownRepo.existsByTitle(title.trim(), userId);
  if (exists) {
    throw ConflictError("File dengan title ini sudah ada");
  }

  return markdownRepo.create({
    title: title.trim(),
    content: content || "",
    user_id: userId,
    group_id: group_id || null,
  });
};

export const updateFile = async (
  userId,
  fileId,
  { title, content, group_id },
) => {
  const file = await markdownRepo.findById(fileId, userId);
  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  if (title !== undefined && title.trim() === "") {
    throw BadRequestError("Title tidak boleh kosong");
  }

  if (title !== undefined) {
    const exists = await markdownRepo.existsByTitle(
      title.trim(),
      userId,
      fileId,
    );
    if (exists) {
      throw ConflictError("File dengan title ini sudah ada");
    }
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (content !== undefined) updateData.content = content;
  // Handle group_id: empty string or "null" means remove from group
  if (group_id !== undefined) {
    updateData.group_id =
      group_id === "" || group_id === "null" ? null : group_id;
  }

  return markdownRepo.update(fileId, updateData);
};

export const deleteFile = async (userId, fileId) => {
  const file = await markdownRepo.findById(fileId, userId);
  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  await markdownRepo.softDelete(fileId);

  return { message: "File berhasil dihapus" };
};

export const bulkDeleteFiles = async (userId, fileIds) => {
  if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
    throw BadRequestError("File IDs tidak boleh kosong");
  }

  const result = await markdownRepo.bulkSoftDelete(fileIds, userId);
  return {
    message: `${result.count} file berhasil dihapus`,
    count: result.count,
  };
};

export const getFileCount = async (userId) => {
  const count = await markdownRepo.countByUserId(userId);
  return { count };
};

export const getDeletedFiles = async (userId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  return markdownRepo.findDeletedByUserId(userId, { page, limit });
};

export const getDeletedFileCount = async (userId) => {
  const count = await markdownRepo.countDeletedByUserId(userId);
  return { count };
};

export const restoreFile = async (userId, fileId) => {
  const file = await markdownRepo.findDeletedById(fileId, userId);

  if (!file) {
    throw NotFoundError("File tidak ditemukan di trash");
  }

  const exists = await markdownRepo.existsByTitle(file.title, userId);
  if (exists) {
    throw ConflictError(
      `Tidak bisa restore: File dengan title "${file.title}" sudah ada. ` +
      `Hapus atau rename file tersebut terlebih dahulu.`,
    );
  }

  return await markdownRepo.restoreById(fileId, userId);
};

export const restoreAllFiles = async (userId) => {
  const deletedFiles = await markdownRepo.findDeletedByUserId(userId, {
    limit: 1000,
  });

  const conflicts = [];
  for (const file of deletedFiles.data) {
    const exists = await markdownRepo.existsByTitle(file.title, userId);
    if (exists) {
      conflicts.push(file.title);
    }
  }

  if (conflicts.length > 0) {
    throw ConflictError(
      `Tidak bisa restore semua file. Konflik dengan: ${conflicts.join(", ")}`,
    );
  }

  const result = await markdownRepo.restoreAllByUserId(userId);

  return {
    message: `${result.count} file berhasil di-restore`,
    count: result.count,
  };
};

export const permanentDeleteFile = async (userId, fileId) => {
  const file = await markdownRepo.hardDeleteById(fileId, userId);

  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  return { message: "File berhasil dihapus permanen" };
};

export const emptyTrash = async (userId) => {
  const result = await markdownRepo.emptyTrash(userId);
  return {
    message: `${result.count} file berhasil dihapus permanen`,
    count: result.count,
  };
};

// ============ SHARE ============

// Token URL-safe & sulit ditebak (~22 karakter)
const generateShareToken = () => randomBytes(16).toString("base64url");

export const enableShare = async (userId, fileId) => {
  const file = await markdownRepo.findById(fileId, userId);
  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  // Pakai token lama bila masih ada, kalau tidak buat baru
  const token = file.share_token || generateShareToken();

  await markdownRepo.update(fileId, {
    is_public: true,
    share_token: token,
  });

  return { is_public: true, token };
};

export const disableShare = async (userId, fileId) => {
  const file = await markdownRepo.findById(fileId, userId);
  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  // Cabut total: matikan publik & hapus token (link lama jadi mati)
  await markdownRepo.update(fileId, {
    is_public: false,
    share_token: null,
  });

  return { is_public: false, token: null };
};

export const getShareStatus = async (userId, fileId) => {
  const file = await markdownRepo.findById(fileId, userId);
  if (!file) {
    throw NotFoundError("File tidak ditemukan");
  }

  return {
    is_public: file.is_public,
    token: file.is_public ? file.share_token : null,
  };
};

export const getSharedByToken = async (token) => {
  const file = await markdownRepo.findByShareToken(token);
  if (!file) {
    // 404 (bukan 401) agar halaman publik tidak redirect ke login
    throw NotFoundError("Dokumen tidak ditemukan atau berbagi telah dinonaktifkan");
  }

  return {
    title: file.title,
    content: file.content,
    username: file.user?.username,
    created_at: file.created_at,
    updated_at: file.updated_at,
  };
};

import { prisma } from "../config/database.js";
import {
  parsePaginationOptions,
  paginatedResponse,
} from "../utils/pagination.util.js";

const notDeleted = { deleted_at: null };

const isDeleted = { deleted_at: { not: null } };

export const findById = async (id, userId) => {
  return prisma.markdownFile.findFirst({
    where: { id, user_id: userId, ...notDeleted },
  });
};

export const findByIdWithUser = async (id, userId) => {
  return prisma.markdownFile.findFirst({
    where: { id, user_id: userId, ...notDeleted },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
    },
  });
};

export const findManyByUserId = async (userId, options = {}) => {
  const { page, limit, skip, orderBy, order } = parsePaginationOptions(options);
  const { ungrouped, group_id } = options;

  const where = {
    user_id: userId,
    ...notDeleted,
    // Filter: group_id spesifik ATAU ungrouped (null) ATAU semua
    ...(group_id && { group_id }),
    ...(ungrouped && !group_id && { group_id: null }),
  };

  const [data, total] = await Promise.all([
    prisma.markdownFile.findMany({
      where,
      orderBy: { [orderBy]: order },
      take: limit,
      skip,
    }),
    prisma.markdownFile.count({ where }),
  ]);

  return paginatedResponse(data, total, { page, limit });
};

export const search = async (userId, keyword, options = {}) => {
  const { page, limit, skip } = parsePaginationOptions(options);
  const { group_id, ungrouped } = options;

  const where = {
    user_id: userId,
    ...notDeleted,
    OR: [
      { title: { contains: keyword, mode: "insensitive" } },
      { content: { contains: keyword, mode: "insensitive" } },
    ],
    // Filter berdasarkan grup
    ...(group_id && { group_id }),
    ...(ungrouped && !group_id && { group_id: null }),
  };

  const [data, total] = await Promise.all([
    prisma.markdownFile.findMany({
      where,
      orderBy: { updated_at: "desc" },
      take: limit,
      skip,
      include: {
        group: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.markdownFile.count({ where }),
  ]);

  return paginatedResponse(data, total, { page, limit });
};

export const getRecentByUserId = async (userId, limit = 10) => {
  return prisma.markdownFile.findMany({
    where: { user_id: userId, ...notDeleted },
    orderBy: { updated_at: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      updated_at: true,
    },
  });
};

export const existsByTitle = async (title, userId, excludeId = null) => {
  const where = {
    title,
    user_id: userId,
    ...notDeleted,
    ...(excludeId && { id: { not: excludeId } }),
  };

  const count = await prisma.markdownFile.count({ where });
  return count > 0;
};

export const create = async (data) => {
  return prisma.markdownFile.create({
    data: {
      title: data.title,
      content: data.content,
      user_id: data.user_id,
      group_id: data.group_id,
    },
  });
};

export const update = async (id, data) => {
  return prisma.markdownFile.update({
    where: { id },
    data,
  });
};

export const softDelete = async (id) => {
  return prisma.markdownFile.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
};

export const softDeleteAllByUserId = async (userId) => {
  return prisma.markdownFile.updateMany({
    where: { user_id: userId, ...notDeleted },
    data: { deleted_at: new Date() },
  });
};

export const bulkSoftDelete = async (ids, userId) => {
  return prisma.markdownFile.updateMany({
    where: {
      id: { in: ids },
      user_id: userId,
      ...notDeleted,
    },
    data: { deleted_at: new Date() },
  });
};

export const hardDeleteAllByUserId = async (userId, confirmation = false) => {
  if (!confirmation) {
    throw new Error("Confirmation required for hard delete all files");
  }

  return prisma.markdownFile.deleteMany({
    where: { user_id: userId },
  });
};

export const countByUserId = async (userId) => {
  return prisma.markdownFile.count({
    where: { user_id: userId, ...notDeleted },
  });
};

export const findDeletedById = async (id, userId) => {
  return prisma.markdownFile.findFirst({
    where: { id, user_id: userId, ...isDeleted },
  });
};

export const findDeletedByUserId = async (userId, options = {}) => {
  const { page, limit, skip } = parsePaginationOptions(options);

  const where = { user_id: userId, ...isDeleted };

  const [data, total] = await Promise.all([
    prisma.markdownFile.findMany({
      where,
      orderBy: { deleted_at: "desc" },
      take: limit,
      skip,
    }),
    prisma.markdownFile.count({ where }),
  ]);

  return paginatedResponse(data, total, { page, limit });
};

export const countDeletedByUserId = async (userId) => {
  return prisma.markdownFile.count({
    where: { user_id: userId, ...isDeleted },
  });
};

export const restoreById = async (id, userId) => {
  // First check if file exists and belongs to user
  const file = await findDeletedById(id, userId);
  if (!file) return null;

  return prisma.markdownFile.update({
    where: { id },
    data: { deleted_at: null },
  });
};

export const restoreAllByUserId = async (userId) => {
  return prisma.markdownFile.updateMany({
    where: { user_id: userId, ...isDeleted },
    data: { deleted_at: null },
  });
};

export const hardDeleteById = async (id, userId) => {
  // First check if file exists and belongs to user
  const file = await prisma.markdownFile.findFirst({
    where: { id, user_id: userId },
  });
  if (!file) return null;

  return prisma.markdownFile.delete({
    where: { id },
  });
};

export const emptyTrash = async (userId) => {
  return prisma.markdownFile.deleteMany({
    where: { user_id: userId, ...isDeleted },
  });
};

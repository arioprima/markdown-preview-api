import { prisma } from "../config/database.js";
import {
  paginatedResponse,
  parsePaginationOptions,
} from "../utils/pagination.util.js";

const notDeleted = { deleted_at: null };

export const findById = async (id) => {
  if (!id) return null;

  return prisma.groupNote.findFirst({
    where: {
      id: id,
      ...notDeleted,
    },
    include: {
      markdownFiles: true,
    },
  });
};

export const findByUserId = async (userId, options = {}) => {
  if (!userId) return null;
  const { page, limit, skip, orderBy, order } = parsePaginationOptions(options);

  const where = {
    user_id: userId,
    ...notDeleted,
  };

  const [data, count] = await Promise.all([
    prisma.groupNote.findMany({
      where,
      orderBy: { [orderBy]: order },
      take: limit,
      skip,
      include: {
        markdownFiles: true,
      },
    }),
    prisma.groupNote.count({ where }),
  ]);

  return paginatedResponse(data, count, { page, limit });
};

export const create = async (data) => {
  const { name, userId } = data;

  return prisma.groupNote.create({
    data: {
      name,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
};

export const update = async (id, data) => {
  const { name } = data;

  return prisma.groupNote.update({
    where: {
      id,
      ...notDeleted,
    },
    data: {
      name,
    },
  });
};

export const softDelete = async (id) => {
  return prisma.groupNote.update({
    where: {
      id,
      ...notDeleted,
    },
    data: {
      deleted_at: new Date(),
    },
  });
};

export const findByIdAndUserId = async (id, userId) => {
  if (!id || !userId) return null;

  return prisma.groupNote.findFirst({
    where: {
      id,
      user_id: userId,
      ...notDeleted,
    },
    include: {
      markdownFiles: true,
    },
  });
};

import { prisma } from "../config/database.js";

const notDeleted = { deleted_at: null };

export const findById = async (id) => {
    if (!id) return null;

    return prisma.user.findFirst({
        where: { id, ...notDeleted }
    });
};


export const findByEmail = async (email) => {
    return prisma.user.findFirst({
        where: { email, ...notDeleted }
    });
};

export const findByUsername = async (username) => {
    return prisma.user.findFirst({
        where: { username, ...notDeleted }
    });
};

export const findOne = async (where, options = {}) => {
    const { includeDeleted = false } = options;

    return prisma.user.findFirst({
        where: {
            ...where,
            ...(includeDeleted ? {} : notDeleted)
        }
    });
};

export const create = async (data) => {
    return prisma.user.create({
        data: {
            email: data.email,
            username: data.username,
            password: data.password || null,
            avatar_url: data.avatar_url || null,
        }
    });
};

export const update = async (id, data) => {
    return prisma.user.update({
        where: { id },
        data
    });
};

export const softDelete = async (id) => {
    return prisma.user.update({
        where: { id },
        data: { deleted_at: new Date() }
    });
};

export const restore = async (id) => {
    return prisma.user.update({
        where: { id },
        data: { deleted_at: null }
    });
};

export const hardDelete = async (id) => {
    return prisma.user.delete({
        where: { id }
    });
};
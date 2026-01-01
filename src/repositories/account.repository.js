import { prisma } from "../config/database.js";

export const findByProvider = async (provider, providerId) => {
    return await prisma.account.findUnique({
        where: {
            provider_provider_id: {
                provider,
                provider_id: providerId,
            },
        },
        include: {
            user: true,
        },
    });
};

export const create = async (data) => {
    return await prisma.account.create({
        data,
    });
};

export const findByUserId = async (userId) => {
    return await prisma.account.findMany({
        where: {
            user_id: userId
        }
    })
}

export const deleteAccount = async (id) => {
    return await prisma.account.delete({
        where: { id }
    })
}
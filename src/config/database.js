import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

const { PrismaClient } = pkg;

export const prisma = new PrismaClient({
    adapter: new PrismaPg({
        connectionString: env.DATABASE_URL,
    }),
    log: env.isDevelopment ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

export async function connectDB() {
    await prisma.$connect();
    console.log("Database connected");
}

export async function disconnectDB() {
    await prisma.$disconnect();
    console.log("Database disconnected");
}
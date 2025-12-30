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

const CONNECTION_TIMEOUT = 10000;

export async function connectDB() {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Database connection timeout")), CONNECTION_TIMEOUT);
    });

    const connectPromise = (async () => {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
    })();

    await Promise.race([connectPromise, timeoutPromise]);
    console.log("Database connected");
}

export async function disconnectDB() {
    await prisma.$disconnect();
    console.log("Database disconnected");
}
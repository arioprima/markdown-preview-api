import "dotenv/config";

const required = (key) => {
    const v = process.env[key];
    if (!v) throw new Error(`Missing required env var: ${key}`);
    return v;
}

export const env = {
    //SERVER
    NODE_ENV: process.env.NODE_ENV,
    PORT: Number(process.env.PORT),

    //DATABASE
    DATABASE_URL: required("DATABASE_URL"),

    // JWT
    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    //CLIENT URL
    CLIENT_URL: process.env.CLIENT_URL,

    // Helper
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
}
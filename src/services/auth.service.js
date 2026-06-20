import * as userRepo from "../repositories/user.repository.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/error.util.js";
import { generateToken } from "../utils/jwt.util.js";

export const register = async (data) => {
    const { email, username, password } = data;

    const [existingEmail, existingUsername] = await Promise.all([
        userRepo.findByEmail(email),
        userRepo.findByUsername(username)
    ]);

    if (existingEmail) {
        throw ConflictError("Email already registered");
    }

    if (existingUsername) {
        throw ConflictError("Username already taken");
    }

    const hashedPassword = await hashPassword(password);

    const user = await userRepo.create({
        email,
        username,
        password: hashedPassword
    });

    const token = generateToken({
        id: user.id,
        email: user.email,
    });

    return {
        user: excludePassword(user),
        token
    };
};

export const login = async (data) => {
    const { email, password } = data;

    const user = await userRepo.findByEmail(email);

    if (!user) {
        throw UnauthorizedError("Email or password is incorrect");
    }

    if (!user.password) {
        throw UnauthorizedError("This account was registered using Google. Please login with Google.");
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
        throw UnauthorizedError("Email or password is incorrect");
    }

    const token = generateToken({
        id: user.id,
        email: user.email,
    });

    return {
        user: excludePassword(user),
        token
    };
};

export const getProfile = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) {
        throw NotFoundError("User not found");
    }

    return excludePassword(user);
};

export const updateProfile = async (userId, data) => {
    const { email, username } = data;

    const user = await userRepo.findById(userId);
    if (!user) {
        throw NotFoundError("User not found");
    }

    if (email && email !== user.email) {
        const existingEmail = await userRepo.findByEmail(email);
        if (existingEmail) {
            throw ConflictError("Email already registered");
        }
    }

    if (username && username !== user.username) {
        const existingUsername = await userRepo.findByUsername(username);
        if (existingUsername) {
            throw ConflictError("Username already taken");
        }
    }

    const updatedUser = await userRepo.update(userId, {
        ...(email && { email }),
        ...(username && { username })
    });

    return excludePassword(updatedUser);
};

export const changePassword = async (userId, data) => {
    if (!userId) {
        throw BadRequestError("User ID is required");
    }

    const { current_password, new_password } = data;
    const user = await userRepo.findById(userId);

    console.log("user from repo:", userId);

    if (!user) {
        throw NotFoundError("User not found");
    }

    const isValidPassword = await comparePassword(current_password, user.password);
    if (!isValidPassword) {
        throw BadRequestError("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(new_password);

    await userRepo.update(userId, { password: hashedPassword });

    return { message: "Password successfully changed" };
};

export const deleteAccount = async (userId) => {
    const user = await userRepo.findById(userId);
    if (!user) {
        throw NotFoundError("User not found");
    }

    await userRepo.softDelete(userId);
    return { message: "Account successfully deleted" };
};

const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
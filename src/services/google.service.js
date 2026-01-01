import * as userRepo from "../repositories/user.repository.js";
import * as accountRepo from "../repositories/account.repository.js";
import { GOOGLE_OAUTH } from "../constants/oauth.constants.js";
import { generateToken } from "../utils/jwt.util.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;


export const getGoogleAuthURL = () => {
    const options = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: GOOGLE_OAUTH.SCOPES.join(" "),
        access_type: "offline",
        prompt: "consent",
    });
    return `${GOOGLE_OAUTH.AUTH_URL}?${options.toString()}`;
};

export const getGoogleTokens = async (code) => {
    const url = GOOGLE_OAUTH.TOKEN_URL;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            code,
            grant_type: "authorization_code",
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || "Failed to get tokens from Google");
    }
    return data;
}

export const getGoogleUserInfo = async (accessToken) => {
    const url = GOOGLE_OAUTH.USERINFO_URL
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error_description || "Failed to get user info from Google");
    }
    return data;
}

export const handleGoogleLogin = async (code) => {
    const tokens = await getGoogleTokens(code);

    const googleUser = await getGoogleUserInfo(tokens.access_token);

    const existingAccount = await accountRepo.findByProvider("google", googleUser.id);

    if (existingAccount) {
        const token = generateToken({
            id: existingAccount.user.id,
            email: existingAccount.user.email,
        });

        return {
            user: excludePassword(existingAccount.user),
            token,
            isNewUser: false,
        };
    }
    let user = await userRepo.findByEmail(googleUser.email);

    if (user) {
        await accountRepo.create({
            user_id: user.id,
            provider: "google",
            provider_id: googleUser.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
        });

        if (!user.avatar_url && googleUser.picture) {
            user = await userRepo.update(user.id, {
                avatar_url: googleUser.picture,
            });
        }
    } else {
        const username = generateUsername(googleUser.email, googleUser.name);

        user = await userRepo.create({
            email: googleUser.email,
            username: username,
            password: null,
            avatar_url: googleUser.picture,
        });

        await accountRepo.create({
            user_id: user.id,
            provider: "google",
            provider_id: googleUser.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || null,
        });
    }

    const token = generateToken({
        id: user.id,
        email: user.email,
    });

    return {
        user: excludePassword(user),
        token,
        isNewUser: true,
    };
}

const generateUsername = (email, name) => {
    if (name) {
        const baseUsername = name.toLowerCase().replace(/\s+/g, "");
        return `${baseUsername}${Math.floor(Math.random() * 1000)}`;
    }
    return email.split("@")[0] + Math.floor(Math.random() * 1000);
};

const excludePassword = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
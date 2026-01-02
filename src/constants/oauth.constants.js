export const GOOGLE_OAUTH = {
    AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    TOKEN_URL: "https://oauth2.googleapis.com/token",
    USERINFO_URL: "https://www.googleapis.com/oauth2/v2/userinfo",
    SCOPES: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
    ],
};

export const GITHUB_OAUTH = {
    AUTH_URL: "https://github.com/login/oauth/authorize",
    TOKEN_URL: "https://github.com/login/oauth/access_token",
    USERINFO_URL: "https://api.github.com/user",
    SCOPES: [
        "user:email",
        "read:user",
    ],
};
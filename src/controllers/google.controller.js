import * as googleService from "../services/google.service.js";


export const redirectToGoogle = (req, res) => {
    const url = googleService.getGoogleAuthURL();
    res.redirect(url);
}

export const handleGoogleCallback = async (req, res, next) => {
    try {
        const { code, error } = req.query;

        if (error) {
            return res.redirect(
                `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error)}`
            );
        }

        if (!code) {
            return res.redirect(
                `${process.env.CLIENT_URL}/login?error=no_code`
            );
        }

        const result = await googleService.handleGoogleLogin(code);

        res.redirect(
            `${process.env.CLIENT_URL}/auth/callback?token=${result.token}&isNewUser=${result.isNewUser}`
        );
    } catch (error) {
        console.error("Google OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
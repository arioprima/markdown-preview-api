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

        // Set JWT di HTTP-only cookie (tidak bisa diakses JavaScript)
        res.cookie('token', result.token, {
            httpOnly: true,                                    // Anti XSS
            secure: process.env.NODE_ENV === 'production',     // HTTPS only di production
            sameSite: 'lax',                                   // Anti CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000                    // 7 hari
        });

        // Redirect tanpa token di URL (aman dari Google Safe Browsing)
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?isNewUser=${result.isNewUser}`);
    } catch (error) {
        console.error("Google OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
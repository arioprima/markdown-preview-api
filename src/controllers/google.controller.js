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

        // Set cookie dengan domain untuk cross-subdomain
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: true,                          // HTTPS required
            sameSite: 'none',                      // Cross-origin allowed
            domain: '.karyacodelab.com',           // Share antar subdomain
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.redirect(`${process.env.CLIENT_URL}/callback?isNewUser=${result.isNewUser}`);
    } catch (error) {
        console.error("Google OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
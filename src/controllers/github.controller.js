import * as githubService from "../services/github.service.js";


export const redirectToGithub = (req, res) => {
    const url = githubService.getGithubAuthURL();
    res.redirect(url);
}

export const handleGithubCallback = async (req, res, next) => {
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

        const result = await githubService.handleGithubLogin(code);

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
        console.error("Github OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
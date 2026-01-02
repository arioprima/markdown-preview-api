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
        console.error("Github OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
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

        res.redirect(
            `${process.env.CLIENT_URL}/callback?token=${result.token}&isNewUser=${result.isNewUser}`
        );
    } catch (error) {
        console.error("Github OAuth error:", error);
        res.redirect(
            `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`
        );
    }
}
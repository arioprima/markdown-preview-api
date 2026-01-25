import * as googleService from "../services/google.service.js";
import { getCookieOptions } from "../utils/cookie.utils.js";

export const redirectToGoogle = (req, res) => {
  const url = googleService.getGoogleAuthURL();
  res.redirect(url);
};

export const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error)}`,
      );
    }

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }

    const result = await googleService.handleGoogleLogin(code);

    // Set cookie
    res.cookie("token", result.token, getCookieOptions());

    res.redirect(
      `${process.env.CLIENT_URL}/callback?isNewUser=${result.isNewUser}`,
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/login?error=${encodeURIComponent(error.message)}`,
    );
  }
};

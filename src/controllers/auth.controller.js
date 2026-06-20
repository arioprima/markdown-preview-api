import * as authService from "../services/auth.service.js";
import { getCookieOptions } from "../utils/cookie.utils.js";

export const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const result = await authService.register({ email, username, password });

    // Set cookie
    res.cookie("token", result.token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: { user: result.user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await authService.login({ email, password });

    // Set cookie
    res.cookie("token", result.token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user: result.user },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await authService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { username, email } = req.body;

    const user = await authService.updateProfile(userId, { username, email });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log("userId:", userId);
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const result = await authService.changePassword(userId, {
      current_password,
      new_password,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await authService.deleteAccount(userId);

    // Clear cookie saat delete account
    res.clearCookie("token", getCookieOptions());

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  // Clear HTTP-only cookie
  res.clearCookie("token", getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

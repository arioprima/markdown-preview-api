// Helper untuk cookie options - support localhost dan production
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  const options = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  };

  if (isProduction) {
    options.secure = true;
    options.sameSite = "none";
    options.domain = ".karyacodelab.com";
  } else {
    // Development mode - untuk localhost
    options.secure = false;
    options.sameSite = "lax";
    // Tidak set domain untuk localhost
  }

  return options;
};

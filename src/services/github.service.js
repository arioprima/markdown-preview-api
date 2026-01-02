import * as userRepo from "../repositories/user.repository.js";
import * as accountRepo from "../repositories/account.repository.js";
import { GITHUB_OAUTH } from "../constants/oauth.constants.js";
import { generateToken } from "../utils/jwt.util.js";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export const getGithubAuthURL = () => {
  const options = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: GITHUB_OAUTH.SCOPES.join(" "),
  });
  return `${GITHUB_OAUTH.AUTH_URL}?${options.toString()}`;
};

export const getGithubTokens = async (code) => {
  const url = GITHUB_OAUTH.TOKEN_URL;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      redirect_uri: GITHUB_REDIRECT_URI,
      code,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error_description || "Failed to get tokens from GitHub"
    );
  }
  return data;
};

export const getGithubUserInfo = async (accessToken) => {
  const url = GITHUB_OAUTH.USERINFO_URL;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error_description || "Failed to get user info from GitHub"
    );
  }

  // Jika email null, fetch dari endpoint emails
  if (!data.email) {
    try {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (emailResponse.ok) {
        const emails = await emailResponse.json();
        console.log("📧 GitHub emails:", emails);

        // Prioritas: primary & verified > verified > any email
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        const verifiedEmail = emails.find((e) => e.verified);
        const anyEmail = emails.find((e) => e.email);

        data.email =
          primaryEmail?.email ||
          verifiedEmail?.email ||
          anyEmail?.email ||
          null;
        console.log("✉️ Selected email:", data.email);
      }
    } catch (emailError) {
      console.error("❌ Failed to fetch GitHub emails:", emailError.message);
    }
  }

  return data;
};

export const handleGithubLogin = async (code) => {
  const tokens = await getGithubTokens(code);

  const githubUser = await getGithubUserInfo(tokens.access_token);

  const existingAccount = await accountRepo.findByProvider(
    "github",
    githubUser.id.toString()
  );

  if (existingAccount) {
    const token = generateToken({
      id: existingAccount.user.id,
      email: existingAccount.user.email,
    });

    return {
      user: excludePassword(existingAccount.user),
      token,
      isNewUser: false,
    };
  }

  // Jika email tetap null, gunakan format noreply GitHub yang standar
  // Format ini sama dengan yang digunakan GitHub untuk commit dengan email private
  if (!githubUser.email) {
    githubUser.email = `${githubUser.id}+${githubUser.login}@users.noreply.github.com`;
    console.log(
      "⚠️ GitHub email private/null, using noreply format:",
      githubUser.email
    );
  }

  let user = await userRepo.findByEmail(githubUser.email);

  if (user) {
    await accountRepo.create({
      user_id: user.id,
      provider: "github",
      provider_id: githubUser.id.toString(),
      access_token: tokens.access_token,
      refresh_token: null,
    });

    if (!user.avatar_url && githubUser.avatar_url) {
      user = await userRepo.update(user.id, {
        avatar_url: githubUser.avatar_url,
      });
    }
  } else {
    // Gunakan GitHub login langsung sebagai username (sudah unique di GitHub)
    // Fallback ke generateUsername jika login sudah dipakai di database
    let username = githubUser.login;
    const existingUsername = await userRepo.findByUsername(username);

    if (existingUsername) {
      username = await generateUniqueUsername(githubUser.login);
    }

    user = await userRepo.create({
      email: githubUser.email,
      username: username,
      password: null,
      avatar_url: githubUser.avatar_url,
    });

    await accountRepo.create({
      user_id: user.id,
      provider: "github",
      provider_id: githubUser.id.toString(),
      access_token: tokens.access_token,
      refresh_token: null,
    });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
  });

  return {
    user: excludePassword(user),
    token,
    isNewUser: true,
  };
};

/**
 * Generate unique username dengan menambahkan angka suffix jika duplikat
 */
const generateUniqueUsername = async (baseUsername) => {
  let username = baseUsername;
  let counter = 1;

  while (await userRepo.findByUsername(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

const excludePassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

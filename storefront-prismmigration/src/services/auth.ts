import { AuthAPI } from "./api";

const TOKEN_KEY = "admin_jwt";
const USERNAME_KEY = "admin_username";
const EXPIRY_KEY = "admin_token_expiry";

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}

export const AuthService = {
  async login(username: string, password: string): Promise<AdminSession> {
    const response = await AuthAPI.login(username, password);
    const expiresAt = Date.now() + response.expiresIn;

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));

    return {
      token: response.token,
      username: response.username,
      expiresAt,
    };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  },

  getSession(): AdminSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const username = localStorage.getItem(USERNAME_KEY);
    const expiresAtStr = localStorage.getItem(EXPIRY_KEY);

    if (!token || !username || !expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      // Token expired -- clean up
      AuthService.logout();
      return null;
    }

    return { token, username, expiresAt };
  },

  isLoggedIn(): boolean {
    return AuthService.getSession() !== null;
  },
};

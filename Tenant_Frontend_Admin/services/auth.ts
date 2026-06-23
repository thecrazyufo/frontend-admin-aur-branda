"use client";

import { AuthAPI } from "./api";

const TOKEN_KEY = "admin_jwt";
const USERNAME_KEY = "admin_username";
const EXPIRY_KEY = "admin_token_expiry";
const ROLE_KEY = "admin_role";
const BRAND_KEY = "admin_brand_id";

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
  role: string;
  brandId: string;
}

export const AuthService = {
  async login(username: string, password: string): Promise<AdminSession> {
    const response = await AuthAPI.login(username, password);
    const expiresAt = Date.now() + response.expiresIn;

    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USERNAME_KEY, response.username);
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));
    localStorage.setItem(ROLE_KEY, response.role);
    localStorage.setItem(BRAND_KEY, response.brandId);

    return {
      token: response.token,
      username: response.username,
      expiresAt,
      role: response.role,
      brandId: response.brandId,
    };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(BRAND_KEY);
  },

  getSession(): AdminSession | null {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(TOKEN_KEY);
    const username = localStorage.getItem(USERNAME_KEY);
    const expiresAtStr = localStorage.getItem(EXPIRY_KEY);
    const role = localStorage.getItem(ROLE_KEY) || "";
    const brandId = localStorage.getItem(BRAND_KEY) || "";

    if (!token || !username || !expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (Date.now() > expiresAt) {
      // Token expired — clean up
      AuthService.logout();
      return null;
    }

    return { token, username, expiresAt, role, brandId };
  },

  isLoggedIn(): boolean {
    return AuthService.getSession() !== null;
  },
};

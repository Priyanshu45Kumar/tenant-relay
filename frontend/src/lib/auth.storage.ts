
import type { AuthData } from "../types/auth";

const AUTH_STORAGE_KEY = "tenantrelay_auth";

export const saveAuth = (auth: AuthData): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

export const getStoredAuth = (): AuthData | null => {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth) as AuthData;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

import { clearStoredAuth } from "./auth.storage";

export const logout = (): void => {
  clearStoredAuth();
};
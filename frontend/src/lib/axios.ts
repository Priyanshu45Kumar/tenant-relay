import axios from "axios"
import {getStoredAuth} from "./auth.storage"

const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();

    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;
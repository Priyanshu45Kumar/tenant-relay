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
      console.log("AUTH FROM STORAGE:", auth);
    console.log("ACCESS TOKEN:", auth?.accessToken);

    if (auth?.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
    }

    console.log(
      "AUTHORIZATION HEADER:",
      config.headers.Authorization,
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;
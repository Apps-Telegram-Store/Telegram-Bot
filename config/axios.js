import axios from "axios";

export const axiosApi = axios.create({
    baseURL: process.env.API_URL || 'http://localhost:1337'
});

axiosApi.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${process.env.JWT_TOKEN}`
        return config
    }
);
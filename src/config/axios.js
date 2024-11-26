import axios from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: { 'X-Custom-Header': 'foobar' },
    timeout: "5000ms"
});

export default axiosInstance;
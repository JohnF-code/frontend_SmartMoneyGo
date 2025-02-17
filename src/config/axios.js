// config/axios.js
import axios from 'axios';

// La idea es: NEXT_PUBLIC_BACKEND_URL = "http://localhost:5000"
// => baseURL = "http://localhost:5000/api"
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + '/api',
  headers: { 'X-Custom-Header': 'foobar' },
  timeout: '5000ms',
});

export default axiosInstance;

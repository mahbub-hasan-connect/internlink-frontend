import axios from 'axios';

// Shared axios instance — every page should import this instead of calling
// axios.post/get directly with a hardcoded URL.
// Change ONLY this baseURL if the backend port/host ever changes.
const axiosClient = axios.create({
  baseURL: 'https://localhost:7182/api',
});

// Request interceptor — automatically attaches the JWT token (if present)
// to every outgoing request, so individual pages never have to do it manually.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — if the backend ever says the token is invalid/expired
// (401), clear the stale session and send the user back to login instead of
// leaving them stuck on a broken page.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Attaches the JWT from localStorage as a Bearer token on every request.
// (Not using httpOnly cookies here: the frontend and backend are deployed on
// different domains - Vercel and Render - and cross-site cookies are
// increasingly blocked by default in Safari and Chrome, which would make
// login intermittently fail for real users. A Bearer token in localStorage
// is the standard, reliable pattern for this split-domain setup.)
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('pgos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pgos_token');
      localStorage.removeItem('pgos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;

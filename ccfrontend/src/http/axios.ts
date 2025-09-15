import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  withCredentials: true,
});

let accessToken: string | null = null;

function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

function getAccessToken() {
  return accessToken;
}

function clearAccessToken() {
  accessToken = null;
  delete api.defaults.headers.common['Authorization'];
}

export default api;
export { api, setAccessToken, getAccessToken, clearAccessToken };

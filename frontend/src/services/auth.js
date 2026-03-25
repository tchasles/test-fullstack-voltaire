import axios from 'axios';

const API_URL = '/api';

const TOKEN_KEY = 'voltaire_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(username, email, password) {
  const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
  setToken(res.data.token);
  return res.data;
}

export async function login(email, password) {
  const res = await axios.post(`${API_URL}/auth/login`, { email, password });
  setToken(res.data.token);
  return res.data;
}

export function logout() {
  removeToken();
}

export async function getMe() {
  const res = await axios.get(`${API_URL}/me`, { headers: authHeader() });
  return res.data;
}

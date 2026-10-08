import { IS_STATIC } from './asset.js';

const TOKEN_KEY = 'maneldev-admin-token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(url, { body, method = 'GET', auth = false } = {}) {
  const headers = {};
  if (auth) headers.Authorization = `Bearer ${getToken()}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body instanceof FormData ? body : body && JSON.stringify(body),
  });

  if (res.status === 401 && auth) clearToken();
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Error de conexión con el servidor');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  login: (username, password) => request('/api/login', { method: 'POST', body: { username, password } }),
  checkSession: () => request('/api/session', { auth: true }),
  // En GitHub Pages no hay API: se lee la copia estática generada en el build (scripts/prepare-pages.js)
  getProjects: () =>
    IS_STATIC ? request(`${import.meta.env.BASE_URL}projects.json`) : request('/api/projects'),
  createProject: (formData) => request('/api/projects', { method: 'POST', body: formData, auth: true }),
  updateProject: (id, formData) =>
    request(`/api/projects/${encodeURIComponent(id)}`, { method: 'PUT', body: formData, auth: true }),
  deleteProject: (id) => request(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  reorderProjects: (ids) => request('/api/projects-order', { method: 'PUT', body: { ids }, auth: true }),
};

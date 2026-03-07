'use client'

const BASE_URL = ''

// Global logout handler — set by AuthContext
let globalLogoutFn = null

export function setGlobalLogout(fn) {
  globalLogoutFn = fn
}

// ── Core fetch wrapper ────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // sends httpOnly cookie automatically
  })

  // Token expired or invalid → auto logout
  if (res.status === 401) {
    if (globalLogoutFn) globalLogoutFn()
    throw { status: 401, message: 'Session expired, please login again' }
  }

  const data = await res.json()

  if (!res.ok) {
    throw {
      status: res.status,
      message: data.message || 'Something went wrong',
      errors: data.errors,
    }
  }

  return data
}

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  register: (body) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch('/api/auth/me'),
}

// ── Posts ─────────────────────────────────────────────
export const postsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/posts?${query}`)
  },

  getOne: (id) =>
    apiFetch(`/api/posts/${id}`),

  create: (body) =>
    apiFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (id, body) =>
    apiFetch(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (id) =>
    apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),

  publish: (id) =>
    apiFetch(`/api/publish/${id}`, { method: 'POST' }),
}

// ── Accounts ──────────────────────────────────────────
export const accountsApi = {
  getAll: () =>
    apiFetch('/api/accounts'),

  disconnect: (platform) =>
    apiFetch(`/api/accounts/${platform}`, { method: 'DELETE' }),

  connect: (platform) => {
    window.location.href = `/api/accounts/connect/${platform}`
  },
}

// ── AI Caption ────────────────────────────────────────
export const aiApi = {
  generateCaptions: (body) =>
    apiFetch('/api/ai/caption', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

// ── Upload ────────────────────────────────────────────
export const uploadApi = {
  getAuth: () =>
    apiFetch('/api/upload/auth'),
}
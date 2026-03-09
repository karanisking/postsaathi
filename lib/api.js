const BASE_URL = ''

let globalLogoutFn = null

export function setGlobalLogout(fn) {
  globalLogoutFn = fn
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  const data = await res.json()

  // Token expired → auto logout
  if (res.status === 401 && !endpoint.includes('/api/auth/login')) {
    if (globalLogoutFn) globalLogoutFn()
    throw { status: 401, message: 'Session expired, please login again' }
  }

  // ✅ Always throw full error object so pages can read message + errors + status
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.status = res.status
    err.errors = data.errors || null
    err.message = data.message || 'Something went wrong'
    throw err
  }

  return data
}

export const authApi = {
  register: (body) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }),

  me: () =>
    apiFetch('/api/auth/me'),
}

export const postsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return apiFetch(`/api/posts?${query}`)
  },
  getOne: (id) => apiFetch(`/api/posts/${id}`),
  create: (body) => apiFetch('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),
  publish: (id) => apiFetch(`/api/publish/${id}`, { method: 'POST' }),
}

export const accountsApi = {
  getAll: () => apiFetch('/api/accounts'),
  disconnect: (platform) => apiFetch(`/api/accounts/${platform}`, { method: 'DELETE' }),
  connect: (platform) => { window.location.href = `/api/accounts/connect/${platform}` },
}

export const aiApi = {
  generateCaptions: (body) =>
    apiFetch('/api/ai/caption', { method: 'POST', body: JSON.stringify(body) }),
}

export const uploadApi = {
  getAuth: () => apiFetch('/api/upload/auth'),
}
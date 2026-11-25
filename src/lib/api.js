export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(method, url, body) {
  let res;
  try {
    res = await fetch(`/api${url}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the AMY server. Check your connection and try again.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) throw new ApiError(res.status, data?.error || `Request failed (${res.status}).`);
  return data;
}

export const api = {
  me: () => request('GET', '/auth/me'),
  demoCredentials: () => request('GET', '/auth/demo'),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (data) => request('POST', '/auth/register', data),
  logout: () => request('POST', '/auth/logout', {}),
  updateMe: (patch) => request('PATCH', '/auth/me', patch),
  changePassword: (currentPassword, newPassword) => request('POST', '/auth/password', { currentPassword, newPassword }),

  tasks: () => request('GET', '/tasks'),
  createTask: (data) => request('POST', '/tasks', data),
  updateTask: (id, patch) => request('PATCH', `/tasks/${id}`, patch),
  commentTask: (id, text) => request('POST', `/tasks/${id}/comments`, { text }),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
  resetDemo: () => request('POST', '/tasks/reset-demo', {}),

  createBooking: (data) => request('POST', '/bookings', data),
  bookings: () => request('GET', '/bookings'),
  updateBooking: (id, status) => request('PATCH', `/bookings/${id}`, { status }),
  deleteBooking: (id) => request('DELETE', `/bookings/${id}`),

  clients: () => request('GET', '/clients'),
};

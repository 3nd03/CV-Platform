import client from './client'

export async function signup({ email, password, display_name }) {
  const { data } = await client.post('/auth/signup', { email, password, display_name })
  return data
}

export async function login({ email, password }) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function logout() {
  const { data } = await client.post('/auth/logout')
  return data
}

export async function getMe() {
  const { data } = await client.get('/auth/me')
  return data
}

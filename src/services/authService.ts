import { api } from './api'

export async function loginClient(email: string, password: string) {
  const response = await api.post('/auth/login-client', { email, password })
  return response.data?.access_token
}

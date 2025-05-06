import { api } from './api'

export async function loginClient(email: string, password: string) {
  const response = await api.post('/auth/login-client', { email, password })
  return response.data?.access_token
}


export async function verifyEmailCode(email: string, code: string) {
  try {
    const response = await api.post('/auth/verify-email-code', { email, code })
    return response.data
  } catch (error: any) {
    return Promise.reject({ message: 'Erro ao registrar usuário.' })
  }
}

import { api } from './api'

interface LoginClientPayload {
  login: string
  password: string
  context: 'CLIENT'
  cnpj?: string
  isAdmin?: boolean
}

export async function loginClient(data: LoginClientPayload) {
  try {
    const response = await api.post('/auth/login-client', data)
    return response.data.access_token
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return Promise.reject({ message: 'Login ou senha inválidos.' })
    }
    if (error?.response?.status === 403) {
      return Promise.reject({ message: 'Acesso negado.' })
    }
    if (error?.response?.status === 409) {
      return Promise.reject({ message: 'Este e-mail já está em uso.' })
    }
    if (error?.response?.status === 500) { 
      return Promise.reject({ message: 'Erro interno do servidor.' })
    }
  }
}

interface BackOfficePayload {
  login: string
  password: string
  context: 'BACKOFFICE'
}

export async function loginBackOffice(payload: BackOfficePayload) {
  try {
    const response = await api.post('/auth/login-client', payload)
    return response.data.access_token
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return Promise.reject({ message: 'Login ou senha inválidos.' })
    }
    if (error?.response?.status === 403) {
      return Promise.reject({ message: 'Acesso negado.' })
    }
    if (error?.response?.status === 409) {
      return Promise.reject({ message: 'Este e-mail já está em uso.' })
    }
    if (error?.response?.status === 500) { 
      return Promise.reject({ message: 'Erro interno do servidor.' })
    }
  }
}


export async function verifyEmailCode(email: string, code: string) {
  try {
    const response = await api.post('/auth/verify-email-code', { email, code })
    return response.data
  } catch (error: any) {
    return Promise.reject({ message: 'Erro ao registrar usuário.' })
  }
}
export async function forgotPassword(data: { email: string; context: 'CLIENT' | 'BACKOFFICE' }) {
  const response = await api.post('/auth/forgot-password', data)
  return response.data
}


export async function validateResetToken(token: string) {
  return await api.get(`/auth/validate-reset-token?token=${token}`)
}

export async function resetPassword(payload: {
  token: string
  code: string
  newPassword: string
}) {
  return await api.post('/auth/reset-password', payload)
}

export async function requestChangePassword() {
  return await api.post('/auth/change-password-request')
}

export async function changePassword(payload: {
  currentPassword: string
  code: string
  newPassword: string
}) {
  return await api.post('/auth/change-password', payload)
}

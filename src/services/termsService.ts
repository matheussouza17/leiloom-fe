import { api } from './api'
import { AxiosError } from 'axios'

/**
 * Registra o aceite de termos de um usuário
 * @param userId ID do usuário que aceitou os termos
 * @returns Dados do registro de aceite
 */
export async function acceptTerms(payload: { clientUserId: string; termsId: string }) {
  try {
    const response = await api.post('/terms/accept', payload)
    return response.data
  } catch (error) {
    console.error('Error accepting terms:', error)
    throw error
  }
}


export async function getCurrentTerms(): Promise<{ id: string } | null> {
  try {
    const response = await api.get('/terms/current')
    return response.data
  } catch (err) {
    const error = err as AxiosError

    if (error.response?.status === 404) {
      console.warn('Termo de uso atual não encontrado (404).')
      return null
    }

    console.error('Erro inesperado ao buscar termo de uso atual:', error)
    return null
  }
}


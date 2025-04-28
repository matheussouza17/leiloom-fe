import { api } from './api'

export async function acceptTerms(clientUserId: string) {
  const response = await api.post('/terms/accept', {
    clientUserId,
  })
  return response.data
}

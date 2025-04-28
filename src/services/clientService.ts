import { api } from './api'

export async function registerClient(name: string, address: string) {
  const response = await api.post('/clients', {
    name,
    address,
  })
  return response.data
}

export async function registerClientUser(
  clientId: string,
  name: string,
  email: string,
  password: string,
  cpfCnpj: string,
  phone: string,
) {
  const response = await api.post('/client-users', {
    clientId,
    name,
    email,
    password,
    cpfCnpj: cpfCnpj,
    phone,
    role: 'ClientOwner',
  })
  return response.data
}

import { api } from './api'

/**
 * Cadastra um novo cliente
 * @param name Nome da empresa
 * @param address Endereço da empresa
 * @returns Dados do cliente cadastrado
 */
export async function registerClient(name: string, address: string) {
  try {
    const response = await api.post('/clients', {
      name,
      address,
    })
    return response.data
  } catch (error) {
    console.error('Error registering client:', error)
    throw error
  }
}

/**
 * Cadastra um usuário para um cliente
 * @param clientId ID do cliente
 * @param name Nome do usuário
 * @param email Email do usuário
 * @param password Senha do usuário
 * @param cpfCnpj CPF ou CNPJ do usuário
 * @param phone Telefone do usuário
 * @returns Dados do usuário cadastrado
 */
export async function registerClientUser(
  clientId: string,
  name: string,
  email: string,
  password: string,
  cpfCnpj: string,
  phone: string,
) {
  try {
    const response = await api.post('/client-users', {
      clientId,
      name,
      email,
      password,
      cpfCnpj,
      phone,
      role: 'ClientOwner',
    })
    return response.data
  } catch (error: any) {
    if (error.response?.status === 409) {
      return Promise.reject({ message: 'Este e-mail já está em uso.' })
    }

    return Promise.reject({ message: 'Erro ao registrar usuário.' })
  }
}
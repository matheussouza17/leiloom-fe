'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Interface para os dados do formulário de registro de cliente
export interface RegisterClientData {
  companyName: string
  userName: string
  email: string
  cpfCnpj: string
  phone: string
  password: string
  address: string
  acceptTerms: boolean
}

// Props do contexto de registro
interface RegisterClientContextProps {
  formData: RegisterClientData
  setFormData: (data: Partial<RegisterClientData>) => void
  clearFormData: () => void
}

// Estado inicial do formulário
const initialFormState: RegisterClientData = {
  companyName: '',
  userName: '',
  email: '',
  cpfCnpj: '',
  phone: '',
  password: '',
  address: '',
  acceptTerms: false,
}

// Criação do contexto
const RegisterClientContext = createContext<RegisterClientContextProps>({} as RegisterClientContextProps)

/**
 * Provider para gerenciar o estado do formulário de registro de cliente
 */
export function RegisterClientProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<RegisterClientData>(initialFormState)

  // Função para atualizar o estado do formulário
  function setFormData(data: Partial<RegisterClientData>) {
    setFormDataState((prev) => ({ ...prev, ...data }))
  }

  // Função para limpar o estado do formulário
  function clearFormData() {
    setFormDataState(initialFormState)
  }

  return (
    <RegisterClientContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </RegisterClientContext.Provider>
  )
}

/**
 * Hook para acessar o contexto de registro de cliente
 */
export function useRegisterClient() {
  const context = useContext(RegisterClientContext)
  
  if (!context) {
    throw new Error('useRegisterClient must be used within a RegisterClientProvider')
  }
  
  return context
}
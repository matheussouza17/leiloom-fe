'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface RegisterClientData {
  companyName: string
  userName: string
  email: string
  cpfCnpj: string
  phone: string
  password: string
  address: string
  acceptTerms: boolean
}

interface RegisterClientContextProps {
  formData: RegisterClientData
  setFormData: (data: Partial<RegisterClientData>) => void
  clearFormData: () => void
}

const RegisterClientContext = createContext({} as RegisterClientContextProps)

export function RegisterClientProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<RegisterClientData>({
    companyName: '',
    userName: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    password: '',
    address: '',
    acceptTerms: false,
  })

  function setFormData(data: Partial<RegisterClientData>) {
    setFormDataState((prev) => ({ ...prev, ...data }))
  }

  function clearFormData() {
    setFormDataState({
      companyName: '',
      userName: '',
      email: '',
      cpfCnpj: '',
      phone: '',
      password: '',
      address: '',
      acceptTerms: false,
    })
  }

  return (
    <RegisterClientContext.Provider value={{ formData, setFormData, clearFormData }}>
      {children}
    </RegisterClientContext.Provider>
  )
}

export function useRegisterClient() {
  return useContext(RegisterClientContext)
}

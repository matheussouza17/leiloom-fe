'use client'

import { useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { RegisterClientProvider, useRegisterClient } from '@/contexts/RegisterClientContext'
import StepOneForm from './StepOneForm'
import StepTwoAddress from './StepTwoAddress'
import StepThreeTerms from './StepThreeTerms'
import { registerClient, registerClientUser } from '@/services/clientService'
import { acceptTerms } from '@/services/termsService'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

function WizardContent() {
  const [step, setStep] = useState(1)
  const { formData, clearFormData } = useRegisterClient()
  const router = useRouter()

  async function handleSubmitAll() {
    try {
      if (!formData.acceptTerms) {
        toast.error('É necessário aceitar os termos.')
        return
      }

      const client = await registerClient(formData.companyName, formData.address)

      const clientUser = await registerClientUser(
        client.id,
        formData.userName,
        formData.email,
        formData.password,
        formData.cpfCnpj,
        formData.phone,
      )

      await acceptTerms(clientUser.id)

      clearFormData()

      toast.success('Cadastro realizado com sucesso! Faça login para continuar.')
      router.push('/login')

    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao finalizar o cadastro. Tente novamente.')
    }
  }

  function handleNextStep() {
    if (step === 3) {
      handleSubmitAll()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {step === 1 && 'Crie sua conta - Dados básicos'}
          {step === 2 && 'Endereço da Empresa'}
          {step === 3 && 'Aceite os Termos'}
        </h1>

        {step === 1 && <StepOneForm onNext={handleNextStep} />}
        {step === 2 && <StepTwoAddress onNext={handleNextStep} onBack={() => setStep(1)} />}
        {step === 3 && <StepThreeTerms onBack={() => setStep(2)} onNext={handleNextStep} />}
      </div>
    </div>
  )
}


export default function RegisterClientPage() {
  return (
    <RegisterClientProvider>
      <MainLayout>
        <WizardContent />
      </MainLayout>
    </RegisterClientProvider>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

import MainLayout from '@/layouts/MainLayout'
import { RegisterClientProvider, useRegisterClient } from '@/contexts/RegisterClientContext'
import StepOneForm from './StepOneForm'
import StepTwoDetails from './StepTwoDetails'
import StepThreePlans from './StepThreePlans'
import { registerClient, registerClientUser } from '@/services/clientService'
import { acceptTerms, getCurrentTerms } from '@/services/termsService'

function WizardContent() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { formData, clearFormData } = useRegisterClient()
  const router = useRouter()

  async function handleSubmitAll() {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      if (!formData.acceptTerms) {
        toast.error('É necessário aceitar os termos.')
        setIsSubmitting(false)
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

      const currentTerms = await getCurrentTerms()

      if (!currentTerms) {
        toast.error('Nenhum termo de uso disponível no momento. Contate o suporte.')
        setIsSubmitting(false)
        return
      }

      await acceptTerms({
        clientUserId: clientUser.id,
        termsId: currentTerms.id,
      })

      clearFormData()
      toast.success('Cadastro realizado com sucesso!')
      setStep(3) // avança para os planos

    } catch (error: any) {
      console.error('Erro ao finalizar cadastro:', error)
      toast.error(error.message || 'Erro ao finalizar o cadastro.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleNextStep() {
    if (step === 2) {
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
          {step === 2 && 'Endereço + Termos'}
          {step === 3 && 'Planos e acesso'}
        </h1>

        {step === 1 && <StepOneForm onNext={handleNextStep} />}
        {step === 2 && <StepTwoDetails onNext={handleNextStep} onBack={() => setStep(1)} />}
        {step === 3 && <StepThreePlans onBack={() => setStep(2)} />}

        {/* Indicador de progresso */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${s === step ? 'bg-yellow-400' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
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

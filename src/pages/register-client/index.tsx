'use client'

import { useState } from 'react'
import { RegisterClientProvider } from '@/contexts/RegisterClientContext'
import StepOneForm from './StepOneForm'
import StepTwoDetails from './StepTwoDetails'
import StepThreePlans from './StepThreePlans'
import MainLayout from '@/layouts/MainLayout'
export default function RegisterClientPage() {
  return (
    <MainLayout>
      <RegisterClientProvider>
        <WizardContent />
      </RegisterClientProvider>
    </MainLayout>
  )
}

function WizardContent() {
  const [step, setStep] = useState(1)

  function handleNextStep() {
    setStep(prev => prev + 1)
  }

  function handlePreviousStep() {
    setStep(prev => prev - 1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {step === 1 && 'Crie sua conta - Dados básicos'}
          {step === 2 && 'Preencha seus dados pessoais'}
          {step === 3 && 'Escolha seu plano'}
        </h1>

        {step === 1 && <StepOneForm onNext={handleNextStep} />}
        {step === 2 && <StepTwoDetails onNext={handleNextStep} onBack={handlePreviousStep} />}
        {step === 3 && <StepThreePlans onBack={handlePreviousStep} />}

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

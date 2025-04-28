'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegisterClient } from '@/contexts/RegisterClientContext'
import * as z from 'zod'

const stepThreeSchema = z.object({
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os Termos de Uso' }),
  }),
})

type StepThreeSchema = z.infer<typeof stepThreeSchema>

interface StepThreeTermsProps {
  onBack: () => void
  onNext: () => void
}

export default function StepThreeTerms({ onBack, onNext }: StepThreeTermsProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepThreeSchema>({
    resolver: zodResolver(stepThreeSchema),
  })

  const { formData, setFormData } = useRegisterClient()

function handleNextStep(data: StepThreeSchema) {
  setFormData({
    ...formData,  // Preserva os dados anteriores
    acceptTerms: data.acceptTerms,
  })
  onNext()
  console.log('Passei aqui:')
}

  return (
    <form onSubmit={handleSubmit(handleNextStep)} className="space-y-6">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          {...register('acceptTerms')}
          className="mt-1"
        />
        <label className="text-sm text-gray-700">
          Eu li e aceito os <a href="#" className="underline">Termos de Uso</a> da plataforma.
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-600 hover:underline"
        >
          Voltar
        </button>

        <button
          type="submit"
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          Finalizar Cadastro
        </button>
      </div>
    </form>
  )
}

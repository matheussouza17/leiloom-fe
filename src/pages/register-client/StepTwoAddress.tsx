'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRegisterClient } from '@/contexts/RegisterClientContext'
import * as z from 'zod'

const stepTwoSchema = z.object({
  address: z.string().min(5, 'Endereço obrigatório'),
})

type StepTwoSchema = z.infer<typeof stepTwoSchema>

interface StepTwoAddressProps {
  onNext: () => void
  onBack: () => void
}

export default function StepTwoAddress({ onNext, onBack }: StepTwoAddressProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<StepTwoSchema>({
    resolver: zodResolver(stepTwoSchema),
  })

  const { setFormData } = useRegisterClient()

    function handleNext(data: StepTwoSchema) {
    setFormData({
        address: data.address,
    })
    onNext()
    }

  return (
    <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm">Endereço da Empresa</label>
        <input
          type="text"
          {...register('address')}
          className="w-full border border-gray-300 rounded px-3 py-2 text-black"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
      </div>

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
          Avançar
        </button>
      </div>
    </form>
  )
}

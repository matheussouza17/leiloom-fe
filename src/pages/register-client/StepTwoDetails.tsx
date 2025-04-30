'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterClient } from '@/contexts/RegisterClientContext'

const schema = z.object({
  address: z.string().min(5, 'Endereço obrigatório'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os Termos de Uso',
  }),
})

type FormSchema = z.infer<typeof schema>

interface Props {
  onBack: () => void
  onNext: () => void
}

export default function StepTwoDetails({ onBack, onNext }: Props) {
  const { formData, setFormData } = useRegisterClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: formData.address,
      acceptTerms: formData.acceptTerms,
    },
  })

  function onSubmit(data: FormSchema) {
    setFormData(data)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm text-black">Endereço da Empresa</label>
        <input
          type="text"
          {...register('address')}
          className="w-full border border-gray-300 rounded px-3 py-2 text-black"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div className="flex items-start gap-3">
        <input type="checkbox" {...register('acceptTerms')} className="mt-1" />
        <label className="text-sm text-gray-700">
          Eu li e aceito os <a href="#" className="underline">Termos de Uso</a> da plataforma.
        </label>
      </div>
      {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>}

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

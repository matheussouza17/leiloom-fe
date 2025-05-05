'use client'

import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterClient } from '@/contexts/RegisterClientContext'
import { acceptTerms, getCurrentTerms } from '@/services/termsService'
import { toast } from 'react-toastify'

const schema = z.object({
  cpfCnpj: z.string().min(11, 'CPF ou CNPJ obrigatório'),
  phone: z.string().min(10, 'Telefone obrigatório'),
  address: z.string().optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar os Termos de Uso' }),
  }),
})

type FormData = z.infer<typeof schema>

export default function StepTwoDetails({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [currentTerms, setCurrentTerms] = useState<{ id: string; fileUrl?: string } | null>(null)
  const { formData, setFormData } = useRegisterClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      cpfCnpj: formData.cpfCnpj,
      phone: formData.phone,
      address: formData.address
    }
  })
  useEffect(() => {
    getCurrentTerms().then(term => {
      if (!term) {
        toast.error('Termo de uso não encontrado.')
        return
      }
      setCurrentTerms(term)
    })
  }, [])

  async function onSubmit(data: FormData) {
    try {
      await acceptTerms({
        clientUserId: formData.clientUserId,
        termsId: currentTerms?.id||'',
      })
      setFormData(data)
      onNext()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar os dados.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm text-black">CPF ou CNPJ</label>
        <input {...register('cpfCnpj')} className="w-full border px-3 py-2 rounded text-black" />
        {errors.cpfCnpj && <p className="text-red-500 text-xs">{errors.cpfCnpj.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Telefone</label>
        <input {...register('phone')} className="w-full border px-3 py-2 rounded text-black" />
        {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
      </div>
      <div className="flex items-start gap-2">
        <input type="checkbox" {...register('acceptTerms')} className="mt-1" />
        <label className="text-sm text-black">
          Eu li e aceito os{' '}
          {currentTerms?.fileUrl ? (
            <a href={currentTerms.fileUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
              Termos de Uso
            </a>
          ) : (
            <span className="text-gray-500 cursor-not-allowed underline">Termos de Uso</span>
          )}{' '}
          da plataforma.
        </label>
      </div>

      {errors.acceptTerms && <p className="text-red-500 text-xs">{errors.acceptTerms.message}</p>}
      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="text-sm text-gray-600 hover:underline">Voltar</button>
        <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300">Avançar</button>
      </div>
    </form>
  )
}

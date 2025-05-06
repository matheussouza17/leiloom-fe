'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRegisterClient } from '@/contexts/RegisterClientContext'
import { registerClient, registerClientUser } from '@/services/clientService'
import { toast } from 'react-toastify'

const schema = z.object({
  companyName: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function StepOneForm({ onNext }: { onNext: () => void }) {
  const { setFormData } = useRegisterClient()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  async function onSubmit(data: FormData) {
    try {
      const client = await registerClient(data.companyName, '')
      const clientUser = await registerClientUser(client.id, data.companyName, data.email, '', '', '')

      setFormData({
        companyName: data.companyName,
        email: data.email,
        clientId: client.id,
        clientUserId: clientUser.id
      })

      onNext()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao iniciar o cadastro.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm text-black">Nome (Pessoal ou Empresarial)</label>
        <input {...register('companyName')} className="w-full border px-3 py-2 rounded text-black" />
        {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Email</label>
        <input type="email" {...register('email')} className="w-full border px-3 py-2 rounded text-black" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
      </div>

      <button type="submit" className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300">
        Avançar
      </button>
    </form>
  )
}

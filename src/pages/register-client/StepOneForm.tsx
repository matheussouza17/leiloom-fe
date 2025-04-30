'use client'

import { useForm } from 'react-hook-form'
import { useRegisterClient } from '@/contexts/RegisterClientContext'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Schema de validação para o primeiro passo
const stepOneSchema = z.object({
  companyName: z.string().min(3, 'Nome da empresa obrigatório'),
  userName: z.string().min(3, 'Nome do usuário obrigatório'),
  email: z.string().email('Email inválido'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  password: z.string().min(6, 'Senha precisa ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type StepOneSchema = z.infer<typeof stepOneSchema>

interface StepOneFormProps {
  onNext: () => void
}

export default function StepOneForm({ onNext }: StepOneFormProps) {
  const { formData, setFormData } = useRegisterClient()
  
  const { register, handleSubmit, formState: { errors } } = useForm<StepOneSchema>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      companyName: formData.companyName,
      userName: formData.userName,
      email: formData.email,
      cpfCnpj: formData.cpfCnpj,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.password,
    }
  })

  function handleNext(data: StepOneSchema) {
    setFormData({
      companyName: data.companyName,
      userName: data.userName,
      email: data.email,
      cpfCnpj: data.cpfCnpj,
      phone: data.phone,
      password: data.password,
    })
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(handleNext)} className="space-y-6">
      <div>
        <label className="block mb-1 text-sm text-black">Nome da Empresa</label>
        <input 
          type="text" 
          {...register('companyName')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.companyName && (
          <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Nome do Usuário Principal</label>
        <input 
          type="text" 
          {...register('userName')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.userName && (
          <p className="text-red-500 text-xs mt-1">{errors.userName.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Email</label>
        <input 
          type="email" 
          {...register('email')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">CPF ou CNPJ</label>
        <input 
          type="text" 
          {...register('cpfCnpj')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.cpfCnpj && (
          <p className="text-red-500 text-xs mt-1">{errors.cpfCnpj.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Telefone</label>
        <input 
          type="text" 
          {...register('phone')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Senha</label>
        <input 
          type="password" 
          {...register('password')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm text-black">Confirme a Senha</label>
        <input 
          type="password" 
          {...register('confirmPassword')} 
          className="w-full border border-gray-300 rounded px-3 py-2 text-black" 
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 transition"
      >
        Avançar
      </button>
    </form>
  )
}
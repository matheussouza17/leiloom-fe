'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { loginBackOffice } from '@/services/authService' 
import MainLayout from '@/layouts/MainLayout'

const schema = z.object({
  login: z.string().min(3, 'Informe usuário ou e-mail'),
  password: z.string().min(6, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function BackOfficeLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { login: '', password: '' }
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const token = await loginBackOffice({
        login: data.login,
        password: data.password,
        context: 'BACKOFFICE' as const
      })
      localStorage.setItem('backofficeToken', token)
      toast.success('Bem-vindo ao Back-Office!')
      router.push('/dashboard-backoffice')
    } catch (err: any) {
      console.error(err)
      if (err?.response?.status === 401) {
        toast.error('Usuário ou senha inválidos.')
      } else {
        toast.error(err?.message || 'Erro ao fazer login.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white shadow-md p-8 rounded w-full max-w-sm space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">Login Back-Office</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-black font-medium mb-1">CPF ou E-mail</label>
              <input
                type="text"
                {...register('login')}
                className="w-full border rounded px-3 py-2 text-black focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>}
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-1">Senha</label>
              <input
                type="password"
                {...register('password')}
                className="w-full border rounded px-3 py-2 text-black focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 transition"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { loginClient } from '@/services/authService'
import MainLayout from '@/layouts/MainLayout'

const schema = z.object({
  personType: z.enum(['PF', 'PJ']),
  login: z.string().min(3, 'Informe CPF, CNPJ ou email'),
  password: z.string().min(6, 'Senha obrigatória'),
  cnpj: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [personType, setPersonType] = useState<'PF' | 'PJ'>('PF')
  const [isAdmin, setIsAdmin] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      personType: 'PF',
      login: '',
      password: '',
      cnpj: '',
    }
  })
  
  useEffect(() => {
    setValue('personType', personType)
  }, [personType, setValue])

  const cnpjValue = watch('cnpj')
  
  useEffect(() => {
    if (isAdmin && cnpjValue) {
      setValue('login', cnpjValue)
    }
  }, [isAdmin, cnpjValue, setValue])

  // Função para lidar com a mudança de tipo de pessoa com animação
  const handlePersonTypeChange = (type: 'PF' | 'PJ') => {
    if (type === personType) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      setPersonType(type);
      if (type === 'PF') {
        setIsAdmin(false);
        setValue('cnpj', '');
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  async function onSubmit(data: FormData) {
    setLoading(true)

    try {
      const payload = {
        login: data.login,
        password: data.password,
        context: 'CLIENT' as const, 
        ...(personType === 'PJ' && {
          cnpj: data.cnpj,
          isAdmin,
        }),
      }
      
      console.log('Payload:', payload) // Debugging line
      
      const token = await loginClient(payload)
      localStorage.setItem('token', token)
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard-client')
    } catch (err: any) {
      console.error('Erro no login:', err)
      if (err?.response?.status === 401) {
        toast.error('Email ou senha inválidos.')
      } else if (err?.response?.status === 403) {
        toast.error('Acesso negado.')
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
        <div className="bg-white shadow-md p-8 rounded w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-800">Entrar</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Tipo de pessoa - Estilizado */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-100 p-1 rounded-full flex gap-1 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => handlePersonTypeChange('PF')}
                  className={`flex-1 py-2 px-4 text-sm rounded-full transition-all duration-300 ${
                    personType === 'PF' 
                      ? 'bg-yellow-400 text-black font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pessoa Física
                </button>
                <button
                  type="button"
                  onClick={() => handlePersonTypeChange('PJ')}
                  className={`flex-1 py-2 px-4 text-sm rounded-full transition-all duration-300 ${
                    personType === 'PJ' 
                      ? 'bg-yellow-400 text-black font-medium shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pessoa Jurídica
                </button>
              </div>
            </div>

            {/* Área de conteúdo dinâmico com transição */}
            <div className={`space-y-4 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              {personType === 'PJ' && (
                <>
                  <div>
                    <label className="block text-sm text-black font-medium mb-1">CNPJ ou E-mail da empresa</label>
                    <input
                      type="text"
                      {...register('cnpj')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-black">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="isAdmin"
                          checked={isAdmin}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setIsAdmin(checked)
                            if (checked && cnpjValue) {
                              setValue('login', cnpjValue)
                            }
                          }}
                          className="sr-only" // Esconde o checkbox original
                        />
                        <div className={`w-5 h-5 border rounded transition-all duration-200 ${
                          isAdmin 
                            ? 'bg-yellow-400 border-yellow-500' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {isAdmin && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mx-auto mt-0.5 text-black" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span>Sou o administrador</span>
                    </label>
                  </div>
                </>
              )}

              {/* Campo de login apenas visível quando não é administrador em PJ */}
              {!(personType === 'PJ' && isAdmin) && (
                <div>
                  <label className="block text-sm text-black font-medium mb-1">
                    {personType === 'PF' ? 'CPF ou E-mail' : 'CNPJ ou E-mail'}
                  </label>
                  <input
                    type="text"
                    {...register('login')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                  />
                  {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login.message}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm text-black font-medium mb-1">Senha</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex justify-between items-center text-sm">
                <a href="/forgot-password" className="text-yellow-600 hover:underline font-medium">
                  Esqueci a senha
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-black py-2.5 rounded-lg hover:bg-yellow-300 focus:ring-4 focus:ring-yellow-200 font-medium transition-all duration-300 shadow-sm"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
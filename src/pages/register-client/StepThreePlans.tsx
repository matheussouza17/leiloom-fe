'use client'

import { useRegisterClient } from '@/contexts/RegisterClientContext'
import { loginClient } from '@/services/authService'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface StepThreePlansProps {
  onBack: () => void
}

const plans = [
  { name: 'Starter', price: 'Grátis', features: ['1 usuário', 'Sem suporte'] },
  { name: 'Essencial', price: 'R$ 49/mês', features: ['5 usuários', 'Suporte por e-mail'] },
  { name: 'Profissional', price: 'R$ 149/mês', features: ['10 usuários', 'Suporte rápido'] },
  { name: 'Enterprise', price: 'R$ 499/mês', features: ['Ilimitado', 'Suporte dedicado'] },
]

export default function StepThreePlans({ onBack }: StepThreePlansProps) {
  const { formData } = useRegisterClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    try {
      const token = await loginClient(formData.email, formData.password)
      localStorage.setItem('token', token)
      toast.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Escolha um plano (simulado)</h2>
        <p className="text-sm text-gray-600">Todos são fictícios por enquanto</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="border border-gray-300 rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
            <p className="text-yellow-600 font-medium">{plan.price}</p>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:underline"
        >
          Voltar
        </button>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
        >
          {loading ? 'Entrando...' : 'Acessar Plataforma'}
        </button>
      </div>
    </div>
  )
}

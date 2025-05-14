'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getAllPlans, createPlan, updatePlan, deletePlan } from '@/services/planService'
import MainLayout from '@/layouts/MainLayout'
import { withBackofficeAuth } from '@/hooks/withBackofficeAuth'
import { TokenPayload } from '@/utils/jwtUtils'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Pagination from '@/components/shared/Pagination'

/**
 * Interface para o objeto de plano
 */
interface Plan {
  id?: string
  name: string
  description?: string
  price: number
  durationDays: number
  isTrial: boolean
  isActive: boolean
}

interface Props {
  user: TokenPayload
}

/**
 * Página de administração de planos protegida por autenticação
 */
function PlansAdminPage({ user }: Props) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [currentAction, setCurrentAction] = useState<'create' | 'edit'>('create')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const plansPerPage = 10

  /**
   * Carrega a lista de planos do servidor
   */
  async function loadPlans() {
    try {
      setIsLoading(true)
      const data = await getAllPlans()
      setPlans(data)
    } catch (err) {
      console.error('Erro ao carregar planos:', err)
      toast.error('Erro ao carregar os planos')
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(plans.length / plansPerPage)
  const paginatedPlans = plans.slice(
    (currentPage - 1) * plansPerPage,
    currentPage * plansPerPage
  )

  useEffect(() => {
    loadPlans()
  }, [])

  /**
   * Trata o salvamento ou atualização de um plano
   * @param planData Dados do plano a ser salvo
   */
  async function handleSave(planData: Partial<Plan>) {
    try {
      setIsLoading(true)
      
      // Convertendo valores para o formato correto
      const formattedData = {
        ...planData,
        price: Number(planData.price),
        durationDays: Number(planData.durationDays),
        isTrial: Boolean(planData.isTrial),
        isActive: Boolean(planData.isActive)
      }
      
      if (editingPlan && editingPlan.id) {
        await updatePlan(editingPlan.id, formattedData)
        toast.success('Plano atualizado com sucesso!')
      } else {
        await createPlan(formattedData as Plan)
        toast.success('Novo plano criado com sucesso!')
      }
      
      setEditingPlan(null)
      setIsOpenModal(false)
      loadPlans()
    } catch (err) {
      console.error('Erro ao salvar plano:', err)
      toast.error('Erro ao salvar o plano. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Abre o modal para criar um novo plano
   */
  function handleNewPlan() {
    setEditingPlan(null)
    setCurrentAction('create')
    setIsOpenModal(true)
  }

  /**
   * Abre o modal para editar um plano existente
   */
  function handleEditPlan(plan: Plan) {
    setEditingPlan(plan)
    setCurrentAction('edit')
    setIsOpenModal(true)
  }

  /**
   * Abre o modal de confirmação para excluir um plano
   */
  function handleDeleteConfirmation(plan: Plan) {
    setPlanToDelete(plan)
    setIsDeleteModalOpen(true)
  }

  /**
   * Exclui um plano após confirmação
   */
  async function handleDeletePlan() {
    if (!planToDelete || !planToDelete.id) return

    try {
      setIsLoading(true)
      await deletePlan(planToDelete.id)
      toast.success('Plano removido com sucesso!')
      setIsDeleteModalOpen(false)
      setPlanToDelete(null)
      loadPlans()
    } catch (err) {
      console.error('Erro ao excluir plano:', err)
      toast.error('Erro ao excluir o plano. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Fecha o modal
   */
  function closeModal() {
    setIsOpenModal(false)
  }

  /**
   * Formata o valor para exibição em Reais
   */
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  /**
   * Formata o período de duração do plano
   */
  function formatDuration(days: number) {
    if (days === 1) return '1 dia'
    if (days < 30) return `${days} dias`
    if (days === 30 || days === 31) return '1 mês'
    if (days >= 365) {
      const years = Math.floor(days / 365)
      return years === 1 ? '1 ano' : `${years} anos`
    }
    const months = Math.floor(days / 30)
    return `${months} meses`
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="mx-auto py-4 px-4 w-full max-w-none">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-500">Gerenciamento de Planos</h1>
          <button 
            onClick={handleNewPlan} 
            className="bg-yellow-400 text-black font-medium px-5 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
            Novo Plano
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b px-6 py-4">
            <p className="text-sm text-gray-500">
              Gerencie os planos de assinatura disponíveis na plataforma.
            </p>
          </div>
          {isLoading && !plans.length ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="mt-2 text-gray-500">Carregando planos...</p>
            </div>
          ) : plans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duração</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Situação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{plan.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{plan.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatCurrency(plan.price)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDuration(plan.durationDays)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.isTrial ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Trial
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{plan.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inativo</span>
                        )}</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="text-yellow-500 hover:text-yellow-700 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
                            disabled={isLoading}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                            </svg>
                            <span>Editar</span>
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => {
                  if (p >= 1 && p <= totalPages) setCurrentPage(p)
                }}
              />
            </div>
            
          ) : (
            <div className="py-12 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <p className="mt-2">Nenhum plano cadastrado.</p>
              <button 
                onClick={handleNewPlan}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
              >
                Criar o primeiro plano
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar planos */}
      <Transition appear show={isOpenModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !isLoading && closeModal()}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    {currentAction === 'create' ? 'Adicionar novo plano' : 'Editar plano'}
                  </Dialog.Title>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formElement = e.currentTarget
                      const data = new FormData(formElement)
                      
                      const formObj = {
                        name: data.get('name') as string,
                        description: data.get('description') as string,
                        price: parseFloat(data.get('price') as string),
                        durationDays: parseInt(data.get('durationDays') as string),
                        isTrial: data.get('isTrial') === 'on',
                        isActive: data.get('isActive') === 'on'
                      }
                      
                      handleSave(formObj)
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Plano</label>
                      <input 
                        id="name"
                        name="name" 
                        type="text"
                        required
                        placeholder="Ex: Plano Mensal"
                        defaultValue={editingPlan?.name || ''} 
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <textarea 
                        id="description"
                        name="description" 
                        placeholder="Descrição do plano"
                        defaultValue={editingPlan?.description || ''} 
                        rows={3}
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 focus:ring-yellow-500 focus:border-yellow-500" 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                      <input 
                        id="price"
                        name="price" 
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        defaultValue={editingPlan?.price || ''} 
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="durationDays" className="block text-sm font-medium text-gray-700 mb-1">Duração (dias)</label>
                      <input 
                        id="durationDays"
                        name="durationDays" 
                        type="number"
                        min="1"
                        required
                        placeholder="30"
                        defaultValue={editingPlan?.durationDays || ''} 
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" 
                        disabled={isLoading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Ex: 30 (para 1 mês), 365 (para 1 ano)
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input 
                          id="isActive"
                          type="checkbox" 
                          name="isActive" 
                          defaultChecked={editingPlan?.isActive} 
                          disabled={isLoading}
                          className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isActive" className="font-medium text-gray-700">Ativo</label>
                        <p className="text-gray-500">Define se o plano está ativo ou não.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input 
                          id="isTrial"
                          type="checkbox" 
                          name="isTrial" 
                          defaultChecked={editingPlan?.isTrial} 
                          disabled={isLoading}
                          className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isTrial" className="font-medium text-gray-700">Este é um plano de teste (trial)</label>
                        <p className="text-gray-500">Planos de teste normalmente possuem duração limitada.</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        onClick={closeModal}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="inline-flex justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Salvando...
                          </>
                        ) : currentAction === 'create' ? 'Adicionar' : 'Atualizar'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmação de exclusão */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => !isLoading && setIsDeleteModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 mb-4"
                  >
                    Confirmar exclusão
                  </Dialog.Title>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Tem certeza que deseja excluir o plano <span className="font-semibold">{planToDelete?.name}</span>?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta ação não pode ser desfeita.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                      onClick={() => setIsDeleteModalOpen(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="button" 
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      onClick={handleDeletePlan}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Excluindo...
                        </>
                      ) : 'Excluir'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      </div>
    </MainLayout>
  )
}

export default withBackofficeAuth(PlansAdminPage)
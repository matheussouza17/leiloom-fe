'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getTerms, uploadTerm, updateTerm } from '@/services/termsService'
import MainLayout from '@/layouts/MainLayout'
import { withBackofficeAuth } from '@/hooks/withBackofficeAuth'
import { TokenPayload } from '@/utils/jwtUtils'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import Pagination from '@/components/shared/Pagination'

/**
 * Interface para o objeto de termo
 */
interface Term {
  id: string
  fileUrl: string
  description: string
  isCurrent: boolean
  uploadedById: string
}

interface Props {
  user: TokenPayload
}

/**
 * Página de administração de termos de uso protegida por autenticação
 */
function TermsAdminPage({ user }: Props) {
  const [terms, setTerms] = useState<Term[]>([])
  const [editingTerm, setEditingTerm] = useState<Term | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [currentAction, setCurrentAction] = useState<'create' | 'edit'>('create')
  const [currentPage, setCurrentPage] = useState(1)
  const termsPerPage = 10

  /**
   * Carrega a lista de termos do servidor
   */
  async function loadTerms() {
    try {
      setIsLoading(true)
      const data = await getTerms()
      setTerms(data)
    } catch (err) {
      console.error('Erro ao carregar termos:', err)
      toast.error('Erro ao carregar os termos de uso')
    } finally {
      setIsLoading(false)
    }
  }

    const totalPages = Math.ceil(terms.length / termsPerPage)
    const paginatedTerms = terms.slice(
    (currentPage - 1) * termsPerPage,
      currentPage * termsPerPage
  )

  useEffect(() => {
    loadTerms()
  }, [])

  /**
   * Trata o salvamento ou atualização de um termo
   * @param termData Dados do termo a ser salvo
   */
  async function handleSave(termData: Partial<Term>) {
    try {
      setIsLoading(true)
      
      // Adicionando o ID do usuário logado nos dados
      const termWithUser = {
        ...termData,
        uploadedById: user.sub // Usando o ID do usuário atual
      }
      
      if (editingTerm) {
        await updateTerm(editingTerm.id, termWithUser)
        toast.success('Termo atualizado com sucesso!')
      } else {
        await uploadTerm(termWithUser)
        toast.success('Novo termo criado com sucesso!')
      }
      
      setEditingTerm(null)
      setIsOpenModal(false)
      loadTerms()
    } catch (err) {
      console.error('Erro ao salvar termo:', err)
      toast.error('Erro ao salvar o termo de uso. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Abre o modal para criar um novo termo
   */
  function handleNewTerm() {
    setEditingTerm(null)
    setCurrentAction('create')
    setIsOpenModal(true)
  }

  /**
   * Abre o modal para editar um termo existente
   */
  function handleEditTerm(term: Term) {
    setEditingTerm(term)
    setCurrentAction('edit')
    setIsOpenModal(true)
  }

  /**
   * Fecha o modal
   */
  function closeModal() {
    setIsOpenModal(false)
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="mx-auto py-4 px-4 w-full max-w-none">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-500 ">Gerenciamento de Termos de Uso</h1>
          <button 
            onClick={handleNewTerm} 
            className="bg-yellow-400 text-black font-medium px-5 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
            Novo Termo
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b px-6 py-4">
            <p className="text-sm text-gray-500">
              Gerencie os termos de uso da plataforma. O termo marcado como atual será exibido para os usuários.
            </p>
          </div>
          {isLoading && !terms.length ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              <p className="mt-2 text-gray-500">Carregando termos...</p>
            </div>
          ) : terms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTerms.map((term) => (
                    <tr key={term.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 ">{term.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={term.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>Visualizar</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                            <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                          </svg>
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {term.isCurrent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ativo
                          </span>
                        ) : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEditTerm(term)}
                          className="text-yellow-500 hover:text-yellow-700 font-medium hover:underline disabled:opacity-50 flex items-center gap-1"
                          disabled={isLoading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                          </svg>
                          <span>Editar</span>
                        </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">Nenhum termo de uso cadastrado.</p>
              <button 
                onClick={handleNewTerm}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
              >
                Criar o primeiro termo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar/editar termos */}
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
                    {currentAction === 'create' ? 'Adicionar novo termo' : 'Editar termo'}
                  </Dialog.Title>
                  
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formElement = e.currentTarget
                      const data = new FormData(formElement)
                      
                      const formObj = {
                        fileUrl: data.get('fileUrl') as string,
                        description: data.get('description') as string,
                        isCurrent: data.get('isCurrent') === 'on'
                      }
                      
                      handleSave(formObj)
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">URL do Arquivo</label>
                      <input 
                        id="fileUrl"
                        name="fileUrl" 
                        type="url"
                        required
                        placeholder="https://exemplo.com/termos.pdf"
                        defaultValue={editingTerm?.fileUrl || ''} 
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                      <input 
                        id="description"
                        name="description" 
                        required
                        placeholder="Ex: Termos de Uso v1.0"
                        defaultValue={editingTerm?.description || ''} 
                        className="w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-500 focus:ring-yellow-500 focus:border-yellow-500" 
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input 
                          id="isCurrent"
                          type="checkbox" 
                          name="isCurrent" 
                          defaultChecked={editingTerm?.isCurrent} 
                          disabled={isLoading}
                          className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isCurrent" className="font-medium text-gray-700">Este é o termo atual</label>
                        <p className="text-gray-500">Apenas um termo pode ser marcado como atual.</p>
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
      </div>
    </MainLayout>
  )
}

export default withBackofficeAuth(TermsAdminPage)
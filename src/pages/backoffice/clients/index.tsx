'use client'

import { useEffect, useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Dialog, Transition } from '@headlessui/react'
import MainLayout from '@/layouts/MainLayout'
import Pagination from '@/components/shared/Pagination'
import { withBackofficeAuth } from '@/hooks/withBackofficeAuth'
import {
  getAllClients,
  createClient,
  updateClientAll,
} from '@/services/clientService'

/**
 * Interface para o objeto de cliente
 */
interface Client {
  id?: string
  name: string
  cpfCnpj: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  country?: string
  status: 'PENDING' | 'CONFIRMED' | 'APPROVED' | 'EXCLUDED'
  confirmationCode?: string
  isConfirmed: boolean
  createdOn?: string
  updatedOn?: string
}

function ClientsAdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const clientsPerPage = 10

  // modal de criação
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [newClient, setNewClient] = useState<Client>({
    name: '',
    cpfCnpj: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: '',
    status: 'PENDING',
    confirmationCode: '',
    isConfirmed: false,
  })

  // modal de exclusão
  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false)
  const [clientToExclude, setClientToExclude] = useState<Client | null>(null)

  const totalPages = Math.ceil(clients.length / clientsPerPage)
  const paginatedClients = clients.slice(
    (currentPage - 1) * clientsPerPage,
    currentPage * clientsPerPage
  )

  // carrega clientes do backend
  async function loadClients() {
    setIsLoading(true)
    try {
      const data = await getAllClients()
      setClients(data)
    } catch (err) {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  // abre modal de novo cliente
  function handleNewClient() {
    setNewClient({
      name: '',
      cpfCnpj: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: '',
      status: 'PENDING',
      confirmationCode: '',
      isConfirmed: false,
    })
    setIsOpenModal(true)
  }

  // salva cliente (cria)
  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await createClient(newClient)
      toast.success('Cliente criado com sucesso!')
      setIsOpenModal(false)
      loadClients()
    } catch {
      toast.error('Erro ao salvar cliente.')
    } finally {
      setIsLoading(false)
    }
  }

  // navega para tela de edição
  function handleEdit(client: Client) {
    router.push(`/backoffice/clients/${client.id}/edit`)
  }

  // abre modal de confirmar exclusão
  function handleExcludeConfirmation(client: Client) {
    setClientToExclude(client)
    setIsExcludeModalOpen(true)
  }

  // "exclui" cliente (atualiza status)
  async function handleExcludeClient() {
    if (!clientToExclude?.id) return
    setIsLoading(true)
    try {
      await updateClientAll(clientToExclude.id, {
        ...clientToExclude,
        status: 'EXCLUDED',
      })
      toast.success('Cliente excluído com sucesso!')
      setIsExcludeModalOpen(false)
      loadClients()
    } catch {
      toast.error('Erro ao excluir cliente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center bg-gray-50">
        <div className="mx-auto py-4 px-4 w-full max-w-none">
          {/* header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-500">
              Gerenciamento de Clientes
            </h1>
            <button
              onClick={handleNewClient}
              className="bg-yellow-400 text-black font-medium px-5 py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Novo Cliente
            </button>
          </div>

          {/* tabela */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b px-6 py-4">
              <p className="text-sm text-gray-500">
                Gerencie os clientes cadastrados na plataforma.
              </p>
            </div>

            {isLoading && !clients.length ? (
              <div className="py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                <p className="mt-2 text-gray-500">Carregando clientes...</p>
              </div>
            ) : clients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF/CNPJ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Situação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.cpfCnpj}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.city || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {client.state || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              client.status === 'EXCLUDED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEdit(client)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <p className="mt-2">Nenhum cliente cadastrado.</p>
                <button
                  onClick={handleNewClient}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                >
                  Criar o primeiro cliente
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Novo Cliente */}
        <Transition appear show={isOpenModal} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => !isLoading && setIsOpenModal(false)}
          >
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
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Novo Cliente
                    </Dialog.Title>

                    <form onSubmit={handleSave} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nome da Empresa
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Ex: Empresa XPTO Ltda"
                          value={newClient.name}
                          onChange={(e) =>
                            setNewClient({ ...newClient, name: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="cpfCnpj"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          CPF/CNPJ
                        </label>
                        <input
                          id="cpfCnpj"
                          name="cpfCnpj"
                          type="text"
                          required
                          placeholder="12345678900"
                          value={newClient.cpfCnpj}
                          onChange={(e) =>
                            setNewClient({
                              ...newClient,
                              cpfCnpj: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                          disabled={isLoading}
                        />
                      </div>

                      {/* --- campos de endereço --- */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="cep"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            CEP
                          </label>
                          <input
                            id="cep"
                            name="cep"
                            type="text"
                            placeholder="74343340"
                            value={newClient.cep}
                            onChange={(e) =>
                              setNewClient({ ...newClient, cep: e.target.value })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Cidade
                          </label>
                          <input
                            id="city"
                            name="city"
                            type="text"
                            placeholder="Goiânia"
                            value={newClient.city}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                city: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="street"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Rua
                          </label>
                          <input
                            id="street"
                            name="street"
                            type="text"
                            placeholder="Av. T-63"
                            value={newClient.street}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                street: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="state"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Estado
                          </label>
                          <input
                            id="state"
                            name="state"
                            type="text"
                            placeholder="GO"
                            value={newClient.state}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                state: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="number"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Número
                          </label>
                          <input
                            id="number"
                            name="number"
                            type="text"
                            placeholder="1234"
                            value={newClient.number}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                number: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="complement"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Complemento
                          </label>
                          <input
                            id="complement"
                            name="complement"
                            type="text"
                            placeholder="Sala 05"
                            value={newClient.complement}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                complement: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="neighborhood"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Bairro
                          </label>
                          <input
                            id="neighborhood"
                            name="neighborhood"
                            type="text"
                            placeholder="Setor Bueno"
                            value={newClient.neighborhood}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                neighborhood: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                        <div className="col-span-2">
                          <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            País
                          </label>
                          <input
                            id="country"
                            name="country"
                            type="text"
                            placeholder="Brasil"
                            value={newClient.country}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                country: e.target.value,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="isConfirmed"
                            name="isConfirmed"
                            type="checkbox"
                            checked={newClient.isConfirmed}
                            onChange={(e) =>
                              setNewClient({
                                ...newClient,
                                isConfirmed: e.target.checked,
                              })
                            }
                            disabled={isLoading}
                            className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="isConfirmed"
                            className="font-medium text-gray-700"
                          >
                            Confirmado
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                          onClick={() => setIsOpenModal(false)}
                          disabled={isLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium text-black shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Salvando...' : 'Salvar'}
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
        <Transition appear show={isExcludeModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            onClose={() => !isLoading && setIsExcludeModalOpen(false)}
          >
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
                        Tem certeza que deseja excluir o cliente{' '}
                        <span className="font-semibold">
                          {clientToExclude?.name}
                        </span>
                        ?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Esta ação apenas altera o status para EXCLUDED.
                      </p>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                        onClick={() => setIsExcludeModalOpen(false)}
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        onClick={handleExcludeClient}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Excluindo...' : 'Excluir'}
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

export default withBackofficeAuth(ClientsAdminPage)

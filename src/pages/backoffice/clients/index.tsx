'use client'

import { useEffect, useState, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Dialog, Transition } from '@headlessui/react'
import MainLayout from '@/layouts/MainLayout'
import { withBackofficeAuth } from '@/hooks/withBackofficeAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ActionButton } from '@/components/shared/ActionButton'
import { ConfirmationModal } from '@/components/shared/ConfirmationModal'
import { usePagedData } from '@/hooks/usePagedData'
import {
  getAllClients,
  createClient,
  updateClientAll,
} from '@/services/clientService'
import Client from '@/services/Interfaces'

function ClientsAdminPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { currentPage, totalPages, paginatedData, goToPage, resetToFirstPage } = usePagedData(clients, 10)
  
  const statusMap: Record<Client['status'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    PENDING: { label: 'Pendente', variant: 'warning' },
    CONFIRMED: { label: 'Confirmado', variant: 'info' },
    APPROVED: { label: 'Aprovado', variant: 'success' },
    EXCLUDED: { label: 'Excluído', variant: 'error' },
  }

  const [isOpenModal, setIsOpenModal] = useState(false)
  const [newClient, setNewClient] = useState<Client>({
  clientId:   '',
  name:       '',
  email:      '',
  phone:      '',
  role:       'ClientOwner',
  id:              undefined,
  cpfCnpj:         '',
  cep:             '',
  street:          '',
  number:          '',
  complement:      '',
  neighborhood:    '',
  city:            '',
  state:           '',
  country:         'Brasil',
  status:          'PENDING',
  confirmationCode:'',
  isConfirmed:     false,
  createdOn:       undefined,
  updatedOn:       undefined,
  clientUsers:     undefined,
  })

  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false)
  const [clientToExclude, setClientToExclude] = useState<Client | null>(null)

  // Configuração das colunas da tabela
  interface Column<T> {
    key: keyof T | string
    header: string
    render?: (value: any, row: T) => React.ReactNode
  }

  const columns: Column<Client>[] = [
    { key: 'name', header: 'Nome' },
    { key: 'cpfCnpj', header: 'CPF/CNPJ' },
    { key: 'city', header: 'Cidade' },
    { key: 'state', header: 'Estado' },
    {
      key: 'status',
      header: 'Situação',
      render: (status: Client['status']) => (
        <StatusBadge variant={statusMap[status].variant}>
          {statusMap[status].label}
        </StatusBadge>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (_: unknown, client: Client) => (
        <div className="flex space-x-4">
          <ActionButton
            variant="edit"
            onClick={() => handleEdit(client)}
            disabled={isLoading}
          />
        </div>
      )
    }
  ]

  async function loadClients() {
    setIsLoading(true)
    try {
      const data = await getAllClients()
      setClients(data)
      resetToFirstPage()
    } catch (err) {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  function handleNewClient() {
    setNewClient({
  clientId:   '',
  name:       '',
  email:      '',
  phone:      '',
  role:       'ClientOwner',
  id:              undefined,
  cpfCnpj:         '',
  cep:             '',
  street:          '',
  number:          '',
  complement:      '',
  neighborhood:    '',
  city:            '',
  state:           '',
  country:         '',
  status:          'PENDING',
  confirmationCode:'',
  isConfirmed:     false,
  createdOn:       undefined,
  updatedOn:       undefined,
  clientUsers:     undefined,
    })
    setIsOpenModal(true)
  }

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

  function handleEdit(client: Client) {
    router.push(`/backoffice/clients/${client.id}/edit`)
  }

  function handleExcludeConfirmation(client: Client) {
    setClientToExclude(client)
    setIsExcludeModalOpen(true)
  }

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
          <PageHeader
            title="Gerenciamento de Clientes"
            buttonText="Novo Cliente"
            onButtonClick={handleNewClient}
            isLoading={isLoading}
          />

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b px-6 py-4">
              <p className="text-sm text-gray-500">
                Gerencie os clientes cadastrados na plataforma.
              </p>
            </div>

            <DataTable
              data={clients}
              columns={columns}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={10}
              onPageChange={goToPage}
              isLoading={isLoading}
              emptyStateTitle="Nenhum cliente cadastrado."
              onCreateFirst={handleNewClient}
              createFirstText="Criar o primeiro cliente"
            />
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

        <ConfirmationModal
          isOpen={isExcludeModalOpen}
          onClose={() => setIsExcludeModalOpen(false)}
          onConfirm={handleExcludeClient}
          title="Confirmar exclusão"
          message={`Tem certeza que deseja excluir o cliente ${clientToExclude?.name}? Esta ação apenas altera o status para EXCLUDED.`}
          confirmButtonText="Excluir"
          isLoading={isLoading}
          variant="danger"
        />
      </div>
    </MainLayout>
  )
}

export default withBackofficeAuth(ClientsAdminPage)
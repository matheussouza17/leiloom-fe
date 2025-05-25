'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { getClientById, updateClientAll } from '@/services/clientService'
import {
  getClientUsers,
  createClientUserAdm,
  updateClientUser,
} from '@/services/clientUserService'
import ClientUser from '@/services/Interfaces' 
import Client from '@/services/Interfaces' 

function ClientEditPage() {
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const clientId = params?.clientId
  const [client, setClient] = useState<Client | null>(null)
  const [users, setUsers] = useState<ClientUser[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<ClientUser | null>(null)

  const { currentPage, totalPages, paginatedData, goToPage, resetToFirstPage } =
    usePagedData(users, 10)


  const columns = [
              { key: 'name', header: 'Nome' },
              { key: 'email', header: 'Email' },
              { key: 'phone', header: 'Telefone' },
              { key: 'cpfCnpj', header: 'CPF/CNPJ' },
              { key: 'role', header: 'Função' },
              {
                key: 'status', header: 'Situação', render: (s: string) => (
                  <StatusBadge variant={
                    s === 'APPROVED' ? 'success' : s === 'PENDING' ? 'warning' : s === 'CONFIRMED' ? 'info' : 'error'
                  }>{s}</StatusBadge>
                )
              },
              {
                key: 'actions', header: 'Ações', render: (_: any, u: ClientUser) => (
                  <div className="flex space-x-2">
                    <ActionButton variant="edit" onClick={() => { setUserAction('edit'); setEditingUser(u); setIsUserModalOpen(true) }} disabled={isLoading} />
                    <ActionButton variant="delete" onClick={() => { setUserToDelete(u); setIsDeleteModalOpen(true) }} disabled={isLoading} />
                  </div>
                )
              }
            ]
  useEffect(() => {
  if (!clientId) return;
  loadAll();
}, [clientId]);

async function loadAll() {
  setIsLoading(true);
  try {
    const c = await getClientById(clientId!);
    setClient(c);
    setUsers(c.clientUsers || []);
    resetToFirstPage();
  } catch {
    toast.error('Erro ao carregar dados do cliente');
  } finally {
    setIsLoading(false);
  }
}
  // Salvar client
  async function saveClient(form: Partial<Client>) {
    setIsLoading(true)
    try {
      await updateClientAll(clientId!, form)
      toast.success('Cliente atualizado com sucesso!')
      loadAll()
    } catch {
      toast.error('Erro ao atualizar cliente')
    } finally {
      setIsLoading(false)
    }
  }

  // Gerenciar usuário (create/edit/delete) – reaproveita service acima
  async function saveUser(payload: Partial<ClientUser> & { password?: string }) {
    setIsLoading(true)
    try {
      if (userAction === 'edit' && editingUser?.id) {
        await updateClientUser(editingUser.id, payload)
        toast.success('Usuário atualizado')
      } else {
        await createClientUserAdm({ ...payload as ClientUser, clientId: clientId! })
        toast.success('Usuário criado')
      }
      setIsUserModalOpen(false)
      loadAll()
    } catch {
      toast.error('Erro ao salvar usuário')
    } finally {
      setIsLoading(false)
    }
  }


  if (!client) return null

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center bg-gray-50">
        <div className="mx-auto py-4 px-4 w-full max-w-none">

          <PageHeader
            title="Editar Cliente"
            buttonText="Salvar Cliente"
            onButtonClick={() => saveClient(client!)}
            isLoading={isLoading}
          />

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                value={client.name}
                onChange={e => setClient({ ...client, name: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
              <input
                type="text"
                value={client.cpfCnpj}
                onChange={e => setClient({ ...client, cpfCnpj: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input
                  type="text"
                  value={client.cep ?? ''}
                  onChange={e => setClient({ ...client, cep: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade</label>
                <input
                  type="text"
                  value={client.city?? ''}
                  onChange={e => setClient({ ...client, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rua</label>
                <input
                  type="text"
                  value={client.street?? ''}
                  onChange={e => setClient({ ...client, street: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <input
                  type="text"
                  value={client.state?? ''}
                  onChange={e => setClient({ ...client, state: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Número</label>
                <input
                  type="text"
                  value={client.number?? ''}
                  onChange={e => setClient({ ...client, number: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Complemento</label>
                <input
                  type="text"
                  value={client.complement?? ''}
                  onChange={e => setClient({ ...client, complement: e.target.value })}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bairro</label>
              <input
                type="text"
                value={client.neighborhood?? ''}
                onChange={e => setClient({ ...client, neighborhood: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">País</label>
              <input
                type="text"
                value={client.country?? ''}
                onChange={e => setClient({ ...client, country: e.target.value })}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Situação</label>
                <select
                  value={client.status}
                  onChange={e => setClient({ ...client, status: e.target.value as any })}
                  className="border p-2 rounded text-gray-500"
                  disabled={isLoading}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="EXCLUDED">EXCLUDED</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={client.isConfirmed}
                  onChange={e => setClient({ ...client, isConfirmed: e.target.checked })}
                  disabled={isLoading}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Confirmado</label>
              </div>
            </div>
          </div>
          </div>

          <PageHeader
            title="Usuários do Cliente"
            buttonText="Novo Usuário"
            onButtonClick={() => { setUserAction('create'); setEditingUser(null); setIsUserModalOpen(true) }}
            isLoading={isLoading}
          />

          <DataTable
            data={paginatedData}
            columns={columns}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={10}
            onPageChange={goToPage}
            isLoading={isLoading}
            emptyStateTitle="Nenhum usuário cadastrado."
            onCreateFirst={() => { setUserAction('create'); setEditingUser(null); setIsUserModalOpen(true) }}
            createFirstText="Criar o primeiro usuário"
          />

          {/* Modal Create/Edit User */}
          <Transition appear show={isUserModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={() => !isLoading && setIsUserModalOpen(false)}>
              <Transition.Child as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/25" />
              </Transition.Child>
              <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
                <Transition.Child as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded-lg shadow-xl">
                    <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                      {userAction === 'create' ? 'Adicionar usuário' : 'Editar usuário'}
                    </Dialog.Title>
                    <form onSubmit={e => {
                      e.preventDefault()
                      const f = new FormData(e.currentTarget)
                      const obj: any = Object.fromEntries(f)
                      saveUser(obj)
                    }} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input id="name" name="name" type="text" defaultValue={editingUser?.name} required className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}/>
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" name="email" type="email" defaultValue={editingUser?.email} required className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}/>
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input id="phone" name="phone" type="text" defaultValue={editingUser?.phone} required className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}/>
                      </div>
                      <div>
                        <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                        <input id="cpfCnpj" name="cpfCnpj" type="text" defaultValue={editingUser?.cpfCnpj} required className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}/>
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Função</label>
                        <select id="role" name="role" defaultValue={editingUser?.role} className="text-gray-500 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}>
                          <option>ClientOwner</option>
                          <option>ClientAdmin</option>
                          <option>ClientFinancial</option>
                          <option>ClientOperator</option>
                        </select>
                      </div>
                      {userAction === 'edit' && (
                        <>
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Situação</label>
                            <select id="status" name="status" defaultValue={editingUser?.status} className="text-gray-500 w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-500" disabled={isLoading}>
                              <option>PENDING</option>
                              <option>CONFIRMED</option>
                              <option>APPROVED</option>
                              <option>EXCLUDED</option>
                            </select>
                          </div>
                          <div className="flex items-center">
                            <input id="isConfirmed" name="isConfirmed" type="checkbox" defaultChecked={editingUser?.isConfirmed} disabled={isLoading} className="mr-2"/>
                            <label htmlFor="isConfirmed" className="text-sm text-gray-700">Confirmado</label>
                          </div>
                        </>
                      )}
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 border rounded">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-yellow-400 rounded text-black">{userAction === 'create' ? 'Adicionar' : 'Atualizar'}</button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition>

        </div>
      </div>
    </MainLayout>
  )
}

export default withBackofficeAuth(ClientEditPage)

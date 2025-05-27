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
import { usePagedData } from '@/hooks/usePagedData'
import { getClientById, updateClientAll } from '@/services/clientService'
import {
  createClientUserAdm,
  updateClientUser,
} from '@/services/clientUserService'
import ClientUser from '@/services/Interfaces' 
import Client from '@/services/Interfaces' 
import { getCountries } from '@/services/countryService'
import { getCitiesByCountryCode, City } from '@/services/cityService'
import { Combobox } from '@headlessui/react'


function ClientEditPage() {
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const clientId = params?.clientId
  const [client, setClient] = useState<Client | null>(null)
  const [users, setUsers] = useState<ClientUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const statusMap: Record<Client['status'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    PENDING: { label: 'Pendente', variant: 'warning' },
    CONFIRMED: { label: 'Confirmado', variant: 'info' },
    APPROVED: { label: 'Aprovado', variant: 'success' },
    EXCLUDED: { label: 'Excluído', variant: 'error' },
  }
  
  const roleMap: Record<Client['role'], { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    ClientOwner: { label: 'Owner', variant: 'warning' },
    ClientAdmin: { label: 'Admin', variant: 'info' },
    ClientFinancial: { label: 'Financeiro', variant: 'success' },
    ClientOperator: { label: 'Operador', variant: 'error' },
  }
  interface Country {
  code: string
  name: string
  }

  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [userAction, setUserAction] = useState<'create' | 'edit'>('create')
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null)
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [filteredCities, setFilteredCities] = useState<City[]>([])
  const { currentPage, totalPages, paginatedData, goToPage, resetToFirstPage } =
    usePagedData(users, 10)

  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])


  const columns = [
    { key: 'name', header: 'Nome' },
    { key: 'email', header: 'Email', className: 'hidden sm:table-cell' },
    { key: 'phone', header: 'Telefone', className: 'hidden md:table-cell' },
    { key: 'cpfCnpj', header: 'CPF/CNPJ', className: 'hidden lg:table-cell' },
    { 
      key: 'role', 
      header: 'Função',
      className: 'hidden sm:table-cell',
      render: (role: Client['role']) => roleMap[role].label
    },
    {
      key: 'status', 
      header: 'Status', 
      render: (status: Client['status']) => (
        <StatusBadge variant={statusMap[status].variant}>
          {statusMap[status].label}
        </StatusBadge>
      )
    },
    {
      key: 'actions', 
      header: 'Ações', 
      render: (_: any, u: ClientUser) => (
        <div className="flex justify-end">
          <ActionButton 
            variant="edit" 
            onClick={() => { 
              setUserAction('edit'); 
              setEditingUser(u); 
              setIsUserModalOpen(true) 
            }} 
            disabled={isLoading} 
          />
        </div>
      )
    }
  ]

  useEffect(() => {
    if (!clientId) return;
    loadAll();
    loadCountries();
  }, [clientId]);

  useEffect(() => {
    if (!client?.country) return
    const countryObj = countries.find(c => c.name === client.country)
    if (!countryObj) return

    getCitiesByCountryCode(countryObj.code)
      .then(data => {
        setCities(data)
        setFilteredCities(data)
      })
      .catch(() => setCities([]))
  }, [client?.country])

  async function loadCountries() {
    setIsLoadingCountries(true);
    try {
      const countriesData = await getCountries();
      setCountries(countriesData);
      setFilteredCountries(countriesData);
    } catch (error) {
      console.error('Erro ao carregar países:', error);
      setCountries([
        { code: 'BR', name: 'Brasil' },
        { code: 'US', name: 'Estados Unidos' },
        { code: 'AR', name: 'Argentina' },
        { code: 'UY', name: 'Uruguai' },
        { code: 'PY', name: 'Paraguai' },
        { code: 'CL', name: 'Chile' },
        { code: 'PE', name: 'Peru' },
        { code: 'CO', name: 'Colômbia' },
        { code: 'VE', name: 'Venezuela' },
        { code: 'EC', name: 'Equador' }
      ]);
    } finally {
      setIsLoadingCountries(false);
    }
  }

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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">

          {/* Header da página */}
          <div className="mb-6">
            <PageHeader
              title="Editar Cliente"
              buttonText="Salvar Cliente"
              onButtonClick={() => saveClient(client!)}
              isLoading={isLoading}
            />
          </div>

          {/* Informações do Cliente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Informações do Cliente</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Dados principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={client.name}
                    onChange={e => setClient({ ...client, name: e.target.value })}
                    className="w-full border border-gray-300 text-gray-700 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                  <input
                    type="text"
                    value={client.cpfCnpj}
                    onChange={e => setClient({ ...client, cpfCnpj: e.target.value })}
                    className="w-full border text-gray-700 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Endereço</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                    <Combobox value={client.country ?? ''} onChange={(value) => setClient({ ...client, country: value??'' })} disabled={isLoading || isLoadingCountries}>
                      <div className="relative">
                        <Combobox.Input
                          className="w-full border text-gray-700 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                          displayValue={(value: string) => value}
                          onChange={(e) => {
                            const query = e.target.value.toLowerCase()
                            const filtered = countries.filter(c => c.name.toLowerCase().includes(query))
                            setFilteredCountries(filtered)
                          }}
                        />
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                          {(filteredCountries.length > 0 ? filteredCountries : countries).map((country) => (
                            <Combobox.Option
                              key={country.code}
                              value={country.name}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 px-4 ${
                                  active ? 'bg-yellow-100 text-black' : 'text-gray-900'
                                }`
                              }
                            >
                              {country.name}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </div>
                    </Combobox>

                    {isLoadingCountries && (
                      <p className="text-xs text-gray-500 mt-1">Carregando países...</p>
                    )}
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <Combobox
                    value={client.city ?? ''}
                    onChange={(value) => setClient({ ...client, city: value??'' })}
                    disabled={isLoading}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                        displayValue={(value: string) => value}
                        onChange={(e) => {
                          const query = e.target.value.toLowerCase()
                          const filtered = cities.filter(city => city.name.toLowerCase().includes(query))
                          setFilteredCities(filtered)
                        }}
                      />
                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                        {(filteredCities.length > 0 ? filteredCities : cities).map((city) => (
                          <Combobox.Option
                            key={city.name}
                            value={city.name}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 px-4 ${
                                active ? 'bg-yellow-100 text-black' : 'text-gray-900'
                              }`
                            }
                          >
                            {city.name}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>

                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <input
                      type="text"
                      value={client.state ?? ''}
                      onChange={e => setClient({ ...client, state: e.target.value })}
                      className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={client.cep ?? ''}
                      onChange={e => setClient({ ...client, cep: e.target.value })}
                      className="w-full border text-gray-700 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={client.number ?? ''}
                      onChange={e => setClient({ ...client, number: e.target.value })}
                      className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={client.complement ?? ''}
                      onChange={e => setClient({ ...client, complement: e.target.value })}
                      className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={client.neighborhood ?? ''}
                      onChange={e => setClient({ ...client, neighborhood: e.target.value })}
                      className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={client.street ?? ''}
                      onChange={e => setClient({ ...client, street: e.target.value })}
                      className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Situação</label>
                  <select
                    value={client.status}
                    onChange={e => setClient({ ...client, status: e.target.value as any })}
                    className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    disabled={isLoading}
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="PENDING">Pendente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="APPROVED">Aprovado</option>
                    <option value="EXCLUDED">Excluído</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Usuários */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Usuários do Cliente</h2>
                <button
                  onClick={() => { 
                    setUserAction('create'); 
                    setEditingUser(null); 
                    setIsUserModalOpen(true) 
                  }}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 bg-yellow-400 text-black text-sm font-medium rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Novo Usuário
                </button>
              </div>
            </div>

            <div className="overflow-hidden">
              <DataTable
                data={paginatedData}
                columns={columns}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={10}
                onPageChange={goToPage}
                isLoading={isLoading}
                emptyStateTitle="Nenhum usuário cadastrado."
                onCreateFirst={() => { 
                  setUserAction('create'); 
                  setEditingUser(null); 
                  setIsUserModalOpen(true) 
                }}
                createFirstText="Criar o primeiro usuário"
              />
            </div>
          </div>

          {/* Modal Create/Edit User */}
          <Transition appear show={isUserModalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => !isLoading && setIsUserModalOpen(false)}>
              <Transition.Child as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
              </Transition.Child>
              
              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                  <Transition.Child as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                          {userAction === 'create' ? 'Adicionar usuário' : 'Editar usuário'}
                        </Dialog.Title>
                      </div>
                      
                      <form onSubmit={e => {
                        e.preventDefault()
                        const f = new FormData(e.currentTarget)
                        const obj: any = Object.fromEntries(f)
                        saveUser(obj)
                      }} className="p-6 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                          <input 
                            id="name" 
                            name="name" 
                            type="text" 
                            defaultValue={editingUser?.name} 
                            required 
                            className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            defaultValue={editingUser?.email} 
                            required 
                            className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                            disabled={isLoading}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                            <input 
                              id="phone" 
                              name="phone" 
                              type="text" 
                              defaultValue={editingUser?.phone} 
                              required 
                              className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                              disabled={isLoading}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                            <input 
                              id="cpfCnpj" 
                              name="cpfCnpj" 
                              type="text" 
                              defaultValue={editingUser?.cpfCnpj} 
                              required 
                              className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                          <select 
                            id="role" 
                            name="role" 
                            defaultValue={editingUser?.role} 
                            className="w-full border text-gray-700 border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                            disabled={isLoading}
                          >
                            <option value="" disabled>Selecione...</option>
                            <option value="ClientOwner">Owner</option>
                            <option value="ClientAdmin">Admin</option>
                            <option value="ClientFinancial">Financeiro</option>
                            <option value="ClientOperator">Operador</option>
                          </select>
                        </div>
                        
                        {userAction === 'edit' && (
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Situação</label>
                            <select 
                              id="status" 
                              name="status" 
                              defaultValue={editingUser?.status} 
                              className="w-full text-gray-700 border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors" 
                              disabled={isLoading}
                            >
                              <option value="" disabled>Selecione...</option>
                              <option value="PENDING">Pendente</option>
                              <option value="CONFIRMED">Confirmado</option>
                              <option value="APPROVED">Aprovado</option>
                              <option value="EXCLUDED">Excluído</option>
                            </select>
                          </div>
                        )}
                        
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsUserModalOpen(false)} 
                            className="px-4 py-2  border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                            disabled={isLoading}
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="px-4 py-2 bg-yellow-400 rounded-md text-black font-medium hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {userAction === 'create' ? 'Adicionar' : 'Atualizar'}
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
      </div>
    </MainLayout>
  )
}

export default withBackofficeAuth(ClientEditPage)
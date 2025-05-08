'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowRightIcon, Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid'
import { useAuth } from '@/hooks/useAuth'         // ajuste para o caminho real
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  return (
    <header className="bg-neutral-900 text-white text-xs font-medium">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo + Nome */}
        <div className="flex items-center gap-2">
          <Link href="/" aria-label="Leiloom">
            <Image src="/logo.png" alt="Logo Leiloom" width={150} height={150} priority />
          </Link>
        </div>

       {/* Menu Desktop */}
      <nav className="hidden md:flex items-center gap-6">
          {/* Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-yellow-400 transition">
            Menu 1
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white text-black rounded shadow-md z-50 min-w-[200px] py-2">
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Opção 1</Link>
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Opção 2</Link>
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100 text-sm">Opção 3</Link>
            </div>
          </div>

          <Link href="#" className="hover:text-yellow-400 transition">Menu 2</Link>
          <Link href="#" className="hover:text-yellow-400 transition">Menu 3</Link>
          <Link href="#" className="hover:text-yellow-400 transition">Menu 4</Link>
          <Link href="#" className="hover:text-yellow-400 transition">Menu 5</Link>
        </nav>

        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="flex items-center text-white hover:text-yellow-400 transition text-[12px]"
              >
                <UserCircleIcon className="h-5 w-5 mr-1" />
                Olá, {user?.email.split('@')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-white hover:text-yellow-400 transition text-[12px]"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center text-white hover:text-yellow-400 transition text-[12px]"
              >
                Acesse sua conta
                <ArrowRightIcon className="ml-1 h-4 w-4 text-white" />
              </Link>
              <Link
                href="/register-client"
                className="bg-yellow-400 text-black px-4 py-1.5 text-[12px] rounded hover:bg-yellow-300 transition min-w-[92px] h-[32px] flex items-center justify-center font-medium"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        {/* Botão Mobile */}
        <button onClick={() => setIsOpen(true)} className="md:hidden text-white">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Drawer Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50">
          <div className="fixed left-0 top-0 w-64 h-full bg-white text-black p-6 flex flex-col gap-4 z-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={() => setIsOpen(false)}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* links gerais */}
            <Link href="#" onClick={() => setIsOpen(false)} className="hover:text-yellow-600">Leilões</Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="hover:text-yellow-600">Lotes</Link>
            {/* ... */}

            <hr />

            {/* Ações Mobile */}
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-sm text-neutral-700"
                >
                  <UserCircleIcon className="h-5 w-5" /> Perfil
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false) }}
                  className="flex items-center gap-2 text-sm text-neutral-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" /> Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-neutral-700 flex items-center gap-1"
                >
                  Acesse sua conta <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/register-client"
                  onClick={() => setIsOpen(false)}
                  className="bg-yellow-400 text-black px-4 py-2 rounded text-sm text-center hover:bg-yellow-300 transition"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

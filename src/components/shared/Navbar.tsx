'use client'

import { ArrowRightIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="bg-neutral-900 text-white">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 relative">
        {/* Logo */}
        <div className="flex items-center">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="mr-4" />
        </div>

        {/* Menu */}
        <ul className="hidden md:flex space-x-6 text-sm font-medium">
          {/* Dropdown exemplo */}
          <li className="relative group">
            <button className="flex items-center gap-1">
              Sobre a XP
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 hidden group-hover:block bg-white text-black rounded shadow-lg w-48 z-10">
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Quem somos</Link>
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Nossa história</Link>
              <Link href="#" className="block px-4 py-2 hover:bg-gray-100">Carreiras</Link>
            </div>
          </li>

          {/* Outros menus com ou sem dropdown */}
          <li className="relative group">
            <button className="flex items-center gap-1">
                Exemplo
                <ChevronDownIcon className="h-4 w-4" />
            </button>

            <div className="absolute left-0 mt-4 hidden group-hover:flex bg-neutral-900 text-white rounded shadow-lg z-50 px-8 py-6 w-[900px]">
                {/* Coluna 1 */}
                <div className="flex-1">
                <h4 className="text-sm font-semibold mb-3 text-yellow-400">Exemplo Coluna 1</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="hover:underline">Exemplo</Link></li>
                </ul>
                </div>

                {/* Coluna 2 */}
                <div className="flex-1">
                <h4 className="text-sm font-semibold mb-3 text-yellow-400">Exemplo Coluna 2</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="hover:underline">Exemplo</Link></li>
                </ul>
                </div>

                {/* Coluna 3 */}
                <div className="flex-1">
                <h4 className="text-sm font-semibold mb-3 text-yellow-400">Exemplo Coluna 3</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="hover:underline">Exemplo</Link></li>
                </ul>
                </div>

                {/* Coluna 4 */}
                <div className="flex-1">
                <h4 className="text-sm font-semibold mb-3 text-yellow-400">Exemplo Coluna 4</h4>
                <ul className="space-y-1 text-sm">
                    <li><Link href="#" className="hover:underline">Exemplo</Link></li>
                </ul>
                </div>
            </div>
            </li>


          <li><Link href="#">Conteúdos</Link></li>
          <li><Link href="#">Empresas</Link></li>
          <li><Link href="#">Área do Trader</Link></li>
          <li><Link href="#">Tire suas dúvidas</Link></li>
        </ul>

        {/* Ações à direita */}
        <div className="flex items-center space-x-4">
          <Link href="#" className="text-sm text-yellow-400 hover:text-yellow-500 flex items-center">
            Acesse sua conta
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
          <Link
            href="#"
            className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold text-sm hover:bg-yellow-300"
          >
            Abra sua conta
          </Link>
        </div>
      </nav>
    </header>
  )
}

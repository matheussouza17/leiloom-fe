import { ReactNode } from 'react'
import Head from 'next/head'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>XP Landing</title>
        <meta name="description" content="Landing page inspirada na XP" />
      </Head>
      <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
        {/* nav aqui */}
      </header>
      <main className="mt-[80px]">{children}</main>
      <footer className="bg-gray-100 p-6 text-center">© 2025</footer>
    </>
  )
}

import Navbar from '@/components/shared/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100 text-center text-sm p-4 text-gray-500">
        © {new Date().getFullYear()} - Radar Leilão. Todos os direitos reservados.
      </footer>
    </div>
  )
}

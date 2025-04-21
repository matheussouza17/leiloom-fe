import MainLayout from '@/layouts/MainLayout'
import Hero from '@/components/landing/Hero';

export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Fale com a gente</h2>
        <form className="grid grid-cols-1 gap-4">
          <input className="border p-3 rounded" type="text" placeholder="Nome" required />
          <input className="border p-3 rounded" type="email" placeholder="E-mail" required />
          <textarea className="border p-3 rounded" placeholder="Mensagem" required />
          <button className="bg-green-600 text-white p-3 rounded hover:bg-green-700">Encgnzdgviar</button>
        </form>
      </section>
    </MainLayout>
  )
}

import MainLayout from '@/layouts/MainLayout'

export default function Home() {
  return (
    <MainLayout>
      <section className="h-[80vh] flex items-center justify-center text-center px-4 bg-gradient-to-br from-blue-100 to-white">
        <div>
          <h1 className="text-4xl font-bold mb-4">Investir nunca foi tão simples</h1>
          <p className="text-lg mb-6">Descubra as melhores oportunidades com clareza.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">Comece agora</button>
        </div>
      </section>

      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Fale com a gente</h2>
        <form className="grid grid-cols-1 gap-4">
          <input className="border p-3 rounded" type="text" placeholder="Nome" required />
          <input className="border p-3 rounded" type="email" placeholder="E-mail" required />
          <textarea className="border p-3 rounded" placeholder="Mensagem" required />
          <button className="bg-green-600 text-white p-3 rounded hover:bg-green-700">Enviar</button>
        </form>
      </section>
    </MainLayout>
  )
}

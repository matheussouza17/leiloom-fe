import MainLayout from '@/layouts/MainLayout'
import Hero from '@/components/landing/Hero';

export default function Home() {
  return (
    <MainLayout>
      <Hero />
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Fale com a gente</h2>
      </section>
    </MainLayout>
  )
}

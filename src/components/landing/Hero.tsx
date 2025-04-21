'use client';

export default function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6 text-center">
      <div className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Invista com segurança, clareza e tecnologia
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Tenha acesso às melhores oportunidades com uma experiência simples, intuitiva e feita para você.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition">
          Comece agora
        </button>
      </div>
    </section>
  );
}

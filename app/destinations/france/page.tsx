export default function FrancePage() {
  return (
    <main className="min-h-screen bg-[#f8f6f2]">
      <section className="mx-auto max-w-6xl px-6 py-24">
        <span className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          🇫🇷 Destination
        </span>

        <h1 className="mt-4 text-5xl font-bold text-neutral-900">
          France
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          Découvrez progressivement les destinations où CoolGuide est
          disponible en France.
        </p>

        <div className="mt-16 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Destinations disponibles
          </h2>

          <div className="mt-8">
            <a
              href="/nimes"
              className="flex items-center justify-between rounded-2xl border border-neutral-200 p-6 transition hover:border-neutral-900"
            >
              <div>
                <h3 className="text-xl font-semibold">📍 Nîmes</h3>

                <p className="mt-2 text-neutral-600">
                  Arènes • Maison Carrée • Jardins de la Fontaine
                </p>
              </div>

              <span className="text-neutral-900">Découvrir →</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
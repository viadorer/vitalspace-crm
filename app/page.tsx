import { LeadForm } from '@/components/marketing/LeadForm'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { COMPANY_INFO } from '@/lib/utils/constants'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Profesionální ozonová sanitace
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-50">
                Eliminace virů, bakterií a nežádoucích pachů pro B2B segment
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#kontakt"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Nezávazná poptávka
                </a>
                <a
                  href="/crm/dashboard"
                  className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Admin přístup →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Naše řešení</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Reset prostoru</h3>
                <p className="text-gray-600 mb-4">
                  Jednorázová hloubková sanitace. Ideální pro nové prostory nebo po nemoci.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Prevent</h3>
                <p className="text-gray-600 mb-4">
                  Pravidelná prevence. Udržujte prostory čisté a zdravé dlouhodobě.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Clinic Standard</h3>
                <p className="text-gray-600 mb-4">
                  Certifikované řešení pro zdravotnictví s nejvyššími nároky.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Vědecky ověřená účinnost</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Ozon prokazatelně eliminuje viry, bakterie a plísně. Publikováno v renomovaných
              vědeckých časopisech včetně Nature a The Lancet.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">99%+</div>
                <div className="text-gray-600">Eliminace patogenů</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">24h</div>
                <div className="text-gray-600">Rychlost reakce</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-600">Chemických zbytků</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600">Ekologické řešení</div>
              </div>
            </div>
          </div>
        </section>

        <section id="kontakt" className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-4">Nezávazná poptávka</h2>
            <p className="text-center text-gray-600 mb-8">
              Kontaktujte nás a my vám připravíme řešení na míru
            </p>
            <div className="bg-gray-50 rounded-lg p-8">
              <LeadForm />
            </div>
          </div>
        </section>

        <section className="py-12 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Máte dotazy?</h3>
            <p className="text-xl mb-6">Zavolejte nám nebo napište email</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {COMPANY_INFO.phone}
              </a>
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                {COMPANY_INFO.email}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

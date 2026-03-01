import { COMPANY_INFO } from '@/lib/utils/constants'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Vitalspace</h3>
            <p className="text-sm">
              Profesionální ozonová sanitace pro B2B segment.
              Eliminace virů, bakterií a nežádoucích pachů.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Kontakt</h4>
            <div className="space-y-2 text-sm">
              <p>
                <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-white">
                  {COMPANY_INFO.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-white">
                  {COMPANY_INFO.email}
                </a>
              </p>
              <p>{COMPANY_INFO.cities.join(' • ')}</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Programy</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/reset" className="hover:text-white">Reset prostoru</a></li>
              <li><a href="/prevent" className="hover:text-white">Prevent</a></li>
              <li><a href="/clinic" className="hover:text-white">Clinic Standard</a></li>
              <li><a href="/pronajem" className="hover:text-white">Pronájem</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Vitalspace. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  )
}

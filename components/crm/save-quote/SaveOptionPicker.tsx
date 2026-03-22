import { Building2, UserPlus, Download } from 'lucide-react'

type SaveOption = 'client' | 'prospect' | 'export'

interface Props {
  onSelect: (option: SaveOption) => void
}

const OPTIONS = [
  {
    key: 'client' as SaveOption,
    icon: <Building2 className="w-6 h-6 text-blue-600 mt-1" />,
    title: 'Přiřadit existujícímu klientovi',
    description: 'Vytvoří obchod (Deal) v pipeline pro vybraného klienta',
    hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
  },
  {
    key: 'prospect' as SaveOption,
    icon: <UserPlus className="w-6 h-6 text-green-600 mt-1" />,
    title: 'Vytvořit nového prospecta',
    description: 'Uloží jako nového zájemce s kalkulací v poznámkách',
    hoverColor: 'hover:border-green-500 hover:bg-green-50',
  },
  {
    key: 'export' as SaveOption,
    icon: <Download className="w-6 h-6 text-purple-600 mt-1" />,
    title: 'Stáhnout jako PDF',
    description: 'Exportuje cenovou nabídku s kompletními náležitostmi',
    hoverColor: 'hover:border-purple-500 hover:bg-purple-50',
  },
]

export function SaveOptionPicker({ onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 mb-4">
        Jak chcete pokračovat s touto nabídkou?
      </p>
      {OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={`w-full p-4 border-2 border-gray-200 rounded-lg ${opt.hoverColor} transition-all text-left`}
        >
          <div className="flex items-start gap-3">
            {opt.icon}
            <div>
              <h3 className="font-semibold text-gray-900">{opt.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{opt.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

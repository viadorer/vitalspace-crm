'use client'

import { ClientContact } from '@/lib/supabase/types'
import { User, Mail, Phone, Smartphone, Linkedin, Star, CheckCircle } from 'lucide-react'

interface ClientContactsListProps {
  contacts: ClientContact[]
  onEdit?: (contact: ClientContact) => void
  onDelete?: (contactId: string) => void
}

export function ClientContactsList({ contacts, onEdit, onDelete }: ClientContactsListProps) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>Žádné kontaktní osoby</p>
      </div>
    )
  }

  const sortedContacts = [...contacts].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    if (a.is_decision_maker && !b.is_decision_maker) return -1
    if (!a.is_decision_maker && b.is_decision_maker) return 1
    return 0
  })

  return (
    <div className="space-y-4">
      {sortedContacts.map((contact) => (
        <div
          key={contact.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">
                  {contact.first_name} {contact.last_name}
                </h3>
                {contact.is_primary && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    <Star className="w-3 h-3" />
                    Primární
                  </span>
                )}
                {contact.is_decision_maker && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    <CheckCircle className="w-3 h-3" />
                    Rozhodovatel
                  </span>
                )}
              </div>

              {contact.position && (
                <p className="text-sm text-gray-600 mb-3">{contact.position}</p>
              )}

              <div className="space-y-1.5">
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                      {contact.email}
                    </a>
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.mobile && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Smartphone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${contact.mobile}`} className="hover:text-blue-600">
                      {contact.mobile}
                    </a>
                  </div>
                )}

                {contact.linkedin_url && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Linkedin className="w-4 h-4 text-gray-400" />
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600"
                    >
                      LinkedIn profil
                    </a>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic">{contact.notes}</p>
                </div>
              )}
            </div>

            {(onEdit || onDelete) && (
              <div className="flex gap-2 ml-4">
                {onEdit && (
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upravit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(contact.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Smazat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

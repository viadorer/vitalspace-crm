'use client'

import { useCrudResource } from './useCrudResource'
import type { Client } from '@/lib/supabase/types'

const CLIENT_SELECT = `
  *,
  company_segments(*),
  client_contacts(
    id,
    first_name,
    last_name,
    position,
    email,
    phone,
    mobile,
    is_primary,
    is_decision_maker
  ),
  original_prospect:prospects!clients_original_prospect_id_fkey(
    id,
    company_name
  ),
  deals(
    id,
    title,
    stage
  )
`

const NULLABLE_FIELDS: (keyof Client)[] = [
  'segment_id',
  'assigned_user_id',
  'prospect_id',
  'original_prospect_id',
]

export function useClients() {
  const crud = useCrudResource<Client>({
    table: 'clients',
    select: CLIENT_SELECT,
    orderBy: 'created_at',
    orderAscending: false,
    nullableFields: NULLABLE_FIELDS,
    errorMessages: {
      fetch: 'Chyba při načítání klientů',
      create: 'Chyba při vytváření klienta',
      update: 'Chyba při aktualizaci klienta',
      delete: 'Chyba při mazání klienta',
    },
  })

  return {
    clients: crud.items,
    loading: crud.loading,
    error: crud.error,
    refetch: crud.refetch,
    createClient: crud.create,
    updateClient: crud.update,
    deleteClient: crud.remove,
  }
}

'use client'

import { useCrudResource } from './useCrudResource'
import type { Prospect } from '@/lib/supabase/types'

const PROSPECT_SELECT = `
  *,
  company_segments(*),
  prospect_contacts(
    id,
    first_name,
    last_name,
    position,
    email,
    phone,
    is_decision_maker
  ),
  converted_client:clients!prospects_converted_to_client_id_fkey(
    id,
    company_name
  )
`

const NULLABLE_FIELDS: (keyof Prospect)[] = [
  'segment_id',
  'assigned_user_id',
]

export function useProspects() {
  const crud = useCrudResource<Prospect>({
    table: 'prospects',
    select: PROSPECT_SELECT,
    orderBy: 'created_at',
    orderAscending: false,
    nullableFields: NULLABLE_FIELDS,
    errorMessages: {
      fetch: 'Chyba při načítání prospektů',
      create: 'Chyba při vytváření prospectu',
      update: 'Chyba při aktualizaci prospectu',
      delete: 'Chyba při mazání prospectu',
    },
  })

  return {
    prospects: crud.items,
    loading: crud.loading,
    error: crud.error,
    createProspect: crud.create,
    updateProspect: crud.update,
    deleteProspect: crud.remove,
    refetch: crud.refetch,
  }
}

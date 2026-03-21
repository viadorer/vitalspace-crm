/**
 * Converts empty string values to null for specified fields.
 * Useful for UUID/nullable fields that Supabase rejects as empty strings.
 */
export function cleanNullableFields<T extends Record<string, unknown>>(
  obj: Partial<T>,
  fields: (keyof T)[]
): Partial<T> {
  const cleaned = { ...obj }
  for (const field of fields) {
    if (cleaned[field] === '') {
      (cleaned as Record<string, unknown>)[field as string] = null
    }
  }
  return cleaned
}

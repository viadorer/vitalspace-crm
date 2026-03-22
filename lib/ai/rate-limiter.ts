/**
 * Jednoduchý in-memory rate limiter pro Gemini API.
 *
 * Gemini free tier: 15 RPM (requests per minute).
 * Pokud limit překročen, vrátí false a caller použije fallback (rule-based logiku).
 *
 * Pozn: Na serverless (Vercel) je in-memory state sdílený jen v rámci jedné invokace.
 * Toto je "best effort" ochrana — Gemini API má vlastní rate limiting.
 */

const callTimestamps = new Map<string, number[]>()

/** Zkontroluje zda můžeme volat API (nepřekročili jsme limit) */
export function canCall(key: string, maxPerMinute: number): boolean {
  const now = Date.now()
  const timestamps = callTimestamps.get(key) || []

  // Vyčisti staré záznamy (starší než 60s)
  const recent = timestamps.filter(t => now - t < 60_000)
  callTimestamps.set(key, recent)

  return recent.length < maxPerMinute
}

/** Zaznamená volání API */
export function recordCall(key: string): void {
  const now = Date.now()
  const timestamps = callTimestamps.get(key) || []
  timestamps.push(now)
  callTimestamps.set(key, timestamps)
}

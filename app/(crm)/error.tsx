'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function CRMErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CRM error boundary]', error)
  }, [error])

  return (
    <div role="alert" className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Něco se pokazilo
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Při načítání této stránky došlo k chybě. Zkuste obnovit nebo se vraťte zpět.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-400 font-mono">ID: {error.digest}</p>
        )}
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => window.history.back()}>
            Zpět
          </Button>
          <Button onClick={reset}>Zkusit znovu</Button>
        </div>
      </div>
    </div>
  )
}

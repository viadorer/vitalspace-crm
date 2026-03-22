'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CronStatusIndicator() {
  const [status, setStatus] = useState<'ok' | 'warning' | 'error' | 'loading'>('loading')
  const [lastRun, setLastRun] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState('')

  useEffect(() => {
    checkCronStatus()
    const interval = setInterval(checkCronStatus, 900000) // každých 15 minut
    return () => clearInterval(interval)
  }, [])

  async function checkCronStatus() {
    try {
      const supabase = createClient()

      // Najdi poslední execution log
      const { data: rows } = await supabase
        .from('sequence_execution_log')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      const data = rows?.[0]

      if (!data) {
        setStatus('warning')
        setTooltip('Cron: žádný záznam — sekvence ještě neběžely')
        setLastRun(null)
        return
      }

      const lastRunDate = new Date(data.created_at)
      const minutesAgo = Math.floor((Date.now() - lastRunDate.getTime()) / 60000)
      setLastRun(data.created_at)

      if (minutesAgo < 20) {
        setStatus('ok')
        setTooltip(`Cron OK — poslední běh před ${minutesAgo} min`)
      } else if (minutesAgo < 60) {
        setStatus('warning')
        setTooltip(`Cron zpožděn — poslední běh před ${minutesAgo} min`)
      } else {
        setStatus('error')
        setTooltip(`Cron neběží — poslední běh před ${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m`)
      }
    } catch {
      // Tabulka neexistuje nebo chyba → kontrola enrollmentů
      try {
        const supabase = createClient()
        const { count } = await supabase
          .from('prospect_sequence_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')

        if (count && count > 0) {
          setStatus('warning')
          setTooltip(`Cron: ${count} aktivních enrollmentů čeká na zpracování`)
        } else {
          setStatus('ok')
          setTooltip('Cron: žádné aktivní sekvence')
        }
      } catch {
        setStatus('error')
        setTooltip('Cron: nelze zjistit stav')
      }
    }
  }

  const colors = {
    ok: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    loading: 'bg-gray-400',
  }

  const pulseColors = {
    ok: 'bg-green-400',
    warning: 'bg-yellow-400',
    error: 'bg-red-400',
    loading: 'bg-gray-300',
  }

  return (
    <div className="relative group" title={tooltip}>
      <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
        <span className="relative flex h-2.5 w-2.5">
          {status === 'ok' && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pulseColors[status]} opacity-75`} />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`} />
        </span>
        <span>
          {status === 'ok' && 'Cron běží'}
          {status === 'warning' && 'Cron čeká'}
          {status === 'error' && 'Cron neběží'}
          {status === 'loading' && '...'}
        </span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-4 mb-1 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          {tooltip}
        </div>
      </div>
    </div>
  )
}

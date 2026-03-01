'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { Topbar } from '@/components/crm/Topbar'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import type { CompanySegment } from '@/lib/supabase/types'

export default function SegmentsPage() {
  const [segments, setSegments] = useState<CompanySegment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchSegments() {
      const { data, error } = await supabase
        .from('company_segments')
        .select('*')
        .order('name')

      if (!error && data) {
        setSegments(data)
      }
      setLoading(false)
    }
    fetchSegments()
  }, [])

  const filteredSegments = segments.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.target_pain_point?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div>
        <Topbar title="Segmenty" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Segmenty"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Segmenty' }]}
      />

      <div className="p-8">
        <div className="mb-6">
          <Input
            placeholder="Hledat segment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název segmentu</TableHead>
                <TableHead>Pain point</TableHead>
                <TableHead>Doporučený přístup</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell className="font-medium">{segment.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {segment.target_pain_point || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {segment.recommended_approach || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Celkem {filteredSegments.length} segmentů
        </div>
      </div>
    </div>
  )
}

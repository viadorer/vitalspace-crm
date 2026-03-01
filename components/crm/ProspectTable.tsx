'use client'

import { useState, useMemo } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PROSPECT_STATUSES, REGIONS, PRIORITIES } from '@/lib/utils/constants'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Prospect } from '@/lib/supabase/types'

interface ProspectTableProps {
  prospects: Prospect[]
  onProspectClick: (prospect: Prospect) => void
}

export function ProspectTable({ prospects, onProspectClick }: ProspectTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Extrakce unikátních segmentů
  const segments = useMemo(() => {
    const segmentSet = new Set<string>()
    prospects.forEach(p => {
      const segmentName = (p as any).company_segments?.name
      if (segmentName) segmentSet.add(segmentName)
    })
    return Array.from(segmentSet).sort()
  }, [prospects])

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      // Fulltext vyhledávání
      if (search) {
        const searchLower = search.toLowerCase()
        const contacts = (p as any).prospect_contacts || []
        const matchesCompany = p.company_name.toLowerCase().includes(searchLower)
        const matchesCity = p.city?.toLowerCase().includes(searchLower)
        const matchesAddress = p.address?.toLowerCase().includes(searchLower)
        const matchesICO = p.ico?.includes(search)
        const matchesContact = contacts.some((c: any) => 
          `${c.first_name || ''} ${c.last_name}`.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(search)
        )
        
        if (!matchesCompany && !matchesCity && !matchesAddress && !matchesICO && !matchesContact) {
          return false
        }
      }

      // Filtry
      const matchesStatus = !statusFilter || p.status === statusFilter
      const matchesRegion = !regionFilter || p.region === regionFilter
      const matchesPriority = !priorityFilter || p.priority === Number(priorityFilter)
      const matchesSegment = !segmentFilter || (p as any).company_segments?.name === segmentFilter
      
      return matchesStatus && matchesRegion && matchesPriority && matchesSegment
    })
  }, [prospects, search, statusFilter, regionFilter, priorityFilter, segmentFilter])

  // Stránkování
  const totalPages = Math.ceil(filteredProspects.length / pageSize)
  const paginatedProspects = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProspects.slice(start, start + pageSize)
  }, [filteredProspects, currentPage, pageSize])

  // Reset na první stránku při změně filtrů
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      not_contacted: 'default',
      contacted: 'info',
      meeting_scheduled: 'warning',
      refused: 'danger',
      qualified: 'success',
    }
    const label = PROSPECT_STATUSES.find(s => s.value === status)?.label || status
    return <Badge variant={variants[status] || 'default'}>{label}</Badge>
  }

  function getPriorityColor(priority: number) {
    const p = PRIORITIES.find(pr => pr.value === priority)
    return p?.color || '#gray'
  }

  return (
    <div className="space-y-4">
      {/* Vyhledávací pole */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Vyhledat firmu, město, IČO, kontaktní osobu, email nebo telefon..."
          value={search}
          onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
          className="w-full pl-12 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtry */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          options={[
            { value: '', label: 'Všechny stavy' },
            ...PROSPECT_STATUSES.map(s => ({ value: s.value, label: s.label }))
          ]}
        />
        <Select
          value={regionFilter}
          onChange={(e) => handleFilterChange(setRegionFilter)(e.target.value)}
          options={[
            { value: '', label: 'Všechny regiony' },
            ...REGIONS.map(r => ({ value: r, label: r }))
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={(e) => handleFilterChange(setPriorityFilter)(e.target.value)}
          options={[
            { value: '', label: 'Všechny priority' },
            ...PRIORITIES.map(p => ({ value: String(p.value), label: p.label }))
          ]}
        />
        <Select
          value={segmentFilter}
          onChange={(e) => handleFilterChange(setSegmentFilter)(e.target.value)}
          options={[
            { value: '', label: 'Všechny segmenty' },
            ...segments.map(s => ({ value: s, label: s }))
          ]}
        />
        <Select
          value={String(pageSize)}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setCurrentPage(1)
          }}
          options={[
            { value: '10', label: '10 na stránku' },
            { value: '25', label: '25 na stránku' },
            { value: '50', label: '50 na stránku' },
            { value: '100', label: '100 na stránku' },
          ]}
        />
      </div>

      {/* Statistiky */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Zobrazeno <span className="font-medium">{paginatedProspects.length}</span> z <span className="font-medium">{filteredProspects.length}</span> prospektů
          {filteredProspects.length !== prospects.length && (
            <span className="text-gray-500"> (celkem {prospects.length})</span>
          )}
        </div>
        {(statusFilter || regionFilter || priorityFilter || segmentFilter || search) && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setRegionFilter('')
              setPriorityFilter('')
              setSegmentFilter('')
              setCurrentPage(1)
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Zrušit filtry
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Priorita</TableHead>
              <TableHead>Firma</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>Kontaktní osoba</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Město</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead>Konzultant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProspects.map((prospect) => {
              const primaryContact = (prospect as any).prospect_contacts?.find((c: any) => c.is_decision_maker) || 
                                    (prospect as any).prospect_contacts?.[0];
              const contactName = primaryContact 
                ? `${primaryContact.first_name || ''} ${primaryContact.last_name}`.trim()
                : '-';
              const segmentName = (prospect as any).company_segments?.name || '-';
              
              return (
                <TableRow key={prospect.id} onClick={() => onProspectClick(prospect)}>
                  <TableCell>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPriorityColor(prospect.priority) }}
                      title={PRIORITIES.find(p => p.value === prospect.priority)?.label}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{prospect.company_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{segmentName}</TableCell>
                  <TableCell className="text-sm text-gray-600">{contactName}</TableCell>
                  <TableCell className="text-sm">{primaryContact?.phone || '-'}</TableCell>
                  <TableCell className="text-sm">{primaryContact?.email || '-'}</TableCell>
                  <TableCell>{prospect.city || '-'}</TableCell>
                  <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                  <TableCell>{prospect.assigned_consultant || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredProspects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {search || statusFilter || regionFilter || priorityFilter || segmentFilter
            ? 'Žádné prospekty nenalezeny pro zadané filtry'
            : 'Zatím nejsou žádné prospekty'}
        </div>
      )}

      {/* Stránkování */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Předchozí
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Další
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Stránka <span className="font-medium">{currentPage}</span> z{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

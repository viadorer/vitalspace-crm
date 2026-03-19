'use client'

import { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import type { Client } from '@/lib/supabase/types'

interface ClientTableProps {
  clients: Client[]
  onClientClick: (client: Client) => void
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
}

export function ClientTable({ clients, onClientClick, selectedIds, onSelectionChange }: ClientTableProps) {
  const [search, setSearch] = useState('')

  const filteredClients = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

  const selectable = !!onSelectionChange
  const allSelected = selectable && filteredClients.length > 0 && filteredClients.every(c => selectedIds?.has(c.id))
  const someSelected = selectable && filteredClients.some(c => selectedIds?.has(c.id))

  function toggleAll() {
    if (!onSelectionChange) return
    if (allSelected) {
      const next = new Set(selectedIds)
      filteredClients.forEach(c => next.delete(c.id))
      onSelectionChange(next)
    } else {
      const next = new Set(selectedIds)
      filteredClients.forEach(c => next.add(c.id))
      onSelectionChange(next)
    }
  }

  function toggleOne(id: string) {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Hledat klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </TableHead>
              )}
              <TableHead>Firma</TableHead>
              <TableHead>Segment</TableHead>
              <TableHead>IČO</TableHead>
              <TableHead>Kontaktní osoba</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Město</TableHead>
              <TableHead>Typ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => {
              const primaryContact = (client as any).client_contacts?.find((c: any) => c.is_primary) || 
                                    (client as any).client_contacts?.[0];
              const contactName = primaryContact 
                ? `${primaryContact.first_name || ''} ${primaryContact.last_name}`.trim()
                : '-';
              const segmentName = (client as any).company_segments?.name || '-';
              
              return (
                <TableRow key={client.id} onClick={() => onClientClick(client)}>
                  {selectable && (
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(client.id) || false}
                          onChange={() => toggleOne(client.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{client.company_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{segmentName}</TableCell>
                  <TableCell className="text-sm">{client.ico || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{contactName}</TableCell>
                  <TableCell className="text-sm">{primaryContact?.email || '-'}</TableCell>
                  <TableCell className="text-sm">{primaryContact?.phone || primaryContact?.mobile || '-'}</TableCell>
                  <TableCell>{(client as any).city || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded ${
                      client.type === 'B2B' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {client.type}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Žádní klienti nenalezeni
        </div>
      )}
    </div>
  )
}

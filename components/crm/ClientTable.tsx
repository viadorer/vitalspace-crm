'use client'

import { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table'
import { Input } from '@/components/ui/Input'
import type { Client } from '@/lib/supabase/types'

interface ClientTableProps {
  clients: Client[]
  onClientClick: (client: Client) => void
}

export function ClientTable({ clients, onClientClick }: ClientTableProps) {
  const [search, setSearch] = useState('')

  const filteredClients = clients.filter(c =>
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  )

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

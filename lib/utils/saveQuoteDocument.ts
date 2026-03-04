import { createClient } from '@/lib/supabase/client'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'

interface SaveQuoteDocumentParams {
  blob: Blob
  fileName: string
  quoteNumber: string
  title: string
  dealId?: string
  clientId?: string
  prospectId?: string
}

export async function saveQuoteDocument({
  blob,
  fileName,
  quoteNumber,
  title,
  dealId,
  clientId,
  prospectId,
}: SaveQuoteDocumentParams): Promise<{ id: string } | null> {
  const supabase = createClient()

  const { data: userData } = await supabase.auth.getUser()
  const userId = userData?.user?.id || null

  const timestamp = Date.now()
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storagePath = `proposals/${timestamp}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/pdf',
    })

  if (uploadError) {
    console.error('Error uploading quote PDF:', uploadError)
    throw uploadError
  }

  const { data: doc, error: insertError } = await supabase
    .from('documents')
    .insert({
      deal_id: dealId || null,
      client_id: clientId || null,
      doc_type: 'proposal',
      title: title || `Nabídka ${quoteNumber}`,
      file_path: storagePath,
      file_size_bytes: blob.size,
      mime_type: 'application/pdf',
      created_by: userId,
    })
    .select('id')
    .single()

  if (insertError) {
    console.error('Error saving quote document record:', insertError)
    throw insertError
  }

  if (doc) {
    const entityType = dealId ? 'deal' : (clientId ? 'client' : 'prospect')
    const entityId = dealId || clientId || prospectId

    await logAuditEvent({
      action: 'create',
      entityType: 'document',
      entityId: doc.id,
      metadata: {
        parent_entity_type: entityType,
        parent_entity_id: entityId,
        doc_type: 'proposal',
        quote_number: quoteNumber,
        file_name: fileName,
      },
    })
  }

  return doc
}

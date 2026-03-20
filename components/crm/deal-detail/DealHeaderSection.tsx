'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { DEAL_STAGES, APP_ROLES } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/format'
import { logAuditEvent, logAssignment } from '@/lib/hooks/useAuditLog'
import {
  Building2, Clock, Edit2, Mail, Save, UserCheck, User, X,
} from 'lucide-react'
import type { DealSectionProps } from './shared'
import type { DealStage } from '@/lib/supabase/types'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'

export function DealHeaderSection({ dealId, data, onRefresh, isSuperAdmin }: DealSectionProps & { onClose: () => void }) {
  const { deal, allUsers } = data
  const stageInfo = DEAL_STAGES.find((s) => s.value === deal.stage)
  const companyName = deal.client?.company_name || deal.prospect?.company_name
  const daysInStage = deal.stage_entered_at
    ? Math.floor((Date.now() - new Date(deal.stage_entered_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Edit info state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: deal.title || '',
    estimated_close_date: deal.estimated_close_date || '',
    estimated_installation_date: deal.estimated_installation_date || '',
    installation_deadline: deal.installation_deadline || '',
  })
  const [savingEdit, setSavingEdit] = useState(false)

  // Stage change state
  const [changingStage, setChangingStage] = useState(false)
  const [lostReason, setLostReason] = useState('')
  const [pendingStage, setPendingStage] = useState<string | null>(null)

  // Assign state
  const [assignUserId, setAssignUserId] = useState(deal.assigned_user_id || '')
  const [assignReason, setAssignReason] = useState('')
  const [savingAssign, setSavingAssign] = useState(false)

  // Delete state
  const [deleting, setDeleting] = useState(false)

  // Email state
  const [showEmail, setShowEmail] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState('')
  const [emailSalutation, setEmailSalutation] = useState('Vážená paní ředitelko / Vážený pane řediteli')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<string | null>(null)

  async function handleSaveEdit() {
    setSavingEdit(true)
    const supabase = createClient()
    const changes: Record<string, { old: any; new: any }> = {}

    if (editForm.title !== (deal.title || '')) changes.title = { old: deal.title, new: editForm.title }
    if (editForm.estimated_close_date !== (deal.estimated_close_date || '')) changes.estimated_close_date = { old: deal.estimated_close_date, new: editForm.estimated_close_date }
    if (editForm.estimated_installation_date !== (deal.estimated_installation_date || '')) changes.estimated_installation_date = { old: deal.estimated_installation_date, new: editForm.estimated_installation_date }
    if (editForm.installation_deadline !== (deal.installation_deadline || '')) changes.installation_deadline = { old: deal.installation_deadline, new: editForm.installation_deadline }

    const updates: Record<string, any> = {}
    if (editForm.title) updates.title = editForm.title
    if (editForm.estimated_close_date) updates.estimated_close_date = editForm.estimated_close_date
    else updates.estimated_close_date = null
    if (editForm.estimated_installation_date) updates.estimated_installation_date = editForm.estimated_installation_date
    else updates.estimated_installation_date = null
    if (editForm.installation_deadline) updates.installation_deadline = editForm.installation_deadline
    else updates.installation_deadline = null

    await supabase.from('deals').update(updates).eq('id', dealId)

    if (Object.keys(changes).length > 0) {
      await logAuditEvent({
        action: 'update',
        entityType: 'deal',
        entityId: dealId,
        changes,
      })
    }

    setEditing(false)
    setSavingEdit(false)
    await onRefresh()
  }

  async function handleStageChange(newStage: string) {
    if (newStage === deal.stage) return

    if (newStage === 'closed_lost') {
      setPendingStage(newStage)
      return
    }

    await executeStageChange(newStage as DealStage)
  }

  async function executeStageChange(newStage: DealStage, reason?: string) {
    setChangingStage(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    const updates: Record<string, any> = {
      stage: newStage,
      stage_entered_at: new Date().toISOString(),
    }
    if (newStage === 'closed_won') updates.closed_at = new Date().toISOString()
    if (newStage === 'closed_lost') {
      updates.closed_at = new Date().toISOString()
      updates.lost_reason = reason || null
    }

    await supabase.from('deals').update(updates).eq('id', dealId)

    await supabase.from('deal_stage_history').insert({
      deal_id: dealId,
      from_stage: deal.stage,
      to_stage: newStage,
      changed_by: userData?.user?.email || null,
    })

    await logAuditEvent({
      action: 'stage_change',
      entityType: 'deal',
      entityId: dealId,
      changes: { stage: { old: deal.stage, new: newStage } },
    })

    setPendingStage(null)
    setLostReason('')
    setChangingStage(false)
    await onRefresh()
  }

  async function handleAssign() {
    if (!assignUserId) return
    setSavingAssign(true)
    const supabase = createClient()

    await supabase.from('deals').update({ assigned_user_id: assignUserId }).eq('id', dealId)
    await logAssignment({
      entityType: 'deal',
      entityId: dealId,
      fromUserId: deal.assigned_user_id,
      toUserId: assignUserId,
      reason: assignReason || undefined,
    })

    setAssignReason('')
    setSavingAssign(false)
    await onRefresh()
  }

  async function handleDelete() {
    if (!confirm(`Opravdu chcete smazat deal "${deal.title}"?`)) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('deals').delete().eq('id', dealId)

    if (!error) {
      await logAuditEvent({ action: 'delete', entityType: 'deal', entityId: dealId, metadata: { title: deal.title } })
      // onClose is handled by parent
    } else {
      alert(`Chyba: ${error.message}`)
      setDeleting(false)
    }
  }

  async function handleSendEmail() {
    if (!emailTemplate) return
    // Try: primary contact email → any contact email → client email → prospect email
    const contacts = (deal.client as any)?.client_contacts || []
    const primaryContact = contacts.find((c: any) => c.is_primary) || contacts[0]
    const recipientEmail = primaryContact?.email || deal.client?.email || (deal.prospect as any)?.email
    if (!recipientEmail) {
      setEmailResult('Klient/prospekt nemá vyplněný email. Přidejte kontakt s emailem.')
      return
    }

    setSendingEmail(true)
    setEmailResult(null)

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'template',
          to_email: recipientEmail,
          to_name: primaryContact ? `${primaryContact.first_name || ''} ${primaryContact.last_name || ''}`.trim() : '',
          template_name: emailTemplate,
          variables: {
            salutation: emailSalutation,
            company_name: companyName || '',
          },
        }),
      })

      if (res.ok) {
        // Log as email activity
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        await supabase.from('activities').insert({
          entity_type: 'deal',
          entity_id: dealId,
          type: 'email',
          subject: `Email odeslán: ${emailTemplate}`,
          body: `Šablona: ${emailTemplate}, příjemce: ${recipientEmail}`,
          created_by: userData?.user?.id || null,
        })
        setEmailResult('Email úspěšně odeslán')
        setShowEmail(false)
        await onRefresh()
      } else {
        const err = await res.json()
        setEmailResult(`Chyba: ${err.error || 'Neznámá chyba'}`)
      }
    } catch {
      setEmailResult('Chyba při odesílání')
    } finally {
      setSendingEmail(false)
    }
  }

  const templateOptions = Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => ({
    value: key,
    label: tpl.label,
  }))

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Odhad uzavření</label>
                  <input type="date" value={editForm.estimated_close_date} onChange={(e) => setEditForm({ ...editForm, estimated_close_date: e.target.value })} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Plán montáže</label>
                  <input type="date" value={editForm.estimated_installation_date} onChange={(e) => setEditForm({ ...editForm, estimated_installation_date: e.target.value })} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Deadline montáže</label>
                  <input type="date" value={editForm.installation_deadline} onChange={(e) => setEditForm({ ...editForm, installation_deadline: e.target.value })} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} disabled={savingEdit}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {savingEdit ? 'Ukládání...' : 'Uložit'}
                </Button>
                <Button variant="secondary" onClick={() => setEditing(false)}>Zrušit</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                {deal.deal_number && <span className="text-sm text-gray-500 font-mono">{deal.deal_number}</span>}

                {/* Stage change dropdown */}
                <select
                  value={deal.stage}
                  onChange={(e) => handleStageChange(e.target.value)}
                  disabled={changingStage}
                  className="appearance-none text-xs font-medium px-2.5 py-0.5 rounded-full border-0 cursor-pointer"
                  style={{ backgroundColor: stageInfo?.color + '20', color: stageInfo?.color }}
                >
                  {DEAL_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                {daysInStage > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {daysInStage}d ve fázi
                  </span>
                )}

                <button onClick={() => setEditing(true)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {companyName && (
                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                  <Building2 className="w-4 h-4" /> {companyName}
                </p>
              )}
              {deal.assigned_user && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <UserCheck className="w-4 h-4" /> {deal.assigned_user.full_name}
                </p>
              )}
              {!deal.assigned_user && deal.assigned_consultant && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <User className="w-4 h-4" /> {deal.assigned_consultant}
                </p>
              )}
            </>
          )}
        </div>

        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(deal.final_price_czk)}</div>
          {deal.discount_percent > 0 && (
            <div className="text-sm text-gray-500">Sleva {deal.discount_percent}% z {formatCurrency(deal.total_value_czk)}</div>
          )}
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => setShowEmail(!showEmail)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </button>
            {isSuperAdmin && (
              <Button onClick={handleDelete} variant="secondary" disabled={deleting}>
                {deleting ? 'Mažu...' : 'Smazat'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lost reason dialog */}
      {pendingStage === 'closed_lost' && (
        <div className="bg-red-50 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-red-700">Důvod ztráty dealu:</p>
          <input
            type="text"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="Proč byl deal ztracen?"
            className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <Button onClick={() => executeStageChange('closed_lost', lostReason)}>Potvrdit</Button>
            <Button variant="secondary" onClick={() => setPendingStage(null)}>Zrušit</Button>
          </div>
        </div>
      )}

      {/* Email send form */}
      {showEmail && (
        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">-- Vyberte šablonu --</option>
              {templateOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={emailSalutation}
            onChange={(e) => setEmailSalutation(e.target.value)}
            placeholder="Oslovení"
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleSendEmail} disabled={sendingEmail || !emailTemplate}>
              {sendingEmail ? 'Odesílání...' : 'Odeslat'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowEmail(false); setEmailResult(null) }}>Zrušit</Button>
            {emailResult && <span className={`text-xs ${emailResult.includes('Chyba') ? 'text-red-600' : 'text-green-600'}`}>{emailResult}</span>}
          </div>
        </div>
      )}

      {/* Assign consultant */}
      <div className="flex items-center gap-3">
        <Select
          value={assignUserId}
          onChange={(e) => setAssignUserId(e.target.value)}
          options={[
            { value: '', label: '-- Nepřiřazeno --' },
            ...allUsers.map((u) => ({ value: u.id, label: `${u.full_name} (${APP_ROLES.find(r => r.value === u.role)?.label || u.role})` })),
          ]}
        />
        {assignUserId !== (deal.assigned_user_id || '') && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Důvod"
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm w-40"
            />
            <Button onClick={handleAssign} disabled={savingAssign}>
              {savingAssign ? '...' : 'Přiřadit'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

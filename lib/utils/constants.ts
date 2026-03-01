export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead', color: '#94a3b8' },
  { value: 'technical_audit', label: 'Technický audit', color: '#60a5fa' },
  { value: 'proposal_sent', label: 'Nabídka odeslána', color: '#a78bfa' },
  { value: 'negotiation', label: 'Vyjednávání', color: '#f59e0b' },
  { value: 'contract_signed', label: 'Smlouva podepsána', color: '#10b981' },
  { value: 'installation', label: 'Montáž', color: '#06b6d4' },
  { value: 'handover', label: 'Předání', color: '#8b5cf6' },
  { value: 'closed_won', label: 'Uzavřeno - vyhráno', color: '#22c55e' },
  { value: 'closed_lost', label: 'Uzavřeno - prohráno', color: '#ef4444' },
] as const

export const PROSPECT_STATUSES = [
  { value: 'not_contacted', label: 'Neosloveno' },
  { value: 'contacted', label: 'Osloveno' },
  { value: 'meeting_scheduled', label: 'Schůzka naplánována' },
  { value: 'refused', label: 'Odmítnuto' },
  { value: 'qualified', label: 'Kvalifikováno' },
] as const

export const REGIONS = [
  'Plzeňský kraj',
  'Praha',
  'Středočeský kraj',
  'Ostatní',
] as const

export const PRIORITIES = [
  { value: 1, label: 'Velmi vysoká', color: '#ef4444' },
  { value: 2, label: 'Vysoká', color: '#f97316' },
  { value: 3, label: 'Střední', color: '#eab308' },
  { value: 4, label: 'Nízká', color: '#84cc16' },
  { value: 5, label: 'Velmi nízká', color: '#22c55e' },
] as const

export const TOUCHPOINT_TYPES = [
  { value: 'call', label: 'Telefonát' },
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'personal_visit', label: 'Osobní návštěva' },
  { value: 'demo', label: 'Demo' },
  { value: 'webinar', label: 'Webinář' },
  { value: 'referral', label: 'Doporučení' },
] as const

export const APP_ROLES = [
  { value: 'superadmin', label: 'Super Admin', color: '#dc2626' },
  { value: 'admin', label: 'Admin', color: '#ea580c' },
  { value: 'consultant', label: 'Obchodník', color: '#2563eb' },
  { value: 'technician', label: 'Technik', color: '#0891b2' },
  { value: 'viewer', label: 'Čtenář', color: '#6b7280' },
] as const

export const COMPANY_INFO = {
  name: 'Vitalspace',
  phone: '+420 734 451 278',
  email: 'info@vitalspace.cz',
  cities: ['Plzeň', 'Praha'],
} as const

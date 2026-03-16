export type AppRole = 'superadmin' | 'admin' | 'consultant' | 'technician' | 'viewer'

export interface AppUser {
  id: string
  email: string
  full_name: string
  role: AppRole
  permissions: string[]
  is_active: boolean
  phone: string | null
  avatar_url: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export type DealStage =
  | 'lead'
  | 'technical_audit'
  | 'proposal_sent'
  | 'negotiation'
  | 'contract_signed'
  | 'installation'
  | 'handover'
  | 'closed_won'
  | 'closed_lost'

export type ProspectStatus =
  | 'not_contacted'
  | 'contacted'
  | 'meeting_scheduled'
  | 'refused'
  | 'qualified'

export type ProductCategory =
  | 'nastropni'
  | 'mobilni'
  | 'box'
  | 'prislusenstvi'
  | 'sluzba'

export type TouchpointType =
  | 'call'
  | 'email'
  | 'linkedin'
  | 'personal_visit'
  | 'demo'
  | 'webinar'
  | 'referral'

export interface CompanySegment {
  id: string
  name: string
  target_pain_point: string | null
  recommended_approach: string | null
  recommended_products: string[] | null
  average_deal_min_czk: number | null
  average_deal_max_czk: number | null
  closing_time_months_min: number | null
  closing_time_months_max: number | null
  decision_makers: string[] | null
  key_arguments: string[] | null
  objections_handling: Record<string, string> | null
  success_stories: string[] | null
  created_at: string
}

export interface Prospect {
  id: string
  company_name: string
  ico: string | null
  dic: string | null
  segment_id: string | null
  region: string
  city: string | null
  address: string | null
  website: string | null
  employees_count_est: number | null
  estimated_floor_area_m2: number | null
  source: string | null
  priority: number
  status: ProspectStatus
  converted_to_client_id: string | null
  notes: string | null
  assigned_consultant: string | null
  assigned_user_id: string | null
  created_at: string
  updated_at: string
  assigned_user?: AppUser
  converted_client?: { id: string; company_name: string }
}

export interface ProspectContact {
  id: string
  prospect_id: string
  first_name: string | null
  last_name: string
  position: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  is_decision_maker: boolean
  created_at: string
}

export interface ClientContact {
  id: string
  client_id: string
  first_name: string | null
  last_name: string
  position: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  linkedin_url: string | null
  is_primary: boolean
  is_decision_maker: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Touchpoint {
  id: string
  prospect_id: string
  type: TouchpointType
  date: string
  notes: string | null
  outcome: string | null
  next_action: string | null
  next_action_date: string | null
  created_by: string | null
  created_at: string
}

export interface Client {
  id: string
  prospect_id: string | null
  original_prospect_id: string | null
  company_name: string
  type: 'B2B' | 'B2C'
  ico: string | null
  dic: string | null
  contact_person: string | null
  email: string | null
  phone: string | null
  segment_id: string | null
  region: string
  city: string | null
  address: string | null
  website: string | null
  employees_count_est: number | null
  estimated_floor_area_m2: number | null
  source: string | null
  billing_address: Record<string, any> | null
  delivery_address: Record<string, any> | null
  payment_terms_days: number
  notes: string | null
  assigned_consultant: string | null
  assigned_user_id: string | null
  created_at: string
  updated_at: string
  assigned_user?: AppUser
  original_prospect?: { id: string; company_name: string }
  deals?: Array<{ id: string; title: string; stage: string }>
}

export type AuditAction = 'create' | 'update' | 'delete' | 'assign' | 'stage_change' | 'activate' | 'deactivate'
export type AuditEntityType = 'deal' | 'prospect' | 'client' | 'deal_item' | 'deal_activity' | 'prospect_activity' | 'contact_activity' | 'technical_audit' | 'installation' | 'document' | 'product' | 'app_user'

export interface AuditLogEntry {
  id: string
  user_id: string | null
  action: AuditAction
  entity_type: AuditEntityType
  entity_id: string
  changes: Record<string, { old: unknown; new: unknown }>
  metadata: Record<string, unknown>
  created_at: string
  user?: AppUser
}

export interface AssignmentHistoryEntry {
  id: string
  entity_type: 'deal' | 'prospect' | 'client'
  entity_id: string
  from_user_id: string | null
  to_user_id: string | null
  reason: string | null
  created_by: string | null
  created_at: string
  from_user?: AppUser
  to_user?: AppUser
  creator?: AppUser
}

export interface QuantityDiscount {
  min_quantity: number
  discount_percent: number
}

export interface Product {
  id: string
  sku: string
  name: string
  category: ProductCategory
  ozone_output_gh: number | null
  coverage_m3_max: number | null
  dimensions: string | null
  weight_kg: number | null
  power_consumption_w: number | null
  description: string | null
  base_price_czk: number
  vat_rate: number
  purchase_price_czk: number
  quantity_discounts: QuantityDiscount[]
  installation_required: boolean
  installation_price_czk: number
  warranty_months: number
  is_active: boolean
  created_at: string
}

export interface Deal {
  id: string
  client_id: string | null
  prospect_id: string | null
  deal_number: string | null
  title: string
  stage: DealStage
  total_hardware_czk: number
  total_installation_czk: number
  total_service_czk: number
  total_value_czk: number
  discount_percent: number
  final_price_czk: number
  estimated_close_date: string | null
  estimated_installation_date: string | null
  installation_deadline: string | null
  assigned_consultant: string | null
  assigned_user_id: string | null
  stage_entered_at: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  assigned_user?: AppUser
  client?: Client
  prospect?: Prospect
}

export interface DealItem {
  id: string
  deal_id: string
  product_id: string
  quantity: number
  unit_price_czk: number
  discount_percent: number
  line_total_czk: number
  target_room: string | null
  installation_notes: string | null
  serial_number: string | null
  sort_order: number
  created_at: string
  product?: Product
}

export interface DealStageHistory {
  id: string
  deal_id: string
  from_stage: DealStage | null
  to_stage: DealStage
  changed_by: string | null
  notes: string | null
  created_at: string
}

export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'task' | 'document'
export type ActivityEntityType = 'prospect' | 'client' | 'deal' | 'client_contact' | 'prospect_contact'

export interface Activity {
  id: string
  entity_type: ActivityEntityType
  entity_id: string
  type: ActivityType
  subject: string | null
  body: string | null
  is_completed: boolean
  due_date: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type DealActivity = Activity

export interface TechnicalAudit {
  id: string
  deal_id: string
  building_name: string | null
  floor_number: number | null
  room_name: string
  room_purpose: string | null
  area_m2: number | null
  ceiling_height_m: number
  volume_m3: number | null
  has_suspended_ceiling: boolean
  ceiling_type: string | null
  ceiling_load_capacity_kg_m2: number | null
  has_230v_nearby: boolean
  ventilation_type: string | null
  recommended_product_id: string | null
  recommended_quantity: number
  auditor_name: string | null
  audit_date: string | null
  notes: string | null
  created_at: string
  recommended_product?: Product
  air_measurements?: AirMeasurement[]
}

export interface AirMeasurement {
  id: string
  audit_id: string
  measurement_type: 'voc' | 'pm25' | 'co2' | 'formaldehyde' | 'ozone_residual'
  value_before: number | null
  value_after: number | null
  unit: string
  threshold_safe: number | null
  measured_at: string
  notes: string | null
}

export interface Installation {
  id: string
  deal_id: string
  deal_item_id: string | null
  status: 'planned' | 'in_progress' | 'completed' | 'issue'
  technician_name: string | null
  scheduled_date: string | null
  completed_date: string | null
  device_serial_number: string | null
  device_model: string | null
  installation_location: string | null
  safety_check_passed: boolean
  organisms_removed_confirmed: boolean
  ozone_concentration_max: number | null
  ozone_decay_minutes: number | null
  notes: string | null
  created_at: string
}

export interface DealDocument {
  id: string
  deal_id: string | null
  client_id: string | null
  doc_type: 'proposal' | 'contract' | 'technical_report' | 'certificate' | 'invoice' | 'photo' | 'other'
  title: string
  file_path: string | null
  file_size_bytes: number | null
  mime_type: string | null
  created_by: string | null
  created_at: string
}

export type AssignStrategy = 'round_robin' | 'keep_current' | 'return_original'

export type WorkflowTriggerType = 'stage_change' | 'inactivity'
export type EmailTemplate = 'stage_notification' | 'activity_reminder' | 'quote_followup' | 'custom'

export interface WorkflowRule {
  id: string
  trigger_type: WorkflowTriggerType
  trigger_stage: string
  assign_to_role: 'consultant' | 'technician' | null
  assign_strategy: AssignStrategy
  create_activity: boolean
  activity_type: 'task' | 'note' | 'call' | 'email' | 'meeting' | null
  activity_subject: string | null
  activity_due_days: number | null
  send_email: boolean
  email_template: EmailTemplate | null
  email_subject: string | null
  email_body_html: string | null
  inactivity_days: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type DocumentCategory = 'document' | 'presentation' | 'callscript' | 'offer_template' | 'contract'

export interface CrmDocument {
  id: string
  title: string
  description: string | null
  category: DocumentCategory
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string
  page_count: number | null
  tags: string[]
  uploaded_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

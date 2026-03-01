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
  notes: string | null
  assigned_consultant: string | null
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  client_id: string
  stage: DealStage
  title: string
  description: string | null
  total_value: number
  discount_percent: number
  final_value: number
  probability: number
  expected_close_date: string | null
  closed_at: string | null
  lost_reason: string | null
  assigned_consultant: string | null
  created_at: string
  updated_at: string
}

export interface DealItem {
  id: string
  deal_id: string
  product_id: string
  quantity: number
  unit_price: number
  line_total: number
  notes: string | null
  created_at: string
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

export interface DealActivity {
  id: string
  deal_id: string
  type: string
  description: string
  created_by: string | null
  created_at: string
}

export interface TechnicalAudit {
  id: string
  deal_id: string
  room_name: string
  floor_area_m2: number
  ceiling_height_m: number
  room_volume_m3: number
  ceiling_type: string | null
  has_230v_power: boolean
  notes: string | null
  created_at: string
}

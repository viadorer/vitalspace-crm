import { createClient } from '@/lib/supabase/client'

/**
 * Recalculate deal totals from deal_items after any item change.
 * Product categories: nastropni/mobilni/box → hardware, sluzba → service
 * Installation prices are summed from product.installation_price_czk * quantity
 */
export async function recalculateDealTotals(dealId: string) {
  const supabase = createClient()

  const { data: items } = await supabase
    .from('deal_items')
    .select('*, product:products(category, installation_price_czk, installation_required)')
    .eq('deal_id', dealId)

  if (!items) return

  let totalHardware = 0
  let totalService = 0
  let totalInstallation = 0

  for (const item of items) {
    const category = item.product?.category
    const lineTotal = item.line_total_czk || 0

    if (category === 'sluzba') {
      totalService += lineTotal
    } else {
      totalHardware += lineTotal
    }

    if (item.product?.installation_required && item.product?.installation_price_czk) {
      totalInstallation += item.product.installation_price_czk * (item.quantity || 1)
    }
  }

  const totalValue = totalHardware + totalService + totalInstallation

  // Get current discount to recalculate final price
  const { data: deal } = await supabase
    .from('deals')
    .select('discount_percent')
    .eq('id', dealId)
    .single()

  const discount = deal?.discount_percent || 0
  const finalPrice = Math.round(totalValue * (1 - discount / 100) * 100) / 100

  await supabase.from('deals').update({
    total_hardware_czk: totalHardware,
    total_service_czk: totalService,
    total_installation_czk: totalInstallation,
    total_value_czk: totalValue,
    final_price_czk: finalPrice,
  }).eq('id', dealId)
}

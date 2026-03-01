export function calculateRoomVolume(area: number, height: number): number {
  return area * height
}

export function calculateOzoneRequirement(volume: number): number {
  const ozonePerCubicMeter = 0.05
  return volume * ozonePerCubicMeter
}

export function calculateDeviceCount(
  totalOzoneRequired: number,
  deviceOutput: number
): number {
  return Math.ceil(totalOzoneRequired / deviceOutput)
}

export function calculateTotalPrice(items: Array<{ quantity: number; unit_price: number }>): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
}

export function calculateDiscount(total: number, discountPercent: number): number {
  return total * (discountPercent / 100)
}

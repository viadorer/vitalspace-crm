import { describe, it, expect } from 'vitest'
import {
  calculateRoomVolume,
  calculateOzoneRequirement,
  calculateDeviceCount,
  calculateTotalPrice,
  calculateDiscount,
} from '@/lib/utils/calculations'

describe('calculateRoomVolume', () => {
  it('returns area * height', () => {
    expect(calculateRoomVolume(20, 3)).toBe(60)
  })
  it('handles zero', () => {
    expect(calculateRoomVolume(0, 3)).toBe(0)
  })
})

describe('calculateOzoneRequirement', () => {
  it('returns volume * 0.05', () => {
    expect(calculateOzoneRequirement(100)).toBe(5)
  })
})

describe('calculateDeviceCount', () => {
  it('rounds up', () => {
    expect(calculateDeviceCount(7, 3)).toBe(3)
  })
  it('exact division', () => {
    expect(calculateDeviceCount(6, 3)).toBe(2)
  })
})

describe('calculateTotalPrice', () => {
  it('sums quantity * unit_price', () => {
    expect(
      calculateTotalPrice([
        { quantity: 2, unit_price: 100 },
        { quantity: 3, unit_price: 50 },
      ])
    ).toBe(350)
  })
  it('returns 0 for empty array', () => {
    expect(calculateTotalPrice([])).toBe(0)
  })
})

describe('calculateDiscount', () => {
  it('calculates percentage', () => {
    expect(calculateDiscount(1000, 10)).toBe(100)
  })
  it('zero discount', () => {
    expect(calculateDiscount(1000, 0)).toBe(0)
  })
})

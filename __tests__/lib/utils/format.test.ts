import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('formats CZK', () => {
    const result = formatCurrency(15000)
    expect(result).toContain('15')
    expect(result).toContain('000')
  })
  it('handles zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2024-03-15')
    expect(result).toMatch(/15/)
    expect(result).toMatch(/03/)
    expect(result).toMatch(/2024/)
  })
  it('formats Date object', () => {
    const result = formatDate(new Date(2024, 0, 5))
    expect(result).toMatch(/05/)
    expect(result).toMatch(/01/)
  })
})

describe('formatDateTime', () => {
  it('includes time', () => {
    const result = formatDateTime('2024-03-15T14:30:00')
    expect(result).toMatch(/14/)
    expect(result).toMatch(/30/)
  })
})

describe('formatNumber', () => {
  it('formats with decimals', () => {
    const result = formatNumber(1234.567, 2)
    expect(result).toContain('1')
    expect(result).toContain('234')
  })
  it('no decimals by default', () => {
    const result = formatNumber(1234)
    expect(result).not.toContain('.')
  })
})

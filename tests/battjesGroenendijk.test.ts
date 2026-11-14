import { describe, expect, it } from 'vitest'
import { battjesGroenendijk } from '../src/engineering/battjesGroenendijk'

describe('Battjes–Groenendijk wave-height distribution', () => {
  it('reproduces the EurOtop worked example', () => {
    const r = battjesGroenendijk(3.9, 7, 40)
    expect(r.h13).toBeCloseTo(4.16, 1)
    expect(r.h110).toBeCloseTo(4.77, 1)
    expect(r.h2Percent).toBeCloseTo(5.02, 1)
    expect(r.clamped).toBe(false)
  })

  it('uses the published table limit outside its range', () => {
    const r = battjesGroenendijk(1, 20, 100)
    expect(r.h2Percent / r.hrms).toBeCloseTo(1.978, 3)
    expect(r.clamped).toBe(true)
  })
})

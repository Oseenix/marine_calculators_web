import { describe, expect, it } from 'vitest'
import { rubbleOvertopping, smoothOvertopping, verticalOvertopping } from '../src/engineering/eurotop'

describe('EurOtop 2018 calculations', () => {
  it('design approach is conservative for smooth slopes', () => {
    const design = smoothOvertopping(2,8,2,3,1,1,1,1,'design')
    expect(design.q).toBeGreaterThan(smoothOvertopping(2,8,2,3,1,1,1,1,'mean').q)
    expect(design.runup2).toBeGreaterThan(0)
    expect(design.overtoppingProbability).toBeLessThanOrEqual(1)
  })
  it('rubble discharge falls as freeboard increases', () => {
    const low = rubbleOvertopping(2,8,1,1.5,.4,1,'design',true)
    expect(low.q).toBeGreaterThan(rubbleOvertopping(2,8,3,1.5,.4,1,'design',true).q)
    expect(low.runup2).toBeGreaterThan(0)
    expect(low.overtoppingProbabilityEquation).toBe('6.3')
  })
  it('selects non-impulsive and impulsive wall regimes', () => {
    expect(verticalOvertopping(1,6,1,10,true,'mean').regime).toBe('Non-impulsive')
    const impulsive = verticalOvertopping(2,10,1,1,true,'mean')
    expect(impulsive.regime).toBe('Impulsive')
    expect(impulsive.runup2).toBeUndefined()
    expect(impulsive.overtoppingProbabilityEquation).toBe('7.25')
  })
})

import { describe, expect, it } from 'vitest'
import { rubbleOvertopping, smoothOvertopping, verticalOvertopping } from '../src/engineering/eurotop'

describe('EurOtop 2018 calculations', () => {
  it('design approach is conservative for smooth slopes', () => {
    expect(smoothOvertopping(2,8,2,3,1,1,1,1,'design').q).toBeGreaterThan(smoothOvertopping(2,8,2,3,1,1,1,1,'mean').q)
  })
  it('rubble discharge falls as freeboard increases', () => {
    expect(rubbleOvertopping(2,8,1,1.5,.4,1,'design',true).q).toBeGreaterThan(rubbleOvertopping(2,8,3,1.5,.4,1,'design',true).q)
  })
  it('selects non-impulsive and impulsive wall regimes', () => {
    expect(verticalOvertopping(1,6,1,10,true,'mean').regime).toBe('Non-impulsive')
    expect(verticalOvertopping(2,10,1,1,true,'mean').regime).toBe('Impulsive')
  })
})

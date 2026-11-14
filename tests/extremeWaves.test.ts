import { describe, expect, it } from 'vitest'
import { stiveExtremeWaves } from '../src/engineering/extremeWaves'

describe('Stive extreme wave heights', () => {
  it('matches the published shallow-water correction', () => {
    const x=stiveExtremeWaves(2,4)
    expect(x.h1).toBeCloseTo(2*Math.sqrt(Math.log(100)/2)*1.5**(-1/3),12)
    expect(x.h01).toBeCloseTo(2*Math.sqrt(Math.log(1000)/2)*1.5**(-1/2),12)
  })
  it('approaches Rayleigh values as relative wave height tends to zero', () => {
    const x=stiveExtremeWaves(2,1e9)
    expect(x.h1).toBeCloseTo(x.rayleighH1,6)
    expect(x.h01).toBeCloseTo(x.rayleighH01,6)
  })
})

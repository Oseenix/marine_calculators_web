import { describe, expect, it } from 'vitest'
import { createExtremeWaveWorkbook } from '../src/export/extremeWaveWorkbook'
import { createEurotopWorkbook } from '../src/export/eurotopWorkbooks'

describe('new calculator workbooks',()=>{
  it('creates a Stive workbook with both published corrections',async()=>{
    const wb=await createExtremeWaveWorkbook({hm0:2,depth:4});const ws=wb.getWorksheet('Calculations')!
    expect(ws.getCell('E7').formula).toContain('LN(100)')
    expect(ws.getCell('F7').formula).toContain('LN(1000)')
  })
  it.each([
    ['smooth','R7','SQRT(9.81*C7^3)'],
    ['rubble','P7','SQRT(9.81*C7^3)'],
    ['vertical','L7','SQRT(9.81*C7^3)'],
  ] as const)('creates the %s EurOtop decision workbook',async(family,resultCell,fragment)=>{
    const wb=await createEurotopWorkbook(family,{approach:'design',hm0:2,period:8,rc:2.5,cotAlpha:3,gammaB:1,gammaF:1,beta:0,shortCrested:false,gammaV:1,permeableCore:true,depth:6,influencingForeshore:false})
    const ws=wb.getWorksheet('Calculations')!;expect(ws.getCell(resultCell).formula).toContain(fragment);expect(ws.conditionalFormattings.length).toBe(1)
  })
})

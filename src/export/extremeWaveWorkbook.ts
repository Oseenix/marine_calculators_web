import type { Workbook as ExcelWorkbook } from 'exceljs'

export async function createExtremeWaveWorkbook(values:{hm0:number;depth:number}){
  const {default:ExcelJS}=await import('exceljs');const wb:ExcelWorkbook=new ExcelJS.Workbook();const ws=wb.addWorksheet('Calculations',{properties:{defaultRowHeight:18}})
  wb.creator='Marine Calculators';wb.title='Extreme Individual Waves in Shallow Water';wb.calcProperties.fullCalcOnLoad=true
  ws.columns=[{width:10},{width:24},{width:18},{width:18},{width:18},{width:18},{width:20},{width:20},{width:34}]
  ws.mergeCells('A2:I2');ws.getCell('A2').value='Extreme Individual Waves in Shallow Water';ws.getCell('A2').font={name:'Arial',size:15,bold:true}
  ws.mergeCells('A3:I3');ws.getCell('A3').value='Yellow cells are inputs. Green cells are Stive results. Blue cells show the Rayleigh comparison.'
  ws.mergeCells('A4:I4');ws.getCell('A4').value='Stive (1986) provides published shallow-water corrections for H1% and H0.1% only.'
  const labels=['Case','Hm0 (m)','Depth, h (m)','Hm0/h','Stive H1% (m)','Stive H0.1% (m)','Rayleigh H1% (m)','Rayleigh H0.1% (m)','Notes'];const header=ws.getRow(6);header.values=labels
  header.eachCell(c=>{c.font={name:'Arial',size:10,bold:true,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4E78'}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true}});header.height=36
  for(let r=7;r<=31;r++){ws.getCell(r,1).value=r-6;ws.getCell(r,2).value=r===7?values.hm0:null;ws.getCell(r,3).value=r===7?values.depth:null;ws.getCell(r,4).value={formula:`IF(OR(B${r}="",C${r}=""),"",B${r}/C${r})`};ws.getCell(r,5).value={formula:`IF(D${r}="","",B${r}*SQRT(LN(100)/2)*(1+D${r})^(-1/3))`};ws.getCell(r,6).value={formula:`IF(D${r}="","",B${r}*SQRT(LN(1000)/2)*(1+D${r})^(-1/2))`};ws.getCell(r,7).value={formula:`IF(B${r}="","",B${r}*SQRT(LN(100)/2))`};ws.getCell(r,8).value={formula:`IF(B${r}="","",B${r}*SQRT(LN(1000)/2))`}
    for(let c=2;c<=3;c++){const cell=ws.getCell(r,c);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFFF2CC'}};cell.dataValidation={type:'decimal',operator:'greaterThan',allowBlank:true,formulae:[0]}}
    for(let c=4;c<=8;c++){const cell=ws.getCell(r,c);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:`FF${c<=6?'E2F0D9':'DDEBF7'}`}};cell.numFmt='0.000'}
  }
  ws.views=[{state:'frozen',ySplit:6,showGridLines:false}];ws.autoFilter='A6:I31';ws.mergeCells('A34:I34');ws.getCell('A34').value='References: Stive (1986), shallow-water correction; deep-water comparison from the Rayleigh distribution.'
  return wb
}
export async function downloadExtremeWaveWorkbook(values:{hm0:number;depth:number}){const wb=await createExtremeWaveWorkbook(values);const data=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([data as BlobPart],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));const a=document.createElement('a');a.href=url;a.download='shallow-water-extreme-waves.xlsx';a.click();URL.revokeObjectURL(url)}

export interface ExtremeWaveResult {
  ratio: number
  h1: number
  h01: number
  rayleighH1: number
  rayleighH01: number
}

export function stiveExtremeWaves(hm0: number, depth: number): ExtremeWaveResult {
  const ratio = hm0 / depth
  const rayleighH1 = hm0 * Math.sqrt(Math.log(100) / 2)
  const rayleighH01 = hm0 * Math.sqrt(Math.log(1000) / 2)
  return {
    ratio,
    h1: rayleighH1 * (1 + ratio) ** (-1 / 3),
    h01: rayleighH01 * (1 + ratio) ** (-1 / 2),
    rayleighH1,
    rayleighH01,
  }
}

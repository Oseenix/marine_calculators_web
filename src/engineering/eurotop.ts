const G = 9.81

export type EurotopApproach = 'design' | 'mean'
export type EurotopFamily = 'smooth' | 'rubble' | 'vertical'

export interface EurotopResult {
  q: number
  qNd: number
  regime: string
  equations: string
  xi?: number
  gammaFModified?: number
  impulseParameter?: number
  runup2?: number
  overtoppingProbability: number
  overtoppingProbabilityEquation: string
  applicable: boolean
  warnings: string[]
}

export const roughnessCatalogue: Record<string, number> = {
  'Smooth impermeable surface': 1,
  'Rock, 1 layer, impermeable core': 0.6,
  'Rock, 1 layer, permeable core': 0.45,
  'Rock, 2 layers, impermeable core': 0.55,
  'Rock, 2 layers, permeable core': 0.4,
  'Cubes, 1 layer, flat': 0.49,
  'Cubes, 2 layers, random': 0.47,
  Antifer: 0.5,
  HARO: 0.47,
  Tetrapod: 0.38,
  Dolos: 0.43,
  'Accropode I': 0.46,
  'Xbloc / CORE-LOC / Accropode II': 0.44,
  'Cubipod, 1 layer': 0.49,
  'Cubipod, 2 layers': 0.47,
}

export function deepWaterWavelength(period: number) { return G * period ** 2 / (2 * Math.PI) }
export function breakerParameter(hm0: number, period: number, cotAlpha: number) { return (1 / cotAlpha) / Math.sqrt(hm0 / deepWaterWavelength(period)) }
export function obliquityFactor(betaDegrees: number, shortCrested = false) {
  const beta = Math.max(0, Math.min(80, Math.abs(betaDegrees)))
  return shortCrested ? Math.max(0.8, 1 - 0.0033 * beta) : Math.max(0.6, 1 - 0.0063 * beta)
}

function result(qNd: number, rest: Omit<EurotopResult, 'q' | 'qNd'>, hm0: number): EurotopResult {
  return { q: qNd * Math.sqrt(G * hm0 ** 3), qNd, ...rest }
}

export function smoothOvertopping(hm0: number, period: number, rc: number, cotAlpha: number, gammaB: number, gammaF: number, gammaBeta: number, gammaV: number, approach: EurotopApproach): EurotopResult {
  const xi = breakerParameter(hm0, period, cotAlpha)
  const tanAlpha = 1 / cotAlpha
  const design = approach === 'design'
  const aBreak = design ? 0.026 : 0.023
  const bBreak = design ? 2.5 : 2.7
  const aMax = design ? 0.1035 : 0.09
  const bMax = design ? 1.35 : 1.5
  const qBreak = aBreak / Math.sqrt(tanAlpha) * gammaB * xi * Math.exp(-((bBreak * rc / (xi * hm0 * gammaB * gammaF * gammaBeta * gammaV)) ** 1.3))
  const qMax = aMax * Math.exp(-((bMax * rc / (hm0 * gammaF * gammaBeta)) ** 1.3))
  const combinedFactor = gammaB * gammaF * gammaBeta * gammaV
  const warnings: string[] = []
  const runupBreaking = (design ? 1.75 : 1.65) * gammaB * gammaF * gammaBeta * xi * hm0
  const runupMaximum = (design ? 1.07 : 1) * gammaF * gammaBeta * (4 - 1.5 / Math.sqrt(gammaB * xi)) * hm0
  const runup2 = Math.min(runupBreaking, runupMaximum)
  const overtoppingProbability = Math.exp(-((Math.sqrt(-Math.log(0.02)) * rc / runup2) ** 2))
  if (cotAlpha < 2) warnings.push('The general gentle-slope method is intended primarily for slopes 1:2 and gentler.')
  if (combinedFactor < 0.4) warnings.push('The combined influence factor is below 0.4; EurOtop recommends further research in this range.')
  return result(Math.min(qBreak, qMax), { xi, runup2, overtoppingProbability, overtoppingProbabilityEquation: '5.56', regime: qBreak <= qMax ? 'Breaking-wave equation' : 'Non-breaking maximum', equations: design ? '5.12 / 5.13' : '5.10 / 5.11', applicable: warnings.length === 0, warnings }, hm0)
}

export function rubbleOvertopping(hm0: number, period: number, rc: number, cotAlpha: number, gammaF: number, gammaBeta: number, approach: EurotopApproach, permeableCore: boolean): EurotopResult {
  const xi = breakerParameter(hm0, period, cotAlpha)
  let gammaFModified = gammaF
  if (xi > 5) gammaFModified = gammaF + (Math.min(xi, 10) - 5) * (1 - gammaF) / 5
  if (permeableCore) gammaFModified = Math.min(gammaFModified, 0.6)
  const design = approach === 'design'
  const qNd = (design ? 0.1035 : 0.09) * Math.exp(-(((design ? 1.35 : 1.5) * rc / (hm0 * gammaFModified * gammaBeta)) ** 1.3))
  const warnings: string[] = []
  let gammaFRunup = gammaF
  if (xi > 1.8) gammaFRunup = gammaF + (Math.min(xi, 10) - 1.8) * (1 - gammaF) / 8.2
  const runupBreaking = (design ? 1.75 : 1.65) * gammaF * gammaBeta * xi * hm0
  const runupMaximum = (design ? 1.07 : 1) * gammaFRunup * gammaBeta * (4 - 1.5 / Math.sqrt(xi)) * hm0
  const coreLimit = (design ? (permeableCore ? 2.14 : 3.21) : (permeableCore ? 2 : 3)) * hm0
  const runup2 = Math.min(runupBreaking, runupMaximum, coreLimit)
  const overtoppingProbability = Math.exp(-((Math.sqrt(-Math.log(0.02)) * rc / runup2) ** 2))
  if (cotAlpha < 1.333 || cotAlpha > 2) warnings.push('The steep armoured-slope method is intended for slopes from about 1:1.33 to 1:2.')
  if (xi < 2.8 || xi > 4.5) warnings.push('The Table 6.2 roughness factors were derived mainly for breaker parameters between 2.8 and 4.5.')
  warnings.push('EurOtop Equation 6.3 gives an upper estimate of the percentage of waves that actually overtop a rubble-mound crest.')
  return result(qNd, { xi, gammaFModified, runup2, overtoppingProbability, overtoppingProbabilityEquation: '6.3', regime: xi > 5 ? 'Steep armoured slope with modified roughness' : 'Steep armoured slope', equations: design ? '6.6 (and 6.7 where ξ > 5)' : '6.5 (and 6.7 where ξ > 5)', applicable: warnings.length === 1, warnings }, hm0)
}

export function verticalOvertopping(hm0: number, period: number, rc: number, depth: number, influencingForeshore: boolean, approach: EurotopApproach): EurotopResult {
  const l0 = deepWaterWavelength(period)
  const steepness = hm0 / l0
  const impulseParameter = depth ** 2 / (hm0 * l0)
  const design = approach === 'design'
  let qNd: number
  let regime: string
  let equations: string
  if (!influencingForeshore) {
    qNd = (design ? 0.054 : 0.047) * Math.exp(-(((design ? 2.12 : 2.35) * rc / hm0) ** 1.3))
    regime = 'No influencing foreshore'
    equations = design ? '7.2' : '7.1'
  } else if (impulseParameter > 0.23) {
    qNd = (design ? 0.062 : 0.05) * Math.exp(-(design ? 2.61 : 2.78) * rc / hm0)
    regime = 'Non-impulsive'
    equations = design ? '7.6' : '7.5'
  } else {
    const relativeFreeboard = rc / hm0
    const depthSteepness = hm0 / (depth * steepness)
    if (relativeFreeboard < 1.35) {
      qNd = (design ? 0.0155 : 0.011) * Math.sqrt(depthSteepness) * Math.exp(-2.2 * relativeFreeboard)
      equations = design ? '7.9' : '7.7'
    } else {
      qNd = (design ? 0.002 : 0.0014) * Math.sqrt(depthSteepness) * relativeFreeboard ** -3
      equations = design ? '7.10' : '7.8'
    }
    regime = 'Impulsive'
  }
  const warnings = depth <= 0 ? ['Water depth at the wall toe must be positive.'] : []
  const rayleighProbability = Math.exp(-1.21 * (rc / hm0) ** 2)
  const impulsiveProbability = 0.024 * impulseParameter * (rc / hm0) ** -1
  const overtoppingProbability = Math.min(1, influencingForeshore && impulseParameter <= 0.23 ? Math.max(rayleighProbability, impulsiveProbability) : rayleighProbability)
  return result(qNd, { impulseParameter, overtoppingProbability, overtoppingProbabilityEquation: influencingForeshore && impulseParameter <= 0.23 ? '7.25' : '7.24', regime, equations, applicable: warnings.length === 0, warnings }, hm0)
}

export type ValidationLevel = 'reference' | 'formula' | 'limited'

export type ValidationEntry = {
  level: ValidationLevel
  label: string
  summary: string
}

const reference = (summary: string): ValidationEntry => ({ level: 'reference', label: 'Reference checked', summary })
const formula = (summary: string): ValidationEntry => ({ level: 'formula', label: 'Formula checked', summary })
const limited = (summary: string): ValidationEntry => ({ level: 'limited', label: 'Independent check needed', summary })

export const validationCatalog: Record<string, ValidationEntry> = {
  'linear-wave': reference('Automated checks cover the dispersion solution, deep-water limits and Fenton-McKee wavelength approximation.'),
  'theory-selection': formula('Region logic and boundary continuity are tested; the map is educational guidance, not a substitute for a nonlinear-wave solution.'),
  'extreme-waves': formula('Stive equations and limiting behaviour are covered by automated tests; independent experimental benchmarking remains limited.'),
  'battjes-groenendijk': reference('Checked against published Battjes-Groenendijk distribution values and automated regression cases.'),
  'shoaling-refraction': reference('Conservation, Snell-law and representative numerical cases are covered by automated tests.'),
  'stokes-drift': reference('Surface and depth-decay values are checked against the analytical Stokes-drift expression.'),
  'wind-holthuijsen': formula('Equation implementation and workbook parity are tested; no broad field-data validation has been performed.'),
  'wind-carter': formula('Equation implementation and workbook parity are tested; no broad field-data validation has been performed.'),
  'cyclone-waves': formula('Regression and workbook tests cover the implemented empirical equations; site-specific verification is still required.'),
  'eurotop-smooth': formula('Equation branches, design/mean coefficients and limits are tested against EurOtop 2018 formulae; not benchmarked against the official neural network or physical-test database.'),
  'eurotop-rubble': formula('Equation branches, roughness corrections and limits are tested against EurOtop 2018 formulae; not benchmarked against the official neural network or physical-test database.'),
  'eurotop-vertical': formula('Plain-wall equation branches are tested against EurOtop 2018 formulae. Composite walls and independent database benchmarking are not included.'),
  'wave-setup': formula('Analytical formula and regression tests are present; broader comparison with Stockdon field data is still needed.'),
  'bed-shear': formula('Soulsby/DATA13 formula paths are regression tested; independent software comparison is still needed.'),
  'critical-current': formula('Soulsby threshold formula is regression tested; independent software comparison is still needed.'),
  'critical-shear': formula('Shields threshold formula is regression tested; independent software comparison is still needed.'),
  'critical-orbital': formula('Soulsby relationship is regression tested; independent software comparison is still needed.'),
  'fall-velocity': formula('Ferguson-Church and Soulsby implementations are regression tested; additional published benchmark cases would improve confidence.'),
  'rock-sizing': formula('Van der Meer branches and workbook output are tested; project use still requires applicability and physical-design review.'),
  'wind-setup': formula('Equation and units are regression tested; independent benchmark cases are limited.'),
  'fringe-setup': limited('Implemented from the source application, but no independent published worked example has yet been reproduced.'),
  'beach-slope': limited('Empirical source relationship is implemented, but provenance and independent benchmark coverage need strengthening.'),
  'sediment-density': limited('Source-app parity is checked, but the empirical mixture relationship lacks an independent benchmark set.'),
  'submerged-breakwater': limited('Source-app parity and calibration-range logic are tested; an independent published dataset has not yet been reproduced.'),
  'reef-balls': limited('Source-app parity is tested; an independent published dataset has not yet been reproduced.'),
  'overtopping': limited('Retained for comparison with the source app; use the newer EurOtop calculators for current work.'),
}

export function validationFor(id: string): ValidationEntry {
  return validationCatalog[id] ?? limited('Automated regression coverage is present, but no independent published benchmark has yet been documented.')
}

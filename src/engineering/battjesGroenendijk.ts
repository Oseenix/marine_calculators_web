export interface BattjesGroenendijkResult {
  hrms: number
  transitionHeight: number
  normalizedTransition: number
  h13: number
  h110: number
  h2Percent: number
  h1Percent: number
  h01Percent: number
  clamped: boolean
}

// Table 2 from Battjes & Groenendijk (2000), reproduced in Verhagen (2013).
// Columns are Htr/Hrms, H1/3, H1/10, H2%, H1%, H0.1%, all heights normalised by Hrms.
const rows = `
.05 1.279 1.466 1.548 1.620 1.813
.10 1.279 1.466 1.548 1.620 1.813
.15 1.279 1.466 1.548 1.620 1.813
.20 1.279 1.466 1.548 1.620 1.813
.25 1.279 1.466 1.548 1.620 1.813
.30 1.279 1.466 1.548 1.620 1.813
.35 1.279 1.466 1.548 1.620 1.813
.40 1.279 1.466 1.548 1.620 1.813
.45 1.279 1.466 1.549 1.620 1.813
.50 1.280 1.467 1.549 1.621 1.814
.55 1.281 1.468 1.550 1.622 1.815
.60 1.282 1.469 1.552 1.624 1.817
.65 1.284 1.471 1.554 1.626 1.820
.70 1.286 1.474 1.557 1.629 1.823
.75 1.290 1.478 1.561 1.634 1.828
.80 1.294 1.483 1.567 1.639 1.835
.85 1.300 1.490 1.573 1.646 1.843
.90 1.307 1.498 1.582 1.655 1.852
.95 1.315 1.507 1.591 1.665 1.864
1.00 1.324 1.518 1.603 1.677 1.877
1.05 1.335 1.530 1.616 1.690 1.892
1.10 1.346 1.543 1.630 1.705 1.909
1.15 1.359 1.558 1.645 1.721 1.927
1.20 1.371 1.573 1.662 1.739 1.946
1.25 1.381 1.590 1.679 1.757 1.967
1.30 1.389 1.607 1.698 1.776 1.988
1.35 1.395 1.626 1.717 1.796 2.011
1.40 1.399 1.644 1.737 1.817 2.034
1.45 1.403 1.664 1.757 1.838 2.058
1.50 1.406 1.683 1.778 1.860 2.082
1.55 1.408 1.703 1.799 1.882 2.106
1.60 1.410 1.721 1.820 1.904 2.131
1.65 1.411 1.736 1.841 1.927 2.156
1.70 1.412 1.749 1.863 1.949 2.182
1.75 1.413 1.759 1.884 1.972 2.207
1.80 1.413 1.767 1.906 1.994 2.232
1.85 1.414 1.773 1.927 2.017 2.257
1.90 1.414 1.779 1.949 2.039 2.282
1.95 1.415 1.783 1.970 2.062 2.307
2.00 1.415 1.786 1.985 2.084 2.332
2.05 1.415 1.789 1.983 2.106 2.357
2.10 1.415 1.791 1.982 2.128 2.382
2.15 1.415 1.793 1.981 2.150 2.406
2.20 1.415 1.795 1.981 2.149 2.430
2.25 1.415 1.796 1.980 2.148 2.454
2.30 1.415 1.797 1.979 2.148 2.478
2.35 1.415 1.797 1.979 2.147 2.502
2.40 1.416 1.798 1.979 2.147 2.525
2.45 1.416 1.798 1.979 2.147 2.548
2.50 1.416 1.799 1.978 2.147 2.571
2.55 1.416 1.799 1.978 2.146 2.593
2.60 1.416 1.799 1.978 2.146 2.616
2.65 1.416 1.799 1.978 2.146 2.629
2.70 1.416 1.799 1.978 2.146 2.629
2.75 1.416 1.800 1.978 2.146 2.628
2.80 1.416 1.800 1.978 2.146 2.628
2.85 1.416 1.800 1.978 2.146 2.628
2.90 1.416 1.800 1.978 2.146 2.628
2.95 1.416 1.800 1.978 2.146 2.628
3.00 1.416 1.800 1.978 2.146 2.628`.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number))

function interpolate(x: number, column: number) {
  const xc = Math.max(rows[0][0], Math.min(rows[rows.length - 1][0], x))
  const upper = rows.findIndex(row => row[0] >= xc)
  if (upper <= 0) return rows[0][column]
  const a = rows[upper - 1], b = rows[upper]
  const f = (xc - a[0]) / (b[0] - a[0])
  return a[column] + f * (b[column] - a[column])
}

export function battjesGroenendijk(hm0: number, depth: number, cotSlope: number): BattjesGroenendijkResult {
  const rootM0 = hm0 / 4
  const hrms = (2.69 + 3.24 * rootM0 / depth) * rootM0
  const transitionHeight = (0.35 + 5.8 / cotSlope) * depth
  const normalizedTransition = transitionHeight / hrms
  const value = (column: number) => interpolate(normalizedTransition, column) * hrms
  return { hrms, transitionHeight, normalizedTransition, h13: value(1), h110: value(2), h2Percent: value(3), h1Percent: value(4), h01Percent: value(5), clamped: normalizedTransition < 0.05 || normalizedTransition > 3 }
}

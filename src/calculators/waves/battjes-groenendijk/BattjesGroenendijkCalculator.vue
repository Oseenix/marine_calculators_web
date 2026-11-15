<script setup lang="ts">
import { computed, reactive } from 'vue'
import PlotlyChart from '../../../components/PlotlyChart.vue'
import InfoTip from '../../../components/InfoTip.vue'
import { battjesGroenendijk } from '../../../engineering/battjesGroenendijk'

const values = reactive({ hm0: 3.9, depth: 7, cotSlope: 40 })
const result = computed(() => battjesGroenendijk(values.hm0, values.depth, values.cotSlope))
const labels = ['H1/3', 'H1/10', 'H2%', 'H1%', 'H0.1%']
const heights = computed(() => [result.value.h13, result.value.h110, result.value.h2Percent, result.value.h1Percent, result.value.h01Percent])
const rayleigh = computed(() => [1.416, 1.8, 1.978, 2.146, 2.628].map(x => x * result.value.hrms))
const chartData = computed(() => [
  { x: labels, y: heights.value, name: 'Battjes–Groenendijk', type: 'bar' as const, marker: { color: '#0879bd' }, hovertemplate: '%{x}: %{y:.3f} m<extra></extra>' },
  { x: labels, y: rayleigh.value, name: 'Rayleigh reference', type: 'scatter' as const, mode: 'lines+markers' as const, line: { color: '#e36f18', width: 2 }, hovertemplate: '%{x}: %{y:.3f} m<extra></extra>' },
])
</script>

<template>
  <section class="calculator">
    <div class="calculator-heading"><div><h1>Shallow-Water Wave Height Distribution</h1><p class="eurotop-section">Battjes–Groenendijk composite Weibull method</p></div></div>
    <div class="calculator-grid">
      <article class="panel input-panel"><div class="panel-title input-title"><h2>Input</h2></div>
        <label>Spectral Wave Height, Hm0 (m) <InfoTip text="Local spectral significant wave height after transformation across the foreshore." /><input v-model.number="values.hm0" type="number" min=".01" step="any" /></label>
        <label>Local Water Depth, h (m) <InfoTip text="Still-water depth at the location where the individual-wave distribution is required." /><input v-model.number="values.depth" type="number" min=".01" step="any" /></label>
        <label>Foreshore Slope, cot α (1V:nH) <InfoTip text="Horizontal distance per unit vertical rise. The principal calibration range was approximately 1:20 to 1:250." /><input v-model.number="values.cotSlope" type="number" min="1" step="any" /></label>
      </article>
      <article class="panel output-panel"><div class="panel-title output-title"><h2>Output</h2></div><dl class="results">
        <div><dt>Root-mean-square Height, Hrms <InfoTip text="Square root of the mean squared individual wave heights, inferred from Hm0 and relative depth." /></dt><dd>{{ result.hrms.toFixed(3) }} m</dd></div>
        <div><dt>Transition Height, Htr <InfoTip text="Height at which the composite distribution changes from Weibull exponent 2 to exponent 3.6." /></dt><dd>{{ result.transitionHeight.toFixed(3) }} m</dd></div>
        <div><dt>H1/3 <InfoTip text="Mean height of the highest one-third of individual waves." /></dt><dd>{{ result.h13.toFixed(3) }} m</dd></div>
        <div><dt>H1/10 <InfoTip text="Mean height of the highest one-tenth of individual waves." /></dt><dd>{{ result.h110.toFixed(3) }} m</dd></div>
        <div><dt>H2% <InfoTip text="Individual wave height exceeded by 2% of waves, or about one wave in 50." /></dt><dd>{{ result.h2Percent.toFixed(3) }} m</dd></div>
        <div><dt>H1% <InfoTip text="Individual wave height exceeded by 1% of waves, or about one wave in 100." /></dt><dd>{{ result.h1Percent.toFixed(3) }} m</dd></div>
        <div><dt>H0.1% <InfoTip text="Individual wave height exceeded by 0.1% of waves, or about one wave in 1,000." /></dt><dd>{{ result.h01Percent.toFixed(3) }} m</dd></div>
      </dl><div :class="result.clamped || values.cotSlope<20 || values.cotSlope>250?'applicability-warning':'applicability-ok'">{{ result.clamped?'Htr/Hrms is outside the published table range (0.05–3.0); the nearest tabulated limit is being used.':values.cotSlope<20 || values.cotSlope>250?'The foreshore slope is outside the principal calibration range of 1:20 to 1:250.':'The transition ratio and foreshore slope lie within the published ranges.' }}</div></article>
      <article class="panel charts-panel"><div class="panel-title graphical-title"><h2>Graphical</h2></div><div class="graphical-body eurotop-graphical">
        <PlotlyChart :data="chartData" :layout="{barmode:'group',margin:{t:58,b:66},xaxis:{title:{text:'Characteristic wave height',standoff:12}},yaxis:{title:{text:'Wave height (m)'},rangemode:'tozero'},legend:{orientation:'h',x:.5,xanchor:'center',y:1.16,yanchor:'bottom'}}" />
      </div></article>
    </div>
    <article class="background-panel"><div class="background-title"><h2>Background and applicability</h2><span>−</span></div><div class="background-body">
      <p>In deep water, individual wave heights are often represented by a Rayleigh distribution. On a shallow sloping foreshore, the largest waves break first, so the upper tail becomes smaller and steeper. Battjes and Groenendijk represent this with two joined Weibull distributions: exponent 2 below a transition height and 3.6 above it.</p>
      <p>The method uses local Hm0, water depth and foreshore slope. Hrms follows EurOtop Equation 2.1 and Htr = (0.35 + 5.8 tan α)h. The characteristic heights are linearly interpolated from Table 2 of Battjes and Groenendijk (2000). The orange Rayleigh curve is a reference, not an additional prediction.</p>
      <p>The original calibration covered straight shallow foreshores, principally slopes from 1:20 to 1:250. EurOtop advises against applying the composite distribution to a horizontal bed, where the distribution may tend back towards Rayleigh.</p>
      <p><strong>Note on the EurOtop example:</strong> its text reports H2% = 5.4 m, but the reproduced table gives about 5.02 m and its stated H2%/H1/3 ratio of 1.21 gives about 5.03 m. This calculator follows the table, which is internally consistent with the ratio.</p>
      <p>Sources: Battjes &amp; Groenendijk (2000), Coastal Engineering 40, 161–182; EurOtop (2018), Section 2.3.2.</p>
    </div></article>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import PlotlyChart from '../../../components/PlotlyChart.vue'
import { linspace } from '../../../engineering/numeric'
import { stiveExtremeWaves } from '../../../engineering/extremeWaves'
import { downloadExtremeWaveWorkbook } from '../../../export/extremeWaveWorkbook'

const values=reactive({hm0:2,depth:4})
const result=computed(()=>stiveExtremeWaves(values.hm0,values.depth))
const curve=computed(()=>linspace(.01,1.2,120).map(r=>({r,h1:Math.sqrt(Math.log(100)/2)*(1+r)**(-1/3),h01:Math.sqrt(Math.log(1000)/2)*(1+r)**(-1/2)})))
const chartData=computed(()=>[
  {x:curve.value.map(x=>x.r),y:curve.value.map(x=>x.h1),type:'scatter' as const,mode:'lines' as const,name:'Stive H1%',line:{color:'#0879bd',width:2},hovertemplate:'Hm0/h: %{x:.3f}<br>H1%/Hm0: %{y:.3f}<extra></extra>'},
  {x:curve.value.map(x=>x.r),y:curve.value.map(x=>x.h01),type:'scatter' as const,mode:'lines' as const,name:'Stive H0.1%',line:{color:'#d66a00',width:2},hovertemplate:'Hm0/h: %{x:.3f}<br>H0.1%/Hm0: %{y:.3f}<extra></extra>'},
  {x:[result.value.ratio,result.value.ratio],y:[result.value.h1/values.hm0,result.value.h01/values.hm0],type:'scatter' as const,mode:'markers' as const,name:'Your wave',marker:{color:'#111',size:9},hovertemplate:'Relative wave height: %{x:.3f}<br>Height ratio: %{y:.3f}<extra></extra>'},
])
</script>

<template>
  <section class="calculator">
    <div class="calculator-heading"><h1>Extreme Individual Waves in Shallow Water</h1><button class="excel-download" type="button" @click="downloadExtremeWaveWorkbook(values)">Download Excel template</button></div>
    <p class="theory-intro">Significant wave height describes a sea state, but individual waves can be appreciably higher. Stive’s simple empirical correction reduces the deep-water Rayleigh extremes as waves become depth limited.</p>
    <div class="calculator-grid">
      <article class="panel input-panel"><div class="panel-title input-title"><h2>Input</h2></div>
        <label>Spectral Significant Wave Height, Hm0 (m)<input v-model.number="values.hm0" type="number" min="0.001" step="any" /></label>
        <label>Water Depth, h (m)<input v-model.number="values.depth" type="number" min="0.001" step="any" /></label>
      </article>
      <article class="panel output-panel"><div class="panel-title output-title"><h2>Output</h2></div><dl class="results">
        <div><dt>Relative Wave Height, Hm0/h</dt><dd>{{ result.ratio.toFixed(3) }}</dd></div>
        <div><dt>1% Exceedance Wave Height, H1%</dt><dd>{{ result.h1.toFixed(2) }} m</dd></div>
        <div><dt>0.1% Exceedance Wave Height, H0.1%</dt><dd>{{ result.h01.toFixed(2) }} m</dd></div>
        <div><dt>Deep-Water Rayleigh H1%</dt><dd>{{ result.rayleighH1.toFixed(2) }} m</dd></div>
        <div><dt>Deep-Water Rayleigh H0.1%</dt><dd>{{ result.rayleighH01.toFixed(2) }} m</dd></div>
      </dl></article>
      <article class="panel charts-panel"><div class="panel-title graphical-title"><h2>Graphical</h2></div><div class="graphical-body">
        <PlotlyChart :data="chartData" :layout="{xaxis:{title:{text:'Relative wave height, Hm0/h'}},yaxis:{title:{text:'Extreme wave height / Hm0'}},legend:{orientation:'h',y:-.22},margin:{b:85}}" />
      </div></article>
    </div>
    <article class="background-panel"><div class="background-title"><h2>Background and method choice</h2><span>−</span></div><div class="background-body">
      <p>Stive (1986) proposed empirical corrections to the Rayleigh distribution for depth-limited waves:</p>
      <div class="equation">H₁% = Hm0 √(ln 100 / 2) (1 + Hm0/h)⁻¹ᐟ³</div>
      <div class="equation">H₀.₁% = Hm0 √(ln 1000 / 2) (1 + Hm0/h)⁻¹ᐟ²</div>
      <p>The method is attractive because it needs only Hm0 and water depth. It was based on physical-model tests and a limited prototype check, so it is best treated as a transparent screening calculation. The later Battjes–Groenendijk (2000) composite Weibull distribution is more widely used for shallow foreshores and can predict a broader set of exceedance statistics, but it also needs foreshore information and a more involved solution. A future comparison calculator could add that method without weakening the clarity of this one.</p>
      <p>Only H₁% and H₀.₁% are presented as Stive results because those are the two published correction equations. The Rayleigh values show what the same sea state would produce without the shallow-water correction.</p>
    </div></article>
  </section>
</template>

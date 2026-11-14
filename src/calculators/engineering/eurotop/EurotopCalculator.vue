<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import PlotlyChart from '../../../components/PlotlyChart.vue'
import { linspace } from '../../../engineering/numeric'
import { obliquityFactor, roughnessCatalogue, rubbleOvertopping, smoothOvertopping, verticalOvertopping, type EurotopApproach, type EurotopFamily } from '../../../engineering/eurotop'
import { downloadEurotopWorkbook } from '../../../export/eurotopWorkbooks'

const props=defineProps<{family:EurotopFamily}>()
const values=reactive({approach:'design' as EurotopApproach,hm0:2,period:8,rc:2.5,cotAlpha:props.family==='rubble'?1.5:3,gammaB:1,gammaF:props.family==='rubble'?.4:1,beta:0,shortCrested:false,gammaV:1,permeableCore:true,depth:6,influencingForeshore:false})
const vary=ref<'rc'|'hm0'|'period'>('rc')
const title=computed(()=>props.family==='smooth'?'Dikes and Embankment Seawalls':props.family==='rubble'?'Armoured Rubble Slopes and Mounds':'Vertical and Steep Walls')
const section=computed(()=>props.family==='smooth'?'Section 5':props.family==='rubble'?'Section 6':'Section 7')
const image=computed(()=>`images/eurotop/${props.family==='smooth'?'smooth-slope':props.family==='rubble'?'rubble-mound':'composite-wall'}.png`)
function calculate(overrides:Partial<typeof values>={}){
  const v={...values,...overrides}
  if(props.family==='smooth')return smoothOvertopping(v.hm0,v.period,v.rc,v.cotAlpha,v.gammaB,v.gammaF,obliquityFactor(v.beta,v.shortCrested),v.gammaV,v.approach)
  if(props.family==='rubble')return rubbleOvertopping(v.hm0,v.period,v.rc,v.cotAlpha,v.gammaF,obliquityFactor(v.beta,v.shortCrested),v.approach,v.permeableCore)
  return verticalOvertopping(v.hm0,v.period,v.rc,v.depth,v.influencingForeshore,v.approach)
}
const result=computed(()=>calculate())
const sweep=computed(()=>{const centre=values[vary.value];const lo=vary.value==='rc'?0:Math.max(.05,centre*.45);const hi=vary.value==='rc'?Math.max(1,centre*2):centre*1.55;return linspace(lo,hi,80).map(x=>({x,q:calculate({[vary.value]:x}).q*1000}))})
const chartData=computed(()=>[
  {x:sweep.value.map(x=>x.x),y:sweep.value.map(x=>x.q),type:'scatter' as const,mode:'lines' as const,line:{color:'#0879bd',width:2},hovertemplate:`${varyLabel.value}: %{x:.3g}<br>Discharge: %{y:.3g} L/s/m<extra></extra>`},
  {x:[values[vary.value]],y:[result.value.q*1000],type:'scatter' as const,mode:'markers' as const,marker:{color:'#111',size:9},hovertemplate:'Current case<br>%{y:.3g} L/s/m<extra></extra>'},
])
const varyLabel=computed(()=>vary.value==='rc'?'Crest freeboard, Rc (m)':vary.value==='hm0'?'Wave height, Hm0 (m)':'Wave period, Tm-1,0 (s)')
const armour=ref('Rock, 2 layers, permeable core')
function setArmour(){values.gammaF=roughnessCatalogue[armour.value]}
</script>

<template>
  <section class="calculator">
    <div class="calculator-heading"><div><h1>{{ title }}</h1><p class="eurotop-section">EurOtop 2018, {{ section }}</p></div><button class="excel-download" type="button" @click="downloadEurotopWorkbook(props.family,values)">Download Excel template</button></div>
    <div class="calculator-grid">
      <article class="panel input-panel"><div class="panel-title input-title"><h2>Input</h2></div>
        <label>Calculation Approach<select v-model="values.approach"><option value="design">Design / assessment</option><option value="mean">Mean value</option></select></label>
        <label>Spectral Wave Height, Hm0 (m)<input v-model.number="values.hm0" type="number" min=".05" step="any" /></label>
        <label>Spectral Period, Tm-1,0 (s)<input v-model.number="values.period" type="number" min=".5" step="any" /></label>
        <label>Crest Freeboard, Rc (m)<input v-model.number="values.rc" type="number" min="0" step="any" /></label>
        <template v-if="family==='smooth'">
          <label>Slope, cot α (1V:nH)<input v-model.number="values.cotAlpha" type="number" min="1.5" step="any" /></label>
          <label>Berm Factor, γb<input v-model.number="values.gammaB" type="number" min=".4" max="1" step=".01" /></label>
          <label>Roughness Factor, γf<input v-model.number="values.gammaF" type="number" min=".4" max="1" step=".01" /></label>
          <label>Wall Factor, γv<input v-model.number="values.gammaV" type="number" min=".4" max="1" step=".01" /></label>
        </template>
        <template v-else-if="family==='rubble'">
          <label>Armour Slope, cot α (1V:nH)<input v-model.number="values.cotAlpha" type="number" min="1.333" max="2" step=".05" /></label>
          <label>Armour System<select v-model="armour" @change="setArmour"><option v-for="(_,name) in roughnessCatalogue" :key="name" :value="name">{{ name }}</option></select></label>
          <label>Applied Roughness Factor, γf<input v-model.number="values.gammaF" type="number" min=".1" max="1" step=".01" /></label>
          <label class="check-label"><input v-model="values.permeableCore" type="checkbox" /> Permeable core</label>
        </template>
        <template v-else>
          <label>Water Depth at Wall Toe, h (m)<input v-model.number="values.depth" type="number" min=".05" step="any" /></label>
          <label class="check-label"><input v-model="values.influencingForeshore" type="checkbox" /> Influencing foreshore</label>
        </template>
        <template v-if="family!=='vertical'">
          <label>Wave Angle, β (degrees)<input v-model.number="values.beta" type="number" min="0" max="80" step="1" /></label>
          <label class="check-label"><input v-model="values.shortCrested" type="checkbox" /> Short-crested waves</label>
        </template>
      </article>
      <article class="panel output-panel"><div class="panel-title output-title"><h2>Output</h2></div><dl class="results">
        <div class="primary-result"><dt>Mean Overtopping Discharge</dt><dd>{{ (result.q*1000).toPrecision(4) }} L/s/m</dd></div>
        <div><dt>Discharge in SI Units</dt><dd>{{ result.q.toPrecision(4) }} m³/s/m</dd></div>
        <div><dt>Governing Regime</dt><dd>{{ result.regime }}</dd></div>
        <div><dt>EurOtop Equation(s)</dt><dd>{{ result.equations }}</dd></div>
        <div v-if="result.runup2!==undefined"><dt>2% Wave Run-up, Ru2%</dt><dd>{{ result.runup2.toPrecision(4) }} m</dd></div>
        <div><dt>Waves Overtopping</dt><dd>{{ (100*result.overtoppingProbability).toPrecision(3) }}%</dd></div>
        <div><dt>Overtopping-wave Equation</dt><dd>{{ result.overtoppingProbabilityEquation }}</dd></div>
        <div v-if="result.xi!==undefined"><dt>Breaker Parameter, ξm-1,0</dt><dd>{{ result.xi.toFixed(2) }}</dd></div>
        <div v-if="result.gammaFModified!==undefined"><dt>Applied Modified Roughness, γf,mod</dt><dd>{{ result.gammaFModified.toFixed(3) }}</dd></div>
        <div v-if="result.impulseParameter!==undefined"><dt>Impulse Classifier</dt><dd>{{ result.impulseParameter.toFixed(3) }}</dd></div>
      </dl><div :class="result.applicable?'applicability-ok':'applicability-warning'">{{ result.applicable?'Inputs pass the automated applicability checks.':result.warnings.join(' ') }}</div><p v-if="family==='rubble'" class="method-note">Equation 6.3 is an upper estimate: run-up on the front slope is not identical to water passing the crest, particularly where a crest berm or crown wall is present.</p></article>
      <article class="panel charts-panel"><div class="panel-title graphical-title"><h2>Graphical</h2></div><div class="graphical-body eurotop-graphical">
        <PlotlyChart :data="chartData" :layout="{xaxis:{title:{text:varyLabel}},yaxis:{title:{text:'Mean discharge, q (L/s/m)'},type:'log'},showlegend:false}" />
        <div class="select-row"><label>Vary Input<select v-model="vary"><option value="rc">Crest freeboard</option><option value="hm0">Wave height</option><option value="period">Wave period</option></select></label><img class="structure-diagram" :src="image" :alt="`${title} geometry`" /></div>
      </div></article>
    </div>
    <article class="background-panel"><div class="background-title"><h2>Background, equation selection and applicability</h2><span>−</span></div><div class="background-body">
      <template v-if="family==='smooth'"><p>The calculator evaluates the breaking-wave expression and its non-breaking maximum, then uses the lower discharge. The design approach uses Equations 5.12 and 5.13; the mean-value approach uses 5.10 and 5.11. Berm, roughness, obliquity and wall factors modify the effective freeboard.</p><p>Ru2% is calculated with Equations 5.1–5.5. Equation 5.56 then estimates the proportion of incident waves whose run-up exceeds the freeboard. The wall factor is used for discharge, but EurOtop does not apply it to run-up.</p></template>
      <template v-else-if="family==='rubble'"><p>Equations 6.5 (mean) and 6.6 (design) apply to simple steep armoured slopes. When ξm-1,0 exceeds 5, Equation 6.7 progressively increases the effective roughness factor towards 1.0. The selected armour system supplies the Table 6.2 roughness factor.</p><p>Ru2% uses Equations 6.1 and 6.2, including the surging-wave roughness correction and core-permeability limit. Equation 6.3 converts run-up to an overtopping percentage, but the manual warns that this overestimates the number actually passing the crest.</p></template>
      <template v-else><p>Without an influencing foreshore, the plain-wall equations 7.1 or 7.2 are used. With a foreshore, h²/(Hm0Lm-1,0) separates non-impulsive conditions above 0.23 (Equations 7.5 or 7.6) from impulsive conditions. Impulsive cases then use the exponential branch below Rc/Hm0 = 1.35 (7.7 or 7.9) and the power-law branch above it (7.8 or 7.10).</p><p>A vertical wall has no front slope on which to define Ru2%. The percentage is therefore calculated directly with Equation 7.24 for non-impulsive waves or Equation 7.25 for impulsive waves.</p></template>
      <p>The reported equation and regime update with the inputs. The graph shows the sensitivity of the selected family’s complete decision process, not a single permanently selected equation.</p>
      <p>Source: EurOtop (2018), Manual on wave overtopping of sea defences and related structures, {{ section }}.</p>
    </div></article>
  </section>
</template>

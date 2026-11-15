<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'
import type { Layout } from 'plotly.js'
import PlotlyChart from '../../../components/PlotlyChart.vue'
import { linspace } from '../../../engineering/numeric'
import { obliquityFactor, roughnessCatalogue, rubbleOvertopping, smoothOvertopping, verticalOvertopping, type EurotopApproach, type EurotopFamily } from '../../../engineering/eurotop'
import { downloadEurotopWorkbook } from '../../../export/eurotopWorkbooks'

const props=defineProps<{family:EurotopFamily}>()
const values=reactive({approach:'design' as EurotopApproach,hm0:2,period:8,rc:2.5,cotAlpha:props.family==='rubble'?1.5:3,gammaB:1,gammaF:props.family==='rubble'?.4:1,beta:0,shortCrested:false,gammaV:1,permeableCore:true,depth:6,influencingForeshore:false})
const vary=ref<'rc'|'hm0'|'period'>('rc')
const title=computed(()=>props.family==='smooth'?'Dikes and Embankment Seawalls':props.family==='rubble'?'Armoured Rubble Slopes and Mounds':'Vertical and Steep Walls')
const section=computed(()=>props.family==='smooth'?'Section 5':props.family==='rubble'?'Section 6':'Section 7')
const image=computed(()=>`images/eurotop/${props.family==='smooth'?'smooth-slope.png':props.family==='rubble'?'rubble-mound.png':'plain-wall.svg'}`)
function calculate(overrides:Partial<typeof values>={}){
  const v={...values,...overrides}
  if(props.family==='smooth')return smoothOvertopping(v.hm0,v.period,v.rc,v.cotAlpha,v.gammaB,v.gammaF,obliquityFactor(v.beta,v.shortCrested),v.gammaV,v.approach)
  if(props.family==='rubble')return rubbleOvertopping(v.hm0,v.period,v.rc,v.cotAlpha,v.gammaF,obliquityFactor(v.beta,v.shortCrested),v.approach,v.permeableCore)
  return verticalOvertopping(v.hm0,v.period,v.rc,v.depth,v.influencingForeshore,v.approach)
}
const result=computed(()=>calculate())
const sweep=computed(()=>{const centre=values[vary.value];const lo=vary.value==='rc'?0:Math.max(.05,centre*.45);const hi=vary.value==='rc'?Math.max(1,centre*2):centre*1.55;return linspace(lo,hi,120).map(x=>{const r=calculate({[vary.value]:x});return{x,q:r.q*1000,regime:r.regime,equations:r.equations}})})
const transitions=computed(()=>sweep.value.slice(1).flatMap((point,index)=>{const previous=sweep.value[index];return point.regime!==previous.regime||point.equations!==previous.equations?[{x:(point.x+previous.x)/2,label:point.regime,equations:point.equations}]:[]}))
const chartData=computed(()=>[
  {x:sweep.value.map(x=>x.x),y:sweep.value.map(x=>x.q),type:'scatter' as const,mode:'lines' as const,line:{color:'#0879bd',width:2},hovertemplate:`${varyLabel.value}: %{x:.3g}<br>Discharge: %{y:.3g} L/s/m<extra></extra>`},
  {x:[values[vary.value]],y:[result.value.q*1000],type:'scatter' as const,mode:'markers' as const,marker:{color:'#111',size:9},hovertemplate:'Current case<br>%{y:.3g} L/s/m<extra></extra>'},
])
const varyLabel=computed(()=>vary.value==='rc'?'Crest freeboard, Rc (m)':vary.value==='hm0'?'Wave height, Hm0 (m)':'Wave period, Tm-1,0 (s)')
const chartLayout=computed<Partial<Layout>>(()=>({xaxis:{title:{text:varyLabel.value}},yaxis:{title:{text:'Mean discharge, q (L/s/m)'},type:'log'},showlegend:false,shapes:transitions.value.map(t=>({type:'line',xref:'x',yref:'paper',x0:t.x,x1:t.x,y0:0,y1:1,line:{color:'#8b3a3a',width:1.5,dash:'dash'}})),annotations:transitions.value.map((t,i)=>({xref:'x',yref:'paper',x:t.x,y:1,xanchor:i%2?'right':'left',yanchor:'bottom',text:`${t.label}<br><span style="font-size:10px">Eq. ${t.equations}</span>`,showarrow:false,font:{size:10,color:'#6d2424'},bgcolor:'rgba(255,255,255,.85)',borderpad:2}))}))
const armour=ref('Rock, 2 layers, permeable core')
function setArmour(){values.gammaF=roughnessCatalogue[armour.value]}
onMounted(async()=>{await nextTick();const el=document.querySelector('.eurotop-background');if(el)renderMathInElement(el as HTMLElement,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})})
</script>

<template>
  <section class="calculator">
    <div class="calculator-heading"><div><h1>{{ title }}</h1><p class="eurotop-section">EurOtop 2018, {{ section }}</p></div><button class="excel-download" type="button" @click="downloadEurotopWorkbook(props.family,values)">Download Excel template</button></div>
    <div class="calculator-grid">
      <article class="panel input-panel"><div class="panel-title input-title"><h2>Input</h2></div>
        <label>Calculation Approach <button class="info-tip" type="button" data-tip="Mean-value equations represent the central empirical fit. Design/assessment equations include one standard deviation of model uncertainty and normally give a more conservative result.">i</button><select v-model="values.approach"><option value="design">Design / assessment</option><option value="mean">Mean value</option></select></label>
        <label>Spectral Wave Height, Hm0 (m) <button class="info-tip" type="button" data-tip="The incident spectral significant wave height at the structure toe, equal to four times the square root of the zero-th spectral moment.">i</button><input v-model.number="values.hm0" type="number" min=".05" step="any" /></label>
        <label>Spectral Period, Tm-1,0 (s) <button class="info-tip" type="button" data-tip="The spectral energy period at the structure toe. EurOtop uses it to calculate wavelength, wave steepness and the breaker parameter.">i</button><input v-model.number="values.period" type="number" min=".5" step="any" /></label>
        <label>Crest Freeboard, Rc (m) <button class="info-tip" type="button" data-tip="Vertical distance from still water level to the level over which water must pass. Overtopping decreases rapidly as Rc increases.">i</button><input v-model.number="values.rc" type="number" min="0" step="any" /></label>
        <template v-if="family==='smooth'">
          <label>Slope, cot α (1V:nH) <button class="info-tip" type="button" data-tip="Horizontal distance for one unit of vertical rise. A value of 3 describes a 1V:3H slope; larger values are gentler slopes.">i</button><input v-model.number="values.cotAlpha" type="number" min="1.5" step="any" /></label>
          <label>Berm Factor, γb <button class="info-tip" type="button" data-tip="Reduction factor for the influence of a berm on run-up and overtopping. It is 1.0 where no effective berm is present.">i</button><input v-model.number="values.gammaB" type="number" min=".4" max="1" step=".01" /></label>
          <label>Roughness Factor, γf <button class="info-tip" type="button" data-tip="Reduction factor describing energy loss caused by surface roughness. A smooth impermeable slope uses 1.0; rougher surfaces use smaller values.">i</button><input v-model.number="values.gammaF" type="number" min=".4" max="1" step=".01" /></label>
          <label>Wall Factor, γv <button class="info-tip" type="button" data-tip="Overtopping reduction produced by a wall at the top of the slope. EurOtop applies this factor to discharge, but not to the run-up calculation.">i</button><input v-model.number="values.gammaV" type="number" min=".4" max="1" step=".01" /></label>
        </template>
        <template v-else-if="family==='rubble'">
          <label>Armour Slope, cot α (1V:nH) <button class="info-tip" type="button" data-tip="Horizontal distance for one unit of vertical rise. The simple steep rubble-slope equations are intended for approximately 1V:1.33H to 1V:2H.">i</button><input v-model.number="values.cotAlpha" type="number" min="1.333" max="2" step=".05" /></label>
          <label>Armour System <button class="info-tip" type="button" data-tip="The armour type selects a representative roughness factor from EurOtop Table 6.2. Check the selected value against the actual placement, layers and core.">i</button><select v-model="armour" @change="setArmour"><option v-for="(_,name) in roughnessCatalogue" :key="name" :value="name">{{ name }}</option></select></label>
          <label>Applied Roughness Factor, γf <button class="info-tip" type="button" data-tip="The roughness factor actually used in the calculation. It can be edited where project-specific test evidence or a different EurOtop classification is available.">i</button><input v-model.number="values.gammaF" type="number" min=".1" max="1" step=".01" /></label>
          <label class="check-label"><input v-model="values.permeableCore" type="checkbox" /> Permeable core <button class="info-tip" type="button" data-tip="A permeable core allows internal flow and imposes a lower maximum relative run-up than an impermeable core in Equation 6.2.">i</button></label>
        </template>
        <template v-else>
          <label>Water Depth at Wall Toe, h (m) <button class="info-tip" type="button" data-tip="Still-water depth immediately in front of a plain wall. EurOtop uses h to classify impulsive attack. The separate symbol d is the depth above a significant toe mound and belongs to the composite-wall method, which is not included here.">i</button><input v-model.number="values.depth" type="number" min=".05" step="any" /></label>
          <label class="check-label"><input v-model="values.influencingForeshore" type="checkbox" /> Influencing foreshore <button class="info-tip" type="button" data-tip="Select this when a shallow or sloping seabed transforms the waves before they reach the wall through shoaling, steepening or breaking. EurOtop suggests shallow/intermediate water at the toe and a foreshore around 1:50 or steeper as practical indicators; a deep, nearly horizontal approach is normally not influencing.">i</button></label>
        </template>
        <template v-if="family!=='vertical'">
          <label>Wave Angle, β (degrees) <button class="info-tip" type="button" data-tip="Angle between the incident wave direction and a line normal to the structure. Zero degrees is perpendicular attack.">i</button><input v-model.number="values.beta" type="number" min="0" max="80" step="1" /></label>
          <label class="check-label"><input v-model="values.shortCrested" type="checkbox" /> Short-crested waves <button class="info-tip" type="button" data-tip="Short-crested seas have directional spreading and use a less severe obliquity reduction than long-crested waves.">i</button></label>
        </template>
      </article>
      <article class="panel output-panel"><div class="panel-title output-title"><h2>Output</h2></div><dl class="results">
        <div class="primary-result"><dt>Mean Overtopping Discharge <button class="info-tip" type="button" data-tip="Time-averaged water volume crossing each metre of structure crest. It does not describe the much larger short-duration discharge in an individual overtopping wave.">i</button></dt><dd>{{ (result.q*1000).toPrecision(4) }} L/s/m</dd></div>
        <div><dt>Discharge in SI Units <button class="info-tip" type="button" data-tip="The same mean overtopping discharge expressed in cubic metres per second per metre of structure width.">i</button></dt><dd>{{ result.q.toPrecision(4) }} m³/s/m</dd></div>
        <div><dt>Governing Regime <button class="info-tip" type="button" data-tip="The physical/equation branch selected from the current inputs. A change of regime can produce a change in the sensitivity curve.">i</button></dt><dd>{{ result.regime }}</dd></div>
        <div><dt>EurOtop Equation(s) <button class="info-tip" type="button" data-tip="The numbered EurOtop 2018 equation or pair of equations used for the mean-discharge result.">i</button></dt><dd>{{ result.equations }}</dd></div>
        <div v-if="result.runup2!==undefined"><dt>2% Wave Run-up, Ru2% <button class="info-tip" type="button" data-tip="Vertical run-up level above still water that is exceeded by 2% of incident waves on the seaward slope.">i</button></dt><dd>{{ result.runup2.toPrecision(4) }} m</dd></div>
        <div><dt>Waves Overtopping <button class="info-tip" type="button" data-tip="Estimated percentage of incident waves that cross the crest. This is different from mean discharge and does not state the volume of each event.">i</button></dt><dd>{{ (100*result.overtoppingProbability).toPrecision(3) }}%</dd></div>
        <div><dt>Overtopping-wave Equation <button class="info-tip" type="button" data-tip="The EurOtop equation used to estimate the probability or proportion of overtopping waves.">i</button></dt><dd>{{ result.overtoppingProbabilityEquation }}</dd></div>
        <div v-if="result.xi!==undefined"><dt>Breaker Parameter, ξm-1,0 <button class="info-tip" type="button" data-tip="Also called the Iribarren or surf-similarity parameter. It combines slope and wave steepness and distinguishes plunging from surging run-up behaviour.">i</button></dt><dd>{{ result.xi.toFixed(2) }}</dd></div>
        <div v-if="result.gammaFModified!==undefined"><dt>Applied Modified Roughness, γf,mod <button class="info-tip" type="button" data-tip="Roughness factor after the EurOtop correction for steep/surging waves and, where selected, the permeable-core limit.">i</button></dt><dd>{{ result.gammaFModified.toFixed(3) }}</dd></div>
        <div v-if="result.impulseParameter!==undefined"><dt>Impulse Classifier <button class="info-tip" type="button" data-tip="Dimensionless h²/(Hm0 Lm-1,0). Values above 0.23 indicate non-impulsive attack; smaller values indicate increasingly impulsive breaking at the wall.">i</button></dt><dd>{{ result.impulseParameter.toFixed(3) }}</dd></div>
      </dl><div :class="result.applicable?'applicability-ok':'applicability-warning'">{{ result.applicable?'Inputs pass the automated applicability checks.':result.warnings.join(' ') }}</div><p v-if="family==='rubble'" class="method-note">Equation 6.3 is an upper estimate: run-up on the front slope is not identical to water passing the crest, particularly where a crest berm or crown wall is present.</p></article>
      <article class="panel charts-panel"><div class="panel-title graphical-title"><h2>Graphical</h2></div><div class="graphical-body eurotop-graphical">
        <PlotlyChart :data="chartData" :layout="chartLayout" />
        <div class="select-row eurotop-controls"><label>Vary Input<select v-model="vary"><option value="rc">Crest freeboard</option><option value="hm0">Wave height</option><option value="period">Wave period</option></select></label></div>
        <figure class="structure-figure"><img class="structure-diagram" :src="image" :alt="`${title} geometry`" /><figcaption>{{ family==='vertical'?'Plain-wall geometry implemented by this calculator.':'Representative EurOtop geometry and parameter definitions.' }}</figcaption></figure>
      </div></article>
    </div>
    <article class="background-panel"><div class="background-title"><h2>Background, equation selection and applicability</h2><span>−</span></div><div class="background-body eurotop-background">
      <p>Wave overtopping is described by the mean discharge $q$ per metre of structure width. EurOtop normalises it as $q/\sqrt{gH_{m0}^{3}}$, allowing laboratory and prototype results at different scales to be compared. The incident $H_{m0}$ and $T_{m-1,0}$ must be conditions at the structure toe, after any transformation across the foreshore.</p>
      <div class="equation">$$L_{m-1,0}=\frac{gT_{m-1,0}^{2}}{2\pi},\qquad \xi_{m-1,0}=\frac{\tan\alpha}{\sqrt{H_{m0}/L_{m-1,0}}}$$</div>
      <template v-if="family==='smooth'">
        <h3>Dikes and embankment seawalls</h3><p>For breaking waves on a relatively gentle slope, the mean-value relationship is:</p>
        <div class="equation">$$\frac{q}{\sqrt{gH_{m0}^{3}}}=\frac{0.023}{\sqrt{\tan\alpha}}\,\gamma_b\xi_{m-1,0}\exp\left[-\left(\frac{2.7R_c}{\xi_{m-1,0}H_{m0}\gamma_b\gamma_f\gamma_\beta\gamma_v}\right)^{1.3}\right]$$</div>
        <p>It is limited by the non-breaking maximum:</p><div class="equation">$$\frac{q}{\sqrt{gH_{m0}^{3}}}=0.09\exp\left[-\left(\frac{1.5R_c}{H_{m0}\gamma_f\gamma_\beta}\right)^{1.3}\right]$$</div>
        <p>The calculator evaluates both and reports the smaller discharge. The design/assessment equations replace the coefficients $(0.023,2.7,0.09,1.5)$ with $(0.026,2.5,0.1035,1.35)$, incorporating model uncertainty.</p>
        <h3>Run-up and overtopping waves</h3><div class="equation">$$\frac{R_{u2\%}}{H_{m0}}=\min\left[1.65\gamma_b\gamma_f\gamma_\beta\xi_{m-1,0},\;\gamma_f\gamma_\beta\left(4-\frac{1.5}{\sqrt{\gamma_b\xi_{m-1,0}}}\right)\right]$$</div>
        <div class="equation">$$P_{ov}=\frac{N_{ow}}{N_w}=\exp\left[-\left(\sqrt{-\ln(0.02)}\frac{R_c}{R_{u2\%}}\right)^2\right]$$</div>
        <p>The design run-up coefficients are 1.75 and 1.07. The wall factor $\gamma_v$ affects discharge but is deliberately excluded from run-up, following EurOtop.</p>
      </template>
      <template v-else-if="family==='rubble'">
        <h3>Armoured rubble slopes and mounds</h3><p>For a simple steep armoured slope the mean-value discharge is:</p>
        <div class="equation">$$\frac{q}{\sqrt{gH_{m0}^{3}}}=0.09\exp\left[-\left(\frac{1.5R_c}{H_{m0}\gamma_{f,mod}\gamma_\beta}\right)^{1.3}\right]$$</div>
        <p>The design coefficients are 0.1035 and 1.35. For $\xi_{m-1,0}>5$, EurOtop progressively increases roughness towards a smooth-slope value:</p><div class="equation">$$\gamma_{f,mod}=\gamma_f+\frac{\min(\xi_{m-1,0},10)-5}{5}(1-\gamma_f)$$</div>
        <p>The Table 6.2 factor depends on armour type, number of layers, placement and core permeability; selecting an armour name is therefore a starting point rather than a substitute for checking the actual section.</p>
        <h3>Run-up and overtopping waves</h3><div class="equation">$$\frac{R_{u2\%}}{H_{m0}}=\min\left[1.65\gamma_f\gamma_\beta\xi_{m-1,0},\;\gamma_{f,surging}\gamma_\beta\left(4-\frac{1.5}{\sqrt{\xi_{m-1,0}}}\right)\right]$$</div>
        <div class="equation">$$\gamma_{f,surging}=\gamma_f+\frac{\xi_{m-1,0}-1.8}{8.2}(1-\gamma_f),\qquad P_{ov}=\exp\left[-\left(\sqrt{-\ln(0.02)}\frac{R_c}{R_{u2\%}}\right)^2\right]$$</div>
        <p>Run-up is capped at $R_{u2\%}/H_{m0}=3.0$ for an impermeable core and 2.0 for a permeable core (3.21 and 2.14 for design). Equation 6.3 assumes that crossing the run-up level is equivalent to overtopping. EurOtop warns that it therefore overestimates waves actually passing a crest berm or crown wall.</p>
      </template>
      <template v-else>
        <h3>Vertical and steep walls</h3><p><strong>Scope:</strong> this calculator implements EurOtop's <em>plain wall</em> procedure. In EurOtop figures, $h$ is the water depth in front of the wall toe and $d$ is the depth above a significant berm or toe mound. Composite walls require both $h$ and $d$ and use a different classifier, $hd/(H_{m0}L_{m-1,0})$; that method is not yet implemented here, so $d$ is deliberately not requested.</p><p>Without an influencing foreshore, the mean-value plain-wall expression is:</p><div class="equation">$$\frac{q}{\sqrt{gH_{m0}^{3}}}=0.047\exp\left[-\left(2.35\frac{R_c}{H_{m0}}\right)^{1.3}\right]$$</div>
        <p>An <strong>influencing foreshore</strong> is not simply any seabed in front of the wall. It is a shallow or sloping approach that materially changes wave height and shape through shoaling, steepening or breaking before the wave reaches the wall. EurOtop describes shallow/intermediate water at the toe and a foreshore around 1:50 or steeper as practical indicators. Harbour walls in relatively deep water, with waves small compared with depth, are typical non-influencing cases.</p>
        <p>Where a foreshore influences the wall, the impulse parameter separates non-impulsive and impulsive attack:</p><div class="equation">$$I=\frac{h^2}{H_{m0}L_{m-1,0}},\qquad I>0.23\;\text{non-impulsive},\quad I\leq0.23\;\text{impulsive}$$</div>
        <p>For non-impulsive attack the mean-value relationship is:</p><div class="equation">$$\frac{q}{\sqrt{gH_{m0}^{3}}}=0.05\exp\left(-2.78\frac{R_c}{H_{m0}}\right)$$</div>
        <p>Impulsive attack uses an exponential branch for $R_c/H_{m0}<1.35$ and an inverse-cube branch above that threshold. The output identifies the selected equation. Design coefficients are taken from Equations 7.2, 7.6, 7.9 and 7.10.</p>
        <h3>Percentage of waves overtopping</h3><div class="equation">$$P_{ov}=\exp\left[-1.21\left(\frac{R_c}{H_{m0}}\right)^2\right]\quad\text{(non-impulsive)}$$</div>
        <div class="equation">$$P_{ov}=\max\left\{\exp\left[-1.21\left(\frac{R_c}{H_{m0}}\right)^2\right],\;0.024\,I\left(\frac{R_c}{H_{m0}}\right)^{-1}\right\}\quad\text{(impulsive)}$$</div>
        <p>A vertical wall has no seaward slope on which to define $R_{u2\%}$, so the calculator reports overtopping probability directly rather than a run-up level.</p>
      </template>
      <h3>Using the results</h3><ul><li>The sensitivity plot reruns the complete decision process, so it may cross from one governing equation to another.</li><li>Mean discharge, percentage of waves overtopping and individual overtopping volume describe different hazards and should not be interchanged.</li><li>Results outside the automated checks require closer review of EurOtop geometry limits, influence factors and physical-model evidence.</li></ul>
      <p><strong>Source:</strong> EurOtop (2018), <em>Manual on wave overtopping of sea defences and related structures</em>, {{ section }}.</p>
    </div></article>
  </section>
</template>

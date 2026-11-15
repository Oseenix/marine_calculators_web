<template>
  <section class="content-page resources-page" aria-labelledby="resources-title">
    <h1 id="resources-title">Resources</h1>
    <p class="page-intro">Useful external tools for coastal and marine calculations.</p>

    <div class="resource-list">
      <article class="resource-card">
        <h2>Dalrymple applets</h2>
        <p>A revamped version of the Dalrymple applets that originally inspired this app.</p>
        <a href="https://plynett.github.io/tonys-java-apps/linearplot.html" target="_blank" rel="noopener">Tony’s Java Apps <span aria-hidden="true">↗</span></a>
      </article>
      <article class="resource-card">
        <h2>Wave calculations</h2>
        <p>A collection of useful wave calculation tools.</p>
        <a href="https://ce-tools.fatemeh-hajivalie.workers.dev/" target="_blank" rel="noopener">Coastal Engineering Tools <span aria-hidden="true">↗</span></a>
      </article>
      <article class="resource-card">
        <h2>Deltares NN Overtopping</h2>
        <p>Neural-network overtopping tool for structures that fall within its training-data and geometry limits.</p>
        <a href="https://dserie.deltares.nl/NNOvertopping/default.aspx" target="_blank" rel="noopener">Open Deltares calculator <span aria-hidden="true">↗</span></a>
      </article>
      <article class="resource-card">
        <h2>HR Wallingford BayonetGPE</h2>
        <p>HR Wallingford's machine-learning overtopping model and background article for complex coastal structures.</p>
        <a href="https://www.hrwallingford.com/news/bayonet-gpe-overtopping-a-modelling-tool-at-the-cutting-edge-of-coastal-engineering" target="_blank" rel="noopener">Read about BayonetGPE <span aria-hidden="true">↗</span></a>
      </article>
    </div>

    <section id="validation-register" class="validation-register">
      <h2>Validation register</h2>
      <p>This register distinguishes code/formula checks from independent validation. A passing automated test shows that the programmed equation behaves as expected; it does not prove that an empirical method is suitable for a particular site.</p>
      <div class="validation-key"><span class="validation-reference">Reference checked</span><span class="validation-formula">Formula checked</span><span class="validation-limited">Independent check needed</span></div>
      <h3>Higher-confidence checks</h3>
      <p>Linear wave theory, shoaling/refraction, Stokes drift and the Battjes-Groenendijk distribution include comparisons with analytical limits or published reference values.</p>
      <h3>Formula implementation checked</h3>
      <p>The wind-wave, cyclone, sediment-threshold, fall-velocity, rock-sizing and EurOtop calculators have automated equation, branch, unit or workbook regression tests. EurOtop has not yet been compared against the official neural-network database or a broad physical-test dataset.</p>
      <h3>Independent benchmark still needed</h3>
      <p>Fringing-reef setup, beach-face slope, sediment density/porosity, submerged-breakwater transmission and Reef Ball transmission currently rely mainly on source-application parity and internal regression tests. Their calculators are marked accordingly.</p>
      <p><strong>Important:</strong> these are engineering aids, not certified design software. Applicability ranges, input definitions and project-specific evidence remain the user's responsibility.</p>
    </section>
  </section>
</template>

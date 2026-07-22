function colorFor(d) {
  if (d.vulnerability >= VULNERABILITY_THRESHOLD) return GREY_COLOR;
  return CONTINENT_COLORS[d.continent] || GREY_COLOR;
}

function leafGeometry(d, slot) {
  const t = Math.min(1, popScale(d.population));
  const numLeaves = Math.round(6 + t * (MAX_LEAVES - 6));
  const radius = LEAF_RADIUS;
  const spreadDeg = MIN_SPREAD + t * (MAX_SPREAD - MIN_SPREAD);
  const activeStart = Math.floor((MAX_LEAVES - numLeaves) / 2);
  const active = slot >= activeStart && slot < activeStart + numLeaves;

  let angleDeg = -90;
  if (active) {
    const j = slot - activeStart;
    const angleT = numLeaves > 1 ? j / (numLeaves - 1) : 0.5;
    angleDeg = -90 - spreadDeg / 2 + angleT * spreadDeg;
  }
  return { active, radius, angleDeg };
}

//Paesi con il miglior rapporto GDP/CO2 fra le economie sviluppate, per un dato anno
function computeEfficientSet(year) {
  const candidates = allData.filter(d => d.year === year && d.gdp > EFFICIENCY_GDP_THRESHOLD);
  const ranked = candidates
    .map(d => ({ iso3: d.iso3, ratio: d.gdp / d.co2 }))
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, EFFICIENCY_TOP_N)
    .map(d => d.iso3);
  return new Set(ranked);
}

//Calcolo delle posizioni una volta per anno
function computeBeeswarmPositions() {
  YEARS.forEach(year => {
    const yearData = allData.filter(d => d.year === year);
    const nodes = yearData.map(d => ({
      iso3: d.iso3,
      targetX: xScale(d.co2),
      x: xScale(d.co2),
      y: 0
    }));

    /*prendiamo array di oggetti
    - forceX attira ogni oggetto verso la posizione x
    - forceY tiene tutti gli oggetti sulla stessa linea orizzontale
    - forceCollide impedisce a due oggetti di stare a meno di 15px di distanza*/
    const sim = d3.forceSimulation(nodes)
      .force("x", d3.forceX(n => n.targetX).strength(0.6))
      .force("y", d3.forceY(0).strength(1))
      .force("collide", d3.forceCollide(COLLIDE_RADIUS))
      .stop();

    for (let i = 0; i < 180; i++) sim.tick();

    beeswarmX[year] = {};
    nodes.forEach(n => beeswarmX[year][n.iso3] = n.x);
  });
}

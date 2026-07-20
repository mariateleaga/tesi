/*
  ============================================================
  BLOOMING INEQUALITIES — v9
  ============================================================
*/

const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const marginBottom = 80;
const groundY = height - marginBottom - 40;

const legendSvg = d3.select("#legend");

const VULNERABILITY_THRESHOLD = 35;
const MAX_LEAVES = 70;          //numero massimo linee
const MIN_SPREAD = 40;
const MAX_SPREAD = 300;         //grandezza ventaglio
const YEARS = d3.range(2000, 2023);
const COLLIDE_RADIUS = 15; //x distanza minima tra gli steli, in pixel
const LEAF_RADIUS = 42;    //lunghezza fissa delle foglie

/*
  ============================================================
  ETICHETTE PAESI VISIBILI
  ============================================================
  CAF = GDP più basso + tra i più vulnerabili
  COD = CO2 pro capite più basso
  QAT = CO2 pro capite più alto + GDP più alto
  CHN = popolazione più alta
  USA = tra i maggiori emettitori totali nel tempo
  NOR = ricco e con vulnerabilità bassa
  ITA = patriottismo puro
*/

const NOTABLE_ISO3 = new Set(["CAF", "COD", "QAT", "CHN", "USA", "NOR", "ITA"]);

const VIVID_PALETTE = [
  "#3DAEFF", 
  "#FF4FA3", 
  "#FF7A45", 
  "#FFC93D", 
  "#7CFF6B", 
  "#B968FF", 
  "#33E0C0", 
  "#FF5C5C"  
];
const GREY_COLOR = "#5C5B54";

let currentYear = 2000;
let allData = [];
let xScale, stemScale, popScale, yAxisScale;
let beeswarmX = {};
let hasStarted = false;
let selectedIso3 = new Set(); // paesi scelti dall'utente, vuoto = mostra tutti

const tooltip = d3.select("#tooltip");


function hashInt(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function colorFor(d) {
  if (d.vulnerability >= VULNERABILITY_THRESHOLD) return GREY_COLOR;
  return VIVID_PALETTE[hashInt(d.iso3) % VIVID_PALETTE.length];
}

function leafGeometry(d, slot) {
  const t = popScale(d.population);
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

    //prendiamo array di oggetti
    //forceX attira ogni oggetto verso la posizione x
    //forceY tiene tutti gli oggetti sulla stessa linea orizzontale
    //forceCollide impedisce a due oggetti di stare a meno di 15px di distanza
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


d3.csv("data/flowers_data.csv", d => ({
  country: d.country,
  iso3: d.iso3,
  year: +d.year,
  gdp: +d.gdp_pc,
  co2: +d.co2_pc,
  population: +d.population,
  vulnerability: +d.vulnerability
})).then(data => {

  allData = data;
  const maxGDP = d3.max(allData, d => d.gdp);

  //Calcolo AsseX - CO2
  xScale = d3.scaleSqrt()
    .domain([0, d3.max(allData, d => d.co2)])
    .range([110, width - 150]);

  //Calcolo GDP - Altezza stelo
  stemScale = d3.scaleSqrt()
    .domain([0, maxGDP])
    .range([40, 640]); 

  yAxisScale = d3.scaleSqrt()
    .domain([0, maxGDP])
    .range([groundY - 40, groundY - 640]);

  //Calcolo Popolazione
  popScale = d3.scaleSqrt()
    .domain([0, d3.max(allData, d => d.population)])
    .range([0, 1]);

  computeBeeswarmPositions();

  drawXAxis();
  drawYAxis();
  drawLegendPanel();
  populateCountryPicker();
  setupMenuToggle();
  setupControls();
  //Ricorda non chiamare updateChart qui. La pagina resta vuota fino a play
});


function populateCountryPicker() {
  const countries = Array.from(
    new Map(allData.map(d => [d.iso3, d.country])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const container = d3.select("#countryCheckboxes");

  container.selectAll("label.country-row")
    .data(countries)
    .join("label")
    .attr("class", "country-row")
    .html(d => `<input type="checkbox" value="${d[0]}"> ${d[1]}`);

  d3.select("#countrySearch").on("input", function () {
    const q = this.value.toLowerCase();
    container.selectAll("label.country-row")
      .style("display", d => d[1].toLowerCase().includes(q) ? "flex" : "none");
  });

  d3.select("#confirmSelection").on("click", () => {
    const chosen = [];
    container.selectAll("input[type=checkbox]").each(function () {
      if (this.checked) chosen.push(this.value);
    });
    selectedIso3 = new Set(chosen);
    if (hasStarted) updateChart(currentYear);
  });

  d3.select("#resetSelection").on("click", () => {
    container.selectAll("input[type=checkbox]").property("checked", false);
    selectedIso3 = new Set();
    if (hasStarted) updateChart(currentYear);
  });
}

function setupMenuToggle() {
  d3.select("#menuToggle").on("click", () => {
    const panel = d3.select("#side-panel");
    panel.classed("open", !panel.classed("open"));
  });
}


function drawXAxis() {
  svg.append("g")
    .attr("transform", `translate(0, ${groundY + 15})`)
    .call(d3.axisBottom(xScale).ticks(10).tickFormat(d => d + " t")); //genera scalaa tonnellate

  svg.append("text")
    .attr("x", (xScale.range()[0] + xScale.range()[1]) / 2)
    .attr("y", height - 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("fill", "#888")
    .text("Emissioni di CO2 pro capite (tonnellate/anno) →");
}

function drawYAxis() {
  svg.append("g")
    .attr("transform", "translate(90, 0)")
    .call(d3.axisLeft(yAxisScale).ticks(5).tickFormat(d => "$" + d3.format(",.0f")(d)));

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(groundY / 2))
    .attr("y", 22)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("fill", "#888")
    .text("↑ GDP pro capite ($)");
}


function drawLegendPanel() {
  legendSvg.append("text")
    .attr("x", 14).attr("y", 26)
    .attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "#eee")
    .text("Legenda");

  const rows = [
    ["Asse x", "emissioni di CO2 pro capite"],
    ["Altezza dello stelo", "GDP pro capite"],
    ["Ampiezza del ventaglio", "popolazione"],
    ["Colore", "vulnerabilità climatica"]
  ];
  rows.forEach((r, i) => {
    const y = 54 + i * 34;
    legendSvg.append("text").attr("x", 14).attr("y", y)
      .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#eee")
      .text(r[0]);
    legendSvg.append("text").attr("x", 14).attr("y", y + 15)
      .attr("font-size", "11px").attr("fill", "#999")
      .text(r[1]);
  });

  const colorY = 210;
  legendSvg.append("text").attr("x", 14).attr("y", colorY)
    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#eee")
    .text("Legenda colore");

  legendSvg.append("rect")
    .attr("x", 14).attr("y", colorY + 12).attr("width", 16).attr("height", 16).attr("rx", 3)
    .attr("fill", GREY_COLOR);
  legendSvg.append("text")
    .attr("x", 36).attr("y", colorY + 24)
    .attr("font-size", "11px").attr("fill", "#999")
    .text(`vulnerabilità ≥ ${VULNERABILITY_THRESHOLD}`);

  VIVID_PALETTE.slice(0, 6).forEach((c, i) => {
    legendSvg.append("rect")
      .attr("x", 14 + i * 20).attr("y", colorY + 38).attr("width", 16).attr("height", 16).attr("rx", 3)
      .attr("fill", c);
  });
  legendSvg.append("text")
    .attr("x", 14).attr("y", colorY + 72)
    .attr("font-size", "11px").attr("fill", "#999")
    .text(`vulnerabilità < ${VULNERABILITY_THRESHOLD}:`);
  legendSvg.append("text")
    .attr("x", 14).attr("y", colorY + 86)
    .attr("font-size", "11px").attr("fill", "#999")

  legendSvg.append("text").attr("x", 14).attr("y", colorY + 116)
    .attr("font-size", "11px").attr("fill", "#666")
    .text("Le etichette fisse mostrano solo");
  legendSvg.append("text").attr("x", 14).attr("y", colorY + 130)
    .attr("font-size", "11px").attr("fill", "#666")
    .text("i paesi più estremi. Passa il mouse");
  legendSvg.append("text").attr("x", 14).attr("y", colorY + 144)
    .attr("font-size", "11px").attr("fill", "#666")
    .text("su un fiore per vedere i dettagli.");
}


function updateChart(year) {
  let yearData = allData.filter(d => d.year === year);
  if (selectedIso3.size > 0) {
    yearData = yearData.filter(d => selectedIso3.has(d.iso3));
  }
  const positions = beeswarmX[year];

  //guarda i fiori già disegnati, guarda i nuovi dati yearData e abbina ogni fiore al suo dato
  //usa ISO3 per identificativo
  const flowers = svg.selectAll("g.flower").data(yearData, d => d.iso3); 

  //creo gruppo per ogni fiore
  //.enter() prende solo i dati che non hanno ancora un fiore e .append() prende
  //ogni fiore orfano e crea un nuovo elemento <g> a cui attribuisce uno stelo e un fiore
  const flowersEnter = flowers.enter()
    .append("g")
    .attr("class", "flower")
    .attr("transform", d => `translate(${positions[d.iso3]}, 0)`)
    .on("mousemove", (event, d) => showTooltip(event, d)) //eventlistener per ogni fiore, showToolti prende i dati del paese e li scrive nel box 
    .on("mouseleave", hideTooltip);

  flowersEnter.append("line")
    .attr("class", "stem")
    .attr("x1", 0).attr("y1", groundY)
    .attr("x2", 0).attr("y2", groundY)
    .attr("stroke-width", 2)
    .attr("stroke-linecap", "round")
    .attr("opacity", 0.95);

  d3.range(MAX_LEAVES).forEach(i => {
    flowersEnter.append("line")
      .attr("class", "leaf")
      .attr("data-slot", i)
      .attr("x1", 0).attr("y1", groundY)
      .attr("x2", 0).attr("y2", groundY)
      .attr("stroke-width", 1)
      .attr("stroke-linecap", "round")
      .attr("opacity", 0);
  });

  const flowersAll = flowersEnter.merge(flowers);

  flowersAll.each(function (d) {
    const group = d3.select(this);
    const needsLabel = NOTABLE_ISO3.has(d.iso3) || selectedIso3.has(d.iso3);
    const hasLabel = !group.select("text.country-label").empty();

    if (needsLabel && !hasLabel) {
      group.append("text")
        .attr("class", "country-label")
        .attr("text-anchor", "end")
        .attr("transform", `translate(0, ${groundY + 34}) rotate(-40)`)
        .attr("font-size", "11px")
        .attr("fill", "#bbb")
        .text(d.country);
    } else if (!needsLabel && hasLabel) {
      group.select("text.country-label").remove();
    }
  });

  flowersAll.transition().duration(700)
    .attr("transform", d => `translate(${positions[d.iso3]}, 0)`);

  flowersAll.select("line.stem").transition().duration(700)
    .attr("y2", d => groundY - stemScale(d.gdp))
    .attr("stroke", d => colorFor(d));

  flowersAll.each(function (d) {
    const topY = groundY - stemScale(d.gdp);
    const color = colorFor(d);

    d3.select(this).selectAll("line.leaf")
      .transition().duration(700)
      .attr("y1", topY)
      .attr("x2", function () {
        const slot = +d3.select(this).attr("data-slot"); //+ perché converte stringa in num
        const g = leafGeometry(d, slot);
        return g.active ? g.radius * Math.cos(g.angleDeg * Math.PI / 180) : 0;
      })
      .attr("y2", function () {
        const slot = +d3.select(this).attr("data-slot");
        const g = leafGeometry(d, slot);
        return g.active ? topY + g.radius * Math.sin(g.angleDeg * Math.PI / 180) : topY;
      })
      .attr("opacity", function () {
        const slot = +d3.select(this).attr("data-slot");
        return leafGeometry(d, slot).active ? 0.65 : 0;
      })
      .attr("stroke", color);
  });

  flowers.exit().transition().duration(400).attr("opacity", 0).remove();
}


function showTooltip(event, d) {
  tooltip
    .style("opacity", 1)
    .style("left", (event.pageX + 14) + "px")
    .style("top", (event.pageY - 10) + "px")
    .html(`
      <strong>${d.country}</strong><br>
      GDP pro capite: $${d3.format(",")(Math.round(d.gdp))}<br>
      CO2 pro capite: ${d.co2.toFixed(1)} t<br>
      Popolazione: ${d3.format(",")(Math.round(d.population))}<br>
      Vulnerabilità: ${d.vulnerability.toFixed(1)}
    `);
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}


function ensureStarted() {
  if (!hasStarted) {
    hasStarted = true;
    updateChart(currentYear);
  }
}

function setupControls() {
  const slider = d3.select("#yearSlider");
  const label = d3.select("#yearLabel");
  const playBtn = d3.select("#playBtn");

  let playing = false;
  let timer = null;

  slider.on("input", function () {
    currentYear = +this.value;
    label.text(currentYear);
    ensureStarted();
    updateChart(currentYear);
  });

  playBtn.on("click", () => {
    ensureStarted();
    playing = !playing;
    playBtn.text(playing ? "Pausa" : "Play");

    if (playing) {
      timer = setInterval(() => {
        currentYear = currentYear >= 2022 ? 2000 : currentYear + 1;
        slider.property("value", currentYear);
        label.text(currentYear);
        updateChart(currentYear);
      }, 900);
    } else {
      clearInterval(timer);
    }
  });
}
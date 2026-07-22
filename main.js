d3.csv("data/flowers_data.csv", d => ({
  country: d.country,
  iso3: d.iso3,
  year: +d.year,
  gdp: +d.gdp_pc,
  co2: +d.co2_pc,
  population: +d.population,
  vulnerability: +d.vulnerability,
  continent: d.continent
})).then(data => {

  allData = data;
  const maxGDP = d3.max(allData, d => d.gdp);

  //Riferimento popolazione Cina unità di misura del ventaglio pieno
  CHINA_POP_REF = d3.max(allData.filter(d => d.iso3 === "CHN"), d => d.population);

  //calcolo asseX - CO2
  xScale = d3.scaleSqrt()
    .domain([0, d3.max(allData, d => d.co2)])
    .range([110, width - 150]);

  //calcolo GDP - Altezza Stelo
  stemScale = d3.scaleSqrt()
    .domain([0, maxGDP])
    .range([40, 640]);

  yAxisScale = d3.scaleSqrt()
    .domain([0, maxGDP])
    .range([groundY - 40, groundY - 640]);

  //Calcolo Popolazione
  popScale = d3.scaleSqrt()
    .domain([0, CHINA_POP_REF])
    .range([0, 1]);

  computeBeeswarmPositions();

  drawFixedYAxis();
  drawFixedXAxis();
  drawLegendPanel();
  populateCountryPicker();
  setupMenuToggle();
  setupHomeButton();
  setupLangToggle();
  setupControls(); 
  setupScrollSync();
  setupKeyboardShortcuts();
  drawHeroFlowers();
  drawITitleFlower();
  animateOnFirstView("section-continents", drawContinentExamples);
  animateOnFirstView("section-variables", () => {
    drawIconHeight();
    drawIconPosition();
    drawIconFan();
  });
  animateOnFirstView("section-outcomes", () => {
    drawIconLeaf();
    drawIconOutcome();
  });
  applyLanguage(currentLang);
});

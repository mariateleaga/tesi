//Assi fissi
function drawFixedYAxis() {
  const s = d3.select("#y-axis-svg").attr("width", 90).attr("height", height);
  s.append("g")
    .attr("transform", "translate(85, 0)")
    .call(d3.axisLeft(yAxisScale).ticks(5).tickFormat(d => "$" + d3.format(",.0f")(d)));

  s.append("text")
    .attr("class", "y-axis-label-text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(groundY / 2))
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("font-size", "13px")
    .attr("fill", "#888")
    .text(TRANSLATIONS[currentLang].axisY);
}

function drawFixedXAxis() {
  const s = d3.select("#x-axis-svg").attr("width", width).attr("height", 50);
  s.append("g")
    .attr("class", "x-axis-ticks")
    .attr("transform", "translate(0, 15)")
    .call(d3.axisBottom(xScale).ticks(14).tickFormat(d => d + " t"));
}

//Sincronizza l'asse x fisso con lo scorrimento orizzontale della pagina
function setupScrollSync() {
  const container = document.getElementById("scroll-container");
  const xAxisFixed = document.getElementById("x-axis-fixed");
  const yAxisFixed = document.getElementById("y-axis-fixed");
  const xAxisSvg = document.getElementById("x-axis-svg");

  function onScroll() {
    const panelWidth = window.innerWidth;
    //hero + le 4 sezioni di spiegazione 5 pages prima del grafico
    const chartScrollLeft = container.scrollLeft - panelWidth * 5;
    const inChart = chartScrollLeft > -panelWidth * 0.5;

    xAxisFixed.style.display = inChart ? "block" : "none";
    yAxisFixed.style.display = inChart ? "block" : "none";
    document.getElementById("controls").classList.toggle("visible", inChart);

    if (inChart) {
      const shift = Math.max(0, chartScrollLeft);
      xAxisSvg.style.transform = `translateX(${-shift}px)`;

      //Partenza grafico in autonomia senza play
      if (!autoStarted) {
        autoStarted = true;
        ensureStarted();
        startPlaying();
      }
    }
  }

  container.addEventListener("scroll", onScroll);
  onScroll();
}


function populateCountryPicker() {
  const countries = Array.from(
    new Map(allData.map(d => [d.iso3, d.country])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const container = d3.select("#countryCheckboxes");

  container.selectAll("label.country-row")
    .data(countries)
    .join("label")
    .attr("class", "country-row")
    .html(d => `<input type="checkbox" value="${d[0]}"> <span class="country-label-text">${d[1]}</span>`);

  updateCountryLabelsLanguage();

  d3.select("#countrySearch").on("input", function () {
    const q = this.value.toLowerCase();
    container.selectAll("label.country-row")
      .style("display", function () {
        const name = d3.select(this).select("span.country-label-text").text().toLowerCase();
        return name.includes(q) ? "flex" : "none";
      });
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

function updateCountryLabelsLanguage() {
  d3.select("#countryCheckboxes").selectAll("label.country-row")
    .select("span.country-label-text")
    .text(d => currentLang === "it" ? (COUNTRY_NAMES_IT[d[0]] || d[1]) : d[1]);
}

function setupMenuToggle() {
  d3.select("#menuToggle").on("click", () => {
    const panel = d3.select("#side-panel");
    panel.classed("open", !panel.classed("open"));
  });
}

function setupHomeButton() {
  d3.select("#homeButton").on("click", () => {
    document.getElementById("scroll-container").scrollTo({ left: 0, behavior: "smooth" });
  });
}

function applyLanguage(lang) {
  currentLang = lang;
  const t = TRANSLATIONS[lang];
  document.documentElement.lang = lang;

  d3.select("#heroSubtitle").text(t.heroSubtitle);
  const hints = d3.selectAll(".scroll-hint").nodes();
  hints.forEach((el, i) => {
    el.textContent = i === hints.length - 1 ? t.scrollHint2 : t.scrollHint1;
  });

  d3.select("#introP1").html(t.introP1);
  d3.select("#introP2").html(t.introP2);
  d3.select("#explainTitle").text(t.explainTitle);
  d3.select("#introP3").html(t.introP3);
  d3.select("#introP4").html(t.introP4);
  d3.select("#introP5").html(t.introP5);
  d3.select("#introP6").html(t.introP6);
  d3.select("#introP7").html(t.introP7);
  d3.select("#introP8").html(t.introP8);

  document.getElementById("xAxisLabel").textContent = t.axisX;
  d3.select(".y-axis-label-text").text(t.axisY);

  d3.select("#selectPaesiTitle").text(t.selectPaesiTitle);
  document.getElementById("countrySearch").placeholder = t.searchPlaceholder;
  updateCountryLabelsLanguage();
  d3.select("#confirmSelection").text(t.confirmBtn);
  d3.select("#resetSelection").text(t.resetBtn);
  d3.select("#playBtn").text(playing ? t.stopText : t.playText);

  drawLegendPanel();
  if (animatedSections.has("section-continents")) drawContinentExamples();
  if (animatedSections.has("section-variables")) { drawIconHeight(); drawIconPosition(); drawIconFan(); }
  if (animatedSections.has("section-outcomes")) { drawIconLeaf(); drawIconOutcome(); }

  d3.selectAll(".lang-option").classed("active", function () {
    return this.getAttribute("data-lang") === lang;
  });

  if (hasStarted) updateChart(currentYear);
}

function setupLangToggle() {
  d3.selectAll(".lang-option").on("click", function () {
    applyLanguage(this.getAttribute("data-lang"));
  });
}

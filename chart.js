function updateChart(year) {
  let yearData = allData.filter(d => d.year === year);
  if (selectedIso3.size > 0) {
    yearData = yearData.filter(d => selectedIso3.has(d.iso3));
  }
  const positions = beeswarmX[year];
  const efficientSet = computeEfficientSet(year);

  //Area sensibile al mouse di ogni fiore
  const sortedIso3 = yearData.map(d => d.iso3).sort((a, b) => positions[a] - positions[b]);
  const hoverBounds = {};
  sortedIso3.forEach((iso3, i) => {
    const x = positions[iso3];
    const leftX = i > 0 ? positions[sortedIso3[i - 1]] : null;
    const rightX = i < sortedIso3.length - 1 ? positions[sortedIso3[i + 1]] : null;
    hoverBounds[iso3] = {
      left: leftX !== null ? (x + leftX) / 2 : x - 150,
      right: rightX !== null ? (x + rightX) / 2 : x + 150
    };
  });

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
    .on("mousemove", (event, d) => showTooltip(event, d))
    .on("mouseleave", hideTooltip);

  flowersEnter.append("rect")
    .attr("class", "hit-area")
    .attr("fill", "transparent")
    .attr("y", 0)
    .attr("height", groundY);

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

  //Togli eticheteeee
  /*
  if (SHOW_COUNTRY_LABELS) {
    flowersAll.each(function (d) {
      const group = d3.select(this);
      const needsLabel = NOTABLE_ISO3.has(d.iso3) || selectedIso3.has(d.iso3);
      const label = group.select("text.country-label");
      const displayName = currentLang === "it" ? (COUNTRY_NAMES_IT[d.iso3] || d.country) : d.country;

      if (needsLabel && label.empty()) {
        group.append("text")
          .attr("class", "country-label")
          .attr("text-anchor", "end")
          .attr("transform", `translate(0, ${groundY + 34}) rotate(-40)`)
          .attr("font-size", "11px")
          .attr("fill", "#bbb")
          .text(displayName);
      } else if (!needsLabel && !label.empty()) {
        label.remove();
      } else if (needsLabel && !label.empty()) {
        label.text(displayName);
      }
    });
  }
  */

  flowersAll.select("rect.hit-area")
    .attr("x", d => hoverBounds[d.iso3].left - positions[d.iso3])
    .attr("width", d => hoverBounds[d.iso3].right - hoverBounds[d.iso3].left);

  flowersAll.transition().duration(700)
    .attr("transform", d => `translate(${positions[d.iso3]}, 0)`);

  flowersAll.select("line.stem").transition().duration(700)
    .attr("y2", d => groundY - stemScale(d.gdp))
    .attr("stroke", d => colorFor(d));

  flowersAll.each(function (d) {
    const topY = groundY - stemScale(d.gdp);
    const midY = groundY - stemScale(d.gdp) / 2;
    const color = colorFor(d);
    const group = d3.select(this);

    group.selectAll("line.leaf")
      .transition().duration(700)
      .attr("y1", topY)
      .attr("x2", function () {
        const slot = +d3.select(this).attr("data-slot");//+ converte stringa in num
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

    updateEfficiencyLeaf(group, d, efficientSet.has(d.iso3), midY, color);

   //zona fiori sensibile al mouse evita di selezionare troppo in verticale
    const hitTop = topY - LEAF_RADIUS - 15;
    group.select("rect.hit-area")
      .attr("y", hitTop)
      .attr("height", groundY - hitTop);
  });

  flowers.exit().transition().duration(400).attr("opacity", 0).remove();

  //paesi primo piano disegna per ultimi come zindex
  flowersAll.filter(d => NOTABLE_ISO3.has(d.iso3)).raise();
}


function showTooltip(event, d) {
  const t = TRANSLATIONS[currentLang].tooltip;
  tooltip
    .style("opacity", 1)
    .style("left", (event.clientX + 14) + "px")
    .style("top", (event.clientY - 10) + "px")
    .html(`
      <strong>${d.country}</strong> (${d.continent})<br>
      ${t.gdp}: $${d3.format(",")(Math.round(d.gdp))}<br>
      ${t.co2}: ${d.co2.toFixed(1)} t<br>
      ${t.pop}: ${d3.format(",")(Math.round(d.population))}<br>
      ${t.vuln}: ${d.vulnerability.toFixed(1)}
    `);
}

function hideTooltip() {
  tooltip.style("opacity", 0);
}


function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space") return;

    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    e.preventDefault();
    if (!hasStarted) return;

    if (playing) stopPlaying(); else startPlaying();
  });
}

function ensureStarted() {
  if (!hasStarted) {
    hasStarted = true;
    updateChart(currentYear);
  }
}

//start grafico
function startPlaying() {
  playing = true;
  d3.select("#playBtn").text(TRANSLATIONS[currentLang].stopText);
  playTimer = setInterval(() => {
    currentYear = currentYear >= 2022 ? 2000 : currentYear + 1;
    d3.select("#yearSlider").property("value", currentYear);
    d3.select("#yearLabel").text(currentYear);
    updateChart(currentYear);
  }, 900);
}

function stopPlaying() {
  playing = false;
  d3.select("#playBtn").text(TRANSLATIONS[currentLang].playText);
  clearInterval(playTimer);
}

function setupControls() {
  const slider = d3.select("#yearSlider");
  const label = d3.select("#yearLabel");
  const playBtn = d3.select("#playBtn");

  slider.on("input", function () {
    currentYear = +this.value;
    label.text(currentYear);
    ensureStarted();
    updateChart(currentYear);
  });

  playBtn.on("click", () => {
    if (playing) {
      stopPlaying();
    } else {
      ensureStarted();
      startPlaying();
    }
  });
}

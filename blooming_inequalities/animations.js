const LEAF_PATH = "M0,0 C6,-9 15,-9 20,0 C15,9 6,9 0,0 Z";

//Animazione per home + disegni esempio
function growFlower(g, f, groundY, delay) {
  const stem = g.append("line")
    .attr("x1", f.x).attr("y1", groundY)
    .attr("x2", f.x).attr("y2", groundY)
    .attr("stroke", f.color)
    .attr("stroke-width", f.strokeWidth || 3)
    .attr("stroke-linecap", "round");

  stem.transition()
    .delay(delay || 0)
    .duration(f.stemDuration || 900)
    .ease(d3.easeCubicOut)
    .attr("y2", groundY - f.stemH)
    .on("end", () => growFan(g, f, groundY));
}

function growFan(g, f, groundY) {
  const topY = groundY - f.stemH;

  d3.range(f.numLeaves).forEach(i => {
    const t = f.numLeaves > 1 ? i / (f.numLeaves - 1) : 0.5;
    const angleDeg = -90 - f.spread / 2 + t * f.spread;
    const angleRad = angleDeg * Math.PI / 180;
    const x2 = f.x + f.radius * Math.cos(angleRad);
    const y2 = topY + f.radius * Math.sin(angleRad);

    g.append("line")
      .attr("x1", f.x).attr("y1", topY)
      .attr("x2", f.x).attr("y2", topY)
      .attr("stroke", f.color)
      .attr("stroke-width", f.leafStrokeWidth || 1)
      .attr("opacity", 0)
      .transition().delay(i * 8).duration(400)
      .attr("x2", x2).attr("y2", y2).attr("opacity", f.leafOpacity || 0.75);
  });

  if (f.leaf) {
    const midY = groundY - f.stemH / 2;
    [-1, 1].forEach(side => {
      g.append("path")
        .attr("d", LEAF_PATH)
        .attr("fill", f.color)
        .attr("opacity", 0)
        .attr("transform", `translate(${f.x}, ${midY}) scale(${side}, 1) rotate(-25)`)
        .transition().delay(300).duration(500)
        .attr("opacity", 0.95);
    });
  }

  if (f.onDone) f.onDone(topY);
}

function drawContinentExamples() {
  const container = d3.select("#continentExamples");
  container.selectAll("*").remove();
  const t = TRANSLATIONS[currentLang];
  const groundYE = 122;

  Object.keys(CONTINENT_COLORS).forEach((continent, idx) => {
    const color = CONTINENT_COLORS[continent];
    const wrap = container.append("div").attr("class", "continent-example");
    const s = wrap.append("svg").attr("width", 130).attr("height", 130);
    const g = s.append("g");

    growFlower(g, {
      x: 65, stemH: 80, color, numLeaves: 18, spread: 136, radius: 42,
      strokeWidth: 3, leafStrokeWidth: 1.3, leafOpacity: 0.8
    }, groundYE, idx * 120);

    wrap.append("div")
      .attr("class", "continent-name")
      .style("color", color)
      .text(t.continentNames[continent]);
  });
}

function drawHeroFlowers() {
  const s = d3.select("#hero-flowers");
  const groundYH = 600;

  const flowers = [
    { x: 70, stemH: 330, color: CONTINENT_COLORS.Europe, numLeaves: 34, spread: 140, radius: 72 },
    { x: 230, stemH: 235, color: CONTINENT_COLORS.Asia, numLeaves: 26, spread: 120, radius: 58, leaf: true },
    { x: 390, stemH: 135, color: GREY_COLOR, numLeaves: 16, spread: 90, radius: 45 },
    { x: 545, stemH: 430, color: CONTINENT_COLORS.Oceania, numLeaves: 42, spread: 165, radius: 78 }
  ];

  flowers.forEach((f, idx) => {
    const g = s.append("g");
    growFlower(g, { ...f, strokeWidth: 3, stemDuration: 1300 }, groundYH, idx * 150);
  });
}

// ---- Fiore rosa animato al posto del puntino della "i" in "Blooming" ----
function drawITitleFlower() {
  const s = d3.select("#iTitleFlower");
  const g = s.append("g");
  growFlower(g, {
    x: 20, stemH: 0, color: CONTINENT_COLORS.Americas,
    numLeaves: 14, spread: 320, radius: 15,
    strokeWidth: 0, leafStrokeWidth: 1.3, leafOpacity: 0.9, stemDuration: 1
  }, 25, 500);
}

function drawIconHeight() {
  const s = d3.select("#iconHeight svg");
  s.selectAll("*").remove();
  const t = TRANSLATIONS[currentLang].iconLabels;
  const groundYI = 140;
  const shortStem = 47, shortRadius = 20;
  const tallStem = 83, tallRadius = 30;
  growFlower(s.append("g"), { x: 40, stemH: shortStem, color: GREY_COLOR, numLeaves: 8, spread: 70, radius: shortRadius, strokeWidth: 4 }, groundYI, 0);
  growFlower(s.append("g"), { x: 160, stemH: tallStem, color: CONTINENT_COLORS.Europe, numLeaves: 14, spread: 100, radius: tallRadius, strokeWidth: 4 }, groundYI, 150);
  s.append("text").attr("x", 40).attr("y", groundYI - shortStem - shortRadius - 10).attr("font-size", 13).attr("fill", "#999").attr("text-anchor", "middle").text(t.lowGdp);
  s.append("text").attr("x", 160).attr("y", groundYI - tallStem - tallRadius - 10).attr("font-size", 13).attr("fill", CONTINENT_COLORS.Europe).attr("text-anchor", "middle").text(t.highGdp);
}

function drawIconPosition() {
  const s = d3.select("#iconPosition svg");
  s.selectAll("*").remove();
  const t = TRANSLATIONS[currentLang].iconLabels;
  const groundYI = 62;
  s.append("line").attr("x1", 15).attr("y1", groundYI).attr("x2", 245).attr("y2", groundYI).attr("stroke", "#444").attr("stroke-width", 1);
  growFlower(s.append("g"), { x: 45, stemH: 20, color: GREY_COLOR, numLeaves: 8, spread: 80, radius: 16, strokeWidth: 3 }, groundYI, 0);
  growFlower(s.append("g"), { x: 215, stemH: 20, color: "#FF7A45", numLeaves: 8, spread: 80, radius: 16, strokeWidth: 3 }, groundYI, 150);
  s.append("text").attr("x", 45).attr("y", groundYI + 16).attr("font-size", 13).attr("fill", "#999").attr("text-anchor", "middle").text(t.lowCo2);
  s.append("text").attr("x", 215).attr("y", groundYI + 16).attr("font-size", 13).attr("fill", "#FF7A45").attr("text-anchor", "middle").text(t.highCo2);
}

function drawIconFan() {
  const s = d3.select("#iconFan svg");
  s.selectAll("*").remove();
  const groundYI = 96;
  growFlower(s.append("g"), { x: 55, stemH: 28, color: "#888", numLeaves: 6, spread: 60, radius: 22, strokeWidth: 3 }, groundYI, 0);
  growFlower(s.append("g"), { x: 195, stemH: 38, color: CONTINENT_COLORS.Europe, numLeaves: 16, spread: 130, radius: 46, strokeWidth: 3 }, groundYI, 150);
}

function drawIconLeaf() {
  const s = d3.select("#iconLeaf svg");
  s.selectAll("*").remove();
  const groundYI = 96;
  growFlower(s.append("g"), { x: 55, stemH: 68, color: GREY_COLOR, numLeaves: 8, spread: 60, radius: 20, strokeWidth: 3 }, groundYI, 0);
  growFlower(s.append("g"), { x: 195, stemH: 68, color: CONTINENT_COLORS.Oceania, numLeaves: 8, spread: 60, radius: 20, strokeWidth: 3, leaf: true }, groundYI, 150);
}

function drawIconOutcome() {
  const s = d3.select("#iconOutcome svg");
  s.selectAll("*").remove();
  const t = TRANSLATIONS[currentLang].iconLabels;
  const groundYI = 105;
  growFlower(s.append("g"), { x: 55, stemH: 79, color: CONTINENT_COLORS.Americas, numLeaves: 0, spread: 0, radius: 0, strokeWidth: 4 }, groundYI, 0);
  growFlower(s.append("g"), { x: 225, stemH: 13, color: GREY_COLOR, numLeaves: 0, spread: 0, radius: 0, strokeWidth: 4 }, groundYI, 150);
  s.append("text").attr("x", 55).attr("y", 16).attr("font-size", 13).attr("fill", CONTINENT_COLORS.Americas).attr("text-anchor", "middle").text(t.outcomeRich);
  s.append("text").attr("x", 225).attr("y", 80).attr("font-size", 13).attr("fill", "#999").attr("text-anchor", "middle").text(t.outcomePoor);
}

//l'animazione di una sezione deve partire solo la prima volta che entra nello schermo scorrendo
const animatedSections = new Set();

function animateOnFirstView(sectionId, drawFn) {
  const el = document.getElementById(sectionId);
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        drawFn();
        animatedSections.add(sectionId);
        obs.unobserve(el);
      }
    });
  }, { root: document.getElementById("scroll-container"), threshold: 0.25 });
  obs.observe(el);
}

function updateEfficiencyLeaf(group, d, needsLeaf, midY, color) {
  const existing = group.selectAll("path.efficiency-leaf");

  if (needsLeaf && existing.empty()) {
    [-1, 1].forEach(side => {
      group.append("path")
        .attr("class", "efficiency-leaf")
        .attr("data-side", side)
        .attr("d", LEAF_PATH)
        .attr("fill", color)
        .attr("opacity", 0.95)
        .attr("transform", `translate(0, ${midY}) scale(${side}, 1) rotate(-25)`);
    });
  } else if (!needsLeaf && !existing.empty()) {
    existing.remove();
  } else if (needsLeaf && !existing.empty()) {
    existing.transition().duration(700)
      .attr("fill", color)
      .attr("transform", function () {
        const side = +d3.select(this).attr("data-side");
        return `translate(0, ${midY}) scale(${side}, 1) rotate(-25)`;
      });
  }
}

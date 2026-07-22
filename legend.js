function drawLegendPanel() {
  const t = TRANSLATIONS[currentLang];
  legendSvg.selectAll("*").remove(); 

  legendSvg.append("text")
    .attr("x", 14).attr("y", 26)
    .attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "#eee")
    .text(t.legendTitle);

  t.legendRows.forEach((r, i) => {
    const y = 54 + i * 40;
    legendSvg.append("text").attr("x", 14).attr("y", y)
      .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#eee")
      .text(r[0]);
    legendSvg.append("text").attr("x", 14).attr("y", y + 15)
      .attr("font-size", "11px").attr("fill", "#999")
      .text(r[1]);
  });

  const colorY = 260;
  legendSvg.append("text").attr("x", 14).attr("y", colorY)
    .attr("font-size", "12px").attr("font-weight", "bold").attr("fill", "#eee")
    .text(t.legendColorTitle);

  const continents = Object.keys(CONTINENT_COLORS);
  continents.forEach((c, i) => {
    const y = colorY + 20 + i * 20;
    legendSvg.append("rect")
      .attr("x", 14).attr("y", y - 12).attr("width", 14).attr("height", 14).attr("rx", 3)
      .attr("fill", CONTINENT_COLORS[c]);
    legendSvg.append("text")
      .attr("x", 34).attr("y", y)
      .attr("font-size", "11px").attr("fill", "#999")
      .text(c);
  });

  const greyY = colorY + 20 + continents.length * 20 + 10;
  legendSvg.append("rect")
    .attr("x", 14).attr("y", greyY - 12).attr("width", 14).attr("height", 14).attr("rx", 3)
    .attr("fill", GREY_COLOR);
  legendSvg.append("text")
    .attr("x", 34).attr("y", greyY)
    .attr("font-size", "11px").attr("fill", "#999")
    .text(t.legendGreyLabel(VULNERABILITY_THRESHOLD));
}

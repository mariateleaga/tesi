* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background-color: #060606;
  color: #eee;
  font-family: sans-serif;
  overflow-x: hidden;
}

#controls {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 20;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(6, 6, 6, 0.75);
  backdrop-filter: blur(4px);
}

#controls button {
  background: #eee;
  color: #111;
  border: none;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
}

#yearSlider {
  width: 300px;
}

#yearLabel {
  font-weight: bold;
  min-width: 40px;
}

#menuToggle {
  position: fixed;
  top: 12px;
  left: 16px;
  z-index: 25;
  background: #eee;
  color: #111;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}

#side-panel {
  display: none;
  position: fixed;
  top: 62px;
  left: 16px;
  z-index: 15;
  background: rgba(15, 15, 15, 0.92);
  border: 1px solid #333;
  border-radius: 10px;
  padding: 14px;
  width: 280px;
  max-height: calc(100vh - 90px);
  overflow-y: auto;
  font-size: 13px;
}

#side-panel.open {
  display: block;
}

#side-panel hr {
  border: none;
  border-top: 1px solid #333;
  margin: 14px 0;
}

.panel-section-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 14px;
}

#countrySearch {
  width: 100%;
  background: #111;
  color: #eee;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 8px;
}

#countryCheckboxes {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 6px;
  margin-bottom: 10px;
}

.country-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 2px;
  cursor: pointer;
}

.panel-buttons {
  display: flex;
  gap: 8px;
}

.panel-buttons button {
  background: #333;
  color: #eee;
  border: 1px solid #555;
  padding: 5px 10px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 12px;
}

#chart-scroll {
  width: 100vw;
  height: 100vh;
  overflow-x: auto;
  overflow-y: auto;
  padding-top: 60px;
}

#chart {
  display: block;
  background: transparent;
}

#chart .tick text {
  fill: #999;
  font-size: 11px;
}
#chart .tick line {
  stroke: #333;
}
#chart path.domain {
  stroke: #444;
}

#tooltip {
  position: absolute;
  pointer-events: none;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid #444;
  color: #eee;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 30;
}

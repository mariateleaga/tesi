const svg = d3.select("#chart");
const width = +svg.attr("width");
const height = window.innerHeight;
svg.attr("height", height);
const marginBottom = 70; 
const groundY = height - marginBottom;

const legendSvg = d3.select("#legend");

const VULNERABILITY_THRESHOLD = 35;
const MAX_LEAVES = 70;
const MIN_SPREAD = 40;
const MAX_SPREAD = 355; //cambia valore max=cina x grandezza ventaglio       
const YEARS = d3.range(2000, 2023);
const COLLIDE_RADIUS = 15; //x distanza minima tra gli steli in px
const LEAF_RADIUS = 42; 

const EFFICIENCY_GDP_THRESHOLD = 25000; // soglia per paesi modello con foglie
const EFFICIENCY_TOP_N = 6;             

/*
  ============================================================
  PAESI PRIMO PIANO
  ============================================================
  CHN = più popoloso al mondo
  QAT = emissioni CO2 pro capite più alte + GDP pro capite più alto
  IND = secondo più popoloso, economia emergente
  IDN = grande economia emergente del sud-est asiatico
  NOR = ricco, alta CO2 storica, vulnerabilità bassissima
  CHE = ricco e relativamente efficiente (GDP alto, CO2 contenuta)
  ITA = riferimento per il pubblico italiano
  FRA = grande economia europea storica
  USA = tra i maggiori emettitori storici in assoluto
   = GDP molto alto ma sviluppo umano basso (caso anomalo interessante)
  CAGNQF = GDP più basso + tra i più vulnerabili
  COD = CO2 pro capite più basso
  DEU = maggiore economia europea
  BRA = grande economia emergente, forte crescita e emissioni
  NGA = paese più popoloso dell'Africa
  RUS = tra i maggiori emettitori storici
*/
const NOTABLE_ISO3 = new Set([
  "CHN", "QAT", "IND", "IDN", "NOR", "CHE", "ITA", "FRA", "USA", "GNQ",
  "CAF", "COD", "DEU", "BRA", "NGA", "RUS", "GBR"
]);
//const SHOW_COUNTRY_LABELS = false; //ELIMINARE poco chiaro

//Colore per continente
const CONTINENT_COLORS = {
  "Europe": "#3DAEFF",
  "Asia": "#FFC93D",
  "Africa": "#FF7A45",
  "Americas": "#FF4FA3",
  "Oceania": "#33E0C0"
};
const GREY_COLOR = "#5C5B54";
//const LEAF_GREEN = "#5FBF57"; //CAMBIA foglie colore continente

// Nomi dei paesi in italiano
const COUNTRY_NAMES_IT = {
  "AFG": "Afghanistan", "ALB": "Albania", "DZA": "Algeria", "AGO": "Angola", "ARG": "Argentina",
  "ARM": "Armenia", "AUS": "Australia", "AUT": "Austria", "AZE": "Azerbaigian", "BHR": "Bahrein",
  "BGD": "Bangladesh", "BRB": "Barbados", "BLR": "Bielorussia", "BEL": "Belgio", "BEN": "Benin",
  "BOL": "Bolivia", "BIH": "Bosnia ed Erzegovina", "BWA": "Botswana", "BRA": "Brasile", "BGR": "Bulgaria",
  "BFA": "Burkina Faso", "BDI": "Burundi", "KHM": "Cambogia", "CMR": "Camerun", "CAN": "Canada",
  "CPV": "Capo Verde", "CAF": "Repubblica Centrafricana", "TCD": "Ciad", "CHL": "Cile", "CHN": "Cina",
  "COL": "Colombia", "COM": "Comore", "COG": "Congo", "CRI": "Costa Rica", "CIV": "Costa d'Avorio",
  "HRV": "Croazia", "CUB": "Cuba", "CYP": "Cipro", "CZE": "Repubblica Ceca", "COD": "Rep. Democratica del Congo",
  "DNK": "Danimarca", "DJI": "Gibuti", "DMA": "Dominica", "DOM": "Repubblica Dominicana", "ECU": "Ecuador",
  "EGY": "Egitto", "SLV": "El Salvador", "GNQ": "Guinea Equatoriale", "EST": "Estonia", "SWZ": "Eswatini",
  "ETH": "Etiopia", "FIN": "Finlandia", "FRA": "Francia", "GAB": "Gabon", "GMB": "Gambia",
  "GEO": "Georgia", "DEU": "Germania", "GHA": "Ghana", "GRC": "Grecia", "GTM": "Guatemala",
  "GIN": "Guinea", "GNB": "Guinea-Bissau", "HTI": "Haiti", "HND": "Honduras", "HUN": "Ungheria",
  "ISL": "Islanda", "IND": "India", "IDN": "Indonesia", "IRN": "Iran", "IRQ": "Iraq",
  "IRL": "Irlanda", "ISR": "Israele", "ITA": "Italia", "JAM": "Giamaica", "JPN": "Giappone",
  "JOR": "Giordania", "KAZ": "Kazakistan", "KEN": "Kenya", "KWT": "Kuwait", "KGZ": "Kirghizistan",
  "LAO": "Laos", "LVA": "Lettonia", "LBN": "Libano", "LSO": "Lesotho", "LBR": "Liberia",
  "LBY": "Libia", "LTU": "Lituania", "LUX": "Lussemburgo", "MDG": "Madagascar", "MWI": "Malawi",
  "MYS": "Malesia", "MLI": "Mali", "MLT": "Malta", "MRT": "Mauritania", "MUS": "Mauritius",
  "MEX": "Messico", "MDA": "Moldavia", "MNG": "Mongolia", "MNE": "Montenegro", "MAR": "Marocco",
  "MOZ": "Mozambico", "MMR": "Myanmar", "NAM": "Namibia", "NPL": "Nepal", "NLD": "Paesi Bassi",
  "NZL": "Nuova Zelanda", "NIC": "Nicaragua", "NER": "Niger", "NGA": "Nigeria", "PRK": "Corea del Nord",
  "MKD": "Macedonia del Nord", "NOR": "Norvegia", "OMN": "Oman", "PAK": "Pakistan", "PAN": "Panama",
  "PRY": "Paraguay", "PER": "Perù", "PHL": "Filippine", "POL": "Polonia", "PRT": "Portogallo",
  "QAT": "Qatar", "ROU": "Romania", "RUS": "Russia", "RWA": "Ruanda", "LCA": "Santa Lucia",
  "STP": "São Tomé e Príncipe", "SAU": "Arabia Saudita", "SEN": "Senegal", "SRB": "Serbia", "SYC": "Seychelles",
  "SLE": "Sierra Leone", "SGP": "Singapore", "SVK": "Slovacchia", "SVN": "Slovenia", "ZAF": "Sudafrica",
  "KOR": "Corea del Sud", "ESP": "Spagna", "LKA": "Sri Lanka", "SWE": "Svezia", "CHE": "Svizzera",
  "SYR": "Siria", "TJK": "Tagikistan", "TZA": "Tanzania", "THA": "Thailandia", "TGO": "Togo",
  "TTO": "Trinidad e Tobago", "TUN": "Tunisia", "TUR": "Turchia", "TKM": "Turkmenistan", "UGA": "Uganda",
  "UKR": "Ucraina", "ARE": "Emirati Arabi Uniti", "GBR": "Regno Unito", "USA": "Stati Uniti", "URY": "Uruguay",
  "UZB": "Uzbekistan", "VEN": "Venezuela", "VNM": "Vietnam", "YEM": "Yemen", "ZMB": "Zambia", "ZWE": "Zimbabwe"
};

let currentLang = "en";

const TRANSLATIONS = {
  en: {
    heroSubtitle: "Some countries grew by burning the atmosphere. Others are paying for it.",
    scrollHint1: "scroll to continue →",
    scrollHint2: "scroll to see the graph →",
    introP1: "Every flower on this page is a country.",
    introP2: "Its color marks its continent.",
    explainTitle: "If you wanna grow you have to emit",
    continentNames: { Europe: "Europe", Asia: "Asia", Africa: "Africa", Americas: "Americas", Oceania: "Oceania" },
    introP3: `The taller the stem, the richer the country: height reflects
      <span class="term-tooltip" title="GDP per capita is a country's total economic output divided by its population.">GDP per capita</span>, a rough measure of how much wealth there is, on average, for each person.`,
    introP4: "The further right a flower stands, the more CO2 the country emits per person, every year.",
    introP5: "More petals means larger population.",
    introP6: `Grey flowers are the countries most vulnerable to climate change today.<br>The ones with leaves are the model cases: wealthy and rich nations that kept their emissions low.`,
    introP7: "Many countries — like the United States and China — emitted enormously over the decades, and grew rich doing it.<br>Others — like Ethiopia and Rwanda — have emitted almost nothing, and still struggle to grow at all.",
    introP8: "Watch how, scrolling through the years from 2000 to 2022, wealthy countries keep growing while the most vulnerable are left behind, despite having contributed the least to the problem that is hurting them.",
    axisX: "CO2 emissions per capita (tonnes/year) →",
    axisY: "↑ GDP per capita ($)",
    selectPaesiTitle: "Select countries",
    searchPlaceholder: "Search country...",
    confirmBtn: "Confirm selection",
    resetBtn: "Show all",
    legendTitle: "Legend",
    legendRows: [
      ["Horizontal position", "CO2 emissions per capita"],
      ["Stem height", "GDP per capita"],
      ["Fan width", "population (reference: China = full circle)"],
      ["Color", "continent (grey = vulnerability ≥ 35)"],
      ["Small leaf at mid-stem", "among the most efficient (high GDP, low CO2)"]
    ],
    legendColorTitle: "Colors by continent",
    legendGreyLabel: v => `vulnerability ≥ ${v}`,
    tooltip: { gdp: "GDP per capita", co2: "CO2 per capita", pop: "Population", vuln: "Vulnerability" },
    iconLabels: { lowGdp: "low GDP", highGdp: "high GDP", lowCo2: "low CO2", highCo2: "high CO2", outcomeRich: "USA/China", outcomePoor: "Ethiopia/Rwanda" },
    playText: "Play",
    stopText: "Stop"
  },
  it: {
    heroSubtitle: "Alcuni paesi sono cresciuti bruciando l'atmosfera. Altri ne stanno pagando il prezzo.",
    scrollHint1: "scorri per continuare →",
    scrollHint2: "scorri per vedere il grafico →",
    introP1: "Ogni fiore in questa pagina rappresenta un paese.",
    introP2: "Il colore indica il continente.",
    explainTitle: "Se vuoi crescere, devi emettere",
    continentNames: { Europe: "Europa", Asia: "Asia", Africa: "Africa", Americas: "Americhe", Oceania: "Oceania" },
    introP3: `Più alto è lo stelo, più il paese è ricco: l'altezza riflette il
      <span class="term-tooltip" title="Il GDP pro capite è il valore economico totale di un paese diviso per la sua popolazione.">GDP pro capite</span>, una misura approssimativa di quanta ricchezza c'è, in media, per ogni persona.`,
    introP4: "Più un fiore è spostato a destra, più CO2 emette il paese pro capite, ogni anno.",
    introP5: "Più petali significa più popolazione.",
    introP6: `I fiori grigi sono i paesi oggi più vulnerabili al cambiamento climatico.<br>Quelli con le foglioline sono i casi modello: paesi ricchi e prosperi che hanno mantenuto basse le proprie emissioni.`,
    introP7: "Molti paesi — come Stati Uniti e Cina — hanno emesso moltissimo nel corso dei decenni, arricchendosi.<br>Altri — come Etiopia e Ruanda — hanno emesso quasi nulla, e faticano ancora a crescere.",
    introP8: "Osserva come, scorrendo gli anni dal 2000 al 2022, i paesi ricchi crescono e i più vulnerabili restano indietro, nonostante abbiano contribuito pochissimo al problema che li colpisce.",
    axisX: "Emissioni di CO2 pro capite (tonnellate/anno) →",
    axisY: "↑ GDP pro capite ($)",
    selectPaesiTitle: "Seleziona paesi",
    searchPlaceholder: "Cerca paese...",
    confirmBtn: "Conferma selezione",
    resetBtn: "Mostra tutti",
    legendTitle: "Legenda",
    legendRows: [
      ["Posizione orizzontale", "emissioni di CO2 pro capite"],
      ["Altezza dello stelo", "GDP pro capite"],
      ["Ampiezza del ventaglio", "popolazione (riferimento: Cina = cerchio pieno)"],
      ["Colore", "continente (grigio = vulnerabilità ≥ 35)"],
      ["Fogliolina a metà stelo", "tra i più efficienti (GDP alto, CO2 basso)"]
    ],
    legendColorTitle: "Colori per continente",
    legendGreyLabel: v => `vulnerabilità ≥ ${v}`,
    tooltip: { gdp: "GDP pro capite", co2: "CO2 pro capite", pop: "Popolazione", vuln: "Vulnerabilità" },
    iconLabels: { lowGdp: "GDP basso", highGdp: "GDP alto", lowCo2: "CO2 basso", highCo2: "CO2 alto", outcomeRich: "USA/Cina", outcomePoor: "Etiopia/Ruanda" },
    playText: "Play",
    stopText: "Stop"
  }
};

let currentYear = 2000;
let allData = [];
let xScale, stemScale, popScale, yAxisScale;
let beeswarmX = {};
let hasStarted = false;
let selectedIso3 = new Set(); //paesi scelti dall'utente, vuoto = mostra tutti
let CHINA_POP_REF = 0;
let playing = false;
let playTimer = null;
let autoStarted = false; //starta l'animazione una sola volta, al primo arrivo sul grafico

const tooltip = d3.select("#tooltip");


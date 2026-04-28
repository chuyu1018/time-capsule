/* 地图模块 —— Leaflet + OpenStreetMap raster tiles */

let map = null;
let guessMarker = null;
let actualMarker = null;
let answerLine = null;
let onGuessChange = null;
let lockGuess = false;

export function initMap(onChange) {
  onGuessChange = onChange;

  if (map) {
    map.remove();
    map = null;
  }

  map = L.map('guess-map', {
    center: [35.0, 105.0],   // 中国中心
    zoom: 3,
    minZoom: 3,
    maxZoom: 12,
    zoomControl: true,
    attributionControl: false
  });

  // CartoDB Voyager basemap — 免费、无需 key、单子域避免预览环境的 DNS 抖动
  L.tileLayer('https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
    maxZoom: 12,
    attribution: '© OpenStreetMap contributors © CARTO'
  }).addTo(map);

  // 限定中国地图视野
  map.setMaxBounds([[15, 70], [55, 140]]);

  map.on('click', (e) => {
    if (lockGuess) return;
    placeGuess(e.latlng);
    if (onGuessChange) onGuessChange(e.latlng);
  });

  // 防止 Leaflet 在隐藏容器中初始化导致瓦片错位
  setTimeout(() => map.invalidateSize(), 100);
}

export function placeGuess(latlng) {
  const guessIcon = L.divIcon({
    className: '',
    html: '<div class="guess-marker-icon"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  if (guessMarker) {
    guessMarker.setLatLng(latlng);
  } else {
    guessMarker = L.marker(latlng, { icon: guessIcon, interactive: false }).addTo(map);
  }
}

export function getGuess() {
  return guessMarker ? guessMarker.getLatLng() : null;
}

export function showAnswer(actual, guess) {
  lockGuess = true;

  const actualIcon = L.divIcon({
    className: '',
    html: '<div class="actual-marker-icon"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });

  if (actualMarker) {
    actualMarker.setLatLng(actual);
  } else {
    actualMarker = L.marker(actual, { icon: actualIcon, interactive: false }).addTo(map);
  }

  if (guess) {
    if (answerLine) answerLine.remove();
    answerLine = L.polyline([guess, actual], {
      color: '#c1393d',
      weight: 2,
      opacity: 0.7,
      dashArray: '6 6'
    }).addTo(map);

    // Fit both
    map.fitBounds(L.latLngBounds([guess, actual]).pad(0.4));
  } else {
    map.setView(actual, 5);
  }
}

export function resetMap() {
  lockGuess = false;
  if (guessMarker) { guessMarker.remove(); guessMarker = null; }
  if (actualMarker) { actualMarker.remove(); actualMarker = null; }
  if (answerLine) { answerLine.remove(); answerLine = null; }
  if (map) map.setView([35.0, 105.0], 3);
}

export function expandMap(expand = true) {
  const dock = document.querySelector('.map-dock');
  if (!dock) return;
  dock.classList.toggle('expanded', expand);
  setTimeout(() => map && map.invalidateSize(), 280);
}

/** Haversine: returns kilometers */
export function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

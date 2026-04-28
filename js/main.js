/* 时间胶囊 · Time Capsule —— 入口模块 */

import {
  ROUND_DURATION_SEC,
  ROUNDS_PER_GAME,
  pickRounds,
  scoreRound,
  formatDistance,
  formatYearError,
  endgameTitle
} from './game.js';

import { loadPanorama, destroyViewer } from './viewer.js';
import { initMap, getGuess, showAnswer, resetMap, expandMap } from './map.js';
import {
  startTimer, stopTimer,
  setRoundStatus,
  showResultPanel, hideResultPanel,
  showButton, hideButton,
  setYearReadout, getYearGuess, resetYearSlider,
  showSettings, showHelp,
  showEndgame, hideEndgame
} from './ui.js';

const state = {
  allRounds: [],
  rounds: [],          // selected 5
  currentIndex: 0,
  cumulativeScore: 0,
  cumulativeDistanceKm: 0,
  cumulativeYearError: 0,
  hasGuessed: false,
  filter: 'all'
};

async function loadRoundsData() {
  const res = await fetch('data/rounds.json');
  if (!res.ok) throw new Error('rounds.json 加载失败');
  const data = await res.json();
  return data.rounds;
}

function startNewGame() {
  state.rounds = pickRounds(state.allRounds, state.filter);
  state.currentIndex = 0;
  state.cumulativeScore = 0;
  state.cumulativeDistanceKm = 0;
  state.cumulativeYearError = 0;
  state.hasGuessed = false;

  hideEndgame();
  hideResultPanel();
  showSettings(false);
  beginRound();
}

function beginRound() {
  const round = state.rounds[state.currentIndex];
  if (!round) {
    finishGame();
    return;
  }

  state.hasGuessed = false;
  hideResultPanel();
  hideButton('submit-guess');
  hideButton('next-round');
  showButton('map-prompt');

  resetMap();
  resetYearSlider();
  setRoundStatus(state.currentIndex, state.rounds.length, state.cumulativeScore);

  loadPanorama(round);

  startTimer(() => {
    if (!state.hasGuessed) submitGuess();
  });
}

function submitGuess() {
  if (state.hasGuessed) return;
  state.hasGuessed = true;
  stopTimer();

  const round = state.rounds[state.currentIndex];
  const guessLatLng = getGuess(); // may be null
  const guessYear = getYearGuess();
  const result = scoreRound(round, guessLatLng, guessYear);

  state.cumulativeScore += result.totalScore;
  state.cumulativeDistanceKm += result.distanceKm;
  state.cumulativeYearError += Math.abs(result.yearError);

  // Show answer marker on map
  showAnswer(round.location, guessLatLng);
  expandMap(true);
  setRoundStatus(state.currentIndex, state.rounds.length, state.cumulativeScore);
  showResultPanel(round, result, formatDistance, formatYearError);

  hideButton('submit-guess');
  hideButton('map-prompt');
  if (state.currentIndex < state.rounds.length - 1) {
    showButton('next-round');
  } else {
    showButton('next-round');
    document.getElementById('next-round').textContent = '查看战绩';
  }
}

function nextRound() {
  state.currentIndex += 1;
  expandMap(false);
  if (state.currentIndex >= state.rounds.length) {
    finishGame();
  } else {
    document.getElementById('next-round').textContent = '下一关';
    beginRound();
  }
}

function finishGame() {
  stopTimer();
  destroyViewer();
  hideResultPanel();

  const { title, quote } = endgameTitle(state.cumulativeScore);
  showEndgame({
    totalScore: state.cumulativeScore,
    distanceLabel: formatDistance(state.cumulativeDistanceKm),
    timeLabel: `${state.cumulativeYearError} 年`,
    titleText: title,
    quote: quote
  });
}

// =========== Event wiring ===========

function bindEvents() {
  // Year slider
  const yearInput = document.getElementById('year-input');
  yearInput.addEventListener('input', (e) => {
    setYearReadout(parseInt(e.target.value, 10));
  });

  // Map prompt -> when user has placed a marker the button label changes
  const mapPrompt = document.getElementById('map-prompt');
  const submit = document.getElementById('submit-guess');
  const next = document.getElementById('next-round');

  mapPrompt.addEventListener('click', () => {
    expandMap(true);
  });

  // Listen for guess placement -> show submit
  document.addEventListener('guessPlaced', () => {
    hideButton('map-prompt');
    showButton('submit-guess');
  });

  submit.addEventListener('click', submitGuess);
  next.addEventListener('click', nextRound);

  // Settings
  const settingsBtn = document.querySelector('.settings-button');
  settingsBtn.addEventListener('click', () => showSettings(true));
  document.querySelectorAll('[data-settings-close]').forEach(b =>
    b.addEventListener('click', () => showSettings(false))
  );
  document.querySelector('[data-settings-action="new-game"]').addEventListener('click', () => {
    startNewGame();
  });

  // Filter
  document.querySelectorAll('input[name="round-filter"]').forEach(r => {
    r.addEventListener('change', (e) => {
      if (e.target.checked) state.filter = e.target.value;
    });
  });

  // Help
  document.getElementById('settings-help-button').addEventListener('click', () => showHelp(true));
  document.getElementById('settings-help-back').addEventListener('click', () => showHelp(false));

  // Endgame
  document.getElementById('endgame-new-game').addEventListener('click', startNewGame);

  // Mobile hide map
  const mobileHide = document.getElementById('mobile-hide-map');
  if (mobileHide) {
    mobileHide.addEventListener('click', () => expandMap(false));
  }
}

// =========== Boot ===========
async function boot() {
  try {
    state.allRounds = await loadRoundsData();
  } catch (err) {
    console.error(err);
    document.getElementById('viewer').innerHTML =
      '<div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(244,236,216,.7);font-family:Songti SC,serif;text-align:center;padding:20px;">加载游戏数据失败<br/><small>' + err.message + '</small></div>';
    return;
  }

  initMap((latlng) => {
    document.dispatchEvent(new CustomEvent('guessPlaced', { detail: latlng }));
  });

  bindEvents();
  startNewGame();
}

boot();

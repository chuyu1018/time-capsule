/* UI 控制 —— 计时器、状态展示、模态框、按钮显示/隐藏 */

import { ROUND_DURATION_SEC } from './game.js';

let timerInterval = null;
let timerCallback = null;
let timeLeft = ROUND_DURATION_SEC;

export function startTimer(onExpire) {
  stopTimer();
  timeLeft = ROUND_DURATION_SEC;
  timerCallback = onExpire;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft -= 1;
    updateTimerUI();
    if (timeLeft <= 0) {
      stopTimer();
      if (timerCallback) timerCallback();
    }
  }, 1000);
}

export function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerUI() {
  const label = document.getElementById('timer-label');
  const progress = document.getElementById('timer-progress');
  if (label) {
    const mm = Math.floor(timeLeft / 60);
    const ss = String(timeLeft % 60).padStart(2, '0');
    label.textContent = `${mm}:${ss}`;
  }
  if (progress) {
    const pct = (timeLeft / ROUND_DURATION_SEC) * 100;
    progress.style.strokeDashoffset = String(100 - pct);
    progress.classList.toggle('warn', timeLeft <= 10);
  }
}

export function setRoundStatus(currentIndex, totalRounds, cumulativeScore) {
  const label = document.getElementById('round-status-label');
  const score = document.getElementById('round-status-score');
  if (label) label.textContent = `第 ${currentIndex + 1} / ${totalRounds} 关`;
  if (score) score.textContent = String(cumulativeScore);
}

export function showResultPanel(round, scoreInfo, formatDistance, formatYearError) {
  const panel = document.getElementById('result-card');
  if (!panel) return;
  panel.classList.remove('hidden');

  document.getElementById('distance-result').textContent = formatDistance(scoreInfo.distanceKm);
  document.getElementById('time-result').textContent = formatYearError(scoreInfo.yearError);
  document.getElementById('total-score-result').textContent = `${scoreInfo.totalScore} / 10000`;
  document.getElementById('answer-summary').textContent = round.answer || '';

  // Wiki summary
  if (round.wiki) {
    const wiki = document.getElementById('wiki-summary');
    wiki.classList.remove('is-hidden');
    document.getElementById('wiki-summary-title').textContent = round.wiki.title || round.title;
    document.getElementById('wiki-summary-extract').textContent = round.wiki.summary || '';
    const meta = document.getElementById('wiki-summary-meta');
    meta.innerHTML = round.wiki.url
      ? `<a href="${round.wiki.url}" target="_blank" rel="noopener noreferrer">维基百科</a>`
      : '';
  } else {
    document.getElementById('wiki-summary').classList.add('is-hidden');
  }

  // Trigger reveal animation
  panel.querySelectorAll('.reveal-piece').forEach(el => {
    el.style.animation = 'none';
    // force reflow
    void el.offsetWidth;
    el.style.animation = '';
  });
}

export function hideResultPanel() {
  document.getElementById('result-card')?.classList.add('hidden');
}

export function showButton(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

export function hideButton(id) {
  document.getElementById(id)?.classList.add('hidden');
}

export function setYearReadout(year) {
  const r = document.getElementById('year-readout');
  if (r) r.textContent = String(year);
}

export function getYearGuess() {
  const input = document.getElementById('year-input');
  return input ? parseInt(input.value, 10) : 1800;
}

export function resetYearSlider() {
  const input = document.getElementById('year-input');
  if (input) {
    input.value = '1800';
    setYearReadout(1800);
  }
}

export function showSettings(show = true) {
  document.getElementById('settings-modal')?.classList.toggle('hidden', !show);
}

export function showHelp(show = true) {
  document.getElementById('settings-help-panel')?.classList.toggle('hidden', !show);
  document.getElementById('settings-panel')?.classList.toggle('hidden', show);
}

export function showEndgame(stats) {
  const modal = document.getElementById('endgame-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  document.getElementById('endgame-total-score').textContent = String(stats.totalScore);
  document.getElementById('endgame-total-distance').textContent = stats.distanceLabel;
  document.getElementById('endgame-total-time').textContent = stats.timeLabel;
  document.getElementById('endgame-title').textContent = stats.titleText;
  const quoteEl = document.getElementById('endgame-quote');
  if (stats.quote) {
    quoteEl.textContent = stats.quote;
    quoteEl.classList.remove('hidden');
  } else {
    quoteEl.textContent = '';
    quoteEl.classList.add('hidden');
  }
}

export function hideEndgame() {
  document.getElementById('endgame-modal')?.classList.add('hidden');
}

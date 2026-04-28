/* 游戏循环、计分、状态机 */

import { distanceKm } from './map.js';

export const ROUND_DURATION_SEC = 60;
export const ROUNDS_PER_GAME = 5;
export const MAX_DISTANCE_SCORE = 5000;
export const MAX_TIME_SCORE = 5000;

/** 把全部关卡按筛选 + 抽 5 关 */
export function pickRounds(allRounds, filter = 'all') {
  let pool = allRounds;
  if (filter !== 'all') {
    pool = allRounds.filter(r => r.era === filter);
  }
  if (pool.length === 0) pool = allRounds;

  // 洗牌取前 5
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUNDS_PER_GAME);
}

/**
 * 距离分：1000km 内有分，公式 max(0, 5000 - dKm * 5)
 *   - 0 km    -> 5000
 *   - 100 km  -> 4500
 *   - 500 km  -> 2500
 *   - 1000 km -> 0
 */
export function distanceScore(dKm) {
  return Math.max(0, Math.round(MAX_DISTANCE_SCORE - dKm * 5));
}

/**
 * 年代分：100 年内有分，公式 max(0, 5000 - |yearError| * 50)
 *   - 0 年   -> 5000
 *   - 10 年  -> 4500
 *   - 50 年  -> 2500
 *   - 100 年 -> 0
 */
export function timeScore(yearError) {
  return Math.max(0, Math.round(MAX_TIME_SCORE - Math.abs(yearError) * 50));
}

export function scoreRound(round, guessLatLng, guessYear) {
  const actual = round.location;
  const dKm = guessLatLng ? distanceKm(guessLatLng, actual) : 20000;
  const yearErr = guessYear !== null ? guessYear - round.year : 500;

  const dScore = distanceScore(dKm);
  const tScore = timeScore(yearErr);

  return {
    distanceKm: dKm,
    yearError: yearErr,
    distanceScore: dScore,
    timeScore: tScore,
    totalScore: dScore + tScore
  };
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} 米`;
  if (km < 100) return `${km.toFixed(1)} 公里`;
  return `${Math.round(km)} 公里`;
}

export function formatYearError(yearErr) {
  const abs = Math.abs(yearErr);
  if (abs === 0) return '完全正确！';
  const direction = yearErr > 0 ? '晚了' : '早了';
  return `${direction} ${abs} 年`;
}

/** 终局称号：根据总分给玩家一个段位（王者 → 黑铁） */
export function endgameTitle(totalScore) {
  if (totalScore >= 42000) return { title: '王者', quote: '' };
  if (totalScore >= 33000) return { title: '钻石', quote: '' };
  if (totalScore >= 24000) return { title: '黄金', quote: '' };
  if (totalScore >= 15000) return { title: '白银', quote: '' };
  if (totalScore >= 7000)  return { title: '青铜', quote: '' };
  return { title: '黑铁', quote: '' };
}

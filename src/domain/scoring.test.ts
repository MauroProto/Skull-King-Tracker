import { describe, it, expect } from 'vitest';
import { calculateBaseScore, calculateRoundScore, validateRound } from './scoring';
import { GameSettings } from './types';

const defaultSettings: GameSettings = {
  rulePreset: 'Standard',
  useKraken: true,
  useWhiteWhale: true,
  useLoot: false,
  totalRounds: 10
};

describe('calculateBaseScore', () => {
  it('correctly calculates zero bid success', () => {
    expect(calculateBaseScore(3, 0, 0, defaultSettings)).toBe(30);
  });

  it('correctly calculates zero bid failure', () => {
    expect(calculateBaseScore(3, 0, 1, defaultSettings)).toBe(-30);
  });

  it('correctly calculates exact non-zero bid success', () => {
    expect(calculateBaseScore(3, 2, 2, defaultSettings)).toBe(40);
  });

  it('correctly calculates incorrect non-zero bid (under)', () => {
    expect(calculateBaseScore(3, 3, 1, defaultSettings)).toBe(-20); // 2 diff * 10
  });

  it('correctly calculates incorrect non-zero bid (over)', () => {
    expect(calculateBaseScore(3, 1, 3, defaultSettings)).toBe(-20); // 2 diff * 10
  });
});

describe('calculateRoundScore', () => {
  it('adds bonus only if exact bid', () => {
    // exact bid, 50 bonus
    expect(calculateRoundScore(5, 2, 2, 50, defaultSettings)).toBe(90);
    
    // incorrect bid, 50 bonus should be ignored in standard
    expect(calculateRoundScore(5, 2, 1, 50, defaultSettings)).toBe(-10);
  });
});

describe('validateRound', () => {
  it('validates correct round without Kraken', () => {
    const settings = { ...defaultSettings, useKraken: false };
    const results = {
      p1: { playerId: 'p1', bid: 1, tricksWon: 1, bonusPoints: 0, score: 0 },
      p2: { playerId: 'p2', bid: 2, tricksWon: 2, bonusPoints: 0, score: 0 },
    };
    const { isValid, issues } = validateRound(3, results, settings);
    expect(isValid).toBe(true);
    expect(issues.length).toBe(0);
  });

  it('invalidates round with too many tricks', () => {
    const results = {
      p1: { playerId: 'p1', bid: 1, tricksWon: 2, bonusPoints: 0, score: 0 },
      p2: { playerId: 'p2', bid: 2, tricksWon: 2, bonusPoints: 0, score: 0 },
    };
    const { isValid, issues } = validateRound(3, results, defaultSettings);
    expect(isValid).toBe(false);
    expect(issues[0].code).toBe('total_exceeds');
  });

  it('allows less tricks if Kraken is used', () => {
    const settings = { ...defaultSettings, useKraken: true };
    const results = {
      p1: { playerId: 'p1', bid: 1, tricksWon: 1, bonusPoints: 0, score: 0 },
      p2: { playerId: 'p2', bid: 2, tricksWon: 1, bonusPoints: 0, score: 0 }, // total 2 tricks in round 3
    };
    const { isValid } = validateRound(3, results, settings);
    expect(isValid).toBe(true); // Valid because kraken might have eaten a trick
  });
});

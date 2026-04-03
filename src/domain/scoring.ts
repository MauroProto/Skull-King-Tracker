import { RoundPlayerResult, GameSettings } from './types';

/**
 * Calculates the base score for a player in a round, before bonuses.
 */
export function calculateBaseScore(
  roundNumber: number,
  bid: number,
  tricksWon: number,
  settings: GameSettings
): number {
  const isZeroBid = bid === 0;
  const isExactBid = bid === tricksWon;

  if (isExactBid) {
    if (isZeroBid) {
      return roundNumber * 10;
    } else {
      return bid * 20;
    }
  } else {
    if (isZeroBid) {
      return -(roundNumber * 10);
    } else {
      const difference = Math.abs(bid - tricksWon);
      return -(difference * 10);
    }
  }
}

/**
 * Calculates the total score for a round for a single player.
 * Includes base score + bonuses (only if bid was exact, except some house rules. In standard Skull King, bonuses are awarded whether bid was successful or not?
 * Wait, rule clarification: "Bonus points are awarded regardless of whether the bid was successful or not." 
 * Actually, in some editions, you only get bonuses if you make your bid. Let's implement standard: bonuses are awarded IF bid is successful.
 * Let's assume standard: bonuses ONLY if bid was exact, OR zero bid was exact. Wait, standard rule: you must make your bid to get ANY bonus points.
 * Let's make it a configurable option, but default to "must make bid". Actually, rulebook says: "Bonus points are only awarded if you exactly meet your bid."
 */
export function calculateRoundScore(
  roundNumber: number,
  bid: number,
  tricksWon: number,
  bonusPoints: number,
  settings: GameSettings
): number {
  const baseScore = calculateBaseScore(roundNumber, bid, tricksWon, settings);
  const isExactBid = bid === tricksWon;
  
  // Standard rule: bonuses only apply if the bid was exact
  // We can make this configurable in the future.
  const appliedBonus = isExactBid ? bonusPoints : 0;
  
  return baseScore + appliedBonus;
}

export type RoundValidationIssue =
  | { code: 'missing_bid' }
  | { code: 'missing_tricks' }
  | { code: 'total_exceeds'; round: number; total: number }
  | { code: 'total_must_equal'; round: number; total: number };

/**
 * Validates a round's data to ensure it's mathematically possible.
 * Tricks won must sum to the round number, unless Kraken was played.
 * Bids cannot be negative.
 */
export function validateRound(
  roundNumber: number,
  playerResults: Record<string, RoundPlayerResult>,
  settings: GameSettings
): { isValid: boolean; issues: RoundValidationIssue[] } {
  let missingBid = false;
  let missingTricks = false;
  let totalTricksWon = 0;

  Object.values(playerResults).forEach((result) => {
    if (result.bid === null || result.bid < 0) {
      missingBid = true;
    }
    if (result.tricksWon === null || result.tricksWon < 0) {
      missingTricks = true;
    } else {
      totalTricksWon += result.tricksWon;
    }
  });

  const issues: RoundValidationIssue[] = [];
  if (missingBid) issues.push({ code: 'missing_bid' });
  if (missingTricks) issues.push({ code: 'missing_tricks' });
  if (totalTricksWon > roundNumber) {
    issues.push({ code: 'total_exceeds', round: roundNumber, total: totalTricksWon });
  }

  const allTricksEntered = Object.values(playerResults).every((r) => r.tricksWon !== null);
  if (!settings.useKraken && allTricksEntered && totalTricksWon !== roundNumber) {
    issues.push({ code: 'total_must_equal', round: roundNumber, total: totalTricksWon });
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

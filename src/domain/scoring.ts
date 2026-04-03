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

/**
 * Validates a round's data to ensure it's mathematically possible.
 * Tricks won must sum to the round number, unless Kraken was played.
 * Bids cannot be negative.
 */
export function validateRound(
  roundNumber: number,
  playerResults: Record<string, RoundPlayerResult>,
  settings: GameSettings
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  let totalTricksWon = 0;
  
  Object.values(playerResults).forEach((result) => {
    if (result.bid === null || result.bid < 0) {
      errors.push("Bids must be positive numbers.");
    }
    if (result.tricksWon === null || result.tricksWon < 0) {
      errors.push("Tricks won must be positive numbers.");
    } else {
      totalTricksWon += result.tricksWon;
    }
  });

  if (totalTricksWon > roundNumber) {
    errors.push(`Total tricks won (${totalTricksWon}) cannot exceed round number (${roundNumber}).`);
  }

  // If we don't use Kraken, total tricks must exactly equal round number
  if (!settings.useKraken && totalTricksWon !== roundNumber) {
    // If not all players have entered tricks yet, it's just incomplete, but if they all have and it's wrong:
    const allEntered = Object.values(playerResults).every(r => r.tricksWon !== null);
    if (allEntered) {
      errors.push(`Total tricks won (${totalTricksWon}) must equal round number (${roundNumber}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

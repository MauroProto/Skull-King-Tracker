import { CardPlayed, TrickResolution, GameSettings, SpecialCard } from './types';

export function resolveTrick(
  cardsPlayed: CardPlayed[],
  settings: GameSettings
): TrickResolution {
  if (cardsPlayed.length === 0) {
    return { winnerId: null, reason: "No cards played", bonusPoints: 0, nextLeaderId: "" };
  }

  // Find Kraken and White Whale
  const krakenIndex = cardsPlayed.findIndex(c => c.cardType === 'Kraken');
  const whiteWhaleIndex = cardsPlayed.findIndex(c => c.cardType === 'WhiteWhale');

  let activeKraken = false;
  let activeWhiteWhale = false;

  if (krakenIndex !== -1 && whiteWhaleIndex !== -1) {
    // The second one played keeps its power
    if (krakenIndex > whiteWhaleIndex) {
      activeKraken = true;
    } else {
      activeWhiteWhale = true;
    }
  } else {
    if (krakenIndex !== -1) activeKraken = true;
    if (whiteWhaleIndex !== -1) activeWhiteWhale = true;
  }

  // Transform cards if White Whale is active
  const effectiveCards = cardsPlayed.map(card => {
    if (activeWhiteWhale && isSpecial(card.cardType) && card.cardType !== 'WhiteWhale') {
      return { ...card, cardType: 'Escape' as SpecialCard };
    }
    return card;
  });

  let winnerId: string | null = null;
  let reason = "";
  let bonusPoints = 0;

  // Check for Specials interaction
  const hasMermaid = effectiveCards.some(c => c.cardType === 'Mermaid');
  const hasSkullKing = effectiveCards.some(c => c.cardType === 'SkullKing');
  const hasPirate = effectiveCards.some(c => c.cardType === 'Pirate');

  if (hasMermaid && hasSkullKing) {
    const mermaidPlayer = effectiveCards.find(c => c.cardType === 'Mermaid')!.playerId;
    winnerId = mermaidPlayer;
    reason = "Mermaid captures the Skull King!";
    bonusPoints += 50;
  } else if (hasSkullKing) {
    const skPlayer = effectiveCards.find(c => c.cardType === 'SkullKing')!.playerId;
    winnerId = skPlayer;
    const piratesCaptured = effectiveCards.filter(c => c.cardType === 'Pirate').length;
    if (piratesCaptured > 0) {
      reason = `Skull King captures ${piratesCaptured} Pirate(s)!`;
      bonusPoints += 30 * piratesCaptured;
    } else {
      reason = "Skull King wins!";
    }
  } else if (hasPirate) {
    const firstPirate = effectiveCards.find(c => c.cardType === 'Pirate')!;
    winnerId = firstPirate.playerId;
    reason = "First Pirate played wins!";
  } else if (hasMermaid) {
    const firstMermaid = effectiveCards.find(c => c.cardType === 'Mermaid')!;
    winnerId = firstMermaid.playerId;
    reason = "First Mermaid played wins!";
  } else {
    // No winning specials. Look at Trump (JollyRoger) and Suits.
    const trumps = effectiveCards.filter(c => c.cardType === 'Trump' || c.suit === 'JollyRoger');
    if (trumps.length > 0) {
      const highestTrump = trumps.reduce((prev, curr) => (curr.value! > prev.value!) ? curr : prev);
      winnerId = highestTrump.playerId;
      reason = `Highest Jolly Roger (${highestTrump.value}) wins!`;
    } else {
      // Find the led suit
      let ledSuit: 'Parrot' | 'Treasure' | 'Map' | undefined = undefined;
      for (const card of effectiveCards) {
        if ((card.cardType === 'Suit' || card.suit) && card.suit !== 'JollyRoger') {
          ledSuit = card.suit as 'Parrot' | 'Treasure' | 'Map';
          break;
        }
      }

      if (ledSuit) {
        const followers = effectiveCards.filter(c => (c.cardType === 'Suit' || c.suit) && c.suit === ledSuit);
        const highestFollower = followers.reduce((prev, curr) => (curr.value! > prev.value!) ? curr : prev);
        winnerId = highestFollower.playerId;
        reason = `Highest led suit (${ledSuit} ${highestFollower.value}) wins!`;
      } else {
        // Everyone played Escapes, Loot or non-winning cards
        winnerId = effectiveCards[0].playerId;
        reason = "First card played wins by default (all escapes).";
      }
    }
  }

  let nextLeaderId = winnerId!; // Save who would have won before Kraken cancels it

  if (activeKraken) {
    winnerId = null; // Kraken destroys the trick
    reason = "Kraken destroys the trick! No one wins.";
    bonusPoints = 0; // Kraken negates any bonuses
  }

  return {
    winnerId,
    reason,
    bonusPoints,
    nextLeaderId
  };
}

function isSpecial(type: string): boolean {
  return ['Mermaid', 'Pirate', 'SkullKing', 'Kraken', 'WhiteWhale', 'Loot', 'Escape'].includes(type);
}

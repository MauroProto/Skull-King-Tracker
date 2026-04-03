import { describe, it, expect } from 'vitest';
import { resolveTrick } from './trickResolver';
import { CardPlayed, GameSettings } from './types';

const settings: GameSettings = {
  rulePreset: 'Standard',
  useKraken: true,
  useWhiteWhale: true,
  useLoot: false,
  totalRounds: 10
};

describe('resolveTrick', () => {
  it('Skull King captures Pirate', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'Pirate' },
      { playerId: 'p2', cardType: 'Suit', suit: 'Parrot', value: 10 },
      { playerId: 'p3', cardType: 'SkullKing' }
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBe('p3');
    expect(res.reason).toContain('Skull King captures');
    expect(res.bonusPoints).toBe(30);
  });

  it('Mermaid captures Skull King', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'Pirate' },
      { playerId: 'p2', cardType: 'Mermaid' },
      { playerId: 'p3', cardType: 'SkullKing' }
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBe('p2');
    expect(res.reason).toContain('Mermaid captures');
    expect(res.bonusPoints).toBe(50);
  });

  it('Pirate beats Mermaid if no SK', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'Pirate' },
      { playerId: 'p2', cardType: 'Mermaid' },
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBe('p1');
    expect(res.reason).toContain('First Pirate');
  });

  it('Highest Trump wins', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'Suit', suit: 'Parrot', value: 14 },
      { playerId: 'p2', cardType: 'Trump', value: 2 },
      { playerId: 'p3', cardType: 'Trump', value: 8 }
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBe('p3');
  });

  it('Kraken destroys trick', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'SkullKing' },
      { playerId: 'p2', cardType: 'Kraken' },
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBeNull();
    expect(res.nextLeaderId).toBe('p1'); // p1 would have won
    expect(res.bonusPoints).toBe(0);
  });

  it('White Whale neutralizes specials', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'Pirate' }, // becomes Escape
      { playerId: 'p2', cardType: 'WhiteWhale' },
      { playerId: 'p3', cardType: 'Suit', suit: 'Map', value: 10 }
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBe('p3');
  });

  it('Second creature keeps power (Kraken vs WhiteWhale)', () => {
    const cards: CardPlayed[] = [
      { playerId: 'p1', cardType: 'WhiteWhale' }, // acted as escape
      { playerId: 'p2', cardType: 'Kraken' }, // kept power
      { playerId: 'p3', cardType: 'Pirate' } // wins if kraken didn't destroy it
    ];
    const res = resolveTrick(cards, settings);
    expect(res.winnerId).toBeNull(); // kraken active
  });
});

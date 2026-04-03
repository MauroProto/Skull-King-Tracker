export type RulePreset = 'Standard' | 'Rascal' | 'Custom';

export interface GameSettings {
  rulePreset: RulePreset;
  useKraken: boolean;
  useWhiteWhale: boolean;
  useLoot: boolean;
  totalRounds: number;
}

export interface Player {
  id: string;
  name: string;
}

export interface RoundPlayerResult {
  playerId: string;
  bid: number | null;
  tricksWon: number | null;
  bonusPoints: number; // calculated from TrickEvents or manual
  score: number; // calculated score for this round
}

export type SpecialCard = 
  | 'Mermaid' 
  | 'Pirate' 
  | 'SkullKing' 
  | 'Kraken' 
  | 'WhiteWhale' 
  | 'Loot' 
  | 'Escape' 
  | 'None';

export interface TrickEvent {
  id: string;
  winnerId: string;
  capturedCards: SpecialCard[];
  // For standard standard captures
  mermaidCapturedSkullKing: boolean;
  skullKingCapturedPirates: number;
}

export interface Round {
  roundNumber: number;
  startingPlayerId: string;
  playerResults: Record<string, RoundPlayerResult>;
  trickEvents: TrickEvent[];
  isCompleted: boolean;
}

export interface Game {
  id: string;
  status: 'setup' | 'playing' | 'finished';
  settings: GameSettings;
  players: Player[];
  rounds: Round[];
  currentRound: number; // 1-indexed
  createdAt: string;
}

// Trick Resolver types
export interface CardPlayed {
  playerId: string;
  cardType: SpecialCard | 'Suit' | 'Trump';
  value?: number; // 1-14
  suit?: 'Parrot' | 'Treasure' | 'Map' | 'JollyRoger'; // JollyRoger is trump
}

export interface TrickResolution {
  winnerId: string | null; // null if Kraken
  reason: string;
  bonusPoints: number;
  nextLeaderId: string;
}

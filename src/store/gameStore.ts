import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameSettings, Player, Round, RoundPlayerResult } from '../domain/types';
import { calculateRoundScore } from '../domain/scoring';

interface GameState {
  game: Game | null;
  
  // Actions
  createNewGame: (players: Player[], settings: GameSettings) => void;
  updateBid: (roundIndex: number, playerId: string, bid: number) => void;
  updateTricksWon: (roundIndex: number, playerId: string, tricksWon: number) => void;
  updateBonus: (roundIndex: number, playerId: string, bonusPoints: number) => void;
  completeRound: (roundIndex: number) => void;
  goToNextRound: () => void;
  editRound: (roundIndex: number) => void;
  endGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  importGame: (game: Game) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      game: null,

      createNewGame: (players, settings) => {
        const initialRounds: Round[] = [];
        for (let i = 1; i <= settings.totalRounds; i++) {
          const playerResults: Record<string, RoundPlayerResult> = {};
          players.forEach(p => {
            playerResults[p.id] = {
              playerId: p.id,
              bid: null,
              tricksWon: null,
              bonusPoints: 0,
              score: 0
            };
          });

          initialRounds.push({
            roundNumber: i,
            // Simple rotation of starting player based on round number
            startingPlayerId: players[(i - 1) % players.length].id,
            playerResults,
            trickEvents: [],
            isCompleted: false
          });
        }

        set({
          game: {
            id: uuidv4(),
            status: 'playing',
            settings,
            players,
            rounds: initialRounds,
            currentRound: 1,
            createdAt: new Date().toISOString()
          }
        });
      },

      updateBid: (roundIndex, playerId, bid) => {
        set((state) => {
          if (!state.game) return state;
          const newRounds = [...state.game.rounds];
          newRounds[roundIndex].playerResults[playerId].bid = bid;
          return { game: { ...state.game, rounds: newRounds } };
        });
      },

      updateTricksWon: (roundIndex, playerId, tricksWon) => {
        set((state) => {
          if (!state.game) return state;
          const newRounds = [...state.game.rounds];
          newRounds[roundIndex].playerResults[playerId].tricksWon = tricksWon;
          return { game: { ...state.game, rounds: newRounds } };
        });
      },

      updateBonus: (roundIndex, playerId, bonusPoints) => {
        set((state) => {
          if (!state.game) return state;
          const newRounds = [...state.game.rounds];
          newRounds[roundIndex].playerResults[playerId].bonusPoints = bonusPoints;
          return { game: { ...state.game, rounds: newRounds } };
        });
      },

      completeRound: (roundIndex) => {
        set((state) => {
          if (!state.game) return state;
          const newRounds = [...state.game.rounds];
          const round = newRounds[roundIndex];
          const settings = state.game.settings;

          // Calculate scores
          Object.values(round.playerResults).forEach(result => {
            if (result.bid !== null && result.tricksWon !== null) {
              result.score = calculateRoundScore(
                round.roundNumber,
                result.bid,
                result.tricksWon,
                result.bonusPoints,
                settings
              );
            }
          });

          round.isCompleted = true;
          return { game: { ...state.game, rounds: newRounds } };
        });
      },

      goToNextRound: () => {
        set((state) => {
          if (!state.game) return state;
          if (state.game.currentRound < state.game.settings.totalRounds) {
            return { game: { ...state.game, currentRound: state.game.currentRound + 1 } };
          } else {
            return { game: { ...state.game, status: 'finished' } };
          }
        });
      },

      editRound: (roundIndex) => {
        set((state) => {
          if (!state.game) return state;
          const newRounds = [...state.game.rounds];
          newRounds[roundIndex].isCompleted = false;
          // Note: we don't automatically reset the scores to 0 here, they will be recalculated on completeRound.
          // Also, we change the current round to this one.
          return { 
            game: { 
              ...state.game, 
              rounds: newRounds,
              currentRound: roundIndex + 1,
              status: 'playing' 
            } 
          };
        });
      },

      endGame: () => {
        set((state) => {
          if (!state.game) return state;
          return { game: { ...state.game, status: 'finished' } };
        });
      },

      resumeGame: () => {
        set((state) => {
          if (!state.game) return state;
          return { game: { ...state.game, status: 'playing' } };
        });
      },

      resetGame: () => {
        set({ game: null });
      },

      importGame: (game) => {
        set({ game });
      }
    }),
    {
      name: 'skull-king-storage',
    }
  )
);

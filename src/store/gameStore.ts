import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Game, GameSettings, Player, Round, RoundPlayerResult } from '../domain/types';
import { calculateRoundScore } from '../domain/scoring';

interface GameState {
  game: Game | null;

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
    (set) => ({
      game: null,

      createNewGame: (players, settings) => {
        const initialRounds: Round[] = [];
        for (let i = 1; i <= settings.totalRounds; i++) {
          const playerResults: Record<string, RoundPlayerResult> = {};
          players.forEach((p) => {
            playerResults[p.id] = {
              playerId: p.id,
              bid: null,
              tricksWon: null,
              bonusPoints: 0,
              score: 0,
            };
          });

          initialRounds.push({
            roundNumber: i,
            startingPlayerId: players[(i - 1) % players.length].id,
            playerResults,
            trickEvents: [],
            isCompleted: false,
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
            createdAt: new Date().toISOString(),
          },
        });
      },

      updateBid: (roundIndex, playerId, bid) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r;
            const prev = r.playerResults[playerId];
            return {
              ...r,
              playerResults: {
                ...r.playerResults,
                [playerId]: { ...prev, bid },
              },
            };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      updateTricksWon: (roundIndex, playerId, tricksWon) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r;
            const prev = r.playerResults[playerId];
            return {
              ...r,
              playerResults: {
                ...r.playerResults,
                [playerId]: { ...prev, tricksWon },
              },
            };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      updateBonus: (roundIndex, playerId, bonusPoints) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r;
            const prev = r.playerResults[playerId];
            return {
              ...r,
              playerResults: {
                ...r.playerResults,
                [playerId]: { ...prev, bonusPoints },
              },
            };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      completeRound: (roundIndex) => {
        set((state) => {
          if (!state.game) return state;
          const settings = state.game.settings;
          const rounds = state.game.rounds.map((r, i) => {
            if (i !== roundIndex) return r;
            const playerResults: Record<string, RoundPlayerResult> = {};
            for (const pid of Object.keys(r.playerResults)) {
              const result = r.playerResults[pid];
              if (result.bid !== null && result.tricksWon !== null) {
                playerResults[pid] = {
                  ...result,
                  score: calculateRoundScore(
                    r.roundNumber,
                    result.bid,
                    result.tricksWon,
                    result.bonusPoints,
                    settings
                  ),
                };
              } else {
                playerResults[pid] = { ...result };
              }
            }
            return { ...r, playerResults, isCompleted: true };
          });
          return { game: { ...state.game, rounds } };
        });
      },

      goToNextRound: () => {
        set((state) => {
          if (!state.game) return state;
          if (state.game.currentRound < state.game.settings.totalRounds) {
            return { game: { ...state.game, currentRound: state.game.currentRound + 1 } };
          }
          return { game: { ...state.game, status: 'finished' } };
        });
      },

      editRound: (roundIndex) => {
        set((state) => {
          if (!state.game) return state;
          const rounds = state.game.rounds.map((r, i) =>
            i === roundIndex ? { ...r, isCompleted: false } : r
          );
          return {
            game: {
              ...state.game,
              rounds,
              currentRound: roundIndex + 1,
              status: 'playing',
            },
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
      },
    }),
    {
      name: 'skull-king-storage',
    }
  )
);

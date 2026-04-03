import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../store/gameStore';
import { validateRound } from '../domain/scoring';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, TrendingUp, Anchor, Skull, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export function RoundEntryScreen() {
  const {
    game,
    updateBid,
    updateTricksWon,
    updateBonus,
    completeRound,
    goToNextRound,
    editRound,
    endGame,
    resetGame,
  } = useGameStore(
    useShallow((s) => ({
      game: s.game,
      updateBid: s.updateBid,
      updateTricksWon: s.updateTricksWon,
      updateBonus: s.updateBonus,
      completeRound: s.completeRound,
      goToNextRound: s.goToNextRound,
      editRound: s.editRound,
      endGame: s.endGame,
      resetGame: s.resetGame,
    }))
  );

  const [activeTab, setActiveTab] = useState<'bids' | 'tricks'>('bids');
  const [deletePartidaOpen, setDeletePartidaOpen] = useState(false);

  if (!game) return null;

  const currentRoundIndex = game.currentRound - 1;
  const currentRound = game.rounds[currentRoundIndex];
  
  // Validation
  const validation = validateRound(currentRound.roundNumber, currentRound.playerResults, game.settings);
  
  const allBidsEntered = Object.values(currentRound.playerResults).every(r => r.bid !== null);
  const allTricksEntered = Object.values(currentRound.playerResults).every(r => r.tricksWon !== null);

  const handleCompleteRound = () => {
    if (!validation.isValid) {
      alert("Corrige los errores antes de continuar:\n" + validation.errors.join("\n"));
      return;
    }
    completeRound(currentRoundIndex);
    if (currentRoundIndex === game.settings.totalRounds - 1) {
      endGame();
    } else {
      goToNextRound();
      setActiveTab('bids');
    }
  };

  const isCompleted = currentRound.isCompleted;

  // Function to reorder players starting from the startingPlayer
  const startingPlayerIndex = game.players.findIndex(p => p.id === currentRound.startingPlayerId);
  const orderedPlayers = [
    ...game.players.slice(startingPlayerIndex),
    ...game.players.slice(0, startingPlayerIndex)
  ];

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Header */}
      <header className="shrink-0 bg-zinc-900 border-b border-zinc-800 p-4 pt-[max(1rem,env(safe-area-inset-top))] z-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className="text-amber-500 w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Ronda {currentRound.roundNumber}</h1>
              <p className="text-xs text-zinc-400">Total: {game.settings.totalRounds}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              data-testid="btn-delete-partida"
              onClick={() => setDeletePartidaOpen(true)}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg bg-red-950/80 border border-red-900/60 text-red-400 hover:bg-red-900/50 hover:text-red-300 flex items-center justify-center touch-manipulation"
              title="Eliminar partida"
              aria-label="Eliminar toda la partida"
            >
              <Trash2 className="w-5 h-5" strokeWidth={2.25} />
            </button>
            <button 
              type="button"
              onClick={() => {
                if (currentRoundIndex > 0) {
                  editRound(currentRoundIndex - 1);
                  setActiveTab('bids');
                }
              }}
              disabled={currentRoundIndex === 0}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30 touch-manipulation flex items-center justify-center"
              aria-label="Ronda anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={() => {
                if (currentRoundIndex < game.settings.totalRounds - 1 && game.rounds[currentRoundIndex].isCompleted) {
                  editRound(currentRoundIndex + 1);
                  setActiveTab('bids');
                }
              }}
              disabled={currentRoundIndex === game.settings.totalRounds - 1 || !currentRound.isCompleted}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30 touch-manipulation flex items-center justify-center"
              aria-label="Ronda siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        {!isCompleted && (
          <div className="max-w-3xl mx-auto flex mt-6 bg-zinc-950 rounded-xl p-1 border border-zinc-800">
            <button 
              onClick={() => setActiveTab('bids')}
              className={clsx(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                activeTab === 'bids' ? "bg-amber-600 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white"
              )}
            >
              Apuestas (Bids)
            </button>
            <button 
              onClick={() => setActiveTab('tricks')}
              disabled={!allBidsEntered}
              className={clsx(
                "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                activeTab === 'tricks' ? "bg-amber-600 text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-white",
                !allBidsEntered && "opacity-50 cursor-not-allowed"
              )}
            >
              Bazas (Tricks)
            </button>
          </div>
        )}
      </header>

      {/* Main: único scroll (evita scroll “duel” con body en iOS / Chrome móvil) */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {/* Solo cuando ya cargó todas las bazas: si falta algo, no mostrar (sigue completando) */}
          {!validation.isValid && activeTab === 'tricks' && allTricksEntered && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="text-red-500 w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm text-red-200">
                <ul className="list-disc pl-4 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isCompleted ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ronda Completada</h2>
              <p className="text-zinc-400 mb-6">Puntuaciones calculadas.</p>
              
              <div className="space-y-3 text-left">
                {orderedPlayers.map(p => {
                  const result = currentRound.playerResults[p.id];
                  return (
                    <div key={p.id} className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                      <span className="font-medium text-lg">{p.name}</span>
                      <div className="flex items-center gap-6 text-sm text-zinc-400">
                        <span>Bid: {result.bid}</span>
                        <span>Tricks: {result.tricksWon}</span>
                        <span className={clsx(
                          "font-bold text-lg",
                          result.score > 0 ? "text-emerald-400" : result.score < 0 ? "text-red-400" : "text-zinc-300"
                        )}>
                          {result.score > 0 ? '+' : ''}{result.score}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => editRound(currentRoundIndex)}
                className="mt-6 w-full py-3 border border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
              >
                Editar Ronda
              </button>
            </div>
          ) : (
            orderedPlayers.map((player, index) => {
              const result = currentRound.playerResults[player.id];
              const isStarting = index === 0;

              return (
                <div key={player.id} data-testid="player-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                  {isStarting && (
                    <div className="absolute top-0 right-0 bg-amber-600/20 text-amber-500 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      Líder
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {player.name}
                    </h3>
                  </div>

                  {activeTab === 'bids' ? (
                    <div className="flex items-center justify-between bg-zinc-950 p-2 rounded-xl border border-zinc-800 touch-manipulation">
                      <button 
                        onClick={() => updateBid(currentRoundIndex, player.id, Math.max(0, (result.bid || 0) - 1))}
                        className="w-16 h-16 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-3xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                      >-</button>
                      <div className="text-4xl font-bold font-mono text-amber-500 w-20 text-center">
                        {result.bid !== null ? result.bid : '-'}
                      </div>
                      <button 
                        onClick={() => updateBid(currentRoundIndex, player.id, Math.min(currentRound.roundNumber, (result.bid || 0) + 1))}
                        className="w-16 h-16 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-3xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                      >+</button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 flex items-center gap-2 text-lg"><Anchor className="w-5 h-5"/> Bazas ganadas</span>
                        <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-xl border border-zinc-800 touch-manipulation">
                          <button 
                            onClick={() => updateTricksWon(currentRoundIndex, player.id, Math.max(0, (result.tricksWon || 0) - 1))}
                            className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                          >-</button>
                          <div className="text-3xl font-bold font-mono w-12 text-center">
                            {result.tricksWon !== null ? result.tricksWon : '-'}
                          </div>
                          <button 
                            onClick={() => updateTricksWon(currentRoundIndex, player.id, Math.min(currentRound.roundNumber, (result.tricksWon || 0) + 1))}
                            className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                          >+</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-zinc-800">
                        <span className="text-zinc-400 flex items-center gap-2 text-lg"><TrendingUp className="w-5 h-5"/> Bonus pts.</span>
                        <div className="flex items-center gap-4 bg-zinc-950 p-2 rounded-xl border border-zinc-800 touch-manipulation">
                          <button 
                            onClick={() => updateBonus(currentRoundIndex, player.id, Math.max(0, result.bonusPoints - 10))}
                            className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                          >-</button>
                          <div className="text-2xl font-bold font-mono w-16 text-center text-emerald-400">
                            {result.bonusPoints}
                          </div>
                          <button 
                            onClick={() => updateBonus(currentRoundIndex, player.id, result.bonusPoints + 10)}
                            className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-2xl font-bold flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}

        </div>
      </main>

      {/* Sticky Footer */}
      {!isCompleted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-20">
          <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => endGame()}
              className="px-4 sm:px-6 py-4 min-h-[48px] rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors font-semibold touch-manipulation shrink-0"
            >
              Ver Tabla
            </button>
            {activeTab === 'bids' ? (
              <button 
                type="button"
                onClick={() => setActiveTab('tricks')}
                disabled={!allBidsEntered}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg py-4 min-h-[48px] rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:shadow-none touch-manipulation active:scale-[0.99]"
              >
                Avanzar a Bazas
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleCompleteRound}
                disabled={!allTricksEntered}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 min-h-[48px] rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.3)] disabled:opacity-50 disabled:shadow-none touch-manipulation active:scale-[0.99]"
              >
                {currentRoundIndex === game.settings.totalRounds - 1 ? 'Finalizar Partida' : 'Completar Ronda'}
              </button>
            )}
          </div>
        </div>
      )}

      {deletePartidaOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/90 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-partida-title"
          aria-describedby="delete-partida-desc"
          onClick={() => setDeletePartidaOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-zinc-900 border border-zinc-800 border-b-0 sm:border-b shadow-2xl p-6 sm:p-6 pt-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3 mb-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-red-950 flex items-center justify-center border border-red-800">
                <AlertTriangle className="w-6 h-6 text-red-400" aria-hidden />
              </div>
              <div>
                <h2 id="delete-partida-title" className="text-lg font-bold text-white leading-tight">
                  ¿Eliminar toda la partida?
                </h2>
                <p id="delete-partida-desc" className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Se borrará <strong className="text-zinc-200">por completo</strong> esta partida: todas las rondas,
                  puntuaciones y datos guardados en este dispositivo.{' '}
                  <span className="text-red-300/95">No podrás recuperarla.</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletePartidaOpen(false)}
                className="w-full sm:flex-1 py-3.5 min-h-[48px] rounded-xl border border-zinc-700 text-zinc-200 font-semibold touch-manipulation active:scale-[0.99]"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="btn-confirm-delete-partida"
                onClick={() => {
                  resetGame();
                  setDeletePartidaOpen(false);
                }}
                className="w-full sm:flex-1 py-3.5 min-h-[48px] rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold touch-manipulation active:scale-[0.99] shadow-[0_0_20px_rgba(220,38,38,0.25)]"
              >
                Sí, eliminar partida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

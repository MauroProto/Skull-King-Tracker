import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { validateRound } from '../domain/scoring';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, TrendingUp, Anchor, Skull, Gavel } from 'lucide-react';
import { TrickJudgeModal } from './TrickJudgeModal';
import clsx from 'clsx';

export function RoundEntryScreen() {
  const game = useGameStore(state => state.game);
  const updateBid = useGameStore(state => state.updateBid);
  const updateTricksWon = useGameStore(state => state.updateTricksWon);
  const updateBonus = useGameStore(state => state.updateBonus);
  const completeRound = useGameStore(state => state.completeRound);
  const goToNextRound = useGameStore(state => state.goToNextRound);
  const editRound = useGameStore(state => state.editRound);
  const endGame = useGameStore(state => state.endGame);

  const [activeTab, setActiveTab] = useState<'bids' | 'tricks'>('bids');
  const [isJudgeOpen, setIsJudgeOpen] = useState(false);

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-24">
      
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className="text-amber-500 w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Ronda {currentRound.roundNumber}</h1>
              <p className="text-xs text-zinc-400">Total: {game.settings.totalRounds}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (currentRoundIndex > 0) {
                  editRound(currentRoundIndex - 1);
                  setActiveTab('bids');
                }
              }}
              disabled={currentRoundIndex === 0}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if (currentRoundIndex < game.settings.totalRounds - 1 && game.rounds[currentRoundIndex].isCompleted) {
                  editRound(currentRoundIndex + 1);
                  setActiveTab('bids');
                }
              }}
              disabled={currentRoundIndex === game.settings.totalRounds - 1 || !currentRound.isCompleted}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-300 disabled:opacity-30"
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

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          
          {!validation.isValid && activeTab === 'tricks' && (
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
                <div key={player.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/90 backdrop-blur-md border-t border-zinc-800 z-20">
          <div className="max-w-3xl mx-auto flex gap-4">
            <button
              onClick={() => endGame()}
              className="px-6 py-4 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors font-semibold"
            >
              Ver Tabla
            </button>
            {activeTab === 'bids' ? (
              <button 
                onClick={() => setActiveTab('tricks')}
                disabled={!allBidsEntered}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:shadow-none"
              >
                Avanzar a Bazas
              </button>
            ) : (
              <button 
                onClick={handleCompleteRound}
                disabled={!allTricksEntered}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(5,150,105,0.3)] disabled:opacity-50 disabled:shadow-none"
              >
                {currentRoundIndex === game.settings.totalRounds - 1 ? 'Finalizar Partida' : 'Completar Ronda'}
              </button>
            )}
          </div>
        </div>
      )}

      <TrickJudgeModal isOpen={isJudgeOpen} onClose={() => setIsJudgeOpen(false)} />
    </div>
  );
}

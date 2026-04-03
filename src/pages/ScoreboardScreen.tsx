import { useGameStore } from '../store/gameStore';
import { Skull, Download, RotateCcw, Play, Trophy, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export function ScoreboardScreen() {
  const game = useGameStore(state => state.game);
  const resetGame = useGameStore(state => state.resetGame);
  const editRound = useGameStore(state => state.editRound);
  const resumeGame = useGameStore(state => state.resumeGame);

  if (!game) return null;

  // Determine if the game is fully finished (all rounds completed)
  const isGameFullyCompleted = game.rounds.every(r => r.isCompleted);

  // Calculate cumulative scores per player
  const playerTotals: Record<string, number> = {};
  game.players.forEach(p => playerTotals[p.id] = 0);

  const roundsData = game.rounds.map(round => {
    const roundScores: Record<string, { roundScore: number, cumulative: number, completed: boolean }> = {};
    
    game.players.forEach(p => {
      const result = round.playerResults[p.id];
      if (round.isCompleted) {
        playerTotals[p.id] += result.score;
        roundScores[p.id] = { roundScore: result.score, cumulative: playerTotals[p.id], completed: true };
      } else {
        roundScores[p.id] = { roundScore: 0, cumulative: playerTotals[p.id], completed: false };
      }
    });

    return {
      roundNumber: round.roundNumber,
      scores: roundScores,
      isCompleted: round.isCompleted
    };
  });

  const sortedPlayers = [...game.players].sort((a, b) => playerTotals[b.id] - playerTotals[a.id]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(game, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `skull-king-tracker-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 flex flex-col font-sans pb-[max(3rem,env(safe-area-inset-bottom))]">
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 pt-[max(1rem,env(safe-area-inset-top))] sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isGameFullyCompleted ? (
              <button 
                onClick={() => resumeGame()}
                className="p-2 -ml-2 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                title="Volver a la Partida"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            ) : (
              <Trophy className="text-amber-500 w-8 h-8" />
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Puntuaciones</h1>
              <p className="text-xs text-zinc-400">Skull King Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExport}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Exportar Partida"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                if (confirm('¿Estás seguro de que deseas salir y crear una nueva partida?')) {
                  resetGame();
                }
              }}
              className="p-2 rounded-lg bg-zinc-800 text-red-400 hover:text-red-300 transition-colors"
              title="Nueva Partida"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-4xl w-full mx-auto space-y-8">
        
        {/* Podio / Resumen */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-4 text-center text-zinc-400 uppercase tracking-widest">Clasificación Actual</h2>
          <div className="flex flex-col gap-3">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    index === 0 ? "bg-amber-500 text-zinc-950" : 
                    index === 1 ? "bg-zinc-300 text-zinc-950" : 
                    index === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"
                  )}>
                    {index + 1}
                  </div>
                  <span className="font-semibold text-lg">{player.name}</span>
                </div>
                <span className="text-2xl font-bold font-mono text-amber-500">{playerTotals[player.id]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Rondas */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-bold text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-4 whitespace-nowrap">Ronda</th>
                  {game.players.map(p => (
                    <th key={p.id} className="px-4 py-4 whitespace-nowrap text-center">{p.name}</th>
                  ))}
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {roundsData.map((rd, idx) => (
                  <tr key={rd.roundNumber} className={clsx(
                    "hover:bg-zinc-800/50 transition-colors",
                    !rd.isCompleted && "opacity-50"
                  )}>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      Ronda {rd.roundNumber}
                    </td>
                    {game.players.map(p => {
                      const scoreData = rd.scores[p.id];
                      return (
                        <td key={p.id} className="px-4 py-3 text-center whitespace-nowrap">
                          {rd.isCompleted ? (
                            <div className="flex flex-col items-center">
                              <span className={clsx(
                                "text-xs font-bold",
                                scoreData.roundScore > 0 ? "text-emerald-400" : scoreData.roundScore < 0 ? "text-red-400" : "text-zinc-500"
                              )}>
                                {scoreData.roundScore > 0 ? '+' : ''}{scoreData.roundScore}
                              </span>
                              <span className="text-sm font-mono text-white">{scoreData.cumulative}</span>
                            </div>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => editRound(idx)}
                        className="p-2 text-zinc-500 hover:text-amber-500 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

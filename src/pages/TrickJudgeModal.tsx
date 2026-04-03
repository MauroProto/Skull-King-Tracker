import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SpecialCard, CardPlayed } from '../domain/types';
import { resolveTrick } from '../domain/trickResolver';
import { X, Play, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CARD_TYPES: { type: SpecialCard | 'Suit' | 'Trump', label: string, color: string }[] = [
  { type: 'Pirate', label: 'Pirata', color: 'bg-red-600' },
  { type: 'Mermaid', label: 'Sirena', color: 'bg-teal-500' },
  { type: 'SkullKing', label: 'Skull King', color: 'bg-amber-600' },
  { type: 'Kraken', label: 'Kraken', color: 'bg-purple-600' },
  { type: 'WhiteWhale', label: 'Ballena Blanca', color: 'bg-zinc-200 text-zinc-900' },
  { type: 'Loot', label: 'Loot', color: 'bg-yellow-600' },
  { type: 'Escape', label: 'Escape', color: 'bg-zinc-700' },
  { type: 'Trump', label: 'Bandera Negra', color: 'bg-zinc-900 border border-zinc-700' },
  { type: 'Suit', label: 'Palo Normal', color: 'bg-blue-600' },
];

export function TrickJudgeModal({ isOpen, onClose }: Props) {
  const game = useGameStore(state => state.game);
  const [cardsPlayed, setCardsPlayed] = useState<CardPlayed[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  if (!isOpen || !game) return null;

  const handleAddCard = (type: SpecialCard | 'Suit' | 'Trump') => {
    if (!selectedPlayerId) {
      alert("Selecciona un jugador primero");
      return;
    }
    
    // Check if player already played
    if (cardsPlayed.some(c => c.playerId === selectedPlayerId)) {
      alert("Este jugador ya jugó una carta");
      return;
    }

    let value = undefined;
    let suit = undefined;

    if (type === 'Trump') {
      const val = prompt("Valor de la Bandera Negra (1-14):");
      value = parseInt(val || '0');
      if (isNaN(value) || value < 1 || value > 14) return;
      suit = 'JollyRoger';
    } else if (type === 'Suit') {
      const s = prompt("Palo (Loro, Tesoro, Mapa): \n1: Loro (Rojo)\n2: Tesoro (Amarillo)\n3: Mapa (Azul)");
      const val = prompt("Valor (1-14):");
      value = parseInt(val || '0');
      if (isNaN(value) || value < 1 || value > 14) return;
      suit = s === '1' ? 'Parrot' : s === '2' ? 'Treasure' : 'Map';
    }

    setCardsPlayed([...cardsPlayed, {
      playerId: selectedPlayerId,
      cardType: type,
      value,
      suit: suit as any
    }]);
    setSelectedPlayerId('');
  };

  const resolution = cardsPlayed.length > 0 ? resolveTrick(cardsPlayed, game.settings) : null;
  const winner = resolution?.winnerId ? game.players.find(p => p.id === resolution.winnerId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Play className="text-amber-500 w-5 h-5" /> Juez de Bazas
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">1. Seleccionar Jugador</h3>
            <div className="flex flex-wrap gap-2">
              {game.players.map(p => {
                const hasPlayed = cardsPlayed.some(c => c.playerId === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    disabled={hasPlayed}
                    className={clsx(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-colors border",
                      selectedPlayerId === p.id ? "bg-amber-600 text-zinc-950 border-amber-500" :
                      hasPlayed ? "bg-zinc-950 border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed" :
                      "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                    )}
                  >
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={clsx("transition-opacity", !selectedPlayerId && "opacity-50 pointer-events-none")}>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">2. Seleccionar Carta Jugada</h3>
            <div className="grid grid-cols-3 gap-2">
              {CARD_TYPES.map(ct => (
                <button
                  key={ct.type}
                  onClick={() => handleAddCard(ct.type)}
                  className={clsx(
                    "p-2 rounded-lg text-xs font-bold text-white shadow-sm flex items-center justify-center text-center h-12 transition-transform active:scale-95",
                    ct.color
                  )}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Cartas en la mesa (Orden)</h3>
              <button 
                onClick={() => setCardsPlayed([])}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Reiniciar
              </button>
            </div>
            
            {cardsPlayed.length === 0 ? (
              <div className="text-zinc-600 text-sm italic p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                Ninguna carta jugada aún
              </div>
            ) : (
              <div className="space-y-2">
                {cardsPlayed.map((c, i) => {
                  const player = game.players.find(p => p.id === c.playerId);
                  return (
                    <div key={i} className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                      <span className="font-medium text-sm text-amber-500">{i+1}. {player?.name}</span>
                      <span className="text-sm font-bold">
                        {CARD_TYPES.find(ct => ct.type === c.cardType)?.label} 
                        {c.value ? ` (${c.value})` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {resolution && cardsPlayed.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-900/50 p-4 rounded-xl mt-4">
              <h3 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider mb-2">Resultado</h3>
              {winner ? (
                <div className="text-lg font-bold text-white mb-1">Ganador: <span className="text-emerald-400">{winner.name}</span></div>
              ) : (
                <div className="text-lg font-bold text-purple-400 mb-1">Nadie gana (Kraken)</div>
              )}
              <div className="text-sm text-emerald-200 mb-2">{resolution.reason}</div>
              {resolution.bonusPoints > 0 && (
                <div className="text-sm font-bold text-amber-400 bg-amber-900/30 inline-block px-2 py-1 rounded">
                  Bonus: +{resolution.bonusPoints} pts
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

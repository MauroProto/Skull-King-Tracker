import { useState, useId } from 'react';
import { useGameStore } from '../store/gameStore';
import { useLocale } from '../i18n/LocaleContext';
import { Player, GameSettings, RulePreset } from '../domain/types';
import { v4 as uuidv4 } from 'uuid';
import { Skull, Plus, Trash2, Settings, Users, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export function SetupScreen() {
  const { t, locale, setLocale } = useLocale();
  const createNewGame = useGameStore((state) => state.createNewGame);
  const playerIdPrefix = useId().replace(/:/g, '');
  const [players, setPlayers] = useState<Player[]>(() => [
    { id: `${playerIdPrefix}-0`, name: '' },
    { id: `${playerIdPrefix}-1`, name: '' },
  ]);
  
  const [settings, setSettings] = useState<GameSettings>({
    rulePreset: 'Standard',
    useKraken: true,
    useWhiteWhale: true,
    useLoot: false,
    totalRounds: 10
  });

  const addPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, { id: uuidv4(), name: '' }]);
    }
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleStart = () => {
    // Validate players
    const validPlayers = players.filter(p => p.name.trim() !== '');
    if (validPlayers.length < 2) {
      alert(t('setup.needTwoPlayers'));
      return;
    }
    createNewGame(validPlayers, settings);
  };

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-hidden bg-zinc-950 text-zinc-100 flex flex-col p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] md:p-8 font-sans">
      <div className="max-w-2xl w-full min-w-0 mx-auto flex-1 flex flex-col gap-8">
        
        <header className="mt-8 mb-4 w-full min-w-0">
          <div className="flex justify-end gap-1 pr-[env(safe-area-inset-right)]">
            <button
              type="button"
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
              className="px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-400 border border-zinc-700 hover:border-amber-500/50 hover:text-amber-400 transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
              aria-label={locale === 'es' ? t('lang.switchAriaToEn') : t('lang.switchAriaToEs')}
            >
              {t('lang.switch')}
            </button>
          <label className="p-2 text-zinc-500 hover:text-amber-500 transition-colors cursor-pointer" title={t('setup.importTitle')}>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const importedGame = JSON.parse(ev.target?.result as string);
                      if (importedGame.id && importedGame.players) {
                        useGameStore.getState().importGame(importedGame);
                      } else {
                        alert(t('setup.importInvalid'));
                      }
                    } catch {
                      alert(t('setup.importReadError'));
                    }
                  };
                  reader.readAsText(file);
                }
              }} 
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </label>
          </div>
          <div className="text-center">
          <Skull className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Skull King
          </h1>
          <p className="text-zinc-400 uppercase tracking-widest text-sm">{t('setup.subtitle')}</p>
          </div>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <Users className="text-amber-500" />
            <h2 className="text-xl font-semibold">{t('setup.players')}</h2>
          </div>
          
          <div className="space-y-3 mb-6">
            {players.map((player, index) => (
              <div key={player.id} className="flex min-w-0 gap-3 items-center">
                <div
                  className="flex h-14 min-w-[2.75rem] shrink-0 rounded-xl border border-zinc-700/60 bg-zinc-800/90 items-center justify-center text-base font-semibold text-zinc-300 tabular-nums"
                  aria-hidden
                >
                  {index + 1}
                </div>
                <input 
                  type="text"
                  value={player.name}
                  onChange={(e) => updatePlayerName(player.id, e.target.value)}
                  placeholder={t('setup.playerPlaceholder', { n: index + 1 })}
                  className="min-h-14 min-w-0 flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-lg leading-tight focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors touch-manipulation"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button 
                  type="button"
                  onClick={() => removePlayer(player.id)}
                  disabled={players.length <= 2}
                  className="flex h-14 min-w-11 shrink-0 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-800 hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-500 transition-colors touch-manipulation"
                  aria-label={t('setup.removePlayer')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          {players.length < 8 && (
            <button 
              type="button"
              onClick={addPlayer}
              className="w-full py-3 border-2 border-dashed border-zinc-700 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t('setup.addPlayer')}</span>
            </button>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
            <Settings className="text-amber-500" />
            <h2 className="text-xl font-semibold">{t('setup.rulesTitle')}</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">{t('setup.rulePreset')}</label>
              <div className="grid min-w-0 grid-cols-3 gap-2">
                {(['Standard', 'Rascal', 'Custom'] as RulePreset[]).map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSettings({ ...settings, rulePreset: preset })}
                    className={clsx(
                      "min-w-0 py-2 px-2 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base",
                      settings.rulePreset === preset 
                        ? "bg-amber-600 text-zinc-950" 
                        : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                    )}
                  >
                    {t(`preset.${preset}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.useKraken}
                  onChange={(e) => setSettings({...settings, useKraken: e.target.checked})}
                  className="w-5 h-5 accent-amber-500 rounded bg-zinc-900 border-zinc-700"
                />
                <div className="flex-1">
                  <div className="font-semibold">{t('setup.expansionKrakenTitle')}</div>
                  <div className="text-xs text-zinc-500">{t('setup.krakenDesc')}</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.useWhiteWhale}
                  onChange={(e) => setSettings({...settings, useWhiteWhale: e.target.checked})}
                  className="w-5 h-5 accent-amber-500 rounded bg-zinc-900 border-zinc-700"
                />
                <div className="flex-1">
                  <div className="font-semibold">{t('setup.expansionWhaleTitle')}</div>
                  <div className="text-xs text-zinc-500">{t('setup.whaleDesc')}</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                <input 
                  type="checkbox" 
                  checked={settings.useLoot}
                  onChange={(e) => setSettings({...settings, useLoot: e.target.checked})}
                  className="w-5 h-5 accent-amber-500 rounded bg-zinc-900 border-zinc-700"
                />
                <div className="flex-1">
                  <div className="font-semibold">{t('setup.expansionLootTitle')}</div>
                  <div className="text-xs text-zinc-500">{t('setup.lootDesc')}</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">{t('setup.roundsLabel')}</label>
              <div className="relative">
                <select
                  value={settings.totalRounds}
                  onChange={(e) => setSettings({...settings, totalRounds: parseInt(e.target.value) || 10})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-amber-500 transition-colors touch-manipulation appearance-none"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 10 ? t('setup.roundsStandard') : t('setup.roundsSuffix')}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="button"
          data-testid="btn-zarpar"
          onClick={handleStart}
          className="mt-4 mb-12 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-lg py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
        >
          <span>{t('setup.zarpar')}</span>
          <ArrowRight className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
}

import { useGameStore } from './store/gameStore';
import { usePersistHydration } from './hooks/usePersistHydration';
import { useLocale } from './i18n/LocaleContext';
import { SetupScreen } from './pages/SetupScreen';
import { RoundEntryScreen } from './pages/RoundEntryScreen';
import { ScoreboardScreen } from './pages/ScoreboardScreen';

export default function App() {
  const hydrated = usePersistHydration();
  const game = useGameStore((state) => state.game);
  const { t } = useLocale();

  if (!hydrated) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-950 text-zinc-500 text-sm">
        {t('app.loading')}
      </div>
    );
  }

  if (!game) {
    return <SetupScreen />;
  }

  if (game.status === 'setup') {
    return <SetupScreen />;
  }

  if (game.status === 'finished') {
    return <ScoreboardScreen />;
  }

  return <RoundEntryScreen />;
}

import { useGameStore } from './store/gameStore';
import { SetupScreen } from './pages/SetupScreen';
import { RoundEntryScreen } from './pages/RoundEntryScreen';
import { ScoreboardScreen } from './pages/ScoreboardScreen';

export default function App() {
  const game = useGameStore(state => state.game);

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

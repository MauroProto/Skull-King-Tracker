import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

/** Evita parpadeo setup ↔ partida mientras localStorage rehidrata el store (móvil / recarga). */
export function usePersistHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated());

  useEffect(() => {
    if (useGameStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return useGameStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
  }, []);

  return hydrated;
}

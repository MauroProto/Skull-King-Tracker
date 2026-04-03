import type { Page } from '@playwright/test';

export const STORAGE_KEY = 'skull-king-storage';

export async function waitForAppReady(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expectSkullKingApp(page);
  await page.getByText('Cargando').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
}

async function expectSkullKingApp(page: Page) {
  await page.waitForFunction(() => document.title.includes('Skull King'), null, {
    timeout: 15_000,
  });
}

export async function expectSetupVisible(page: Page) {
  await page.getByTestId('btn-zarpar').waitFor({ state: 'visible' });
}

export async function fillSetupAndStart(page: Page, playerNames: [string, string]) {
  await waitForAppReady(page);
  await expectSetupVisible(page);
  await page.getByPlaceholder('Jugador 1').fill(playerNames[0]);
  await page.getByPlaceholder('Jugador 2').fill(playerNames[1]);
  await page.getByTestId('btn-zarpar').click();
  await page.getByRole('heading', { name: /Ronda 1/ }).waitFor({ state: 'visible', timeout: 15_000 });
}

export async function readPersistedGame(page: Page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { state?: { game?: unknown } };
      return parsed.state?.game ?? null;
    } catch {
      return null;
    }
  }, STORAGE_KEY);
}

export async function assertPersistedGameShape(page: Page) {
  const game = await readPersistedGame(page);
  if (!game || typeof game !== 'object') {
    throw new Error('Se esperaba una partida en localStorage (persistencia zustand)');
  }
  const g = game as { players?: unknown[]; rounds?: unknown[] };
  if (!Array.isArray(g.players) || g.players.length < 2) {
    throw new Error('Partida persistida inválida: jugadores');
  }
  if (!Array.isArray(g.rounds) || g.rounds.length === 0) {
    throw new Error('Partida persistida inválida: rondas');
  }
}

/**
 * Ronda 1, 2 jugadores: bids 1 y 1; bazas 1 y 0 (suma = 1 carta en ronda 1).
 */
export async function completeRound1TwoPlayers(page: Page) {
  const cards = page.getByTestId('player-card');

  await cards.nth(0).getByRole('button', { name: '+' }).first().click();
  await cards.nth(1).getByRole('button', { name: '+' }).first().click();
  await page.getByRole('button', { name: 'Avanzar a Bazas' }).click();

  await cards.nth(0).getByRole('button', { name: '+' }).first().click();
  await cards.nth(1).getByRole('button', { name: '-' }).first().click();

  await page.getByRole('button', { name: 'Completar Ronda' }).click();
}

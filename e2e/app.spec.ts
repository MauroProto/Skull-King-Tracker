import { test, expect } from '@playwright/test';
import {
  fillSetupAndStart,
  assertPersistedGameShape,
  readPersistedGame,
  completeRound1TwoPlayers,
  waitForAppReady,
  STORAGE_KEY,
} from './helpers';

test.describe('Skull King Tracker — E2E + persistencia', () => {
  test('setup → Zarpar → ronda 1; localStorage contiene la partida', async ({ page }) => {
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await assertPersistedGameShape(page);
    const g = (await readPersistedGame(page)) as { currentRound: number; players: { name: string }[] };
    expect(g.currentRound).toBe(1);
    expect(g.players.map((p) => p.name)).toEqual(['E2E_A', 'E2E_B']);
  });

  test('recarga de página: sigue la misma partida (como reabrir la app)', async ({ page }) => {
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await assertPersistedGameShape(page);
    await page.reload();
    await page.getByText('Cargando').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await expect(page.getByRole('heading', { name: /Ronda 1/ })).toBeVisible();
    await assertPersistedGameShape(page);
  });

  test('nuevo contexto con el mismo storage: misma partida (simula otro tab o reabrir navegador)', async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await fillSetupAndStart(page, ['Persist_A', 'Persist_B']);
    await assertPersistedGameShape(page);

    const storage = await context.storageState();
    await context.close();

    const context2 = await browser.newContext({ baseURL, storageState: storage });
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByText('Cargando').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await expect(page2.getByRole('heading', { name: /Ronda 1/ })).toBeVisible();
    const g = (await readPersistedGame(page2)) as { players: { name: string }[] };
    expect(g.players.map((p) => p.name)).toEqual(['Persist_A', 'Persist_B']);
    await context2.close();
  });

  test('completar ronda 1 (bids + bazas) → aparece ronda 2; datos persistidos', async ({ page }) => {
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await completeRound1TwoPlayers(page);
    await expect(page.getByRole('heading', { name: /Ronda 2/ })).toBeVisible();
    await assertPersistedGameShape(page);
    const g = (await readPersistedGame(page)) as { currentRound: number };
    expect(g.currentRound).toBe(2);
  });

  test('Ver Tabla → puntuaciones; recarga mantiene la vista', async ({ page }) => {
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await page.getByRole('button', { name: 'Ver Tabla' }).click();
    await expect(page.getByRole('heading', { name: /Puntuaciones/ })).toBeVisible();
    await page.reload();
    await page.getByText('Cargando').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
    await expect(page.getByRole('heading', { name: /Puntuaciones/ })).toBeVisible();
  });

  test('eliminar partida: confirma y vuelve al setup; game null en storage', async ({ page }) => {
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await page.getByTestId('btn-delete-partida').click();
    await page.getByTestId('btn-confirm-delete-partida').click();
    await expect(page.getByTestId('btn-zarpar')).toBeVisible();
    const parsed = await page.evaluate((k) => {
      const raw = localStorage.getItem(k);
      if (!raw) return null;
      return JSON.parse(raw) as { state?: { game?: unknown } };
    }, STORAGE_KEY);
    expect(parsed?.state?.game).toBeNull();
  });

  test('no hay errores de consola en flujo básico', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(String(err)));
    await fillSetupAndStart(page, ['E2E_A', 'E2E_B']);
    await page.reload();
    await waitForAppReady(page);
    await expect(page.getByRole('heading', { name: /Ronda 1/ })).toBeVisible();
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});

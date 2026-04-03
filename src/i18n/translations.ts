export type Locale = 'es' | 'en';

export const LOCALE_STORAGE_KEY = 'skull-king-locale';

/** Claves planas; interpolación con {clave} en el string */
export const translations: Record<Locale, Record<string, string>> = {
  es: {
    'app.loading': 'Cargando…',
    'lang.switch': 'EN',
    'lang.switchAriaToEn': 'Cambiar idioma a inglés',
    'lang.switchAriaToEs': 'Cambiar idioma a español',

    'setup.importTitle': 'Importar partida JSON',
    'setup.importInvalid': 'Archivo JSON inválido.',
    'setup.importReadError': 'Error al leer el archivo JSON.',
    'setup.needTwoPlayers': 'Se necesitan al menos 2 jugadores.',
    'setup.subtitle': 'Tracker',
    'setup.players': 'Jugadores',
    'setup.playerPlaceholder': 'Jugador {n}',
    'setup.removePlayer': 'Eliminar jugador',
    'setup.addPlayer': 'Agregar Jugador',
    'setup.rulesTitle': 'Reglas y Expansiones',
    'setup.rulePreset': 'Preset de Reglas',
    'setup.expansionKrakenTitle': 'Kraken',
    'setup.expansionWhaleTitle': 'Ballena Blanca',
    'setup.expansionLootTitle': 'Loot (Botín)',
    'setup.krakenDesc': 'Destruye la baza',
    'setup.whaleDesc': 'Anula cartas especiales',
    'setup.lootDesc': 'Alianzas y escape',
    'setup.roundsLabel': 'Cantidad de Rondas',
    'setup.roundsStandard': '(Estándar)',
    'setup.roundsSuffix': 'Rondas',
    'setup.zarpar': 'Zarpar',

    'preset.Standard': 'Standard',
    'preset.Rascal': 'Rascal',
    'preset.Custom': 'Custom',

    'round.title': 'Ronda {n}',
    'round.total': 'Total: {n}',
    'round.deleteTitle': 'Eliminar partida',
    'round.deleteAria': 'Eliminar toda la partida',
    'round.prevRound': 'Ronda anterior',
    'round.nextRound': 'Ronda siguiente',
    'round.tabBids': 'Apuestas',
    'round.tabTricks': 'Bazas',
    'round.roundDone': 'Ronda completada',
    'round.scoresCalculated': 'Puntuaciones calculadas.',
    'round.bid': 'Apuesta',
    'round.tricks': 'Bazas',
    'round.editRound': 'Editar ronda',
    'round.leader': 'Líder',
    'round.tricksWon': 'Bazas ganadas',
    'round.bonus': 'Bonus pts.',
    'round.viewTable': 'Ver tabla',
    'round.goTricks': 'Avanzar a bazas',
    'round.completeRound': 'Completar ronda',
    'round.finishGame': 'Finalizar partida',
    'round.fixErrors': 'Corrige los errores antes de continuar:\n',

    'round.deleteTitleModal': '¿Eliminar toda la partida?',
    'round.deleteBody':
      'Se borrará por completo esta partida: todas las rondas, puntuaciones y datos guardados en este dispositivo.',
    'round.deleteWarn': 'No podrás recuperarla.',
    'round.cancel': 'Cancelar',
    'round.deleteConfirm': 'Sí, eliminar partida',

    'validation.missing_bid': 'Falta la apuesta de algún jugador (o es inválida).',
    'validation.missing_tricks': 'Falta cuántas bazas ganó cada jugador (o el valor es inválido).',
    'validation.total_exceeds':
      'En la ronda {round} solo hay {round} baza(s) en total: sumaste {total}. Revisá las bazas ganadas.',
    'validation.total_must_equal':
      'Con Kraken desactivado, la suma de bazas ganadas debe ser exactamente {round} (ahora suma {total}).',

    'score.title': 'Puntuaciones',
    'score.subtitle': 'Skull King Tracker',
    'score.back': 'Volver a la partida',
    'score.export': 'Exportar partida',
    'score.newGame': 'Nueva partida',
    'score.confirmNew': '¿Estás seguro de que deseas salir y crear una nueva partida?',
    'score.standings': 'Clasificación actual',
    'score.tableRound': 'Ronda',
    'score.tableRoundRow': 'Ronda {n}',
  },
  en: {
    'app.loading': 'Loading…',
    'lang.switch': 'ES',
    'lang.switchAriaToEn': 'Switch language to English',
    'lang.switchAriaToEs': 'Switch language to Spanish',

    'setup.importTitle': 'Import game JSON',
    'setup.importInvalid': 'Invalid JSON file.',
    'setup.importReadError': 'Could not read the JSON file.',
    'setup.needTwoPlayers': 'At least 2 players are required.',
    'setup.subtitle': 'Tracker',
    'setup.players': 'Players',
    'setup.playerPlaceholder': 'Player {n}',
    'setup.removePlayer': 'Remove player',
    'setup.addPlayer': 'Add player',
    'setup.rulesTitle': 'Rules & expansions',
    'setup.rulePreset': 'Rules preset',
    'setup.expansionKrakenTitle': 'Kraken',
    'setup.expansionWhaleTitle': 'White Whale',
    'setup.expansionLootTitle': 'Loot',
    'setup.krakenDesc': 'Destroys the trick',
    'setup.whaleDesc': 'Nullifies special cards',
    'setup.lootDesc': 'Alliances & escape',
    'setup.roundsLabel': 'Number of rounds',
    'setup.roundsStandard': '(Standard)',
    'setup.roundsSuffix': 'rounds',
    'setup.zarpar': 'Set sail',

    'preset.Standard': 'Standard',
    'preset.Rascal': 'Rascal',
    'preset.Custom': 'Custom',

    'round.title': 'Round {n}',
    'round.total': 'Total: {n}',
    'round.deleteTitle': 'Delete game',
    'round.deleteAria': 'Delete entire game',
    'round.prevRound': 'Previous round',
    'round.nextRound': 'Next round',
    'round.tabBids': 'Bids',
    'round.tabTricks': 'Tricks',
    'round.roundDone': 'Round complete',
    'round.scoresCalculated': 'Scores calculated.',
    'round.bid': 'Bid',
    'round.tricks': 'Tricks',
    'round.editRound': 'Edit round',
    'round.leader': 'Leader',
    'round.tricksWon': 'Tricks won',
    'round.bonus': 'Bonus pts.',
    'round.viewTable': 'Score table',
    'round.goTricks': 'Go to tricks',
    'round.completeRound': 'Complete round',
    'round.finishGame': 'End game',
    'round.fixErrors': 'Fix the errors before continuing:\n',

    'round.deleteTitleModal': 'Delete entire game?',
    'round.deleteBody':
      'This will permanently delete this game: all rounds, scores, and data stored on this device.',
    'round.deleteWarn': 'You won’t be able to recover it.',
    'round.cancel': 'Cancel',
    'round.deleteConfirm': 'Yes, delete game',

    'validation.missing_bid': 'Some player is missing a bid (or it’s invalid).',
    'validation.missing_tricks': 'Enter tricks won for every player (or the value is invalid).',
    'validation.total_exceeds':
      'Round {round} only has {round} trick(s) total: you entered {total}. Check tricks won.',
    'validation.total_must_equal':
      'With Kraken off, tricks won must add up to exactly {round} (currently {total}).',

    'score.title': 'Scores',
    'score.subtitle': 'Skull King Tracker',
    'score.back': 'Back to game',
    'score.export': 'Export game',
    'score.newGame': 'New game',
    'score.confirmNew': 'Leave and start a new game?',
    'score.standings': 'Standings',
    'score.tableRound': 'Round',
    'score.tableRoundRow': 'Round {n}',
  },
};

export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}

# Skull King Tracker

Skull King Tracker es una aplicación web premium diseñada para llevar el registro de partidas del juego de cartas **Skull King**. Creada con un enfoque *mobile-first*, permite a los jugadores registrar apuestas (bids), bazas ganadas (tricks), calcular bonificaciones y resolver situaciones complejas con su "Juez de Bazas".

## 🚀 Características (Features)

- **Setup de Partida Rápido:** Añade jugadores (2-8), configura expansiones (Kraken, Ballena Blanca, Botín) y establece la cantidad de rondas (estándar 10).
- **Registro Rápido de Rondas:** Interfaz táctil de alto contraste diseñada para usarse en la mesa, reduciendo errores y tiempos de anotación.
- **Puntuación Automática:** Motor de puntuación robusto que calcula puntos base y bonificaciones según si la apuesta fue exacta o no.
- **Juez de Bazas (Trick Resolver):** Módulo especial que permite simular una baza compleja (ej. Sirena vs Skull King vs Pirata vs Kraken) y determina quién gana, aplicando las bonificaciones correspondientes.
- **Validaciones en Tiempo Real:** El sistema avisa si la cantidad de bazas ganadas no coincide con las posibles en la ronda.
- **Estado Persistente (Auto-save):** No pierdas tu partida. El progreso se guarda automáticamente en el navegador.
- **Exportación e Importación:** Guarda el registro completo de tu partida en JSON y expórtalo para guardar un histórico, o reanúdalo en otro dispositivo.
- **Modo Oscuro Elegante:** Diseño maduro con acentos dorados y oscuros, ideal para ambientes con poca luz.

## 📜 Reglas Soportadas y Edge Cases Contemplados

El **Motor de Reglas** (Rules Engine) está programado siguiendo el estándar de Skull King, contemplando:

- **Bids y Puntuación:** +20 pts por baza si aciertas, -10 pts por baza de diferencia si fallas. Bids de 0 dan +/- 10 pts por el número de ronda.
- **Bonificaciones (Bonuses):** Solo se aplican si la apuesta (bid) fue exacta.
- **Jerarquía de Cartas:**
  - *Skull King* vence a *Piratas* (y captura +30 pts por cada uno).
  - *Sirena* vence a *Skull King* (y captura +50 pts), pero pierde ante *Piratas*.
  - En un choque múltiple, el orden de jugada y las reglas de captura se respetan (ej. si la Sirena y el Skull King están presentes, la Sirena siempre gana la baza).
- **Expansiones:**
  - **Kraken:** Destruye la baza. Nadie gana y el siguiente líder es quien *habría* ganado si no estuviese el Kraken.
  - **Ballena Blanca:** Convierte temporalmente a todas las cartas especiales (Piratas, Sirenas, etc.) en Escapes de valor 0.
  - **Interacción Kraken vs Ballena Blanca:** Si ambas se juegan en la misma baza, la segunda criatura en ser jugada mantiene su poder, y la primera actúa como un Escape.

## 🏗 Decisiones de Arquitectura

- **Capa de Dominio Pura (`src/domain/`):** La lógica del juego (`scoring.ts`, `trickResolver.ts`) se mantiene completamente agnóstica de la interfaz. Son funciones puras evaluadas con **Vitest**.
- **Capa de Estado (`src/store/gameStore.ts`):** Utiliza **Zustand** para mantener el estado global de manera inmutable y eficiente, combinado con `persist` para usar LocalStorage.
- **Capa UI (`src/pages/`):** Construida con **React** y **Tailwind CSS**. No se utiliza un enrutador pesado (`react-router`) ya que la aplicación sigue un flujo lineal natural (Setup -> Ronda a Ronda -> Resultados), manejado eficientemente mediante renderizado condicional.
- **Tecnologías:** React 18, TypeScript, Vite, Zustand, Tailwind CSS v3, Lucide React (Iconos).

## 🛠 Cómo Correr la Aplicación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```
2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
3. **Ejecutar Tests:**
   ```bash
   npm run test
   ```
4. **Construir para Producción:**
   ```bash
   npm run build
   ```

## 🧩 Cómo Extender las Reglas

Si deseas implementar *House Rules* o nuevas expansiones:

1. **Nuevas Cartas:** Añade el tipo de carta en `src/domain/types.ts` (`SpecialCard`).
2. **Jerarquía:** Actualiza la lógica de resolución en `src/domain/trickResolver.ts` dentro de la función `resolveTrick`.
3. **Puntuación:** Modifica `src/domain/scoring.ts` si las puntuaciones base o los requisitos de bonificación varían (ej. dar bonus aunque el bid falle, habilitando un flag en `GameSettings`).
4. **Interfaz del Juez:** Agrega el botón correspondiente en el array `CARD_TYPES` dentro de `src/pages/TrickJudgeModal.tsx`.

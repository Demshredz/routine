# Issues, Risiken und Technical Debt

## 1. ~~Lokales Datenlimit killt Historie~~ (BEHOBEN)
- **Beschreibung:** `pruneData()` löschte Historie nach 90 Tagen. Jetzt auf 365 Tage gestellt, um User-Frust zu verhindern.
- **Lösung:** Cutoff verlängert.

## 2. ~~Inkonsistente Theme-Nutzung~~ (BEHOBEN)
- **Beschreibung:** Aus verstreuten `darkTheme`/`lightTheme` Objekten wurde ein zentraler `useAppTheme` Hook gebaut.
- **Lösung:** Zentralisiert in `hooks/use-app-theme.ts`.

## 3. Fake Health Sync UX
- **Beschreibung:** Apple Health und Google Fit können in `explore.tsx` via Toggle "verbunden" werden. Der Status wird aber nicht persistiert (Lokaler `useState`). Beim nächsten Tab-Wechsel / Reload ist der Sync optisch wieder "aus".
- **Auswirkung:** Middle. Führt zu Verwirrung.
- **Lösung:** Wenigstens die Persistenz in den Zustand-Store ziehen oder Feature als "Coming Soon" markieren.

## 4. ~~Zeitzonen-Problematik für Streaks~~ (BEHOBEN)
- **Beschreibung:** Wenn der User "gestern" nicht in der App war und bei einem neuen Login das Datum gecheckt wird, brach der Streak nicht immer sauber. 
- **Lösung:** `checkStreak` wurde erweitert (`diffFromToday > 1 && todayCompletions === 0 => newStreak = 0`).

## 5. Fehlende In-App-Purchase Validation
- **Beschreibung:** Bezahlen drückt nur `setIsPro(true)` im Paywall-Modal. Jeder User, der den Code modifiziert oder Backups einspielt, kann das System komplett cracken.
- **Auswirkung:** High (Business Risk).
- **Lösung:** RevenueCat oder ähnliches einbauen, Server-Receipt-Validation.

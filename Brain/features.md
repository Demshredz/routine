# Features Inventur

## 1. Routinen Tracking (Kern)
- **Status:** Fertig (Lokal)
- **Zweck:** User können Habits abhaken und wieder ent-haken. Bei der Erstellung stehen nun Uhrzeit, Icons (Lucide), Farben und Wiederholungen (Daily, Weekdays, Weekends) zur Verfügung (Phase B). Tracker reagiert mit Haptik und visuellen Changes. 
- **Betroffene Dateien:** `index.tsx`, `RoutineCard.tsx`, `TimelineCard.tsx`, `useRoutineStore.ts`, `IconPicker.tsx`, `ColorPicker.tsx`
- **Abhängigkeiten:** Zustand `completions` Objekt.
- **Probleme:** Keine Backup-Strategie, falls App gelöscht wird.

## 1b. Timeline View (NEU Phase A & D)
- **Status:** Fertig (Lokal)
- **Zweck:** Visueller Tagesablauf im Structured-Stil mit Uhrzeitachse. Toggle zwischen List- und Timeline-Mode. Im normalen "Alle"-Tab der List-View kann via **Drag & Drop** (Long Press) die Reihenfolge der Cards verschoben werden.
- **Betroffene Dateien:** `TimelineView.tsx`, `index.tsx`
- **Abhängigkeiten:** `react-native-draggable-flatlist`. 

## 1c. Interaktiver Kalender (NEU Phase C)
- **Status:** Fertig (Lokal)
- **Zweck:** Monatsübersicht als Tab. Zeigt Activity-Dots an Tagen, an denen Routinen erledigt wurden. Klick auf einen Tag wechselt auf diesen Tag in der `TimelineView`.
- **Betroffene Dateien:** `calendar.tsx`, `MonthlyCalendar.tsx`, `_layout.tsx`

## 1d. Push Notifications (NEU)
- **Status:** Fertig (Lokal)
- **Zweck:** Echte `expo-notifications` für Routinen, die mit einer festen Uhrzeit erstellt werden. Bei Erstellung wird ein täglicher lokaler Trigger geplant. Bei Löschung wird dieser Alert gecanceled.
- **Betroffene Dateien:** `utils/notifications.ts`, `_layout.tsx`, `index.tsx`
- **Abhängigkeiten:** `expo-notifications`, `expo-device`. Registrierungs-Logik im Boot-Prozess `_layout.tsx`.

## 1e. AI Coach Generator (NEU Phase E)
- **Status:** Fertig (OpenAI API)
- **Zweck:** Dynamische Generierung von Routine-Protokollen durch Eingabe von User-Problemen (z.B. "Schlechter Schlaf"). Ruft über `gpt-4o-mini` valides JSON ab (inklusive Icons, Farben und Zeiten) und injiziert die Ergebnisse in die bestehende Timeline samt Notification-Schedule.
- **Betroffene Dateien:** `ai-coach.tsx`, `utils/openai.ts`
- **Abhängigkeiten:** Echter API Key in lokaler `.env` (EXPO_PUBLIC_OPENAI_API_KEY). Context (existierende Gewohnheiten) wird mitgesendet um Duplikate zu vermeiden.

## 1e. Gamification, Leveling & Analytics (Phase F, G, H)
- **Status:** Fertig
- **Zweck:** Maximaler Dopamin-Erhalt durch RPG-Elemente und UX Polish. Jede erledigte Routine bringt `+10 EXP`. Bei Erreichen eines neuen Levels friert der Screen ein und triggert eine Level-Up Animation. Abhaken passiert via "Apple Native" Right-Swipe mit belohnendem Pop-Sound (`expo-av`). 
- **Analytics:** Der "Statistiken"-Tab korreliert jetzt die Abends abgefragte Stimmung (1-5) mit der Erledigungsrate und zeigt dem User an: *"An Tagen mit >80% Rate, bist du im Schnitt bei 4.2 / 5 Punkten"*.

## 2. Morgen / Abend / Supplement Tags
- **Status:** Fertig
- **Zweck:** Kategorisierung für einfache Übersicht (Tabs) und sortiertes Ausgeben je nach Tageszeit.
- **Betroffene Dateien:** `index.tsx` (Sorting Logic basiert auf `currentHour`).

## 3. Supplement Dosage Tracker
- **Status:** Teilweise.
- **Zweck:** User können Dosis-Angaben mitspeichern (z.B. 300mg).
- **Probleme:** "Wir senden dir einen Reminder..." im UI ist ein Mockup. Es gibt keine echte Push-Notification-Integration beim Setzen von Supplements.

## 4. Audio-Routinen (Meditations)
- **Status:** Mock / Unvollständig
- **Zweck:** Routinen, die das Wort "Atem" oder "Meditation" beinhalten, erhalten einen ausklappbaren Musik/Audio-Player. 
- **Betroffene Dateien:** `RoutineCard.tsx`
- **Probleme:** Der Player ist nur optischer Natur, keine echten Audio-Files, kein echtes Tracking von Hör-Dauer.

## 5. Zen-Garten / Gamification
- **Status:** Fertig (Front-End Local)
- **Zweck:** Visueller Baum wächst basierend auf `streak`.
- **Betroffene Dateien:** `explore.tsx`, `useRoutineStore.ts`

## 6. Performance Insights & Heatmap
- **Status:** Fertig (Local)
- **Zweck:** Zeigt die Ticks der letzten 90 Tage an. 
- **Probleme:** 90-Tage Limitierung in `pruneData` könnte bedeuten, dass Heatmap nach geraumer Zeit stagniert und ältere Daten unwiderruflich weg sind.

## 7. AI Coach
- **Status:** Mockup
- **Zweck:** Generiert Protokol basierend auf User Input.
- **Betroffene Dateien:** `ai-coach.tsx`
- **Probleme:** Purer Timeout Mock ($setTimeout$ 2500ms).

## 8. Custom Themes
- **Status:** Fertig
- **Zweck:** Premium Feature, stellt Akzentfarbe um.
- **Betroffene Dateien:** `discover.tsx` für Pick, Globales Übergeben von `s.themeColor` an alle Screens und an React Navigation Theme.

## 9. Social Community Leaderboard
- **Status:** Mockup
- **Zweck:** Freunde hinzufügen und "Nudges" schicken.
- **Betroffene Dateien:** `community.tsx`.
- **Probleme:** Harcoded Friend Array. "Nudge" ist nur ein lokaler Alert.

## 10. Apple Health / Google Fit Sync
- **Status:** Fake
- **Zweck:** Schalter in UI, lösen momentan nur Haptik aus. Keine echten API Calls zu HealthKit oder Google Fit vorhanden.

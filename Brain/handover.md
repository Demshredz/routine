# Routine App - Handover

## Was ist das Projekt?
"Routine" ist eine als Premium-App konzeptionierte Habit-Tracker & Selbstoptimierungs-App (React Native / Expo). Der Fokus liegt auf eleganten Mikro-Interaktionen (Moti-Animationen, Haptik, Konfetti), Gamification ("Zen-Garten", Leaderboard) und Personalisierung (Custom Themes, AI Coach).

## Aktueller Gesamtstatus
Das Projekt ist im **Prototyp/MVP-Stadium**, mit starken, voll nutzbaren Frontend-Flows, aber vollständig simulierter Backend-Anbindung und Mock-Daten in Teilbereichen. State Management läuft rein lokal (Zustand + AsyncStorage). Die App ist lauffähig und sieht "Premium" aus (Dark/Light Mode Support).

## Was funktioniert bereits?
- **Routinen-Verwaltung:** Anlegen von Gewohnheiten inkl. Typ (Morgen, Nachmittag, Abend, Supplement) & Dosis. Speichern als lokaler Zustand. 
- **Tracking & Streak:** Abhaken der Täglichen Aufgaben, Konfetti-Belohnung bei 100%, tägliche Streak-Berechnung.
- **Insights:** Skia-animierter Progress Ring, 90-Tage Heatmap & "Zen-Garten" basierend auf Streak-Anzahl.
- **Navigation & UI:** Reibungsloser File-based Routing (Expo Router) durch Tabs (Home, Explore, Discover, Community) und Fullscreen-Screens (Paywall, AI Coach).

## Was ist unklar, kritisch oder fragil?
- **Sync & Backup:** Es gibt kein Backend. Health-Syncs (Apple Health, Google Fit) und AI-Generierung existieren nur visuell / als Timeout-Mocks.
- **Speicher-Management:** Zustand speichert alle historischen Ticks lokal ab – eine `pruneData` Funktion löscht alles über 90 Tage, was User u.U. frustrieren könnte, wenn sie Langzeitdaten einsehen wollen.
- **Zeitzonen / Datumsgrenzen:** Die Streak-Berechnung nutzt reine Strings `yyyy-MM-dd`. Bei Zeitzonenwechseln oder Reaktivierung der App am Rand des Tages kann dies zu unerwarteten Streak-Abbrüchen führen.
- **React Hook Order in RoutineCard:** Die `Swipeable` & `MotiView` Logic der `RoutineCard` sieht stabil aus, ist aber bei vielen List-Items eine Performance-Bremse. 

## Wichtigste bekannte Baustellen
- **Community Feature:** Reine Mock-Daten ohne echte Freunde-Logik.
- **AI Coach:** Mock, keine echte GPT/LLM API angebunden.
- **Monetarisierung / Paywall:** Paywall ist ein reines Frontend-Mockup (`setIsPro(true)`). Echte In-App-Purchases (RevenueCat) fehlen.

## Was man als nächstes wissen muss
- Jegliche States hängen von `store/useRoutineStore.ts` ab. Dies ist das Herzstück der App.
- Haptik (`expo-haptics`) ist omnipräsent bei Interaktionen. Das darf nicht verloren gehen.
- Die UI ist eng mit Moti für Layout-Animationen verzahnt.

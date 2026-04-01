# Technische Architektur

## Projektstruktur
- Expo (React Native) Version 54+ (New Architecture enabled).
- **Routing:** Expo Router V6 (`app/` Verzeichnis).
- **Styling:** React Native StyleSheet gepaart mit dynamischen Theme-Objekten (light/dark Mode).
- **Icons & Animationen:** Lucide React Native, `Moti` (Reanimated 3 basierend), React Native Skia.
- **Global Store:** Zustand (`store/useRoutineStore.ts`) + AsyncStorage Persistenz.

## Routing / Navigation
- `app/_layout.tsx`: Root Layout beinhaltet globalen ThemeProvider, BottomSheetModalProvider und GestureHandlerRootView. Stack-Routing für Modals (Paywall, AI Coach).
- `app/(tabs)/_layout.tsx`: Untere Tab-Leiste (`index`, `explore`, `discover`, `community`). Platform-spezifisches Blur-Styling (iOS). Haptic-Tab Integration.

## Screen-Struktur
1. **`index.tsx` (Home):** Zentriert um eine `Animated.FlatList`. List-Header rendert Greeting, Streak, Mood Tracker, Section-Tabs. FAB (Floating Action Button) öffnet ein Gorhom BottomSheet zum Hinzufügen.
2. **`explore.tsx` (Insights):** ScrollView. Nutzt React Native Skia für den radialen Progress Ring. Reanimated SharedValues für das Füllen des Rings. Verschachtelte Maps für das Grid der Heatmap.
3. **`discover.tsx`:** Statische Listen von Expert-Routines und Themes.
4. **`community.tsx`:** Hardcoded Leaderboard, primär ScrollView mit Listen.
5. **Modals:** `ai-coach.tsx` und `paywall.tsx` sind Screens, die über `<Stack.Screen options={{ presentation: 'fullScreenModal' }}>` gemounted werden.

## Komponenten-Architektur
Ausgeprägte Trennung zwischen Screens und Heavy-Duty Components.
- **`RoutineCard.tsx` & `TimelineCard.tsx`:** Hochoptimierte List-Komponenten (`React.memo`). Nutzen `Swipeable` aus RN-Gesture-Handler für Deletion und Completion (Right/Left Swipe). Besitzt einen ausklappbaren (Moti) Audio-Player-Mock.
- **`TimelineView.tsx`:** Verarbeitet `hours` dynamisch und rechnet sie in `px` (HOUR_HEIGHT) um.
- Zustandskomponenten in `Explore` wg. Skia Performance (`ProgressRing`, `HeatmapChart` sind via `React.memo` entkoppelt).

## State Management (`useRoutineStore.ts`)
Store Name: `routine-storage-v7`
Der komplette lokale State der App.
Nodes:
- `routines`: Array von Objekten.
- `completions`: Record mit Date-String Key (z.B. `2026-03-31`) zu Array von Routine-IDs.
- `moods`: Record Date-Key zu Number (1-5).
- `streak` / `lastCompletedDate`: Number/String für Gamification.
- Config: `themeColor`, `isPro`, `trialStartDate`.

## 8. Gamification & Progression (Phase G & H)
- **EXP & Levels:** Der `useRoutineStore` trackt `exp` und `level`. Pro Erledigung 10 EXP. Level skaliert mit `Math.floor(exp / 100) + 1`. 
- **Sound Design:** `expo-av` puffert einen hochwertigen Pop-Sound global in `_layout.tsx` und triggert ihn bei jeder Gewohnheits-Erledigung, was das haptische Feedback massiv verstärkt.
- **Swipe-Gestures:** RoutineCards und TimelineCards nutzen `Swipeable` (`react-native-gesture-handler`) für Apple-Native "Swipe-to-Complete" Interaktionen.

## 9. Push Notifications (`utils/notifications.ts`)
Wir nutzen `expo-notifications`, um **lokale** Daily-Trigger zu simulieren. Füllt der User bei einer Routine eine `time` aus, wird ein lokaler Alarm gespeichert und das `notificationId` abgelegt, um es bei Löschung sauber stoppen zu können. Ein externes Server-Backend wird dafür nicht benötigt.

## 9. AI Coach Engine (`utils/openai.ts`)
Frontend-direkte Kommunikation mit der **OpenAI API** (`gpt-4o-mini`), geschützt hinter einem lokalen `EXPO_PUBLIC_OPENAI_API_KEY`.
- **System Prompt:** Garantiert einen reinen JSON-Output, der exakt auf das `Routine` Typensystem der App abgestimmt ist.
- **Kontext-Awareness:** Die bestehenden Gewohnheiten des Users aus der Zustandsebene (`useRoutineStore.ts`) werden bei jeder Abfrage injected, um Duplikate zu vermeiden.
- **UX:** Resultierende JSON-Routinen-Protokolle werden in `ai-coach.tsx` visualisiert (inklusive dynamischer Icons und Farben) und können mit einem Klick alle als neue Routinen samt lokalen Push-Notifications in die Timeline integriert werden. Ein `hasHydrated` Check in `_layout.tsx` verhindert Flicker beim Rendern während AsyncStorage lädt.

## 10. Insight Analytics (Phase F)
Die UX der App verlässt sich auf On-The-Fly-Berechnung: Wir speichern keine statischen "Punkte" für Historie, sondern leiten KI-Korrelationen wie "Mood vs. Erledigungsrate" direkt im Render-Tree von `explore.tsx` über `useMemo` in Echtzeit aus den Rohdaten ab. Das hält das Datenbank-Schema (`completions`, `moods`) winzig und flexibel für jede künftige Analyse-Idee. `pruneData` im Store kappt Daten > 365 (früher 90) Tage ab, um den AsyncStorage Heap nicht endlos anwachsen zu lassen.

## 11. Security Architektur & bekannte Corner Cases (Self-Audit)
- **API Key Exposure:** Der OpenAI Token in `EXPO_PUBLIC_OPENAI_API_KEY` wird beim Build in die JS-Kompilierung eingebettet. Das ist in Dev "ok", aber ein klares Security-Risiko für den App Store Release.
- **Background Fetch fehlend:** Lokale Notifications (`expo-notifications`) müssen bei einem Hard-Reboot des Phones via `expo-task-manager` neu registriert werden. Das fehlt aktuell.
- **ScrollView Pan-Collision:** `react-native-draggable-flatlist` (DFL) kollidiert mit der `ScrollView` der Timeline, weswegen das manuelle Reordering aktuell bewusst auf den "List-View" (die reine DFL) beschränkt ist. 
- **Timezone Safety:** Die Streak-Logik und Datums-Filter (`todayKey`) verlassen sich auf `date-fns` im Format `yyyy-MM-dd` basierend auf der lokalen Phone-Zeitzone. Bei langen Flügen über Zeitzonen kann dies aktuell zu Lücken im Streak führen.

## Kritische Abhängigkeiten
- `@shopify/react-native-skia`: Native Module. Muss bei Expo über Prebuild oder Dev-Client kompiliert werden, bricht oft Web-Builds, wenn nicht speziell gehandhabt.
- `moti` und `react-native-reanimated` V4: Animationsantrieb. Bei Downgrades/Upgrades regressionsanfällig. 
- `@gorhom/bottom-sheet`: Braucht Gesture-Handler im Layout Root.

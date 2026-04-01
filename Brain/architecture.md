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
- **`RoutineCard.tsx`:** Hochoptimierte List-Komponente (`React.memo`). Nutzt `Swipeable` aus RN-Gesture-Handler für Deletion. Besitzt einen ausklappbaren (Moti) Audio-Player-Mock für Meditations-Flows.
- **`ui/icon-symbol.tsx`:** Standard SF-Symbols/MaterialIcons Wrapper von Expo.
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

## 8. Push Notifications (`utils/notifications.ts`)
Wir nutzen `expo-notifications`, um **lokale** Daily-Trigger zu simulieren. Füllt der User bei einer Routine eine `time` aus, wird ein lokaler Alarm gespeichert und das `notificationId` abgelegt, um es bei Löschung sauber stoppen zu können. Ein externes Server-Backend wird dafür nicht benötigt.

## 9. AI Coach Engine (`utils/openai.ts`)
Frontend-direkte Kommunikation mit der **OpenAI API** (`gpt-4o-mini`), geschützt hinter einem lokalen `EXPO_PUBLIC_OPENAI_API_KEY`.
- **System Prompt:** Garantiert einen reinen JSON-Output, der exakt auf das `Routine` Typensystem der App abgestimmt ist.
- **Kontext-Awareness:** Die bestehenden Gewohnheiten des Users aus der Zustandsebene (`useRoutineStore.ts`) werden bei jeder Abfrage injected, um Duplikate zu vermeiden.
- **UX:** Resultierende JSON-Routinen-Protokolle werden in `ai-coach.tsx` visualisiert (inklusive dynamischer Icons und Farben) und können mit einem Klick alle als neue Routinen samt lokalen Push-Notifications in die Timeline integriert werden. Ein `hasHydrated` Check in `_layout.tsx` verhindert Flicker beim Rendern während AsyncStorage lädt.
- `pruneData` im Store kappt Daten > 90 Tage ab, um den AsyncStorage Heap nicht endlos anwachsen zu lassen.

## Kritische Abhängigkeiten
- `@shopify/react-native-skia`: Native Module. Muss bei Expo über Prebuild oder Dev-Client kompiliert werden, bricht oft Web-Builds, wenn nicht speziell gehandhabt.
- `moti` und `react-native-reanimated` V4: Animationsantrieb. Bei Downgrades/Upgrades regressionsanfällig. 
- `@gorhom/bottom-sheet`: Braucht Gesture-Handler im Layout Root.

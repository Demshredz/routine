# Projekt-Patterns und Konventionen

## Code-Patterns
- **Functional Components:** Alles rein funktional plus Hooks.
- **Zustand Selectors:** Variablen aus dem Store werden konsequent so ausgelesen: `const foo = useRoutineStore(s => s.foo)` anstatt gesamte State-Objekte zu ziehen (zur Vermeidung unnötiger Rerenders).
- **Date Handling:** Ausschließlich string serialisierte Datums-Keys (`yyyy-MM-dd`) für Dictionaries via `date-fns`.
- **React.memo:** Intensiver Einsatz bei Listen-Elementen (`RoutineCard`) und Skia-Canvas (`ProgressRing`), damit Render-Performanz im Scroll erhalten bleibt.

## UI-Patterns
- **Theme-Objekte via Hook:** Die App nutzt den eigenen Hook `const { isDark, theme, themeColor } = useAppTheme();`, um ein zentralisiertes Theme-Objekt `{ background, card, text, tint, mute, ringBg }` an die Screens zu geben. Keine manuellen `lightTheme` Konstanten mehr in den Screens.
- **Moti für State-Transitions:** Anstelle von nativem `Animated` wird `MotiView` mit `from`/`animate` Props verwendet.
- **Haptics überall:** `Haptics.impactAsync` bei Tabs, Toggles, Buttons. `Haptics.notificationAsync` bei Danger-Aktionen (Papierkorb) oder Success.
- **Lucide Icons:** Jeder Screen nutzt `@lucide-react-native` für durchgängige Ikonografie in Outline-Stil.

## Architektur-Patterns
- **File-Based Routing:** `expo-router` als Single Source of Truth für Navigation.
- **Safe Area Management:** Native SafeAreaView aus `react-native-safe-area-context` auf Screen-Level, oft versehen mit konkreten Edges (z.B. `edges={['top']}`).
- **Local First Data:** Die App rechnet alles asynchron in Speicher, AsyncStorage lädt beim Cold Boot. Es gibt keinen Fetch-Overhead während der typischen Laufzeit.

## Was vermieden werden soll
- Keine inline-Styles ohne zwingenden Grund, außer für Animations-Werte.
- Keine Props Drilling – alles was Theme oder Kern-Data braucht, greift direkt in `useRoutineStore`.
- React Navigation `useState` Params. Route-Params werden nur simpel genutzt, komplexer State geht über Zustand.

## Baustellen bei den Patterns (Inkonsistenzen)
- `Colors` aus `constants/theme.ts` wird kaum genutzt. Stattdessen haben Screens wie `index.tsx`, `community.tsx`, `explore.tsx` ihre eigenen hart codierten `lightTheme` und `darkTheme` Objekte. Das unterläuft das eigene Design-System.

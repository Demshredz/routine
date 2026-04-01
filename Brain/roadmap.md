# Entwicklungs-Roadmap

## 1. Sofort wichtig (Quick Wins & Bugfixes)
- `[ ]` **Health Sync State:** Zustände der Schalter `appleHealthEnabled` persistieren, um UI-Glitches zu vermeiden, auch wenn es aktuell nur Mocks sind.
- `[ ]` **OpenAI Key Security (Self-Audit Folge-Task):** Der `EXPO_PUBLIC_OPENAI_API_KEY` ist im Frontend-Bundle ungeschützt. Er MUSS vor dem Store-Release in einen kleinen Backend-Proxy (z.B. Vercel Edge Function oder Supabase Edge Function) ausgelagert werden.
- `[ ]` **Background Notification Refreeze (Self-Audit Folge-Task):** Die `expo-notifications` werden aktuell nur beim App-Start `_layout.tsx` registriert. Bei einem Hard-Reboot des Smartphones feuern sie nicht mehr, bevor der User die App öffnet. Hierfür muss `expo-task-manager` oder Hintergrund-Sync verwendet werden.

## 2. Nächste Schritte (Feature Integration)
- `[ ]` **Supabase / Backend Build (Erhöhte Prio):** Lokalen Store durch einen Cloud-Ansatz absichern. Durch die RPG-Aspekte (EXP, Lvl, Streak) ist ein Datenverlust jetzt viel kritischer. Sign-Up Screen einführen.
- `[ ]` **Echte RevenueCat Integration:** Paywall in funktionierendes IAP verwandeln.
- `[x]` **Notifications Engine implementieren:** Supplement-Reminders mithilfe von `expo-notifications` aus dem Mockup-Zustand erlöschen.
- `[x]` **Leveling & Gamification:** Apple Native Swipe-Gesten und Audio Pop implementieren, um Motivation zu steigern.

## 3. Technische Schulden reduzieren
- `[ ]` **Audio-Player Logik abstrahieren:** Audio-Player aus `RoutineCard` auslagern oder mit Expo-AV hinterlegen, statt reiner "Waveform-UI" für Meditationen.
- `[ ]` **i18n komplettieren:** Es gibt einen Mix aus `t('insights')` und hardcoded Strings wie `"Dein Zen-Garten"`. Hier muss alles sauber in die Übersetzungs-Keys wandern.
- `[ ]` **Timeline Drag'n'Drop (Self-Audit Folge-Task):** DFL wurde wegen Problemen mit der Timeline (`ScrollView`) nur auf den List-Tab limitiert. Hier muss eine robustere Custom-Drag Lösung via `react-native-reanimated` folgen.

## 4. Spätere Erweiterungen / Wachstum
- `[x]` **AI Backend API Integration:** OpenAI / Claude anbinden, sodass der Prompt auf `/ai-coach` tatsächlich nutzbare JSON-Strukturen zurückspielt.
- `[ ]` **Community Backend realisieren:** Social-Features live nehmen (Friend-Requests, Push Notification Nudge).
- `[ ]` **iOS & Android Home Widgets:** Entwickeln der App-Widgets via Expo Plugins, um den Daily Stack direkt vom Homescreen abhakbar zu machen.

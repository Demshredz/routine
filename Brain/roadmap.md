# Entwicklungs-Roadmap

## 1. Sofort wichtig (Quick Wins & Bugfixes)
- **Health Sync State:** Zustände der Schalter `appleHealthEnabled` persistieren, um UI-Glitches zu vermeiden, auch wenn es aktuell nur Mocks sind.

## 2. Nächste Schritte (Feature Integration)
- **Supabase / Backend Build:** Lokalen Store durch einen Cloud-Ansatz ergänzen. Sign-Up Screen einführen.
- **Echte RevenueCat Integration:** Paywall in funktionierendes IAP verwandeln.
- **Notifications Engine implementieren:** Supplement-Reminders mithilfe von `expo-notifications` aus dem Mockup-Zustand erlöschen.

## 3. Technische Schulden reduzieren
- **Audio-Player Logik abstrahieren:** Audio-Player aus `RoutineCard` auslagern oder mit Expo-AV hinterlegen, statt reiner "Waveform-UI".
- **i18n komplettieren:** Es gibt einen Mix aus `t('insights')` und hardcoded Strings wie `"Dein Zen-Garten"`. Hier muss alles sauber in die Übersetzungs-Keys wandern.

## 4. Spätere Erweiterungen / Wachstum
- **AI Backend API Integration:** OpenAI / Claude anbinden, sodass der Prompt auf `/ai-coach` tatsächlich nutzbare JSON-Strukturen zurückspielt.
- **Community Backend realisieren:** Social-Features live nehmen (Friend-Requests, Push Notification Nudge).
- **iOS & Android Home Widgets:** Entwickeln der App-Widgets via Expo Plugins, um den Daily Stack direkt vom Homescreen abhakbar zu machen.

# Produkt- und Business-Kontext

## Produktvision
Routine ist mehr als nur eine Checklisten-App. Es ist ein "Life OS", das auf Produktivität, Health-Optimization (Huberman, Sleep Foundation) und ein Premium-Feeling setzt. Die App soll den Nutzer durch positive Psychologie, Ästhetik und Gamification (Zen-Garten) täglich an sich binden.

## Zielgruppe
- **Biohacker & Self-Improvement-Enthusiasten:** Nutzer, die Supplements, "Deep Sleep", und "Digital Detox" tracken.
- **Young Professionals:** Die Struktur in den Tag bringen wollen.
- **Design-affine User:** Die sich von hässlichen Standard-Trackern abwenden und eine App wollen, die sich wie ein modernes Apple-Tool anfühlt.

## Kernnutzen
- Zentrale Übersicht über alle positiven Gewohnheiten inkl. Einnahme von "Supplements" (Sonderbehandlung in UI).
- Motivation durch den visuellen Ausbau eines "Zen-Gartens" und der 90-Tage Heatmap.
- Inspiration durch Vorlagen "Expert Protokolle" und künftigen AI Coach.

## Hauptprobleme, die die App löst
- Mangelnde Konsistenz beim Aufbau von Routinen.
- Fehlende Motivation auf lange Sicht.
- Die Fragmentierung zwischen Habit-Trackern, Supplement-Managern und Mood-Trackern (alles in einer App vereint).

## Wichtige User Flows
1. **Daily Check-In:** App öffnen (Home), Begrüßung nach Tageszeit, Mood eintragen, offene Routinen durch-checken, Streak und Garten überprüfen.
2. **Onboarding / Inspiration:** Discover-Tab nutzen, "Huberman Morning" Protokoll importieren, Theme personalisieren.
3. **Paywall-Experience:** Bei Klick auf AI / Premium Themes -> Modal Paywall -> Lifetime Access Unlock.

## Bereits getroffene Produktentscheidungen
- **Lokal-First Ansatz (aktuell):** Um Geschwindigkeit hoch zu halten und Boot-Performance in `< 500ms` zu drücken (Zustand + AsyncStorage).
- **Sub-Typen für Habits:** Klare Trennung in 'morning', 'afternoon', 'evening' und explizit 'supplement'.
- **Gamification als Core-Mechanik:** Der Zen-Garten und Konfetti sind keine reinen Gimmicks, sondern zentrale Retention-Loops.

## Bereiche, die absichtlich so bleiben sollen
- Die ästhetische, minimalistische Ausrichtung im UI (viel Whitespace, Dark Mode).
- Die konsequente akustisch/haptische Rückmeldung bei **jeder** erfolgreichen User-Aktion.

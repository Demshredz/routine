import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, differenceInCalendarDays, parseISO } from 'date-fns';

export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'supplement';

export type RecurrenceType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export interface RecurrenceConfig {
  type: RecurrenceType;
  days?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (for 'custom')
}

export interface Routine {
  id: string;
  title: string;
  type: RoutineType;
  time?: string;          // Start time, e.g. '08:00'
  endTime?: string;       // End time, e.g. '08:30'
  duration?: number;      // Duration in minutes
  dosage?: string;
  icon?: string;          // Lucide icon name
  color?: string;         // Custom accent color per routine
  recurrence?: RecurrenceConfig;
  notificationId?: string; // ID for cancelling scheduled push notifications
}

export interface CompletionRecord {
  [dateKey: string]: string[]; // date string (YYYY-MM-DD) -> active routine ids
}

interface RoutineState {
  routines: Routine[];
  completions: CompletionRecord;
  selectedDate: string;
  streak: number;
  lastCompletedDate: string | null;
  // V7: Analytics & Data
  moods: Record<string, number>; // dateKey -> Skala 1-5 (oder 1-10)

  // Premium & Monetization
  isPro: boolean;
  trialStartDate: number;
  themeColor: string; // Neu: Custom Themes
  showConfetti: boolean;
  
  // Boot Performance
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  pruneData: () => void;
  setIsPro: (pro: boolean) => void;
  resetTrial: () => void;
  setThemeColor: (color: string) => void;
  setSelectedDate: (dateKey: string) => void;
  setMood: (dateKey: string, score: number) => void;
  addRoutine: (routine: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<Omit<Routine, 'id'>>) => void;
  removeRoutine: (id: string) => void;
  reorderRoutines: (routineIds: string[]) => void;
  toggleCompletion: (id: string, dateKey: string) => void;
  resetConfetti: () => void;
  checkStreak: () => void;
}

const getTodayKey = () => format(new Date(), 'yyyy-MM-dd');

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: [
        { id: '1', title: 'Vitamine nehmen', type: 'morning', time: '07:00', duration: 5, icon: 'Pill', color: '#10B981' },
        { id: '2', title: 'Kurz dehnen (5 Min)', type: 'morning', time: '07:30', endTime: '07:35', duration: 5, icon: 'Activity', color: '#F59E0B' },
        { id: '3', title: 'Magnesium', type: 'evening', time: '21:00', duration: 5, icon: 'Pill', color: '#8B5CF6', dosage: '300mg' },
      ],
      completions: {},
      selectedDate: new Date().toISOString().split('T')[0],
      streak: 0,
      lastCompletedDate: null,
      moods: {},
      showConfetti: false,
      hasHydrated: false,
      
      isPro: false,
      trialStartDate: Date.now(),
      themeColor: '#4F46E5', // Default Indigo

      setHasHydrated: (state) => set({ hasHydrated: state }),
      setIsPro: (pro) => set({ isPro: pro }),
      resetTrial: () => set({ trialStartDate: Date.now() }),
      setThemeColor: (color) => set({ themeColor: color }),
      setSelectedDate: (dateKey) => set({ selectedDate: dateKey }),
      setMood: (dateKey, score) => set((state) => ({ moods: { ...state.moods, [dateKey]: score } })),

      pruneData: () => {
        set((state) => {
          const cutOffDate = new Date();
          cutOffDate.setDate(cutOffDate.getDate() - 365); // Erhöht auf 365 Tage für Langzeitstatistiken

          const prunedCompletions: Record<string, string[]> = {};
          Object.keys(state.completions).forEach((dateKey) => {
            if (new Date(dateKey) >= cutOffDate) {
              prunedCompletions[dateKey] = state.completions[dateKey];
            }
          });

          const prunedMoods: Record<string, number> = {};
          Object.keys(state.moods).forEach((dateKey) => {
            if (new Date(dateKey) >= cutOffDate) {
              prunedMoods[dateKey] = state.moods[dateKey];
            }
          });

          return { completions: prunedCompletions, moods: prunedMoods };
        });
      },

      addRoutine: (routineData) => {
        set((state) => ({
          routines: [...state.routines, { ...routineData, id: Date.now().toString() }],
        }));
      },

      updateRoutine: (id, updates) => {
        set((state) => ({
          routines: state.routines.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },

      removeRoutine: (id) => {
        set((state) => ({
          routines: state.routines.filter((r) => r.id !== id),
        }));
      },

      reorderRoutines: (routineIds) => {
        set((state) => {
          const routineMap = new Map(state.routines.map(r => [r.id, r]));
          const reordered = routineIds
            .map(id => routineMap.get(id))
            .filter(Boolean) as Routine[];
          return { routines: reordered };
        });
      },

      toggleCompletion: (id, dateKey) => {
        set((state) => {
          const currentCompletions = state.completions[dateKey] || [];
          const isCompleted = currentCompletions.includes(id);
          
          let newCompletions = [];
          if (isCompleted) {
            newCompletions = currentCompletions.filter((rId) => rId !== id);
          } else {
            newCompletions = [...currentCompletions, id];
          }

          const newState = {
            completions: {
              ...state.completions,
              [dateKey]: newCompletions,
            },
          };

          // Confetti Logic: Check if all routines are completed today
          const totalRoutines = state.routines.length;
          if (totalRoutines > 0 && newCompletions.length === totalRoutines && !isCompleted) {
            return { ...newState, showConfetti: true };
          }

          return newState;
        });
        get().checkStreak();
      },

      resetConfetti: () => set({ showConfetti: false }),

      checkStreak: () => {
        const { completions } = get();
        const todayKey = getTodayKey();
        const todayCompletions = completions[todayKey] || [];
        
        set((state) => {
          let newStreak = state.streak;
          let newLastCompleted = state.lastCompletedDate;

          if (state.lastCompletedDate) {
            const diffFromToday = differenceInCalendarDays(
              parseISO(todayKey),
              parseISO(state.lastCompletedDate)
            );
            // Streak sofort visuell brechen, wenn gestern nichts gemacht wurde
            if (diffFromToday > 1 && todayCompletions.length === 0) {
              newStreak = 0;
            }
          }

          if (todayCompletions.length > 0) {
             if (state.lastCompletedDate !== todayKey) {
               // Wenn das letzte Mal vor gestern war, reset
               if (state.lastCompletedDate) {
                 const diff = differenceInCalendarDays(
                   parseISO(todayKey), 
                   parseISO(state.lastCompletedDate)
                 );
                 if (diff > 1) {
                   newStreak = 1; // Streak wurde gebrochen, starte neu
                 } else if (diff === 1) {
                   // Gestern was gemacht -> Bei streak === 0 aber gestern gemacht (sollte nie passieren, aber fallback)
                   // Oder normaler Inkrement. Um doppel-Inkremente zu vermeiden: diff == 1.
                   // Beachte: Da wir diffFromToday checken, ist die Basis sicher.
                   // Wenn wir gestern schon 0 hatten, dann war der diff 1 aber der Streak war vllt gebrochen worden,
                   // warten... Wenn diff === 1 ist lastCompletedDate = gestern. Dann war newStreak bisher korrekt.
                   newStreak = (state.streak === 0 && diff === 1) ? 2 : state.streak + 1; // Sicherstellen, dass Tag 1 + Heute = 2
                 }
               } else {
                 newStreak = 1; // Erster Tag
               }
               newLastCompleted = todayKey;
             }
          }

          return { streak: newStreak, lastCompletedDate: newLastCompleted };
        });
      },
    }),
    {
      name: 'routine-storage-v7',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        if (state) {
          state.checkStreak();
          state.pruneData(); // Clean up memory automatically on app boot
        }
      },
    }
  )
);

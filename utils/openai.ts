import { Routine } from '@/store/useRoutineStore';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface GeneratedProtocol {
  title: string;
  routines: Array<{
    title: string;
    type: 'morning' | 'afternoon' | 'evening' | 'supplement';
    time?: string;
    dosage?: string;
    icon?: string;
    color?: string;
  }>;
}

const SYSTEM_PROMPT = `
Du bist ein Weltklasse-Performance-, Habit- und Gesundheits-Coach (ähnlich wie Andrew Huberman oder James Clear).
Der User nennt dir ein konkretes Problem oder ein Ziel (z.B. "Ich wache immer müde auf" oder "Ich brauche extremen Fokus für meine Arbeit").

Deine Aufgabe ist es, ein hochwirksames, exaktes "Protokoll" aus 3 bis 5 konkreten Routinen oder Supplements zu generieren, 
basierend auf modernsten wissenschaftlichen Erkenntnissen (z.B. Circadianer Rhythmus, Dopamin-Management).

WICHTIGE REGELN:
1. Antworte AUSSCHLIESSLICH mit valider, strukturierter JSON-Syntax (ohne Markdown, nur reines JSON). 
2. Das Format MUSS exakt dieses Interface erfüllen:
{
  "title": "Kurzer, starker Titel deines Protokolls",
  "routines": [
    {
      "title": "Präziser Action-Step (z.B. 'Sonnenlicht auf die Augen')",
      "type": "morning", // "morning", "afternoon", "evening" oder "supplement"
      "time": "08:00", // (Optional) Format HH:MM 
      "dosage": "10 min", // (Optional) Nur für supplements oder genaue Dauer
      "icon": "Sun", // (Optional) Ein exakter, valider "lucide-react-native" Icon Name z.B. Sun, Droplets, Activity, Moon, Battery, Brain, Pill, Coffee, Bed
      "color": "#10B981" // (Optional) Ein gut zum Icon passender Hex Code, verwende Premium Dark/Flat Colors (z.B. #10B981, #3B82F6, #F59E0B, #8B5CF6, #EC4899)
    }
  ]
}
3. Beziehe wenn nötig den Kontext der "Bestehenden Gewohnheiten" des Users in deine Logik ein (z.B. verändere die Zeit oder schlage nicht exakt das gleiche vor).
`;

export async function generateRoutineProtocol(prompt: string, currentRoutines: Routine[]): Promise<GeneratedProtocol | null> {
  if (!OPENAI_API_KEY) {
    console.error('Missing EXPO_PUBLIC_OPENAI_API_KEY');
    return null;
  }

  const userContext = currentRoutines.length > 0
    ? `Hier sind die bestehenden Gewohnheiten des Users. Beachte sie in deinem Plan:\n${currentRoutines.map(r => `- ${r.title} (${r.type || ''} ${r.time || ''})`).join('\n')}\n\n`
    : 'Der User hat bisher keine Gewohnheiten in der App.\n\n';

  const userMessage = `${userContext}Das Ziel/Problem des Users ist: "${prompt}"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const contentString = data.choices[0].message.content;
    const protocol: GeneratedProtocol = JSON.parse(contentString);
    
    return protocol;
  } catch (error) {
    console.error('Failed to generate protocol via OpenAI:', error);
    return null;
  }
}

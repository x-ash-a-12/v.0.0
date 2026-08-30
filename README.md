hallo

# Chatbot-Prototyp Tourist-Info Ruhpolding

Vorläufiger, klickbarer Prototyp für die Bachelorarbeit "AI-Based Chatbots as a
New Touchpoint in Tourism". Der Prototyp simuliert einen touristischen
Auskunfts-Chatbot für Ruhpolding, ganz ohne Backend.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Base-UI-Variante,
Style `base-nova`).

## Start

```bash
npm run dev        # Entwicklungsserver auf http://localhost:5173
npm run build      # Produktionsbuild nach dist/
npm run typecheck  # tsc ohne Emit
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/lib/chat-flow.ts` | Vordefinierter Gesprächsbaum: Knoten, Info-Karten, Themen und die Stichwort-Erkennung für Freitext |
| `src/hooks/use-chat.ts` | Gesprächslogik: Nachrichten-State, Tippsimulation, Abbruch laufender Antworten |
| `src/components/chat/` | UI-Bausteine: Kopfzeile, Nachrichten, Schnellantworten, Tippanzeige, Eingabe |
| `src/components/device-preview.tsx` | Rahmen zum Umschalten zwischen Mobil, Tablet, Desktop und Service-Terminal |

## Interaktion ohne Backend

Es gibt keine Authentifizierung, keine gespeicherten Verläufe und keine echte
Wissensdatenbank. Die Interaktivität entsteht über zwei Wege:

1. **Schnellantworten**: Jede Bot-Nachricht bietet Buttons, die zum nächsten
   Knoten im Baum führen.
2. **Freitext**: Eine Eingabe wird über Stichwortmuster (`matchIntent`) einem
   Knoten zugeordnet. Ohne Treffer antwortet der Bot mit einem Hinweis und der
   Themenauswahl.

Themen: Wandern und Bergbahnen, Veranstaltungen, Anreise und Parken, Wetter,
Essen, Angebote für Familien, Winter und Langlauf, Übernachten, Kontakt zur
Tourist-Information.

## Responsivität

Das Chat-Layout nutzt Container-Queries (`@container`), nicht die
Viewport-Breakpoints. Dadurch passt es sich auch innerhalb der verkleinerten
Geräterahmen der Vorschau korrekt an. Getestet von 320 px bis zu großen
Terminal-Auflösungen, ohne horizontales Scrollen und ohne aus den Containern
laufende Texte.

Alle Inhalte sind fiktiv oder nur zu Demonstrationszwecken angegeben.

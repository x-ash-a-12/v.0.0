# Chatbot-Prototyp Tourist-Info Ruhpolding

Vorläufiger, klickbarer Prototyp für die Bachelorarbeit "AI-Based Chatbots as a
New Touchpoint in Tourism". Der Prototyp simuliert einen touristischen
Auskunfts-Chatbot für Ruhpolding, ganz ohne Backend.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Base-UI-Variante,
Style `base-nova`).

## Aufbau

| Pfad                                | Inhalt                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/lib/chat-flow.ts`              | Vordefinierter Gesprächsbaum: Knoten, Info-Karten, Themen und die Ziele für Rückfragen             |
| `src/lib/verstehen.ts`              | Zuordnung freier Eingaben: Meta-Fragen, Wegführung, Zielauswahl, Themenlexikon, Rückbezug         |
| `src/lib/ziele.ts`                  | Register der Orte, zu denen der Bot hinführen kann, und die Gruppen, aus denen er vorschlägt      |
| `src/lib/empfehlung.ts`             | Baut zur Laufzeit die Vorschlagsliste, die Zielantwort mit QR-Code und die Fahrplantabelle         |
| `src/lib/fahrplan.ts`               | Abfahrtszeiten der Linie RB 53 und der Anschlüsse, samt Berechnung der nächsten drei Abfahrten     |
| `src/lib/jetzt.ts`                  | Zeitbewusstsein: Öffnungsstand eines Ziels, Eignung zur aktuellen Stunde, Tageszeitbezug           |
| `src/hooks/use-chat.ts`             | Gesprächslogik: Nachrichten-State, Tippsimulation, Abbruch laufender Antworten, Gesprächszustand   |
| `src/components/chat/`              | UI-Bausteine: Kopfzeile, Nachrichten, Schnellantworten, Tippanzeige, Eingabe                       |
| `src/components/device-preview.tsx` | Rahmen zum Umschalten zwischen Mobil, Tablet, Desktop und Service-Terminal                         |

## Interaktion ohne Backend

Es gibt keine Authentifizierung, keine gespeicherten Verläufe und keine echte
Wissensdatenbank. Die Interaktivität entsteht über zwei Wege:

1. **Schnellantworten**: Jede Bot-Nachricht bietet Buttons, die zum nächsten
   Knoten im Baum führen.
2. **Freitext**: Eine Eingabe durchläuft in `verstehen.ts` mehrere Stufen, bis
   eine greift: Meta-Fragen an das Gerät ("wo bin ich", "was kannst du"), die
   Frage nach dem Weg ("wie komme ich zur Gondelbahn", "navigiere mich da
   hin"), die Bitte um andere Vorschläge, die Auswahl eines vorgeschlagenen
   Ziels ("ich würde gern auf den Rauschberg"), die Auswahl aus dem zuletzt
   Angebotenen ("ja", "das zweite"), ein gewichtetes Themenlexikon und zuletzt
   der Rückbezug auf das laufende Thema ("was kostet das", "welche genau").
   Bleibt alles ohne Treffer, stellt der Bot eine Rückfrage mit den
   nächstliegenden Themen.

## Vorschlagen statt aufzählen

Auf eine allgemeine Frage ("welche Wandertouren kann ich machen", "was kann
ich hier machen") antwortet der Bot nicht mit einer Textwand, sondern mit drei
Zielen: je eine Sprechblase mit Name, Beschreibung und Eckdaten, eines davon
als beliebtestes hervorgehoben. Auswählen lässt sich in eigenen Worten ("ich
würde gern auf den Rauschberg", "das mit dem See klingt gut", "die zweite"),
und auf die Auswahl folgt der Weg dorthin als QR-Code für Google Maps. Passt
keiner der drei, rückt "gibt es auch andere" die Liste weiter.

Die Vorschläge richten sich nach der Uhrzeit. Was gerade geschlossen ist,
rutscht ans Ende der Gruppe statt zu verschwinden — wer abends fragt, plant
oft für den nächsten Tag — und jeder Vorschlag trägt seinen Öffnungsstand.
Ein Ziel, das einen ganzen Tag braucht, fällt ab dem Nachmittag heraus: neun
Stunden Gehzeit passen um acht Uhr abends in keinen Tag mehr. Wo keine
Öffnungszeit belegt ist, sagt der Prototyp nichts dazu; eine geratene
Öffnungszeit ist die schädlichste Falschauskunft, weil jemand danach losgeht.

Die Orte dafür stehen in `src/lib/ziele.ts`. Sie sind der Grund, warum "wie
komme ich da hin" beantwortbar ist: Ein Knoten kann erzählen, dass es eine
Gondelbahn gibt, aber er ist kein Ort. Ein Ziel hat einen Kartensuchbegriff,
getrennt vom Anzeigenamen, damit die Navigation bei einer Bergtour zum
Parkplatz am Einstieg führt und nicht zum Gipfel.

Die Zuordnung ist bestimmt: dieselbe Eingabe im selben Gesprächszustand ergibt
immer dasselbe Ziel. Das ist die Voraussetzung dafür, dass zwei Testläufe
vergleichbar bleiben. Variiert wird nur die Formulierung der Antwort, nie ihr
Inhalt und nie das Ziel.

## Fahrpläne

Fragen nach einer Verbindung ("wie komme ich nach Traunstein", "wann fährt die
nächste Bahn", "und nach Salzburg") beantwortet der Prototyp mit den nächsten
drei Abfahrten ab der aktuellen Uhrzeit, als Tabelle mit Ab, An, Linie und
gegebenenfalls Umstieg. Die Zeiten stammen aus dem gedruckten Fahrplan der
Linie RB 53 für das Fahrplanjahr 2026, die Anschlüsse mit dem RE 5 nach
Salzburg und München aus derselben Quelle.

Nach der letzten Abfahrt des Tages verweist die Tabelle auf den ersten Zug am
nächsten Morgen, statt leer zu bleiben. Für die Dorflinien im Ort ist kein
Takt veröffentlicht: dort zeigt der Prototyp die Strecken und sagt, dass die
Abfahrtszeiten an den Haltestellen aushängen. Was an den Daten nicht belegt
ist, steht in `QUELLEN.md` unter "Fahrpläne und Buslinien".

## Tests

```
bun test
```

`src/lib/verstehen.test.ts` deckt die Zuordnung ab, einschließlich sämtlicher
Eingaben aus den Testläufen vom 03.09.2026, die damals ohne Treffer blieben
oder auf der falschen Antwort landeten.

Ein exportiertes Interaktionsprotokoll lässt sich gegen die aktuelle Zuordnung
nachspielen:

```
bun run scripts/protokoll-nachspielen.ts protokoll-2026-09-03-1045.json
```

Das Skript zeigt je Eingabe, wie sie im Testlauf eingeordnet wurde und wie
jetzt, und endet mit einem Fehlercode, sobald eine Eingabe schlechter
abschneidet als zuvor.

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

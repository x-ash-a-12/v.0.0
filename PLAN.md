# Ausführungsplan: vom regelbasierten Bot zur LLM-Anmutung

Dieses Dokument ist eine Arbeitsanweisung. Arbeite die Pakete in der
angegebenen Reihenfolge ab, eines nach dem anderen, mit je einem Commit.

## Auftrag

Der Prototyp ist heute ein Entscheidungsbaum mit Chat-Optik. Er soll sich
verhalten wie ein LLM-gestützter Assistent, ohne dass ein Sprachmodell läuft.
Alle Antworten bleiben vordefiniert und für jede Testperson identisch.

Nach Abschluss von AP1 bis AP10 muss gelten: Eine Testperson, die den Prototyp
zwei Minuten bedient, hält ihn für ein System mit Sprachmodell im Hintergrund.

---

## Arbeitsregeln

Diese Regeln gelten für jedes Arbeitspaket. Verstöße dagegen machen das
Ergebnis für den Zweck der Arbeit unbrauchbar.

### Stil ist gesperrt

Farben, Schrift, Radien und Abstände sind fertig und dürfen nicht geändert
werden.

- **`src/index.css` wird nicht angefasst.** Keine neuen CSS-Variablen, keine
  neuen `@import`, keine neuen Farbwerte.
- Nur bestehende Tailwind-Tokens verwenden: `bg-background`, `bg-muted`,
  `bg-primary`, `text-foreground`, `text-muted-foreground`, `border-border`,
  `bg-card` und die zugehörigen `-foreground`-Varianten.
- **Keine Hex-Werte, keine `oklch()`-Literale, keine Tailwind-Farbnamen** wie
  `blue-500` oder `neutral-800` in neuem Code. Einzige Ausnahme ist der
  bestehende Geräterahmen in `device-preview.tsx`, der bleibt wie er ist.
- Schrift bleibt Geist Variable über `font-sans`. Keine neue Schriftart.
- Radien über `rounded-lg`, `rounded-2xl` und die vorhandenen Klassen, nicht
  über eigene Werte.

### shadcn ist Pflicht, Eigenbau ist verboten

Das Projekt nutzt shadcn im Style **`base-nova`** auf Basis von
**`@base-ui/react`**, nicht Radix. Das CLI ist installiert.

- Brauchst du eine UI-Komponente, die noch nicht in `src/components/ui/` liegt,
  installiere sie: `bunx shadcn@latest add <name>`
- **Baue niemals eine eigene Version einer Komponente, die shadcn anbietet.**
  Kein selbstgeschriebenes Select, kein selbstgeschriebenes Dropdown.
- Importiere ausschließlich aus `@base-ui/react`, nie aus `@radix-ui/*`. Wenn
  ein Codebeispiel Radix nutzt, ist es für dieses Projekt falsch.
- Nach dem Hinzufügen einer Komponente prüfen, ob das CLI `src/index.css`
  verändert hat. Falls ja: die Änderung an `index.css` mit
  `git checkout -- src/index.css` zurücknehmen, die Komponente behalten.
- Icons kommen aus `lucide-react`, wie bisher.

Konkret gebraucht werden voraussichtlich `select` (AP5) und `badge` (AP9).
Alles andere ist schon da.

### Keine erfundenen Fakten

Der Prototyp gehört zu einer Bachelorarbeit. Erfundene Öffnungszeiten oder
Preise, die als echt erscheinen, sind ein wissenschaftliches Problem.

- Bestehende Demo-Werte bleiben unverändert stehen, auch wenn sie fiktiv sind.
  Nach AP0 leben sie in `src/lib/daten.ts` und sind dort mit `@demo` markiert.
  Neue Fakten gehören ebenfalls dorthin, nie direkt in einen Antworttext.
- Erfinde keine neuen Zahlen, Adressen, Preise oder Termine.
- Brauchst du für ein Paket ein Datum, das du nicht hast, setze einen
  Platzhalter und markiere ihn:
  ```ts
  // DATEN: vom Autor zu ersetzen
  ```
- Ausnahme sind Google-Maps-Such-URLs (AP6). Die Form
  `https://www.google.com/maps/search/?api=1&query=Rauschbergbahn+Ruhpolding`
  ist keine erfundene Tatsache, sondern eine funktionierende Suchabfrage.

### Ablauf je Arbeitspaket

1. Paket vollständig umsetzen
2. `bun run typecheck && bun run lint && bun run build`
3. `bun run dev` starten und das Akzeptanzkriterium des Pakets von Hand prüfen,
   in der Ansicht „Terminal" **und** in der Ansicht „Mobil"
4. Ein Commit mit der angegebenen Message, auf Englisch
5. Erst dann das nächste Paket

Kommentare und alle sichtbaren Texte auf Deutsch, wie im bestehenden Code.
Die Anrede ist durchgehend Du, kein Sie.

### Wenn etwas unklar ist

Nicht raten und nicht den Umfang erweitern. Das Paket so weit umsetzen wie
möglich, die offene Stelle mit `// OFFEN:` markieren und im Abschlussbericht
nennen.

---

## Warum kein echtes Sprachmodell

Der Prototyp wird in sechs Think-Aloud-Tests evaluiert. Liefe ein echtes Modell,
sähen sechs Personen sechs verschiedene Antworten auf dieselbe Frage, und die
Protokolle wären nicht mehr vergleichbar. Außerdem ließe sich eine schlechte
Bewertung nicht mehr dem Interface oder der Antwortqualität zuordnen.

Deshalb wird das Verhalten nachgebildet, nicht die Technik: freie Eingabe wird
aufgegriffen statt abgewiesen, bei Mehrdeutigkeit wird nachgefragt, Gesagtes
bleibt im Gedächtnis, und Text erscheint gestaffelt.

**Verboten**: API-Aufrufe, Netzwerkzugriffe zur Laufzeit, Backend, Datenbank,
Persistenz über die Sitzung hinaus. Der Prototyp muss offline auf einem Tablet
im Browser laufen.

---

## Ausgangslage

| Datei | Rolle | Zeilen |
|---|---|---|
| `src/lib/chat-flow.ts` | 30 Knoten, 22 Regex-Intents, `matchIntent` | 405 |
| `src/hooks/use-chat.ts` | `runNode`, Tippsimulation, Abbruch über `runIdRef` | 104 |
| `src/components/chat/chat-view.tsx` | Zusammenbau, Auto-Scroll | 61 |
| `src/components/chat/message-item.tsx` | Sprechblase und Infokarte | 79 |
| `src/components/device-preview.tsx` | Geräterahmen, Vorschauleiste | 131 |

Die Architektur trägt alle Pakete. Es gibt keinen Grund, sie umzubauen.

---

# Stufe 0: Daten trennen

## AP0: Fakten aus den Antworttexten herauslösen

**Warum**: Die Zahlen und Namen stehen heute im Fließtext der Antworten, über
30 Knoten verteilt und teils mitten im Satz. Der Autor muss die fiktiven
Demo-Werte durch echte öffentliche Ruhpolding-Daten ersetzen und kann sie so
nicht finden. Nach AP8 stünde dieselbe Zahl zusätzlich in mehreren
Formulierungsvarianten.

**Dieses Paket zuerst umsetzen.** Es ist mechanisch, ändert kein Verhalten und
erspart bei allen folgenden Paketen doppelte Pflege.

**Dateien**: neu `src/lib/daten.ts`, `src/lib/chat-flow.ts`

**Umsetzung**

Alle Fakten in `src/lib/daten.ts` sammeln, nach Themen gegliedert, mit
Quellenangabe und Stand je Block. Die Antworttexte in `chat-flow.ts` beziehen
sie über Template Literals, nicht über Laufzeit-Platzhalter. Damit prüft der
Compiler jeden Verweis, und ein Tippfehler fällt beim Build auf.

```ts
/**
 * Alle Fakten über Ruhpolding an einer Stelle.
 *
 * Werte mit @demo sind noch fiktiv und müssen vor der Evaluation durch
 * öffentlich zugängliche Angaben ersetzt werden. Suchen mit:
 *   grep -n "@demo" src/lib/daten.ts
 */

/** Quelle: noch offen. Stand: noch offen. */
export const BERGBAHNEN = {
  /** @demo */ rauschbergErwachsen: "24,00 €",
  /** @demo */ unternbergErwachsen: "19,50 €",
  /** @demo */ ermaessigungKinder: "50 % Ermäßigung",
  /** @demo */ ermaessigungGaestekarte: "20 % Ermäßigung",
  /** @demo */ betriebszeitSommer: "9:00 bis 16:30 Uhr",
  /** @demo */ letzteBergfahrt: "16:00 Uhr",
} as const
```

Verwendung im Antworttext:

```ts
wandern: {
  id: "wandern",
  messages: [
    `Die Bergbahnen fahren im Sommer täglich von ${BERGBAHNEN.betriebszeitSommer}, letzte Bergfahrt um ${BERGBAHNEN.letzteBergfahrt}.`,
  ],
}
```

**Aufzunehmende Blöcke**, mit den heute im Code stehenden Werten als
Ausgangspunkt:

| Block | Inhalt |
|---|---|
| `TOURIST_INFO` | Adresse, Telefon, E-Mail, Öffnungszeiten |
| `BERGBAHNEN` | Preise, Betriebszeiten, Namen der Bahnen |
| `WANDERN` | Wegenetz in km, Tourennamen, Gehzeiten, Höhenangaben |
| `PARKEN` | Parkplätze mit Tarifen |
| `ANREISE` | Autobahnausfahrt, Fahrzeiten, Buslinie, Gästekarte |
| `LOIPEN` | Loipennetz, Loipenpass-Preise |
| `EVENTS` | wiederkehrende Termine mit festem Datum |
| `GASTRONOMIE` | Namen der genannten Betriebe |
| `FAMILIE` | Einrichtungen mit Öffnungszeiten |
| `UNTERKUNFT` | Anzahl Höfe, Zertifizierungen |

**Nicht in `daten.ts` gehören** Angaben, die tagesaktuell wären und in einem
Prototyp ohne Datenanbindung gar nicht echt sein können: das Wetter, die
Drei-Tages-Prognose, „Was ist diese Woche los?" und die Schneelage. Diese
Knoten behalten ihre Demo-Inhalte und bekommen im Code einen Kommentar:

```ts
// SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
// echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
```

**Der Text darf sich nicht ändern.** Dieses Paket verschiebt Werte, es
formuliert nicht um. Nach dem Umbau muss der Prototyp Wort für Wort dasselbe
sagen wie vorher.

**Akzeptanz**: `grep -n "@demo" src/lib/daten.ts` listet jeden noch fiktiven
Wert. Keine Zahl, kein Preis, keine Uhrzeit und keine Adresse steht mehr direkt
in `chat-flow.ts`. Die Ausgabe des Prototyps ist unverändert.

**Commit**: `refactor: extract facts into src/lib/daten.ts`

---

# Stufe 1: Grundanmutung

## AP1: Gestaffelte Textausgabe

**Warum**: Bot-Nachrichten erscheinen als fertiger Block. Das ist die Optik
eines Formulars. Gestaffelter Text ist das visuelle Erkennungsmerkmal eines
Sprachmodells.

**Dateien**: `src/hooks/use-chat.ts`, `src/components/chat/chat-view.tsx`,
neu `src/components/chat/streaming-bubble.tsx`

**Umsetzung**

In `use-chat.ts` einen eigenen State für die entstehende Nachricht, damit nicht
bei jedem Zeichen die ganze Liste neu rendert:

```ts
const [streaming, setStreaming] = React.useState<string | null>(null)
```

Ablauf je Textnachricht in `runNode`, ersetzt die heutige Logik:

1. `setIsTyping(true)`, Denkpause 400 bis 900 ms (die heutige `typingDelay`
   entsprechend kürzen, sie muss nicht mehr die ganze Lesezeit abdecken)
2. `setIsTyping(false)`, `setStreaming("")`
3. Den Text in Häppchen von zwei bis fünf Zeichen anhängen, Intervall 20 bis
   35 ms mit leichter Zufallsstreuung. Häppchen treffen die Optik echter
   Token-Ausgabe besser als exakt zeichenweise
4. Am Ende `setStreaming(null)` und die fertige Nachricht in `messages` pushen

Die Abbruchprüfung über `runIdRef` muss **innerhalb** der Häppchen-Schleife
laufen, nicht nur davor. Bei Abbruch `setStreaming(null)` setzen, sonst bleibt
eine halbe Blase stehen.

`streaming-bubble.tsx` rendert die entstehende Blase. Sie muss **exakt** so
aussehen wie eine fertige Bot-Blase in `message-item.tsx`, sonst springt der
Übergang. Die Klassen von dort übernehmen, plus ein Cursor am Ende:

```tsx
<span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground align-text-bottom" />
```

In `chat-view.tsx` die Blase unterhalb der Nachrichtenliste rendern, an der
Stelle, wo heute der `TypingIndicator` steht. `streaming` in das
Abhängigkeitsarray des Scroll-Effekts aufnehmen, sonst scrollt es beim Wachsen
nicht mit.

**Barrierefreiheit**: Bei `prefers-reduced-motion: reduce` den Text sofort
vollständig ausgeben, ohne Häppchen. Die Blase bekommt `aria-live="polite"` und
`aria-atomic="true"`, damit Screenreader nicht jedes Häppchen vorlesen.

**Akzeptanz**: Eine Antwort von 200 Zeichen erscheint über rund zwei bis drei
Sekunden. Ein Klick auf einen Chip mitten im Streaming bricht sauber ab, ohne
Rest. Kein Ruckeln in der Terminal-Ansicht.

**Commit**: `feat: stream bot messages in chunks`

---

## AP2: Fallback, der nicht wie ein Fallback klingt

**Warum**: `FLOW.fallback` sagt heute „Das habe ich leider nicht verstanden.
Ich bin ein Prototyp mit vorgegebenen Themen." Das ist die Kapitulationsformel
eines Entscheidungsbaums und entwertet den ganzen Prototyp. Ein Sprachmodell
weist eine Eingabe nicht ab, es greift sie auf und fragt nach.

**Briefing-Anforderung**: „Rückfragen bei unvollständigen oder unklaren
Eingaben (die nicht für eine sinnvolle Auskunft ausreichen)"

**Dateien**: neu `src/lib/fallback.ts`, `src/lib/chat-flow.ts`,
`src/hooks/use-chat.ts`

**Umsetzung**

Erstens ein weicher zweiter Matching-Durchgang in `fallback.ts`. Wenn kein
`INTENTS`-Muster greift:

1. Eingabe kleinschreiben, an Nicht-Buchstaben trennen
2. Stopwörter entfernen. Liste anlegen mit den üblichen deutschen Füllwörtern
   (ich, du, wo, was, wie, kann, gibt, es, der, die, das, ein, eine, und, oder,
   mit, für, bei, nach, von, zu, in, am, im, auf, ist, sind, hab, habe, gerne,
   bitte, mal, denn, noch)
3. Die verbleibenden Wörter gegen eine Stichwortliste je Thema prüfen, auch
   als Teilstring, damit „Schwimmbad" auf „schwimm" trifft
4. Themen nach Trefferzahl sortieren, die besten zwei zurückgeben

```ts
export type WeicherTreffer = { topic: string; label: string; score: number }
export function weicheSuche(text: string): WeicherTreffer[]
export function leitbegriff(text: string): string | null
```

`leitbegriff` liefert das längste inhaltstragende Wort (mehr als vier Zeichen,
kein Stopwort) für die Rückfrage.

Zweitens die Formulierung. Statt eines festen Knotens wird die Antwort erzeugt.
Mit Leitbegriff und mindestens einem weichen Treffer:

```
Zu „Schwimmbad" habe ich gerade nichts Passendes hinterlegt.
Meinst du das Hallenbad in der Vitalwelt, oder suchst du eher
etwas für Kinder bei Regen?
```

Angeboten werden **nur zwei bis drei Chips**: die besten weichen Treffer plus
„Andere Frage". Eine Neunerliste sieht nach Menü aus, zwei gezielte Vorschläge
sehen nach Verständnis aus.

Ohne weichen Treffer die allgemeine Variante, aber ohne das Wort „verstanden"
und ohne den Hinweis auf vorgegebene Themen:

```
Dazu habe ich gerade keine verlässliche Auskunft. Frag mich gern
noch einmal anders, oder wähle eines der Themen.
```

**Mindestens vier Formulierungsvarianten** je Fall hinterlegen und rotieren, nie
zweimal dieselbe hintereinander. Kommt der Fallback im selben Gespräch zweimal
wortgleich, ist der Effekt zerstört.

Der bisherige `FLOW.fallback`-Knoten entfällt als Textquelle. `getNode` muss
weiterhin einen Notknoten liefern, wenn eine unbekannte ID angefragt wird.

**Akzeptanz**: „Wo kann ich mit dem Hund hin?" erzeugt eine Rückfrage, die das
Wort Hund aufgreift, mit höchstens drei Chips. Zwei nicht erkannte Eingaben
hintereinander erzeugen zwei verschiedene Texte.

**Commit**: `feat: replace fallback with clarifying question`

---

## AP3: Überbrückungsformulierung

**Warum**: Bei Knoten mit Infokarte entstehen Wartezeiten, in denen nur die
Punkte pulsieren.

**Briefing-Anforderung**: „Reaktionszeiten max. 3s (oder
Überbrückungsformulierungen wie ‚Lassen Sie mich einmal nachsehen')"

**Dateien**: `src/lib/chat-flow.ts`, `src/hooks/use-chat.ts`

**Umsetzung**: `FlowNode` um `bridge?: boolean` erweitern. Ist es gesetzt oder
hat der Knoten eine `card`, gibt `runNode` vor der eigentlichen Antwort eine
kurze eigene Sprechblase aus, zufällig aus einer Liste von mindestens vier:
„Einen Moment, ich schaue nach.", „Ich sehe kurz nach.", „Das habe ich gleich.",
„Moment, ich hole die Zahlen."

Die Überbrückung wird gestreamt wie jede andere Nachricht, danach folgt eine
Pause von 600 bis 1000 ms, dann die Karte.

**Akzeptanz**: Der Weg zu „Preise Bergbahnen" zeigt erst die Zwischenmeldung,
dann die Karte.

**Commit**: `feat: add bridging phrases before card answers`

---

# Stufe 2: Briefing-Anforderungen

## AP4: Rückfrage bei Mehrdeutigkeit

**Warum**: `matchIntent` gibt den ersten Regex-Treffer zurück. „Was kostet die
Bergbahn mit Kindern?" trifft `wandern`, obwohl `bergbahn-preise` und `familie`
beide plausibel sind. Ein Sprachmodell fragt in so einem Fall nach.

**Briefing-Anforderung**: „Dialogfähigkeit: Rückfragen bei unvollständigen oder
unklaren Eingaben"

**Dateien**: `src/lib/chat-flow.ts`, `src/hooks/use-chat.ts`

**Umsetzung**

`Intent` um die Themenzugehörigkeit erweitern:

```ts
type Intent = { test: RegExp; to: string; topic: string }
```

Jedem der 22 bestehenden Intents das passende Thema aus `TOPICS` zuordnen.
Die Reihenfolge der Einträge bleibt unverändert.

Rückgabetyp von `matchIntent` ändern:

```ts
export type MatchResult =
  | { kind: "hit"; to: string }
  | { kind: "ambiguous"; candidates: Chip[]; term: string | null }
  | { kind: "miss"; term: string | null }
```

Neue Logik: alle greifenden Intents sammeln statt beim ersten abzubrechen.

- Treffer aus **einem** Thema: `hit` mit dem zuerst eingetragenen, also dem
  spezifischsten. Das Verhalten von heute bleibt damit erhalten.
- Treffer aus **zwei oder mehr verschiedenen** Themen: `ambiguous` mit einem
  Chip je Thema, höchstens drei.
- Kein Treffer: `miss`, weiter über AP2.

Die Rückfrage bei `ambiguous`:

```
Damit ich dir das Richtige raussuche: geht es dir um die Preise
der Bergbahn oder allgemein um Angebote für Familien?
```

Auch hier mindestens drei Formulierungsvarianten.

`sendText` in `use-chat.ts` auf den neuen Rückgabetyp umstellen.

**Akzeptanz**: „Was kostet die Bergbahn mit Kindern?" erzeugt eine Rückfrage mit
zwei Chips. „Wandern mit Kinderwagen" liefert weiterhin einen direkten Treffer,
weil beide Muster zum Thema Wandern gehören.

**Commit**: `feat: ask for clarification on ambiguous input`

---

## AP5: Standortbezug

**Warum**: Das System ist im Titel der Arbeit als standortbewusst beschrieben,
kennt aber keinen Standort. Das ist die größte inhaltliche Lücke im Prototyp.

**Briefing-Anforderung**: „Location awareness: Ausgabe abhängig vom Wissen über
den eigenen Standort"

**Dateien**: neu `src/lib/location.ts`, `src/lib/chat-flow.ts`,
`src/hooks/use-chat.ts`, `src/components/device-preview.tsx`,
`src/components/chat/chat-view.tsx`

**Umsetzung**

Kein GPS, keine Geolocation-API. Ein simulierter Aufstellort:

```ts
export type Standort = {
  id: string
  label: string                    // "Tourist-Information, Hauptstraße 60"
  kurz: string                     // "der Tourist-Information"
  naehe: Record<string, string>    // "rauschberg" -> "12 Gehminuten"
}
```

Drei Standorte anlegen: Tourist-Information, Bahnhof, Talstation Rauschberg.
Die Entfernungsangaben sind Platzhalter, jeweils mit `// DATEN: vom Autor zu
ersetzen` markieren.

Antworttexte dürfen Platzhalter enthalten, die beim Ausgeben ersetzt werden:

```
Die Talstation Rauschberg erreichst du von hier in {naehe:rauschberg}.
```

Eine Funktion `aufloesen(text: string, standort: Standort): string` erledigt das
in `runNode`, bevor gestreamt wird. Unbekannte Platzhalter werden entfernt, nicht
sichtbar gelassen.

Der Startknoten greift den Standort auf: „Du stehst gerade an
{standort:kurz}." Das ist der Satz, an dem eine Testperson sofort merkt, dass
das System weiß, wo es steht.

Mindestens fünf bestehende Antworten mit Entfernungsangaben versehen.

**Umschalter**: in die Vorschauleiste von `device-preview.tsx`, **nicht** in die
Chat-Oberfläche. Er ist ein Werkzeug des Versuchsleiters, kein Bedienelement der
Testperson. Umsetzung mit der shadcn-Komponente `select`:

```
bunx shadcn@latest add select
```

Der aktive Standort wird über einen React-Context von `DevicePreview` nach unten
gereicht, damit `useChat` ihn lesen kann. Ein Standortwechsel setzt das Gespräch
nicht zurück, wirkt aber ab der nächsten Antwort.

**Akzeptanz**: Ein Standortwechsel ändert die Entfernungsangaben in mindestens
fünf Antworten. Die Begrüßung nennt den aktuellen Aufstellort. Kein Platzhalter
bleibt im sichtbaren Text stehen.

**Commit**: `feat: add simulated location awareness`

---

## AP6: QR-Code zum Mitnehmen

**Warum**: Der Übergang vom Terminal auf das eigene Gerät ist ein Kernstück des
Konzepts und fehlt vollständig.

**Briefing-Anforderung**: „Für jede Antwort wird ein QR-Code am Screen erstellt,
der einen pdf- oder HTML-Download ermöglicht."

**Dateien**: neu `src/components/chat/qr-card.tsx`, `src/lib/chat-flow.ts`,
`src/hooks/use-chat.ts`, `src/components/chat/message-item.tsx`

**Umsetzung**

Abhängigkeit hinzufügen: `bun add qrcode` und `bun add -d @types/qrcode`.
Erzeugung clientseitig als SVG über `QRCode.toString(url, { type: "svg" })`.
**Kein externer Bilddienst**, das Terminal muss offline funktionieren.

Neuer Nachrichtentyp neben `text` und `card`:

```ts
| { id: string; role: "bot"; kind: "qr"; qr: QrPayload }

export type QrPayload = {
  title: string   // "Route zum Rauschberg"
  hint: string    // "Scanne den Code, um die Route mitzunehmen."
  url: string
}
```

`qr-card.tsx` nutzt die vorhandene `Card`-Komponente aus `@/components/ui/card`,
mit demselben Aufbau wie `InfoCardView` in `message-item.tsx`. Der QR-Code sitzt
zentriert, mindestens 160 px im Quadrat, mit weißem Grund und dunklen Modulen,
damit er in beiden Themes scannbar bleibt. Das ist die einzige Stelle, an der
ein fester weißer Grund erlaubt ist, denn ein QR-Code auf dunklem Grund wird von
vielen Kameras nicht gelesen. Setze ihn über `bg-white`, nicht über eine neue
CSS-Variable.

`FlowNode` um `qr?: QrPayload` erweitern. Anzubinden an mindestens:
`wandern-leicht`, `wandern-schwer`, `anreise-parken`, `events-biathlon`.

Die URLs als Google-Maps-Suchabfragen aufbauen:
`https://www.google.com/maps/search/?api=1&query=<Ziel>+Ruhpolding`

**Akzeptanz**: Der Code ist mit einem Handy vom Bildschirm scannbar, auch in der
skalierten Terminal-Vorschau, und in beiden Themes. Er funktioniert bei
getrenntem Netzwerk.

**Commit**: `feat: add QR handoff cards`

---

# Stufe 3: Sprachwirkung

## AP7: Gesprächsgedächtnis

**Warum**: Jeder Knoten steht heute für sich. Dass ein Modell sich auf Vorheriges
bezieht, nennt die Arbeit als eines von drei Merkmalen LLM-gestützter Agenten.

**Dateien**: neu `src/lib/memory.ts`, `src/hooks/use-chat.ts`

**Umsetzung**

Im Hook eine Historie der besuchten Knoten führen (`React.useRef<string[]>`).
Drei Effekte:

1. **Rückbezug**: Beim Wechsel in ein neues Thema gelegentlich einen Bezug
   voranstellen, wenn vorher ein anderes Thema besucht wurde: „Du hattest vorhin
   nach Wandern gefragt, dazu passt das hier gut." Höchstens jede dritte
   Antwort, sonst wirkt es aufdringlich und fällt im Test negativ auf.
2. **Wiederholung erkennen**: Wird ein Knoten ein zweites Mal angesteuert, eine
   verkürzte Fassung ausgeben statt derselben Textwand. Dafür `FlowNode` um
   `kurz?: string[]` erweitern, für die neun Themenknoten befüllen: „Wie gesagt,
   die Bahnen fahren bis 16:30 Uhr, letzte Bergfahrt um 16:00."
3. **Reset leert die Historie.**

**Akzeptanz**: Zweimal nacheinander nach den Bergbahnpreisen fragen liefert beim
zweiten Mal einen kürzeren Text mit einer Wendung wie „wie gesagt".

**Commit**: `feat: add conversation memory for callbacks and repeats`

---

## AP8: Antwortvarianten

**Warum**: Ein Modell formuliert nie zweimal identisch. Feste Strings sind bei
wiederholtem Aufruf sofort als Datenbank erkennbar.

**Dateien**: `src/lib/chat-flow.ts`

**Umsetzung**: `FlowNode.messages` von `string[]` auf `string[] | string[][]`
erweitern, wobei die zweite Form Varianten enthält. Eine Hilfsfunktion zieht
eine Variante, nie zweimal dieselbe hintereinander.

**Nur für die neun Themen-Einstiegsknoten**, nicht für alle 30. Der Aufwand
wäre sonst unverhältnismäßig, und die Unterknoten werden selten wiederholt.

Jede Variante muss denselben Informationsgehalt haben. Es wird nur die
Formulierung getauscht, nie der Inhalt.

**Akzeptanz**: Zweimaliger Aufruf von `wandern` erzeugt zwei unterschiedliche
Formulierungen mit identischen Fakten.

**Commit**: `feat: vary phrasing of topic answers`

---

## AP9: Sprachumschaltung Deutsch und Englisch

**Warum**: Mehrsprachigkeit ist eine Briefing-Anforderung und eines der drei
LLM-Merkmale, die die Arbeit in Kapitel 2 nennt.

**Briefing-Anforderung**: „Erkennung von diversen Sprachen (primär Deutsch und
Englisch)", „Ausgabe in der Eingabe-Sprache"

**Dieses Paket ist das teuerste. Setze es nur um, wenn AP1 bis AP8 stehen.**

**Dateien**: neu `src/lib/i18n.ts`, `src/lib/chat-flow.ts`,
`src/components/chat/chat-header.tsx`

**Umsetzung**

Spracherkennung über eine Stopwortliste (the, is, are, where, how, what, can,
you, I, my gegen der, die, das, wo, wie, was, kann, ich, mein). Ab zwei Treffern
gilt die Sprache als erkannt.

Beim Umschalten ein kurzer Hinweis in der Antwort: „Sure, let's continue in
English." Im Kopfbereich eine `badge`-Komponente mit dem aktiven Sprachkürzel:

```
bunx shadcn@latest add badge
```

**Umfang strikt begrenzen**: übersetzt werden nur die neun
Themen-Einstiegsknoten, die Begrüßung, der Fallback und die
Mehrdeutigkeitsrückfrage. Die Unterknoten bleiben deutsch und werden mit einem
Hinweis eingeleitet: „I have the details in German only for now." Das reicht,
um die Fähigkeit im Test zu zeigen.

**Akzeptanz**: „Where can I go hiking?" wird auf Englisch beantwortet, der
Dialog bleibt auf Englisch bis zum Reset, und das Kürzel im Kopf wechselt.

**Commit**: `feat: switch dialogue language to match input`

---

# Stufe 4: Auswertung

## AP10: Interaktionsprotokoll

**Warum**: Ohne dieses Paket beruht die Auswertung der sechs Think-Aloud-Tests
auf Erinnerung. Es ist keine LLM-Imitation, aber vor den Tests zwingend nötig.

**Dateien**: neu `src/lib/telemetry.ts`, `src/hooks/use-chat.ts`,
`src/components/device-preview.tsx`

**Umsetzung**

```ts
export type LogEintrag = {
  t: number                                  // ms seit Sitzungsbeginn
  art: "eingabe" | "chip" | "antwort" | "reset"
  text?: string                              // Roheingabe bei "eingabe"
  treffer?: "hit" | "ambiguous" | "miss"
  knoten?: string
  standort?: string
}
```

Alles nur im Speicher. **Kein Netzwerkaufruf, kein localStorage, kein
personenbezogenes Datum.** Das Protokoll lebt so lange wie die Seite offen ist.

Export als JSON-Download über eine Schaltfläche in der Vorschauleiste, nicht in
der Chat-Oberfläche. Dateiname mit Zeitstempel, etwa
`protokoll-2026-09-09-1432.json`.

**Akzeptanz**: Nach einem Durchlauf liefert der Export eine JSON-Datei, aus der
sich Dauer, Anzahl der Fehlversuche und der Pfad durch den Dialogbaum
rekonstruieren lassen.

**Commit**: `feat: log interactions and export as JSON`

---

# Reihenfolge

```
AP0                    zuerst, alle folgenden Pakete bauen darauf auf
AP1 → AP2 → AP3        unabhängig voneinander, diese Reihenfolge ist bequem
AP4                    braucht AP2 (gemeinsame Match-Typen)
AP5 → AP6              unabhängig
AP7 → AP8              AP7 braucht AP1, AP8 braucht AP7
AP9                    braucht AP2 und AP8
AP10                   braucht AP4 (loggt den Treffertyp)
```

AP0 steht bewusst vorn. Danach kann der Autor die echten Daten eintragen,
während die übrigen Pakete laufen, ohne dass die Arbeiten kollidieren.

Reicht die Zeit nicht für alles, ist die Mindestmenge **AP0, AP1, AP2, AP4,
AP10**. Damit ist der Prototyp als LLM-gestützt erkennbar, die Daten sind
pflegbar und die Tests sind auswertbar.

---

# Abschluss

Wenn alle Pakete stehen:

1. `bun run typecheck && bun run lint && bun run build` muss fehlerfrei laufen
2. `git diff --stat src/index.css` muss **leer** sein
3. Im gesamten neuen Code darf `grep -rE "#[0-9a-fA-F]{6}|oklch\(" src/` außer
   in `index.css` und `device-preview.tsx` nichts finden
4. `grep -r "@radix-ui" src/` muss leer sein
5. `README.md` um einen Abschnitt „LLM-Anmutung" ergänzen, der die zehn Pakete
   in je einem Satz nennt
6. Alle `// DATEN:`, `// OFFEN:` und `// SIMULIERT:` Markierungen sowie die
   Ausgabe von `grep -n "@demo" src/lib/daten.ts` im Abschlussbericht
   auflisten, damit der Autor weiß, was er noch einsetzen muss

Der Abschlussbericht nennt außerdem, welche Pakete umgesetzt wurden, welche
nicht, und warum.

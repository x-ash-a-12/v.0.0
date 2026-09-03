---
name: daten-recherche
description: Ersetzt die fiktiven Demo-Werte in src/lib/daten.ts durch echte Angaben aus offiziellen Quellen und belegt jeden Wert mit URL und Abrufdatum im Code. Aufruf ohne Argument für alle offenen Werte, oder mit einem Blocknamen, etwa /daten-recherche BERGBAHNEN.
argument-hint: "[BLOCK] optional, z.B. BERGBAHNEN. Leer = alle offenen Werte"
allowed-tools: Read, Edit, Write, Grep, Glob, Bash, WebSearch, WebFetch
---

# Datenrecherche für den Ruhpolding-Prototyp

Du recherchierst echte, öffentlich zugängliche Angaben über Ruhpolding und
trägst sie in `src/lib/daten.ts` ein. Jeder Wert wird im Code mit Quelle und
Abrufdatum belegt.

Der Prototyp ist das Artefakt einer Bachelorarbeit und wird in Nutzertests
eingesetzt. Eine erfundene Öffnungszeit, die als echt erscheint, ist ein
wissenschaftliches Problem, kein Schönheitsfehler. **Im Zweifel wird ein Wert
als ungeprüft markiert, nie geraten.**

## Vorbedingung

`src/lib/daten.ts` muss existieren. Sie entsteht in Arbeitspaket AP0 aus
`PLAN.md`. Fehlt die Datei, brich sofort ab und weise darauf hin, dass zuerst
AP0 umgesetzt werden muss. Fang nicht selbst damit an.

## Der Zielort

**Alle Werte gehören ausschließlich in `src/lib/daten.ts`.**

Nicht in `chat-flow.ts`, nicht in Komponenten, nicht in eine neue Datei. Die
Antworttexte beziehen die Werte über Template Literals aus dieser einen Datei.
Trägst du einen Wert woanders ein, ist er für den Autor unauffindbar.

Offene Werte findest du so:

! grep -n "@demo\|@ungeprueft" src/lib/daten.ts

Wurde ein Blockname als Argument übergeben ($1), bearbeite nur diesen Block.
Ohne Argument arbeitest du alle offenen Werte ab.

## Was als Quelle zählt

Rangfolge, immer die höchstmögliche nehmen:

1. **Betreiber-Website**: die Bergbahn für ihre Preise, die Vitalwelt für ihre
   Öffnungszeiten, der Veranstalter für seinen Termin
2. **Ruhpolding Tourismus** und die Gemeinde Ruhpolding
3. **Verkehrsunternehmen** für Fahrpläne und Tarife, also Bahn und der
   zuständige Regionalverkehr

**Nicht als Quelle zulässig**: Reiseblogs, TripAdvisor, Booking, Komoot,
Outdooractive, Wikipedia, KI-Zusammenfassungen in Suchergebnissen,
Presseartikel, die selbst keine Primärangabe machen. Diese Seiten dürfen dir
den Weg zur offiziellen Quelle weisen, aber der Wert wird von der offiziellen
Seite genommen.

Findest du zu einem Wert nach höchstens drei Suchanläufen keine zulässige
Quelle, markiere ihn als `@ungeprueft`, lass den bisherigen Wert stehen und geh
zum nächsten. Kein viertes Suchen, kein Ausweichen auf eine unzulässige Quelle.

## Belegformat im Code

Jeder Block bekommt einen Kopfkommentar mit der Hauptquelle:

```ts
/**
 * Bergbahnen Ruhpolding, Sommerbetrieb.
 * Quelle: https://www.beispiel.de/preise
 * Abgerufen: 2026-09-02
 */
export const BERGBAHNEN = {
  rauschbergErwachsen: "24,00 €",
} as const
```

Stammt ein einzelner Wert aus einer **anderen** Quelle als der Block, bekommt er
einen eigenen Kommentar direkt davor:

```ts
  /** https://www.andere-quelle.de/tarife, 2026-09-02 */
  ortsbusTakt: "Stundentakt werktags",
```

Bleibt ein Wert offen, ersetze `@demo` durch `@ungeprueft` und schreib dazu,
woran es lag:

```ts
  /** @ungeprueft keine offizielle Angabe gefunden, nur Blogs */
  hoefeAnzahl: "rund 20",
```

Das Abrufdatum ist das heutige Datum im Format JJJJ-MM-TT. Hol es dir mit:

! date +%Y-%m-%d

## Arbeitsweise

Ein Block nach dem anderen, nicht alle gleichzeitig.

Je Block:

1. Offene Werte des Blocks auflisten
2. Quelle suchen, Seite mit WebFetch abrufen und den Wert **im Volltext der
   Seite** nachlesen. Verlass dich nicht auf das Suchergebnis-Snippet
3. Werte in `src/lib/daten.ts` eintragen, `@demo` entfernen, Kommentar setzen
4. `bun run typecheck && bun run build`
5. Commit: `data: verify <BLOCK> against official sources`

Nach allen Blöcken einmal `bun run dev` starten und stichprobenartig prüfen, ob
die Antworten im Chat noch sinnvoll klingen.

## Regeln, die du nicht brechen darfst

- **Nur Werte tauschen, nie Texte umformulieren.** Die Antwortsätze in
  `chat-flow.ts` bleiben unverändert. Passt ein echter Wert nicht in den Satz,
  weil er eine andere Form hat, melde das im Abschlussbericht, statt den Satz
  umzuschreiben.
- **Keine neuen Felder erfinden.** Fehlt in `daten.ts` ein Feld, das du für
  sinnvoll hältst, melde es, leg es nicht an.
- **Saison beachten.** Bergbahnpreise und Öffnungszeiten unterscheiden sich
  zwischen Sommer und Winter. Nimm die Angabe, die zum Feldnamen passt, und
  notiere im Kommentar, für welche Saison sie gilt.
- **Keine tagesaktuellen Angaben.** Wetter, Drei-Tages-Prognose, Schneelage und
  „Was ist diese Woche los?" bleiben simuliert. Diese Stellen tragen im Code den
  Kommentar `// SIMULIERT:`. Fass sie nicht an.
- **Keine Telefonnummern oder Mailadressen von Privatpersonen.** Nur
  offizielle Kontaktdaten von Einrichtungen.
- **Nichts löschen.** Ein Wert, den du nicht belegen kannst, bleibt stehen und
  wird markiert.

## Abschluss

Erzeuge `QUELLEN.md` im Wurzelverzeichnis als Prüfliste für den Autor:

```markdown
# Quellen der Prototyp-Daten

Erzeugt am <Datum>. Maßgeblich ist der Code in `src/lib/daten.ts`,
diese Liste ist eine Lesehilfe zum Gegenprüfen.

| Block | Wert | Angabe | Quelle | Abgerufen |
|---|---|---|---|---|
| BERGBAHNEN | rauschbergErwachsen | 24,00 € | https://… | 2026-09-02 |

## Offen geblieben

| Block | Wert | Grund |
|---|---|---|
```

Berichte danach im Chat:

- wie viele Werte belegt sind und wie viele offen blieben
- jeden offen gebliebenen Wert mit Grund
- jeden Fall, in dem der echte Wert nicht in den bestehenden Satz passt
- jede Quelle, bei der du unsicher warst, ob sie als offiziell gilt

Behaupte nicht, ein Wert sei belegt, wenn du ihn nur im Suchergebnis gesehen
hast. Belegt heißt: du hast die Seite abgerufen und den Wert dort gelesen.

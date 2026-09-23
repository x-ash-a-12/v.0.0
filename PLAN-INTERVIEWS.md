# Umbauplan nach den Interviews vom 18.09. und 22.09.2026

Grundlage:

- **Interview Auskunft** (22.09.2026, vor Ort, ca. 31 Min.): Karin Amort (KA),
  Bianca Frei (BF), Amelie Paukstadt (AP), Mitarbeiterinnen der Tourist
  Information Ruhpolding. Transkript:
  `../Bachelorarbeit/Transkript_Interview_Auskunft_2026-09-22_redigiert.md`
- **Interview Matjan** (18.09.2026, Zoom, ca. 61 Min.): Dr. Gregor Matjan (M),
  Vorstand Ruhpolding Tourismus. Transkript:
  `../Bachelorarbeit/Transkript_Interview_Matjan_2026-09-18_redigiert.md`

Zeitmarken in eckigen Klammern verweisen auf das jeweilige Transkript.

Der Plan bleibt im Scope der Arbeit: Gegenstand ist das Interface, also wie das
Auskunftssystem fragt, antwortet und etwas mitgibt. Buchen, Datenbankanbindung
und ein echtes Sprachmodell bleiben draußen (siehe Abschnitt 5).

---

## 1. Auswertung: Wie die Auskunft heute arbeitet (Amort)

### 1.1 Was die Gäste fragen

| Befund | Beleg |
| --- | --- |
| Gefragt wird „alles“, nicht nur zu Ruhpolding, sondern zur ganzen Region bis München und Salzburg. | KA/BF [00:00:41], [00:02:21], [00:02:40] |
| Kernthemen: Wanderungen, Fahrpläne, Zugausfälle und Streckensperrungen, Busse, Ausflugsziele. | KA [00:01:30] |
| Tägliche Fragen: „Wo ist das Klo?“, „Wo fährt der Schienenersatzverkehr?“, ob man hier Zugtickets kaufen kann. | KA/AP/BF [00:07:59] bis [00:08:19] |
| Die TI verkauft keine Zugtickets („Beim Schaffner“). Bei Zugausfall Verweis an den Bahnschalter Traunstein. | KA [00:08:24], [00:08:28] |
| Der Ortsplan ist eines der am häufigsten ausgegebenen Materialien. Er dient zuerst der Orientierung. | KA [00:29:28], [00:30:17] |
| Montags großer Andrang, weil am Wochenende angereist wird. Die Frage lautet dann: Was können wir machen? | KA [00:09:19] |
| Typische Anfrage (letzter Gast): Seilbahn oder zu Fuß hinauf, wie lange, was bei Regen, Ausflug Berchtesgaden. Im Grunde ein Programm für drei Tage. | KA [00:06:54] |

### 1.2 Wie die Auskunft zu einer Antwort kommt

Das ist der Kern für den Umbau. Frau Amort beschreibt eine feste Reihenfolge:

1. **Erst fragen, was der Gast will.** „Man fragt so lange, bis man weiß, was
   der Gast will.“ [00:12:47] „Da muss man erst einmal fragen: Was will er
   überhaupt?“ [00:13:11]
2. **Die Merkmale, nach denen gefragt wird:**
   - Interesse: Berge, Kultur, manche wollen „gar nicht auf den Berg“ [00:12:47]
   - Hinauflaufen oder hinauffahren [00:11:53]
   - Sportniveau, Bergerfahrung („Sind Sie schon einmal in den Bergen
     gegangen?“, „Hacklstecken“) [00:11:57], [00:12:01]
   - Aufenthaltsdauer („Wie lange sind Sie denn da? Nur den einen Tag.“)
     [00:13:11]
   - Begleitung: Kinder, Kinderwagen, ältere Personen [00:12:47], [00:13:43]
   - Wetter, ohne dass der Gast fragt: „Bei Regenwetter schicke ich keinen auf
     den Hochfelln“ [00:13:43]
3. **Keine pauschale Antwort.** „Das kann man nie pauschalisieren.“ [00:13:07],
   „dafür sind wir da, für die Individualität“ [00:14:14]
4. **Dosieren.** „Alles einfach herumzuschmeißen, das macht man auch nicht.“
   Gespür dafür, „ob er viel Information will oder wenig“. [00:14:27], [00:15:51]
5. **Zuerst Orientierung.** „Erst einmal fragen, was er will, und dann ist
   meistens das Erste der Ortsplan.“ [00:30:27]
6. **Auswahl dem Gast überlassen.** Almenprospekt mit Ausgangspunkten und
   Höhen, „dann können sie selbst aussuchen“. [00:12:01]
7. **Wiederkommen erlaubt.** „Sie nerven nicht, wenn Sie öfter kommen.“
   [00:14:27]

### 1.3 Umgang mit Wissen und Aktualität

| Befund | Beleg |
| --- | --- |
| „Das Schlimmste ist eine falsche Antwort.“ Falsche Auskunft führt zu Beschwerden (Unternberg geschlossen, Parkgebühr umsonst). | KA [00:17:03], [00:23:43], [00:23:49] |
| Ohne aktuelle Information fliegt ein Betrieb aus der Liste: „Bevor ich falsche Informationen herausgebe, gebe ich lieber keine heraus.“ | KA [00:23:24], [00:23:34] |
| Aktualität wird aktiv beschafft: Rundmails an Gastronomie, Nachtelefonieren, morgens Webseiten der Lifte prüfen. | KA [00:06:11], [00:19:23], [00:21:28] |
| „Wenn es regnet, fährt der Unternberg nicht.“ | KA [00:19:23] |
| Almen: die meisten schließen heuer am 19. Oktober statt Ende Oktober. | KA [00:20:49] |
| Gleisbauarbeiten bei Eisenärzt, deshalb Schienenersatzverkehr. | KA [00:01:30], [00:07:59] |
| Neue Informationen gehen per Rundmail an alle, „denn alle müssen das gleiche Wissen haben“. | KA [00:17:59], [00:18:32] |
| Nachgeschlagen wird kaum, das meiste ist „im Kopf“ oder auf ausgedruckten Listen. Die Infomax-Datenbank wird gepflegt, aber am Schalter nicht abgefragt. | KA [00:19:02], [00:20:19] |

### 1.4 Grenzen und Weiterverweis

- Regional begrenzt: Ruhpolding und Nachbarorte ja, bei Lokalen am Chiemsee
  oder Zielen weiter weg „hört es auf“. [00:09:56]
- Verweiskette: Tourist-Info vor Ort, mitgegebene Prospekte, Internet,
  QR-Code auf dem Prospekt. [00:10:53], [00:11:22]
- Bahn: Bahnschalter Traunstein, Beschwerden an die Bayerische Regiobahn.
  [00:08:28], [00:24:33]
- Salzburg-Stadttour: Salzburg Tourismus. [00:02:40]
- Veranstaltungskarten: Vorverkaufsstelle vor Ort (Reservix, Ticketscharf),
  telefonisch nichts reservierbar. [00:04:40], [00:05:04], [00:26:13]

### 1.5 Was der Gast mitnimmt

Information, Tourentipp, eventuell ein Prospekt, Ortsplan mit eingezeichneter
Unterkunft, Angebot als Ausdruck, „oder auf seinem Zettel die Antworten auf die
Fragen, die er gestellt hat“. [00:14:27], [00:26:52], [00:28:47], [00:30:17]

---

## 2. Auswertung: Anforderungen aus dem Interview Matjan (nur Interface)

| Anforderung | Beleg |
| --- | --- |
| Falsche Antworten entwerten den Prototyp. Er fand bei einer Testabfrage zwei, darunter das nicht existierende Bergbahnmuseum. | M [00:05:10], [00:07:28] |
| Nachvollziehbar machen, woher eine Information stammt. | M [00:07:28] |
| Mitnahme ergebnisorientiert: was vereinbart wurde, nicht der Chatverlauf. | M [00:26:09] |
| Ausgabe direkt als Druck oder per E-Mail. QR-Code „okay, aber nicht optimal“, als Zusatz willkommen. | M [00:24:34], [00:25:36], [00:40:49] |
| Statusrückmeldung, wenn etwas dauert („Warten Sie kurz, ich drucke Ihnen das Ticket aus“). | M [00:58:14] |
| Bei subjektiven Fragen in den Dialog gehen: „Was ist Ihnen wichtig?“ | M [00:45:08] |
| Neutral bleiben, kein Produkt über ein anderes stellen. | M [00:43:01] |
| Offen sagen, wenn eine Information nicht vorliegt (Wegzustand, Soft-Informationen). | M [00:27:31] |
| Zielgruppe am Schalter tendenziell älter. | M [00:19:46] |

Frau Amort und Dr. Matjan decken sich in drei Punkten: Falschauskunft ist das
größte Risiko, vor einer Empfehlung wird nachgefragt, und der Gast bekommt ein
Ergebnis zum Mitnehmen.

---

## 3. Abgleich: Was der Prototyp heute tut

| Arbeitsweise Amort | Prototyp, Stand 20.09.2026 | Lücke |
| --- | --- | --- |
| Erst fragen, dann empfehlen | „Was kann ich hier machen?“ liefert sofort drei feste Vorschläge (`empfehlung:hier:0`). | **groß** |
| Interesse, Dauer, Begleitung, Kondition, hinauf laufen oder fahren | Wird nicht erfragt. Nur die Uhrzeit fließt ein (`jetzt.ts`). | **groß** |
| Wetter ohne Nachfrage berücksichtigen | Wetter ist ein statischer Demo-Text („heute heiter“). Vorschläge ignorieren es. | **groß** |
| Lieber keine Information als eine falsche | Die Rauschbergbahn fährt laut `daten.ts` nicht, wird aber als „beliebtester“ Vorschlag mit Betriebszeiten empfohlen. Viele Vorschläge beruhen auf `@ungeprueft`-Werten (Gipfelalm, Barfußweg, Förchensee-Rundweg, Sommerkonzerte, Wochenmarkt). | **kritisch** |
| Aktuelle Meldungen an alle (Rundmail) | Nicht vorhanden. Der Fahrplan zeigt Züge ohne Hinweis auf den Schienenersatzverkehr. | **groß** |
| Grenzen benennen und weiterverweisen | Fallback bittet nur um andere Worte. Kein Verweis auf Schalter, Bahn oder andere TI. | mittel |
| Tägliche Fragen: Toilette, SEV, Zugticket, Ortsplan | Nicht abgedeckt. | mittel |
| Zettel mit den Antworten, Ausdruck | Nur QR-Code zur Karte. Kein Sammeln, kein Druck, keine Mail. | **groß** |
| Status beim Warten | Tippanzeige und Überbrückungssätze vorhanden. | gering |
| Nicht alles auf einmal | Drei Vorschläge statt Textwand, gut. Startmenü zeigt aber neun Themen auf einmal. | gering |

---

## 4. Arbeitspakete

Reihenfolge nach Wirkung. Jedes Paket ändert Verhalten, das in den
Think-Aloud-Tests sichtbar wird.

### AP-A: Keine Falschauskunft („dann fliegen sie raus“)

**Warum:** KA [00:23:34], M [00:05:10]. Ein Vorschlag, der falsch ist, schadet
mehr als ein fehlender.

- Ziele bekommen ein Feld `ungesichert` mit Grund. Ungesicherte Ziele fallen
  aus allen Vorschlagslisten heraus.
- Wird ein ungesichertes Ziel direkt angefragt, nennt der Prototyp nur den
  Namen, den Kartenlink und offen, dass er dazu nichts Gesichertes hat. Dazu
  der Verweis auf den Schalter.
- Die Rauschbergbahn wird überall als „derzeit kein Fahrbetrieb“ geführt
  (Quelle ruhpolding.de, bereits in `daten.ts`). Die Texte, die sie als
  fahrend darstellen, werden korrigiert, Deutsch und Englisch.
- Beschreibungen und Eckdaten der verbleibenden Ziele enthalten nur noch
  belegte Angaben.
- Neu aufgenommen, weil belegt: „Traunauen und Taubensee“ (8,6 km, 2:15 h,
  Wegeliste ruhpolding.de), Holzknechtmuseum und Glockenschmiede (Museen laut
  ruhpolding.de/bei-regen), die Kirche mit Überblick als Tipp für Gäste mit
  nur einem Tag (KA [00:13:11]).

- Die Hervorhebung „beliebtester Vorschlag“ entfällt. Sie war erfunden und
  stellte ein Angebot über ein anderes (M [00:43:01]).
- Die übrigen Themenknoten (Familie, Winter, Unterkunft, Veranstaltungen,
  Anreise, Parken) verlieren alle `@ungeprueft`-Angaben. Wo nichts Belegtes
  bleibt, sagt der Prototyp das und verweist an den Schalter.
- Ein Tagesausflug trägt ab 14 Uhr den Hinweis „Für heute zu spät“, weil die
  kürzeren Listen ihn nicht mehr nach hinten schieben.

**Dateien:** `ziele.ts`, `empfehlung.ts`, `chat-flow.ts`, `i18n.ts`,
`location.ts`

### AP-B: Wetter als Einstellung des Versuchsleiters

**Warum:** KA [00:13:43], [00:19:23]. Das Terminal kennt das Wetter, der Gast
muss es nicht sagen.

- Neuer Umschalter „Wetter“ in der Vorschauleiste (sonnig, Regen), wie der
  Aufstellort. SIMULIERT, im Code so gekennzeichnet.
- Der Wetterknoten liest die Lage aus der Einstellung statt aus festem Text.
- Vorschläge berücksichtigen das Wetter: bei Regen keine Bergtour und kein
  Unternberg („fährt nicht“), dafür drinnen. Der Prototyp sagt das auch:
  „Bei dem Regen schicke ich dich heute nicht auf den Berg.“
- Wählt jemand bei Regen ein Bergziel direkt, rät die Zielseite davon ab.

**Dateien:** neu `wetter.ts`, `device-preview.tsx`, `use-chat.ts`,
`location.ts` (Platzhalter `{wetter:...}`), `chat-flow.ts`

### AP-C: Bedarfsklärung vor der Empfehlung

**Warum:** Kern der Arbeitsweise, KA [00:12:47] bis [00:14:14], M [00:45:08].

- „Was kann ich hier machen?“ und allgemeine Wander- oder Familienfragen führen
  in eine kurze Klärung statt direkt in drei Vorschläge.
- Reihenfolge wie bei Frau Amort: Interesse, Aufenthaltsdauer, Begleitung,
  bei Bergen zusätzlich „hinauflaufen oder hinauffahren“ samt Kondition.
- Höchstens eine Frage je Nachricht, jede mit Schaltflächen und frei
  beantwortbar. „Wir sind mit Kinderwagen und nur heute da“ füllt zwei
  Merkmale auf einmal.
- Jede Frage lässt sich überspringen, und „Gleich Vorschläge zeigen“ steht
  immer bereit. Wer wenig fragen will, soll nicht müssen (KA [00:15:51]).
- Das Ergebnis nennt den verstandenen Bedarf in einem Satz („Für euch mit
  Kindern, nur heute, bei Regen:“) und schlägt höchstens drei gesicherte Ziele
  vor.
- Findet sich nichts Gesichertes, sagt der Prototyp das und verweist auf das,
  was am Schalter ausliegt, etwa die Almenübersicht mit Ausgangspunkten und
  Höhen (KA [00:12:01]).
- Der Zustand steckt wie bisher in der Knoten-ID (`bedarf:i=berge,d=heute`).
  Gleiche Eingaben ergeben gleiche Antworten, die Tests bleiben vergleichbar.

**Dateien:** neu `bedarf.ts`, `verstehen.ts`, `chat-flow.ts` (`getNode`)

### AP-D: Aktuelle Hinweise wie die Rundmail

**Warum:** KA [00:18:32] „alle müssen das gleiche Wissen haben“, dazu der SEV
als tägliche Frage.

- Neue Datei mit Meldungen, je mit Quelle und Stand: Schienenersatzverkehr
  wegen Gleisbau bei Eisenärzt, Almen meist bis 19. Oktober, Unternberg bei
  Regen ohne Betrieb, Rauschbergbahn ohne Fahrbetrieb.
- Eine Meldung erscheint einmal je Gespräch als eigene Hinweiskarte, sobald
  ihr Thema berührt wird. Beim Fahrplan steht der SEV-Hinweis also direkt über
  der Tabelle.
- „Gibt es aktuelle Hinweise?“ oder „Sperrungen“ zeigt alle.

**Dateien:** neu `meldungen.ts`, `use-chat.ts`, `message-item.tsx`

### AP-E: Tägliche Fragen und Weiterverweis

**Warum:** KA [00:07:59] bis [00:08:28], [00:09:56] bis [00:11:22].

- Zugticket: gibt es nicht in der TI, sondern im Zug.
- Zugausfall und Beschwerde über Bahn oder Ersatzbus: Bahnschalter Traunstein,
  Bayerische Regiobahn.
- Ziele außerhalb (Salzburg, Berchtesgaden, Kehlsteinhaus, Chiemsee, München,
  Kitzbühel): offen sagen, dass das außerhalb liegt, die zuständige
  Tourist-Information nennen und als Kartensuche mitgeben. Fahrplanfragen
  dorthin gehen weiter an den Fahrplan.
- Veranstaltungskarten: Vorverkauf in der TI oder online, telefonisch keine
  Reservierung.
- Ortsplan: Aufstellort, Wege von hier, Kartenlink, Hinweis auf den gedruckten
  Ortsplan am Schalter.
- Toilette: offen, dass der Ort nicht hinterlegt ist. `DATEN:`-Platzhalter für
  den Autor.
- Der allgemeine Fallback verweist zusätzlich auf den Schalter mit
  Öffnungszeiten, statt nur um andere Worte zu bitten.

**Dateien:** neu `service.ts`, `verstehen.ts`, `fallback.ts`

### AP-F: Merkzettel zum Mitnehmen

**Warum:** KA [00:28:47] „auf seinem Zettel die Antworten“, M [00:24:34],
[00:26:09], [00:58:14].

- Unter jedem Ziel und jeder Fahrplanauskunft: „Auf meinen Zettel“.
- Kopfzeile zeigt den Zettel mit Anzahl der Einträge.
- Ausgabe auf drei Wegen: Drucken, per E-Mail, aufs Handy (QR-Code mit dem
  Text des Zettels). Drucken und E-Mail sind simuliert und sagen das. Beide
  melden den Status, bevor das Ergebnis erscheint („Einen Moment, ich drucke
  deinen Zettel aus.“).
- Auf dem Zettel steht nur, was der Gast gesammelt hat, nicht der
  Chatverlauf. Jede Zeile trägt ihren Stand.
- Freitext: „druck mir das aus“, „schreib mir das auf“, „schick mir das per
  Mail“.
- Eine eingegebene E-Mail-Adresse wird nicht gespeichert und im Protokoll
  maskiert.

**Dateien:** neu `zettel.ts`, `use-chat.ts`, `chat-header.tsx`,
`message-item.tsx`, `verstehen.ts`

### AP-G: Einstieg

**Warum:** KA [00:14:27], [00:15:26], [00:30:27]. Nicht alles auf einmal, den
Gast zuerst fragen und orientieren.

- Die Begrüßung lädt ein zu sagen, was man vorhat.
- Statt neun Themen stehen am Start: „Was kann ich hier unternehmen?“,
  „Ortsplan & Orientierung“, „Bahn & Bus“, „Aktuelle Hinweise“ und „Alle
  Themen“. Das Themenmenü bleibt über „Alle Themen“ erreichbar.
- Der Dank-Knoten sagt, dass man gern wiederkommen kann.

---

## 5. Bewusst nicht umgesetzt

| Punkt | Grund |
| --- | --- |
| Buchung von Tickets, Unterkunft, Rufbus | Außerhalb des Scopes (CLAUDE.md, „Buchungs-, Ticket- und Bezahlprozesse“). Der Prototyp verweist nur. |
| Sprachein- und -ausgabe, Avatar (M [00:10:33]) | Als Anforderung in Kapitel 3 aufnehmen, im Mockup in 4.4 als Grenze ausweisen. |
| Gastgeber und Einheimische als Nutzergruppen (KA [00:03:20]) | Anderer Nutzerkreis, nicht Gegenstand. |
| Anrede „Sie“ statt „du“ | Frau Amort siezt, die Kundschaft am Schalter ist älter (M [00:19:46]). Das ist eine Gestaltungsentscheidung des Autors und betrifft jeden Antworttext. **Offen, siehe 6.** |
| Gedruckter Ortsplan als Datei | Keine freigegebene Datei vorhanden. Der Prototyp verweist auf den Plan am Schalter. |

## 6. Offen für den Autor

1. ~~Du oder Sie?~~ Entschieden am 23.09.: Sie.
2. ~~Toilette~~ Geklärt am 23.09.: im Bahnhofsgebäude neben der TI.
3. **SEV:** Zeitraum und Abfahrtsstelle der Ersatzbusse erfragen. Bis dahin
   verweist der Hinweis auf die Bayerische Regiobahn.
4. ~~Kirche mit Überblick~~ Der Wanderflyer nennt die Pfarrkirche St. Georg
   am Kapellen- & Marterlweg, der Ortsplan führt sie in L10.
5. **Unternberg nach dem 14.09.:** Die Quelle nennt Sommerbetriebszeiten bis
   14.09. Ob und wie die Sesselbahn danach fährt, ist nicht belegt.
6. **Kapitel 3:** Der Absatz in 3.1, dass das Interview mit der Theke nicht
   zustande gekommen ist, stimmt seit dem 22.09. nicht mehr. Die Theke ist
   jetzt vierte Datenquelle.

## 7. Umsetzungsstand (23.09.2026)

Alle Pakete AP-A bis AP-G sind auf dem Branch `amort-arbeitsweise` umgesetzt,
nicht committet. Prüfung: `bun test` 199 grün (davon 55 neu in
`src/lib/interviews.test.ts`), `bun run typecheck` und `bun run build`
sauber. `bun run lint` meldet drei Fehler in `src/components/ui/`, die schon
vor dem Umbau bestanden. Im Browser durchgeklickt: Bedarfsklärung mit
Freitext, Regen-Umschalter, Fahrplan mit Ersatzverkehr-Hinweis, Zettel mit
Druck.

## 8. Zweite Runde (23.09.2026): Vorgaben des Autors

Vorgaben: Anrede Sie. Toilette im Bahnhofsgebäude neben der Tourist-Info.
Ablauf je Vorschlag: Gespräch, Vorschlag, Details (für wen geeignet,
Grenzen, worauf achten), Google-Maps-Link, dann genau ein passender Flyer
mit zwei Fragen: kostenlos dazu? digital (QR-Code, eigener Rahmen) oder
gedruckt (Eingangsbereich der TI, auch außerhalb der Öffnungszeiten)?
Öffnungszeiten nie nennen, sondern an die TI verweisen oder eine belegte
Betreibernummer nennen. Lieber keinen Betreiber nennen als einen falschen.

Quellen: die fünf Flyer aus dem Prospektportal (`src/lib/flyer.ts`), alle
gelesen am 23.09.2026. Jede Zahl im Zielregister stammt daraus und wurde per
Skript gegen den Flyertext geprüft.

Umgesetzt:

- **Zielregister neu** (`ziele.ts`): 9 Wanderwege, 7 Gipfeltouren, 4
  Radtouren, 3 Almen und die Ziele im Ort, jeweils mit Flyer, Eckdaten,
  „Geeignet für“, „Worauf achten“. Schwierigkeit nur, wo der Flyer eine
  nennt. Beim Hochfelln keine Höhe, weil der Flyer sich widerspricht
  (1.674 m / 1.664 m).
- **Detailauskunft** (`empfehlung.ts`): Beschreibung, Eignung, Grenzen,
  Hinweis zu Öffnungszeiten mit Telefon und Zeiten der TI, Quellenzeile,
  Karten-QR, danach die Flyerfrage.
- **Flyerfrage** (`flyer.ts`): Ja/Nein auch getippt, dann digital oder
  gedruckt. Der Flyer-QR hat einen eigenen Rahmen und ein Dokumentsymbol,
  der Weg-QR eine Ortsnadel.
- **Radfahren** als Interesse, dazu die beiden Radverleihe aus dem Radflyer
  mit Telefonnummer. Das sind die einzigen Betreibernummern im Prototyp.
- **Kinderwagen** wird eigens erkannt. Dann nur Wege, die der Flyer als
  kinderwagentauglich nennt: Sagenweg, Taubensee, Schwarzachen Alm.
- **Toilette** laut Autor im Bahnhofsgebäude neben der TI, im Ortsplan Feld
  N9 bestätigt.
- **Ortsplan**: Planquadrate aus dem Flyerverzeichnis, dazu das Angebot des
  Ortsplans als Flyer.
- **Anrede Sie** in allen deutschen Texten, per Test abgesichert.

Beim Gegenprüfen korrigiert:

- Die Wegangaben pro Standort waren Platzhalter aus der ersten Version. Eine
  davon war falsch: von der TI zum Bahnhof „10 Gehminuten“, obwohl beide im
  Bahnhofsgebäude liegen. Jetzt stehen nur belegte Angaben da, und Sätze
  mit unbekannter Entfernung fallen weg.
- Wegenetz 240 km laut Wanderflyer, nicht 250 km.
- Freizeitpark laut Ortsplan „bei jeder Witterung“, wird bei Regen also
  nicht mehr ausgeschlossen.
- Erfundenes Wochenprogramm, Drei-Tages-Prognose und Webcam-Standorte
  entfernt.
- Sonntagshorn: Anforderungen jetzt laut Flyer, mit Kletterkönnen I bis II.
- Zeitbezug ohne Aussagen darüber, was gerade geöffnet hat.
- Hinweise erscheinen nur noch bei den Knoten, zu denen sie gehören.

Offen:

- Weitere Gehzeiten ab den drei Aufstellorten (`location.ts`, `DATEN:`).
- Zeitraum und Abfahrtsstelle des Ersatzverkehrs (6.3).
- Unternberg nach dem 14.09. (6.5).

Prüfung: `bun test` 218 grün, Typecheck und Build sauber. Im Browser
durchgeklickt: Bedarfsklärung mit Kinderwagen, Zielwahl Sagenweg,
Detailauskunft, Karten-QR, Flyerfrage, digitaler Flyer.

## 9. Testlauf des Autors (23.09.2026, 11:58)

Befund: Die Schaltflächen tragen den Dialog gut, die freie Eingabe ist
sperrig. Der Verweis an die Tourist-Information wird positiv gesehen.

| Eingabe im Protokoll | vorher | jetzt |
| --- | --- | --- |
| Klicks: Berge, nur heute, mit Kindern, geübt | 1. Vorschlag Staubfall (16,5 km, 5 h, trittsicher) | Staubfall nicht mehr mit Kindern, leichte Touren und kürzere zuerst: Zinnkopf |
| „ich will den Flyer ausgedruck“ (nach digital) | nicht verstanden | gedruckter Flyer |
| „Flyer in ausgedruckter form“ | nicht verstanden | gedruckter Flyer |
| „spazierengehen“ auf „Was interessiert Sie?“ | Sprung in den Themenknoten | bleibt in der Klärung (zu Fuß, gemütlich) |
| „ja gern“ auf „Darf ich Ihnen ein paar Fragen stellen?“ | nicht verstanden | startet die Klärung, „nein“ zeigt gleich Vorschläge |

Zusätzlich:

- Der zuletzt angebotene Flyer bleibt im Gesprächszustand. „Den Flyer
  bitte gedruckt“ funktioniert auch Schritte später. Ohne angebotenen Flyer
  zeigt „haben Sie Flyer?“ die fünf zur Auswahl.
- Unter dem digitalen Flyer steht „Doch lieber gedruckt“, unter dem
  gedruckten „Doch lieber digital“.
- Unverstandene Eingaben mitten im Ablauf lassen die Schaltflächen der
  vorigen Frage stehen und den Gesprächszustand unverändert. Vorher
  verschwanden sie, und der Gast war aus dem Faden.
- Findet die Bedarfserkennung nichts, hilft das Themenlexikon bei der Frage
  nach dem Interesse.
- `scripts/protokoll-nachspielen.ts` baut den Zustand jetzt wie die App auf.
  Ergebnis für dieses Protokoll: 5 von 6 freien Eingaben zugeordnet (vorher
  3), keine schlechter.

## 10. Testlauf des Autors (23.09.2026, 12:06)

| Eingabe | vorher | jetzt |
| --- | --- | --- |
| „Ortplan“ in der Flyerauswahl | nicht verstanden | Ortsplan (Vertipper-Toleranz für Flyernamen) |
| „welche flyer gibt es“ mit gemerktem Ortsplan | wieder der Ortsplan | die Auswahl aller fünf |
| „nein ich will andere flyer“ (dreimal) | jedes Mal der Ortsplan | die Auswahl |

Zusätzlich:

- Flyer lassen sich beim Namen wählen, auch mitten im Flyerdialog („den
  Almflyer bitte“, „lieber den Radflyer digital“).
- „Ich möchte radfahren“ führt in die Bedarfsklärung mit Interesse Rad.
  Vorher blieb es ohne Treffer.
- Ursache für „Ortplan“: Die Stammbildung schnitt das End-„n“ ab
  („ortpla“), damit lag das Wort außerhalb der Toleranz. Die Toleranz für
  Flyernamen vergleicht jetzt das ungekürzte Wort. Allgemeine Wörter wie
  „Rad“ oder „Wander“ werden nur exakt verglichen, sonst las die Toleranz
  „andere“ als „wander“.

Nachgespielt: 9 von 10 freien Eingaben zugeordnet. Das „gern“ ist jetzt
eine Antwort auf „digital oder gedruckt?“, weil „Ortplan“ direkt zur
Flyerfrage führt. Dort bleibt es mehrdeutig, und die Rückfrage lässt die
Schaltflächen stehen.

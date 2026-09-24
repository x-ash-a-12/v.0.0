# Quellen der Prototyp-Daten

Erzeugt am 3. September 2026. Maßgeblich ist der Code in `src/lib/daten.ts`,
diese Liste ist eine Lesehilfe zum Gegenprüfen.

Jeder Wert unten wurde im Volltext der genannten Seite nachgelesen, nicht aus
einem Suchergebnis übernommen.

Nicht aufgeführt sind die beiden Fußnotentexte der Karten
(`TOURIST_INFO.kartenhinweis`, `BERGBAHNEN.kartenhinweis`). Sie sind keine
Angaben über Ruhpolding, sondern Hinweise auf den Stand der Daten.

Belegt: 55. Offen geblieben: 55.

Nachgetragen am 3. September 2026: die Fahrplandaten in `src/lib/fahrplan.ts`
und die Buslinien in `ANREISE`. Sie stehen in einer eigenen Tabelle am Ende
dieser Datei, weil sie anders als die übrigen Werte zur Laufzeit gerechnet
werden und ein Ablaufdatum haben.

| Block | Wert | Angabe | Quelle | Abgerufen |
|---|---|---|---|---|
| TOURIST_INFO | adresse | Bahnhofstraße 8, 83324 Ruhpolding | https://www.ruhpolding.de/kontakt | 2026-09-03 |
| TOURIST_INFO | telefon | +49 (0) 8663 88060 | https://www.ruhpolding.de/kontakt | 2026-09-03 |
| TOURIST_INFO | email | tourismus@ruhpolding.de | https://www.ruhpolding.de/kontakt | 2026-09-03 |
| TOURIST_INFO | oeffnungszeiten | Mo bis Fr 9 bis 17 Uhr, Sa 9 bis 12 Uhr | https://www.ruhpolding.de/kontakt | 2026-09-03 |
| BERGBAHNEN | rauschbergName | Rauschberg | https://www.ruhpolding.de/rauschberg-bahn | 2026-09-03 |
| BERGBAHNEN | unternbergName | Unternberg | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | unternbergBahn | Sesselbahn | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | unternbergBahnEn | chairlift | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | unternbergErwachsen | 19,50 € | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | kinderAlter | 5 bis 17 Jahre | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | ermaessigungKinder | 13,00 € | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | betriebSommerVon | 10 | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | betriebSommerBis | 18 | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| BERGBAHNEN | letzteBergfahrt | 17:30 | https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/ | 2026-09-03 |
| WANDERN | sonntagshorn | Sonntagshorn | https://www.ruhpolding.de/sonntagshorn-1961-m | 2026-09-03 |
| WANDERN | sonntagshornHoehe | 1.961 m | https://www.ruhpolding.de/sonntagshorn-1961-m | 2026-09-03 |
| WANDERN | sonntagshornGehzeit | 9 Stunden | https://www.ruhpolding.de/sonntagshorn-1961-m | 2026-09-03 |
| WANDERN | sonntagshornStart | Wanderparkplatz Holzknechtmuseum / Laubau | https://www.ruhpolding.de/sonntagshorn-1961-m | 2026-09-03 |
| PARKEN | rathaus | Rathaus Tiefgarage | https://www.ruhpolding-rathaus.de/parkplaetze-im-zentrum | 2026-09-03 |
| PARKEN | rathausTarif | 1,00 € pro Stunde | https://www.ruhpolding-rathaus.de/parkplaetze-im-zentrum | 2026-09-03 |
| PARKEN | laubau | Wanderparkplatz Laubau | https://www.ruhpolding-rathaus.de/wanderparkplaetze | 2026-09-03 |
| PARKEN | laubauTarif | Tagesticket 9,00 € | https://www.ruhpolding-rathaus.de/wanderparkplaetze | 2026-09-03 |
| PARKEN | wohnmobile | Hauptstraße 75, bis 24 h 10,00 € | https://www.ruhpolding-rathaus.de/parkplaetze-im-zentrum | 2026-09-03 |
| ANREISE | autobahn | A8 | https://www.ruhpolding.de/anreise-nach-ruhpolding | 2026-09-03 |
| ANREISE | ausfahrt | Siegsdorf Ost / Traunstein | https://www.ruhpolding.de/anreise-nach-ruhpolding | 2026-09-03 |
| ANREISE | fahrzeitAbAusfahrt | rund 8 km | https://www.ruhpolding.de/anreise-nach-ruhpolding | 2026-09-03 |
| ANREISE | fahrzeitAbAusfahrtEn | about 8 km | https://www.ruhpolding.de/anreise-nach-ruhpolding | 2026-09-03 |
| ANREISE | ortsbusLinie | Linien 9532 und 9533 | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | gaestekarteName | Chiemgau Karte | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | gaestekarteBahnBis | Traunstein | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| WINTER | skigebiet | Westernberg | https://www.ruhpolding.de/ski-alpin | 2026-09-03 |
| EVENTS | chiemgauArena | Chiemgau Arena | https://www.chiemgau-arena.de/ | 2026-09-03 |
| EVENTS | biathlonKurz | Biathlon-Weltcup | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| EVENTS | biathlonKurzEn | biathlon world cup | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| EVENTS | biathlonName | LaVita IBU World Cup Biathlon | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| EVENTS | biathlonMonat | im Januar | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| EVENTS | biathlonMonatEn | in January | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| EVENTS | biathlonTermin | vom 4. bis 10. Januar 2027 | https://www.biathlonworld.com/venue/RUH | 2026-09-03 |
| GASTRONOMIE | gasthausPost | Hotel zur Post Restaurant | https://www.ruhpolding.de/gaststaetten-und-restaurants | 2026-09-03 |
| GASTRONOMIE | pizzeria | Pizzeria Eiscafé „Made in Italy“ | https://www.ruhpolding.de/gaststaetten-und-restaurants | 2026-09-03 |
| GASTRONOMIE | hotelGehoben | Steinbach | https://www.ruhpolding.de/gaststaetten-und-restaurants | 2026-09-03 |
| GASTRONOMIE | almstueberl | Unternberg Alm | https://www.ruhpolding.de/gaststaetten-und-restaurants | 2026-09-03 |
| GASTRONOMIE | maiers | Restaurant Maiers | https://www.ruhpolding.de/maiergschwendt | 2026-09-23 |
| GASTRONOMIE | haeusler | Beim Häusler | https://www.ruhpolding.de/beim-haeusler-1 | 2026-09-23 |
| GASTRONOMIE | ruhpoldingerHof | Ruhpoldinger Hof | https://www.ruhpolding.de/ruhpoldinger-hof | 2026-09-23 |
| GASTRONOMIE | fischerwirt | Fischerwirt | https://www.ruhpolding.de/fischerwirt | 2026-09-23 |
| GASTRONOMIE | weingarten | Berggasthaus Weingarten | https://www.ruhpolding.de/gasthof-weingarten | 2026-09-23 |
| GASTRONOMIE | butznwirt | Butz'n Wirt | https://www.ruhpolding.de/butznwirt-1 | 2026-09-23 |
| GASTRONOMIE | holzstube | Holzstube am Maibaum | https://www.ruhpolding.de/holzstube-steakhouse-pub-1 | 2026-09-23 |
| GASTRONOMIE | pizzaCo | Pizza & Co | https://www.ruhpolding.de/pizza-co | 2026-09-23 |
| GASTRONOMIE | bellPonte | Bell Ponte | https://www.ruhpolding.de/bell-ponte | 2026-09-23 |
| GASTRONOMIE | safran | Safran Indisches Restaurant | https://www.ruhpolding.de/safran-indisches-restaurant | 2026-09-23 |
| FAMILIE | freizeitpark | Freizeitpark Ruhpolding | https://www.freizeitpark.by/ | 2026-09-03 |
| FAMILIE | vitalwelt | Vita Alpina | https://www.ruhpolding.de/bei-regen | 2026-09-03 |
| FAMILIE | heimatmuseum | Heimatmuseum Ruhpolding | https://www.ruhpolding.de/bei-regen | 2026-09-03 |

## Offen geblieben

Diese Werte sind weiterhin fiktiv. Sie stehen unverändert im Code und sind
dort mit `@ungeprueft` markiert.

| Block | Wert | Grund |
|---|---|---|
| BERGBAHNEN | rauschbergBahn | Bauart nicht belegt, die Bahn ist außer Betrieb. |
| BERGBAHNEN | rauschbergBahnEn | siehe rauschbergBahn |
| BERGBAHNEN | rauschbergErwachsen | kein Fahrbetrieb, es gibt derzeit keinen Preis. |
| BERGBAHNEN | ermaessigungGaestekarte | Die Quelle nennt nur die Ruhpoldinger Bürgerkarte mit 50 %, keine Ermäßigung auf die Gästekarte. Siehe Bericht. |
| WANDERN | wegenetzKm | Keine offizielle Gesamtangabe gefunden. Weder die Wanderübersicht noch die Wegeliste nennt eine Kilometersumme. Ohne "rund", das Wort steht im Antworttext. |
| WANDERN | foerchensee | auf den geprüften Seiten nicht namentlich genannt |
| WANDERN | foerchenseeRunde | kein Rundweg am Förchensee mit Längenangabe gefunden |
| WANDERN | uferwegTraun | Ein reiner Uferweg ist nicht belegt. Die Wegeliste führt "Traunauen und Taubensee" mit 8,6 km und 02:15 h, was nicht dasselbe ist. |
| PARKEN | vitalwelt | Ein Parkhaus an der Vitalwelt steht weder in der Liste der Zentrumsparkplätze noch bei den Wanderparkplätzen. Der Wohnmobilplatz P1 liegt laut Gemeinde "Richtung Schwimmbad". |
| PARKEN | vitalweltTarif | siehe vitalwelt |
| PARKEN | gaestekarteHinweis | Die Gemeindeseiten sagen nichts über kostenloses Parken mit Gästekarte. Ermäßigt wird nur mit der Ruhpoldinger Bürgerkarte, und die ist für Einheimische. Siehe Bericht. |
| ANREISE | bundesstrasse | Die Quelle nennt keine Straßennummer, sondern nur die Entfernung ab der Ausfahrt. |
| ANREISE | bahnTakt | kein Takt belegt |
| ANREISE | bahnTaktEn | siehe bahnTakt |
| ANREISE | bahnAbfahrtsort | Belegt ist nur die Strecke Traunstein–Ruhpolding der Bayerischen Regiobahn, nicht eine Fahrt ab München. |
| ANREISE | bahnFahrzeit | keine Fahrzeit belegt |
| ANREISE | bahnFahrzeitEn | siehe bahnFahrzeit |
| ANREISE | bahnhofZumZentrum | keine Angabe zur Entfernung Bahnhof–Zentrum gefunden |
| ANREISE | bahnhofZumZentrumEn | siehe bahnhofZumZentrum |
| ANREISE | ortsbusTakt | Für die Dorflinie ist kein Takt belegt. Der Rufbus DORLI fährt laut Quelle "ohne festen Fahrplan", Mo bis Fr 07:00 bis 22:00 Uhr. |
| LOIPEN | netz | keine offizielle Gesamtlänge des Netzes gefunden |
| LOIPEN | spurarten | Spurarten auf der Langlaufseite nicht ausgewiesen |
| LOIPEN | passTag | kein Preis für einen Loipenpass gefunden |
| LOIPEN | passWoche | siehe passTag |
| LOIPEN | gaestekarte | keine Angabe, ob die Chiemgau Karte die Loipen einschließt |
| WINTER | sportgeschaeft | Die Skiseite nennt keine Verleihbetriebe namentlich. In der Suche taucht "Sport Plenk" auf, aber nicht im Volltext einer offiziellen Seite. Siehe Bericht. |
| WINTER | langlaufShop | siehe sportgeschaeft |
| EVENTS | kurpark | Ort auf keiner geprüften Seite namentlich belegt |
| EVENTS | rathausplatz | Ort auf keiner geprüften Seite namentlich belegt |
| EVENTS | skibusTakt | kein Skibus zur Arena und kein Takt belegt |
| EVENTS | sommerkonzerte | Veranstaltung auf den geprüften Seiten nicht belegt |
| EVENTS | sommerkonzerteEn | siehe sommerkonzerte |
| EVENTS | sommerkonzerteZeit | kein Zeitraum und keine Uhrzeit belegt |
| EVENTS | sommerkonzerteZeitEn | siehe sommerkonzerteZeit |
| EVENTS | wochenmarkt | Wochenmarkt auf den geprüften Seiten nicht belegt |
| EVENTS | wochenmarktEn | siehe wochenmarkt |
| EVENTS | wochenmarktZeit | kein Wochentag und keine Uhrzeit belegt |
| EVENTS | wochenmarktZeitEn | siehe wochenmarktZeit |
| GASTRONOMIE | gipfelalm | Keine "Gipfelalm" in der Betriebsliste. Der Antworttext verortet sie zudem auf dem Rauschberg, dessen Bahn nicht fährt. |
| GASTRONOMIE | weitseealm | keine "Weitseealm" in der Betriebsliste |
| GASTRONOMIE | laubaualm | keine "Laubaualm" in der Betriebsliste |
| GASTRONOMIE | ruhetage | die Seite weist keine festen Ruhetage aus |
| FAMILIE | freizeitparkOeffnung | Die Betreiberseite verlinkt "Preise & Öffnungszeiten", die Unterseite war nicht erreichbar. |
| FAMILIE | freizeitparkOeffnungEn | siehe freizeitparkOeffnung |
| FAMILIE | barfussweg | kein Barfußweg auf den geprüften Seiten belegt |
| FAMILIE | barfusswegEn | siehe barfussweg |
| FAMILIE | bergbahnMuseum | Kein Bergbahn-Museum in der Museumsliste. Belegt sind Holzknechtmuseum, Heimatmuseum und Glockenschmiede. |
| FAMILIE | bergbahnMuseumEn | siehe bergbahnMuseum |
| FAMILIE | kletterhalle | Die Schlechtwetterseite nennt keine Kletterhalle. Als Indoor-Ziel der Umgebung führt sie den Babalu Funpark Traunstein. |
| FAMILIE | kletterhalleFahrzeit | siehe kletterhalle |
| UNTERKUNFT | hoechsteKategorie | Die höchste in der Gastgeberliste ausgewiesene Kategorie sind drei Sterne, etwa "Hotel Alp Inn S". Ein Haus mit vier Sternen kommt dort nicht vor. |
| UNTERKUNFT | hoechsteKategorieEn | siehe hoechsteKategorie |
| UNTERKUNFT | hoefeAnzahl | Keine Gesamtzahl der Höfe genannt, die Liste führt sie einzeln auf. Steht am Satzanfang, deshalb groß geschrieben. |
| UNTERKUNFT | zertifizierung | "Reisen für Alle" wird auf der Gastgeberseite nicht erwähnt |
| UNTERKUNFT | barrierefreiHaeuser | Keine Aufstellung barrierefreier Häuser gefunden. Als barrierefrei ausgewiesen ist dort die Ferienwohnung "Berg & Wiese". |


## Fahrpläne und Buslinien

Nachgetragen am 3. September 2026.

| Block | Wert | Angabe | Quelle | Abgerufen |
|---|---|---|---|---|
| fahrplan.ts | NACH_TRAUNSTEIN | 18 Abfahrten Ruhpolding–Traunstein, Fahrzeit 24 Min. | https://download.transdev.de/transdev/uploads/bb/schedule/2124/fahrplan-traunstein-ruhpolding-14-12-2025-12-12-2026.pdf | 2026-09-03 |
| fahrplan.ts | RE5_SALZBURG | 17 Anschlusszeiten ab Traunstein Richtung Salzburg/Freilassing | dieselbe Quelle | 2026-09-03 |
| fahrplan.ts | RE5_MUENCHEN | 17 Anschlusszeiten ab Traunstein Richtung Rosenheim/München | dieselbe Quelle | 2026-09-03 |
| fahrplan.ts | Linie | RB 53, gültig 14.12.2025 bis 12.12.2026 | dieselbe Quelle | 2026-09-03 |
| ANREISE | dorflinie9532 | Westernberg – … – Edeka | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | dorflinie9533 | Bahnhof Ruhpolding – … – Chiemgau Arena | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | rufbusName | DORLI | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | rufbusWerktags | 07:00 bis 22:00 Uhr | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | rufbusWochenende | 08:00 bis 22:00 Uhr | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |
| ANREISE | regionalZiele | Reit im Winkl, Inzell, Bad Reichenhall, Berchtesgaden | https://www.ruhpolding.de/mobilitaet-vor-ort | 2026-09-03 |

### Was an diesen Daten nicht belegt ist

**Verkehrstage.** Der gedruckte Fahrplan unterscheidet Montag bis Freitag,
Samstag sowie Sonn- und Feiertage, gibt die Zuordnung aber über Spaltenbreiten
an, die sich aus dem PDF nicht verlässlich zurücklesen lassen. Aufgenommen ist
deshalb der Grundtakt, den alle Verkehrstage teilen; Fahrten mit Sondervermerk
sind ausgelassen. Jede Fahrplanausgabe des Prototyps weist das in ihrer
Fußnote aus und verweist auf brb.de.

**Takt der Dorflinien.** Ruhpolding Tourismus veröffentlicht die Strecken der
Linien 9532 und 9533, aber keine Abfahrtszeiten. Der Prototyp erfindet keine,
sondern nennt die Strecken und verweist auf den Aushang an den Haltestellen.

**Öffnungszeiten der Gastronomie.** Für die einzelnen Gasthäuser ist keine
offizielle Angabe zu finden. Sie tragen deshalb kein `oeffnung`-Feld, und der
Prototyp sagt zu ihnen nichts über Offen oder Zu. Belegt sind nur die
Betriebszeiten der Bergbahnen, die Öffnung des Freizeitparks und die der
Tourist-Information.

**Beliebtheit.** Die Hervorhebung eines Vorschlags als beliebtester steht fest
in `GRUPPEN` und ist nicht erhoben. Im Code als SIMULIERT gekennzeichnet.

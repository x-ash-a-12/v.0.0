/**
 * Alle Fakten über Ruhpolding an einer Stelle.
 *
 * Jeder Block nennt im Kopf seine Quelle und das Abrufdatum. Werte ohne
 * eigene Markierung stammen von dort und wurden im Volltext der Seite
 * nachgelesen.
 *
 * Werte mit @ungeprueft sind weiterhin fiktiv: für sie war keine offizielle
 * Angabe zu finden. Der Grund steht jeweils daneben. Suchen mit:
 *   grep -n "@ungeprueft" src/lib/daten.ts
 *
 * Felder mit der Endung En sind die englische Fassung derselben Angabe,
 * für die Sprachumschaltung. Ändert sich der Wert, ändern sich beide.
 *
 * Tagesaktuelle Angaben (Wetter, Prognose, Schneelage, Wochenprogramm)
 * stehen bewusst nicht hier. Sie sind in chat-flow.ts mit "SIMULIERT:"
 * gekennzeichnet, weil sie ohne Datenanbindung gar nicht echt sein können.
 */

/**
 * Tourist-Information Ruhpolding, Kontakt und Öffnungszeiten.
 * Quelle: https://www.ruhpolding.de/kontakt
 * Abgerufen: 2026-09-03
 *
 * Die Seite nennt eine einzige Fassung der Öffnungszeiten, ohne zwischen
 * Haupt- und Nebensaison zu unterscheiden.
 */
export const TOURIST_INFO = {
  adresse: "Bahnhofstraße 8, 83324 Ruhpolding",
  telefon: "+49 (0) 8663 88060",
  email: "tourismus@ruhpolding.de",
  oeffnungszeiten: "Mo bis Fr 9 bis 17 Uhr, Sa 9 bis 12 Uhr",
  /** Fußnote der Kontaktkarte, nennt jetzt den Stand statt des Demo-Status. */
  kartenhinweis: "Stand: 3. September 2026, Angaben ohne Gewähr.",
} as const

/**
 * Bergbahnen Ruhpolding, Sommerbetrieb.
 *
 * Quelle Unternberg: https://meinebergwelt.de/preise-oeffnungszeiten-sessellift/
 * Quelle Rauschberg: https://www.ruhpolding.de/rauschberg-bahn
 * Abgerufen: 2026-09-03
 *
 * ACHTUNG: Die Rauschbergbahn fährt nicht. Die Betreiberseite von Ruhpolding
 * Tourismus schreibt: "Aufgrund eines geplanten Neubaus der Rauschbergbahn ist
 * auf unbestimmte Zeit kein Fahrbetrieb möglich." Es gibt dort folglich weder
 * Preise noch Betriebszeiten. Die frühere Betreiberdomain rauschbergbahn.com
 * leitet inzwischen auf eine fremde Seite um und ist keine Quelle mehr.
 *
 * Die Sommerbetriebszeiten des Unternbergs gelten laut Quelle für den
 * Zeitraum 29. Juni bis 14. September.
 */
export const BERGBAHNEN = {
  rauschbergName: "Rauschberg",
  /** @ungeprueft Bauart nicht belegt, die Bahn ist außer Betrieb. */
  rauschbergBahn: "Gondelbahn",
  /** @ungeprueft siehe rauschbergBahn */
  rauschbergBahnEn: "gondola",
  unternbergName: "Unternberg",
  /** Ruhpolding Tourismus führt sie als "Unternberg Sesselbahn". */
  unternbergBahn: "Sesselbahn",
  unternbergBahnEn: "chairlift",
  /** @ungeprueft kein Fahrbetrieb, es gibt derzeit keinen Preis. */
  rauschbergErwachsen: "24,00 €",
  /** Berg- und Talfahrt Erwachsene. */
  unternbergErwachsen: "19,50 €",
  /** Die Quelle fasst Kinder und Jugendliche zusammen. */
  kinderAlter: "5 bis 17 Jahre",
  /** Eigener Preis statt Prozentsatz: Berg- und Talfahrt 13,00 €. */
  ermaessigungKinder: "13,00 €",
  /**
   * @ungeprueft Die Quelle nennt nur die Ruhpoldinger Bürgerkarte mit 50 %,
   * keine Ermäßigung auf die Gästekarte. Siehe Bericht.
   */
  ermaessigungGaestekarte: "20 % Ermäßigung",
  /*
   * Zeiten ohne Sprachbestandteil, damit die deutsche und die englische
   * Fassung sie gleichermaßen einsetzen können.
   */
  betriebSommerVon: "10",
  betriebSommerBis: "18",
  /** Die Quelle schreibt "halbe Stunde vor Schließung", also 17:30 Uhr. */
  letzteBergfahrt: "17:30",
  /** Fußnote der Preiskarte. */
  kartenhinweis:
    "Unternberg, Stand 3. September 2026. Für den Rauschberg gibt es wegen des Bahnneubaus derzeit keinen Fahrbetrieb.",
} as const

/**
 * Wandern in Ruhpolding.
 * Quelle: https://www.ruhpolding.de/sonntagshorn-1961-m
 * Abgerufen: 2026-09-03
 *
 * Geprüft, aber ohne Angabe geblieben: https://www.ruhpolding.de/wandern und
 * https://www.ruhpolding.de/schoensten-wander-spazierwege nennen weder eine
 * Gesamtlänge des Wegenetzes noch einen Rundweg am Förchensee.
 */
export const WANDERN = {
  /**
   * @ungeprueft Keine offizielle Gesamtangabe gefunden. Weder die
   * Wanderübersicht noch die Wegeliste nennt eine Kilometersumme.
   * Ohne "rund", das Wort steht im Antworttext.
   */
  wegenetzKm: "250 km",
  /** @ungeprueft auf den geprüften Seiten nicht namentlich genannt */
  foerchensee: "Förchensee",
  /** @ungeprueft kein Rundweg am Förchensee mit Längenangabe gefunden */
  foerchenseeRunde: "etwa 3 km, eben",
  /**
   * @ungeprueft Ein reiner Uferweg ist nicht belegt. Die Wegeliste führt
   * "Traunauen und Taubensee" mit 8,6 km und 02:15 h, was nicht dasselbe ist.
   */
  uferwegTraun: "Uferweg entlang der Traun",
  sonntagshorn: "Sonntagshorn",
  sonntagshornHoehe: "1.961 m",
  /** Die Quelle gibt "09:00 Stunden" für die Tour ab Laubau an. */
  sonntagshornGehzeit: "9 Stunden",
  sonntagshornStart: "Wanderparkplatz Holzknechtmuseum / Laubau",
} as const

/**
 * Parken in Ruhpolding.
 * Quelle Zentrum: https://www.ruhpolding-rathaus.de/parkplaetze-im-zentrum
 * Quelle Wanderparkplätze: https://www.ruhpolding-rathaus.de/wanderparkplaetze
 * Abgerufen: 2026-09-03
 *
 * Die Gemeinde gibt für die Wanderparkplätze den Stand 01.01.2025 an. Die
 * meisten Plätze im Zentrum sind gebührenfrei, Geld kostet dort nur die
 * Rathaus-Tiefgarage.
 */
export const PARKEN = {
  rathaus: "Rathaus Tiefgarage",
  /** Zeitlich unbegrenzt, nur PKW. Eine Tageskarte gibt es nicht. */
  rathausTarif: "1,00 € pro Stunde",
  laubau: "Wanderparkplatz Laubau",
  /** Gebührenpflichtig täglich 8 bis 18 Uhr, Tagesticket 9,00 €. */
  laubauTarif: "Tagesticket 9,00 €",
  /**
   * @ungeprueft Ein Parkhaus an der Vitalwelt steht weder in der Liste der
   * Zentrumsparkplätze noch bei den Wanderparkplätzen. Der Wohnmobilplatz P1
   * liegt laut Gemeinde "Richtung Schwimmbad".
   */
  vitalwelt: "Parkhaus Vitalwelt",
  /** @ungeprueft siehe vitalwelt */
  vitalweltTarif: "1,50 €/Std.",
  /** Platz P1 an der Hauptstraße 75, bis 48 h 20,00 €. */
  wohnmobile: "Hauptstraße 75, bis 24 h 10,00 €",
  /**
   * @ungeprueft Die Gemeindeseiten sagen nichts über kostenloses Parken mit
   * Gästekarte. Ermäßigt wird nur mit der Ruhpoldinger Bürgerkarte, und die
   * ist für Einheimische. Siehe Bericht.
   */
  gaestekarteHinweis: "Mit der Gästekarte sind die Ortsparkplätze frei.",
} as const

/**
 * Anreise und Mobilität vor Ort.
 * Quelle Anreise: https://www.ruhpolding.de/anreise-nach-ruhpolding
 * Quelle Mobilität: https://www.ruhpolding.de/mobilitaet-vor-ort
 * Abgerufen: 2026-09-03
 *
 * Zur Bahn schreibt Ruhpolding Tourismus nur, dass die Bayerische Regiobahn
 * Traunstein mit Ruhpolding verbindet. Eine durchgehende Verbindung ab
 * München ist dort nicht belegt, ebensowenig ein Takt oder eine Fahrzeit.
 */
export const ANREISE = {
  autobahn: "A8",
  ausfahrt: "Siegsdorf Ost / Traunstein",
  /**
   * @ungeprueft Die Quelle nennt keine Straßennummer, sondern nur die
   * Entfernung ab der Ausfahrt.
   */
  bundesstrasse: "B306",
  /** Die Quelle gibt eine Entfernung an, keine Fahrzeit: "rund 8 km". */
  fahrzeitAbAusfahrt: "rund 8 km",
  fahrzeitAbAusfahrtEn: "about 8 km",
  /** @ungeprueft kein Takt belegt */
  bahnTakt: "stündlich",
  /** @ungeprueft siehe bahnTakt */
  bahnTaktEn: "hourly",
  /**
   * @ungeprueft Belegt ist nur die Strecke Traunstein–Ruhpolding der
   * Bayerischen Regiobahn, nicht eine Fahrt ab München.
   */
  bahnAbfahrtsort: "München Hauptbahnhof",
  /** @ungeprueft keine Fahrzeit belegt */
  bahnFahrzeit: "etwa 1:40 Stunden",
  /** @ungeprueft siehe bahnFahrzeit */
  bahnFahrzeitEn: "about one hour and forty minutes",
  /** @ungeprueft keine Angabe zur Entfernung Bahnhof–Zentrum gefunden */
  bahnhofZumZentrum: "10 Gehminuten",
  /** @ungeprueft siehe bahnhofZumZentrum */
  bahnhofZumZentrumEn: "a ten minute walk",
  /** Die Ruhpoldinger Dorflinie. Daneben fährt der Rufbus DORLI. */
  ortsbusLinie: "Linien 9532 und 9533",
  /**
   * @ungeprueft Für die Dorflinie ist kein Takt belegt. Der Rufbus DORLI
   * fährt laut Quelle "ohne festen Fahrplan", Mo bis Fr 07:00 bis 22:00 Uhr.
   */
  ortsbusTakt: "werktags im Stundentakt",
  /** Die Karte heißt "Chiemgau Karte", siehe Bericht zur Satzstellung. */
  gaestekarteName: "Chiemgau Karte",
  gaestekarteBahnBis: "Traunstein",
  /**
   * Die beiden Dorflinien mit ihren Strecken, wörtlich von der Quelle.
   * Geprüft: https://www.ruhpolding.de/mobilitaet-vor-ort, abgerufen 2026-09-03
   *
   * Zu einem Takt oder zu Abfahrtszeiten steht dort nichts. Deshalb steht
   * hier auch keiner: die Strecke ist belegt, die Uhrzeit nicht.
   */
  dorflinie9532:
    "Westernberg – Chiemgau Coaster – Maiergschwendt – Unternberg – Freizeitpark – Brand – Urschlau – Vita Alpina – Edeka",
  dorflinie9533:
    "Bahnhof Ruhpolding – Häusler – Zell – Fischerwirt – Grashof – Ortnerhof – Fritz am Sand – Laubau – Chiemgau Arena",
  /** Der Rufbus, der ohne Fahrplan fährt. */
  rufbusName: "DORLI",
  rufbusWerktags: "07:00 bis 22:00 Uhr",
  rufbusWochenende: "08:00 bis 22:00 Uhr",
  rufbusHinweis:
    "Der Rufbus fährt ohne festen Fahrplan und verbindet über 100 Haltestellen im Ort.",
  /** Regionalbusse, die Ruhpolding mit den Nachbarorten verbinden. */
  regionalZiele: "Reit im Winkl, Inzell, Bad Reichenhall und Berchtesgaden",
} as const

/**
 * Langlauf in Ruhpolding.
 * Geprüft: https://www.ruhpolding.de/langlaufen, abgerufen 2026-09-03
 *
 * Die Seite beschreibt ein "imposantes Loipennetz" und nennt einzelne Loipen
 * mit Längen, etwa die Drei-Seen-Loipe mit 12,3 km, aber weder eine Summe
 * noch Preise für einen Loipenpass. Auch die Wintersuche über die Gemeinde
 * und die Chiemgau Arena hat dazu nichts ergeben.
 */
export const LOIPEN = {
  /** @ungeprueft keine offizielle Gesamtlänge des Netzes gefunden */
  netz: "75 km",
  /** @ungeprueft Spurarten auf der Langlaufseite nicht ausgewiesen */
  spurarten: "klassisch und Skating",
  /** @ungeprueft kein Preis für einen Loipenpass gefunden */
  passTag: "5,00 €",
  /** @ungeprueft siehe passTag */
  passWoche: "20,00 €",
  /** @ungeprueft keine Angabe, ob die Chiemgau Karte die Loipen einschließt */
  gaestekarte: "Loipen kostenlos",
} as const

/**
 * Alpiner Wintersport.
 * Quelle: https://www.ruhpolding.de/ski-alpin
 * Abgerufen: 2026-09-03
 *
 * Ruhpolding hat drei Skigebiete: Unternberg, Skiarena Westernberg und
 * Skilift Maiergschwendt.
 */
export const WINTER = {
  skigebiet: "Westernberg",
  /**
   * @ungeprueft Die Skiseite nennt keine Verleihbetriebe namentlich. In der
   * Suche taucht "Sport Plenk" auf, aber nicht im Volltext einer offiziellen
   * Seite. Siehe Bericht.
   */
  sportgeschaeft: "Sport Amort",
  /** @ungeprueft siehe sportgeschaeft */
  langlaufShop: "Langlauf-Shop",
} as const

/**
 * Wiederkehrende Veranstaltungen.
 * Quelle Biathlon: https://www.biathlonworld.com/venue/RUH (Veranstalter IBU)
 * Quelle Arena: https://www.chiemgau-arena.de/
 * Abgerufen: 2026-09-03
 *
 * Zum Namen: Die IBU führt den kommenden Weltcup als "LaVita IBU World Cup
 * Biathlon", die Arena-Startseite nennt noch die Ausgabe 2026 als "BMW IBU
 * World Cup Biathlon Ruhpolding 2026". Hier steht die Fassung des
 * Veranstalters. Der Namenssponsor wechselt, der Wert altert also.
 *
 * Geprüft, aber ohne Angabe geblieben: https://www.ruhpolding.de/veranstaltungen
 * verweist nur auf den Veranstaltungskalender, ohne feste Termine zu nennen.
 */
export const EVENTS = {
  chiemgauArena: "Chiemgau Arena",
  /** @ungeprueft Ort auf keiner geprüften Seite namentlich belegt */
  kurpark: "Kurpark",
  /** @ungeprueft Ort auf keiner geprüften Seite namentlich belegt */
  rathausplatz: "Rathausplatz",
  /** Gattungsbezeichnung, Kurzform des belegten Veranstaltungsnamens. */
  biathlonKurz: "Biathlon-Weltcup",
  biathlonKurzEn: "biathlon world cup",
  biathlonName: "LaVita IBU World Cup Biathlon",
  biathlonMonat: "im Januar",
  biathlonMonatEn: "in January",
  /** Nächste Ausgabe laut IBU-Kalender. */
  biathlonTermin: "vom 4. bis 10. Januar 2027",
  /** @ungeprueft kein Skibus zur Arena und kein Takt belegt */
  skibusTakt: "15-Minuten-Takt",
  /** @ungeprueft Veranstaltung auf den geprüften Seiten nicht belegt */
  sommerkonzerte: "Ruhpoldinger Sommerkonzerte",
  /** @ungeprueft siehe sommerkonzerte */
  sommerkonzerteEn: "Ruhpolding summer concerts",
  /** @ungeprueft kein Zeitraum und keine Uhrzeit belegt */
  sommerkonzerteZeit: "Mai bis September, mittwochs 20:00 Uhr",
  /** @ungeprueft siehe sommerkonzerteZeit */
  sommerkonzerteZeitEn: "May to September, Wednesdays at 8 pm",
  /** @ungeprueft Wochenmarkt auf den geprüften Seiten nicht belegt */
  wochenmarkt: "Wochenmarkt",
  /** @ungeprueft siehe wochenmarkt */
  wochenmarktEn: "weekly market",
  /** @ungeprueft kein Wochentag und keine Uhrzeit belegt */
  wochenmarktZeit: "jeden Freitag von 8:00 bis 12:00 Uhr",
  /** @ungeprueft siehe wochenmarktZeit */
  wochenmarktZeitEn: "every Friday from 8 am to 12 noon",
} as const

/**
 * Gastronomie.
 * Quelle: https://www.ruhpolding.de/gaststaetten-und-restaurants
 * Abgerufen: 2026-09-03
 *
 * Die Seite führt alle Betriebe namentlich auf. Namen, die dort nicht
 * vorkommen, sind unten als ungeprüft markiert.
 */
export const GASTRONOMIE = {
  /**
   * @ungeprueft Keine "Gipfelalm" in der Betriebsliste. Der Antworttext
   * verortet sie zudem auf dem Rauschberg, dessen Bahn nicht fährt.
   */
  gipfelalm: "Gipfelalm",
  /** In der Liste als "Hotel zur Post Restaurant" geführt. */
  gasthausPost: "Hotel zur Post Restaurant",
  /** Die einzige in der Liste geführte Pizzeria dieses Namens. */
  pizzeria: "Pizzeria Eiscafé „Made in Italy“",
  /**
   * Offiziell "Steinbach-Hotel". Ohne "Hotel", der Antworttext beugt das
   * Wort selbst. Die Einstufung als gehobenes Haus ist nicht belegt.
   */
  hotelGehoben: "Steinbach",
  /**
   * In der Liste als "Unternberg Alm" geführt. Achtung: der Antworttext
   * sagt "das", die Alm ist weiblich. Siehe Bericht.
   */
  almstueberl: "Unternberg Alm",
  /** @ungeprueft keine "Weitseealm" in der Betriebsliste */
  weitseealm: "Weitseealm",
  /** @ungeprueft keine "Laubaualm" in der Betriebsliste */
  laubaualm: "Laubaualm",
  /** @ungeprueft die Seite weist keine festen Ruhetage aus */
  ruhetage: "Montag oder Dienstag",
} as const

/**
 * Angebote für Familien.
 * Quelle Schlechtwetter: https://www.ruhpolding.de/bei-regen
 * Quelle Freizeitpark: https://www.freizeitpark.by/ (Betreiber)
 * Abgerufen: 2026-09-03
 *
 * Das Bad heißt "Vita Alpina", nicht "Vitalwelt". Ruhpolding Tourismus führt
 * es als Erlebnis- und Wellnessbad. Die Museen des Orts sind laut derselben
 * Seite Holzknechtmuseum, Heimatmuseum und Glockenschmiede.
 */
export const FAMILIE = {
  /** Der Betreiber nennt ihn auch "Märchenpark Ruhpolding". */
  freizeitpark: "Freizeitpark Ruhpolding",
  /**
   * @ungeprueft Die Betreiberseite verlinkt "Preise & Öffnungszeiten", die
   * Unterseite war nicht erreichbar.
   */
  freizeitparkOeffnung: "ab 9:30 Uhr",
  /** @ungeprueft siehe freizeitparkOeffnung */
  freizeitparkOeffnungEn: "from 9.30 am",
  vitalwelt: "Vita Alpina",
  /** @ungeprueft kein Barfußweg auf den geprüften Seiten belegt */
  barfussweg: "Barfußweg",
  /** @ungeprueft siehe barfussweg */
  barfusswegEn: "barefoot trail",
  /**
   * @ungeprueft Kein Bergbahn-Museum in der Museumsliste. Belegt sind
   * Holzknechtmuseum, Heimatmuseum und Glockenschmiede.
   */
  bergbahnMuseum: "Bergbahn-Museum",
  /** @ungeprueft siehe bergbahnMuseum */
  bergbahnMuseumEn: "mountain lift museum",
  /**
   * @ungeprueft Die Schlechtwetterseite nennt keine Kletterhalle. Als
   * Indoor-Ziel der Umgebung führt sie den Babalu Funpark Traunstein.
   */
  kletterhalle: "Kletterhalle in Inzell",
  /** @ungeprueft siehe kletterhalle */
  kletterhalleFahrzeit: "15 Minuten",
  heimatmuseum: "Heimatmuseum Ruhpolding",
} as const

/**
 * Übernachten.
 * Geprüft: https://www.ruhpolding.de/alle-ruhpoldinger-gastgeber
 * Abgerufen: 2026-09-03
 *
 * Die Gastgeberübersicht listet die Häuser einzeln auf, ohne Summen oder
 * Zertifikate zu nennen. Kein Wert dieses Blocks ließ sich belegen.
 */
export const UNTERKUNFT = {
  /**
   * @ungeprueft Die höchste in der Gastgeberliste ausgewiesene Kategorie
   * sind drei Sterne, etwa "Hotel Alp Inn***S". Ein Haus mit vier Sternen
   * kommt dort nicht vor.
   */
  hoechsteKategorie: "4-Sterne-Hotel",
  /** @ungeprueft siehe hoechsteKategorie */
  hoechsteKategorieEn: "four star hotel",
  /**
   * @ungeprueft Keine Gesamtzahl der Höfe genannt, die Liste führt sie
   * einzeln auf. Steht am Satzanfang, deshalb groß geschrieben.
   */
  hoefeAnzahl: "Rund 20",
  /** @ungeprueft "Reisen für Alle" wird auf der Gastgeberseite nicht erwähnt */
  zertifizierung: "Reisen für Alle",
  /**
   * @ungeprueft Keine Aufstellung barrierefreier Häuser gefunden. Als
   * barrierefrei ausgewiesen ist dort die Ferienwohnung "Berg & Wiese".
   */
  barrierefreiHaeuser: "zwei Hotels im Zentrum und ein Gästehaus am Kurpark",
} as const

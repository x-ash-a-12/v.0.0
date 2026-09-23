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
 * Am 23.09.2026 wurden alle ungeprüften Werte gelöscht, die in keiner
 * Antwort mehr vorkamen, darunter Bahntakt, Loipenpreise und Wochenmarkt.
 * Übrig sind nur die Namen der drei Ziele, die der Prototyp findet, aber
 * nicht beschreibt (Förchensee, Kurpark, Rathausplatz).
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
  oeffnungszeitenEn: "Mon to Fri 9 to 17, Sat 9 to 12",
  /** Fußnote der Kontaktkarte, nennt jetzt den Stand statt des Demo-Status. */
  kartenhinweis: "Stand: 3. September 2026, Angaben ohne Gewähr.",
  kartenhinweisEn: "As of 3 September 2026, no guarantee is given.",
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
  unternbergName: "Unternberg",
  /** Ruhpolding Tourismus führt sie als "Unternberg Sesselbahn". */
  unternbergBahn: "Sesselbahn",
  unternbergBahnEn: "chairlift",
  /** Berg- und Talfahrt Erwachsene. */
  unternbergErwachsen: "19,50 €",
  /** Die Quelle fasst Kinder und Jugendliche zusammen. */
  kinderAlter: "5 bis 17 Jahre",
  kinderAlterEn: "5 to 17 years",
  /** Eigener Preis statt Prozentsatz: Berg- und Talfahrt 13,00 €. */
  ermaessigungKinder: "13,00 €",
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
  kartenhinweisEn:
    "Unternberg, as of 3 September 2026. The Rauschberg lift is not running at present because it is being rebuilt.",
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
   * Flyer "Die 10 schönsten Wander- & Spazierwege", Drucklegung 03/25:
   * "In Ruhpolding locken 240 Kilometer Spazier-, Wander- und Bergwege".
   * Bis zum 23.09.2026 stand hier ungeprüft "250 km".
   */
  wegenetzKm: "240 km",
  /** @ungeprueft auf den geprüften Seiten nicht namentlich genannt */
  foerchensee: "Förchensee",
  sonntagshorn: "Sonntagshorn",
  sonntagshornHoehe: "1.961 m",
  /** Die Quelle gibt "09:00 Stunden" für die Tour ab Laubau an. */
  sonntagshornGehzeit: "9 Stunden",
  sonntagshornGehzeitEn: "9 hours",
  sonntagshornStart: "Wanderparkplatz Holzknechtmuseum / Laubau",
  /** Derselbe Ort, für die englische Fassung als Gattung benannt. */
  sonntagshornStartEn: "Holzknechtmuseum / Laubau hikers' car park",
  /**
   * Aus der Wegeliste: https://www.ruhpolding.de/schoensten-wander-spazierwege
   * Abgerufen 2026-09-03. Die Liste nennt Länge und Gehzeit, keine
   * Schwierigkeit. Deshalb steht im Antworttext auch keine.
   */
  taubensee: "Traunauen und Taubensee",
  taubenseeEn: "Traun meadows and Taubensee",
  taubenseeLaenge: "8,6 km",
  taubenseeGehzeit: "2:15 h",
} as const

/**
 * Kultur im Ort.
 *
 * Museen: https://www.ruhpolding.de/bei-regen, abgerufen 2026-09-03. Die Seite
 * führt Holzknechtmuseum, Heimatmuseum und Glockenschmiede als Ziele bei
 * schlechtem Wetter.
 *
 * Kirche: Interview Auskunft 22.09.2026, KA [00:13:11]: "Gehen Sie da hinauf
 * zur Kirche, da haben Sie einen schönen Überblick." Frau Amort nennt die
 * Kirche nicht beim Namen.
 */
export const KULTUR = {
  holzknechtmuseum: "Holzknechtmuseum",
  holzknechtmuseumEn: "Holzknechtmuseum (woodcutters' museum)",
  glockenschmiede: "Glockenschmiede",
  glockenschmiedeEn: "Glockenschmiede (bell forge)",
  /** Wanderflyer (Kapellen- & Marterlweg) und Ortsplan (Feld L10). */
  kirche: "Pfarrkirche St. Georg",
  kircheEn: "St. George's parish church",
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
  rathausEn: "town hall underground car park",
  /** Zeitlich unbegrenzt, nur PKW. Eine Tageskarte gibt es nicht. */
  rathausTarif: "1,00 € pro Stunde",
  rathausTarifEn: "1,00 € per hour",
  laubau: "Wanderparkplatz Laubau",
  laubauEn: "Laubau hikers' car park",
  /** Gebührenpflichtig täglich 8 bis 18 Uhr, Tagesticket 9,00 €. */
  laubauTarif: "Tagesticket 9,00 €",
  laubauTarifEn: "day ticket 9,00 €",
  /** Platz P1 an der Hauptstraße 75, bis 48 h 20,00 €. */
  wohnmobile: "Hauptstraße 75, bis 24 h 10,00 €",
  wohnmobileEn: "Hauptstraße 75, up to 24 h 10,00 €",
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
  /** Die Quelle gibt eine Entfernung an, keine Fahrzeit: "rund 8 km". */
  fahrzeitAbAusfahrt: "rund 8 km",
  fahrzeitAbAusfahrtEn: "about 8 km",
  /** Die Ruhpoldinger Dorflinie. Daneben fährt der Rufbus DORLI. */
  ortsbusLinie: "Linien 9532 und 9533",
  ortsbusLinieEn: "lines 9532 and 9533",
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
  rufbusWerktagsEn: "07:00 to 22:00",
  rufbusWochenende: "08:00 bis 22:00 Uhr",
  rufbusWochenendeEn: "08:00 to 22:00",
  rufbusHinweis:
    "Der Rufbus fährt ohne festen Fahrplan und verbindet über 100 Haltestellen im Ort.",
  rufbusHinweisEn:
    "The on-demand bus runs without a fixed timetable and connects more than 100 stops in the village.",
  /** Regionalbusse, die Ruhpolding mit den Nachbarorten verbinden. */
  regionalZiele: "Reit im Winkl, Inzell, Bad Reichenhall und Berchtesgaden",
  regionalZieleEn: "Reit im Winkl, Inzell, Bad Reichenhall and Berchtesgaden",
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
  biathlonTerminEn: "from 4 to 10 January 2027",
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
  vitalwelt: "Vita Alpina",
  heimatmuseum: "Heimatmuseum Ruhpolding",
  heimatmuseumEn: "Ruhpolding local history museum",
} as const

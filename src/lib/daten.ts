/**
 * Alle Fakten über Ruhpolding an einer Stelle.
 *
 * Werte mit @demo sind noch fiktiv und müssen vor der Evaluation durch
 * öffentlich zugängliche Angaben ersetzt werden. Suchen mit:
 *   grep -n "@demo" src/lib/daten.ts
 *
 * Felder mit der Endung En sind die englische Fassung derselben Angabe,
 * für die Sprachumschaltung. Ändert sich der Wert, ändern sich beide.
 *
 * Tagesaktuelle Angaben (Wetter, Prognose, Schneelage, Wochenprogramm)
 * stehen bewusst nicht hier. Sie sind in chat-flow.ts mit "SIMULIERT:"
 * gekennzeichnet, weil sie ohne Datenanbindung gar nicht echt sein können.
 */

/** Quelle: noch offen. Stand: noch offen. */
export const TOURIST_INFO = {
  /** @demo */ adresse: "Hauptstraße 60, 83324 Ruhpolding",
  /** @demo */ telefon: "08663 8806-0",
  /** @demo */ email: "info@ruhpolding.de",
  /** @demo */ oeffnungszeiten: "Mo bis Fr 8:30 bis 17:00, Sa 9:00 bis 12:00",
  /** @demo Fußnote der Kontaktkarte, entfällt sobald die Daten belegt sind. */
  kartenhinweis: "Kontaktdaten nur zu Demonstrationszwecken.",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const BERGBAHNEN = {
  /** @demo */ rauschbergName: "Rauschberg",
  /** @demo */ rauschbergBahn: "Gondelbahn",
  /** @demo */ rauschbergBahnEn: "gondola",
  /** @demo */ unternbergName: "Unternberg",
  /** @demo */ unternbergBahn: "Sesselbahn",
  /** @demo */ unternbergBahnEn: "chairlift",
  /** @demo */ rauschbergErwachsen: "24,00 €",
  /** @demo */ unternbergErwachsen: "19,50 €",
  /** @demo */ kinderAlter: "6 bis 15 Jahre",
  /** @demo */ ermaessigungKinder: "50 % Ermäßigung",
  /** @demo */ ermaessigungGaestekarte: "20 % Ermäßigung",
  /*
   * Zeiten ohne Sprachbestandteil, damit die deutsche und die englische
   * Fassung sie gleichermaßen einsetzen können.
   */
  /** @demo */ betriebSommerVon: "9:00",
  /** @demo */ betriebSommerBis: "16:30",
  /** @demo */ letzteBergfahrt: "16:00",
  /** @demo Fußnote der Preiskarte, entfällt sobald die Preise belegt sind. */
  kartenhinweis: "Preise nur zu Demonstrationszwecken.",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const WANDERN = {
  /** @demo Ohne "rund", das Wort steht im Antworttext. */
  wegenetzKm: "250 km",
  /** @demo */ foerchensee: "Förchensee",
  /** @demo */ foerchenseeRunde: "etwa 3 km, eben",
  /** @demo */ uferwegTraun: "Uferweg entlang der Traun",
  /** @demo */ sonntagshorn: "Sonntagshorn",
  /** @demo */ sonntagshornHoehe: "1.961 m",
  /** @demo */ sonntagshornGehzeit: "rund 4 Stunden",
  /** @demo */ sonntagshornStart: "Parkplatz Vorderlahnerkopf",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const PARKEN = {
  /** @demo */ rathaus: "Parkplatz Rathaus",
  /** @demo */ rathausTarif: "1,00 €/Std., Tageskarte 6,00 €",
  /** @demo */ laubau: "Wanderparkplatz Laubau",
  /** @demo */ laubauTarif: "kostenlos",
  /** @demo */ vitalwelt: "Parkhaus Vitalwelt",
  /** @demo */ vitalweltTarif: "1,50 €/Std.",
  /** @demo */ wohnmobile: "Stellplatz an der Chiemgau Arena",
  /** @demo */ gaestekarteHinweis: "Mit der Gästekarte sind die Ortsparkplätze frei.",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const ANREISE = {
  /** @demo */ autobahn: "A8",
  /** @demo */ ausfahrt: "Siegsdorf",
  /** @demo */ bundesstrasse: "B306",
  /** @demo */ fahrzeitAbAusfahrt: "rund 10 Minuten",
  /** @demo */ fahrzeitAbAusfahrtEn: "about ten minutes",
  /** @demo */ bahnTakt: "stündlich",
  /** @demo */ bahnTaktEn: "hourly",
  /** @demo */ bahnAbfahrtsort: "München Hauptbahnhof",
  /** @demo */ bahnFahrzeit: "etwa 1:40 Stunden",
  /** @demo */ bahnFahrzeitEn: "about one hour and forty minutes",
  /** @demo */ bahnhofZumZentrum: "10 Gehminuten",
  /** @demo */ bahnhofZumZentrumEn: "a ten minute walk",
  /** @demo */ ortsbusLinie: "Linie 9495",
  /** @demo */ ortsbusTakt: "werktags im Stundentakt",
  /** @demo */ gaestekarteName: "GUEST",
  /** @demo */ gaestekarteBahnBis: "Traunstein",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const LOIPEN = {
  /** @demo */ netz: "75 km",
  /** @demo */ spurarten: "klassisch und Skating",
  /** @demo */ passTag: "5,00 €",
  /** @demo */ passWoche: "20,00 €",
  /** @demo */ gaestekarte: "Loipen kostenlos",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const WINTER = {
  /** @demo */ skigebiet: "Westernberg",
  /** @demo */ sportgeschaeft: "Sport Amort",
  /** @demo */ langlaufShop: "Langlauf-Shop",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const EVENTS = {
  /** @demo */ chiemgauArena: "Chiemgau Arena",
  /** @demo */ kurpark: "Kurpark",
  /** @demo */ rathausplatz: "Rathausplatz",
  /** @demo */ biathlonKurz: "Biathlon-Weltcup",
  /** @demo */ biathlonKurzEn: "biathlon world cup",
  /** @demo */ biathlonName: "BMW IBU Weltcup Biathlon",
  /** @demo */ biathlonMonat: "im Januar",
  /** @demo */ biathlonMonatEn: "in January",
  /** @demo */ biathlonTermin: "vom 8. bis 12. Januar",
  /** @demo */ skibusTakt: "15-Minuten-Takt",
  /** @demo */ sommerkonzerte: "Ruhpoldinger Sommerkonzerte",
  /** @demo */ sommerkonzerteEn: "Ruhpolding summer concerts",
  /** @demo */ sommerkonzerteZeit: "Mai bis September, mittwochs 20:00 Uhr",
  /** @demo */ sommerkonzerteZeitEn: "May to September, Wednesdays at 8 pm",
  /** @demo */ wochenmarkt: "Wochenmarkt",
  /** @demo */ wochenmarktEn: "weekly market",
  /** @demo */ wochenmarktZeit: "jeden Freitag von 8:00 bis 12:00 Uhr",
  /** @demo */ wochenmarktZeitEn: "every Friday from 8 am to 12 noon",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const GASTRONOMIE = {
  /** @demo */ gipfelalm: "Gipfelalm",
  /** @demo */ gasthausPost: "Gasthaus zur Post",
  /** @demo */ pizzeria: "Pizzeria am Dorfplatz",
  /** @demo Ohne "Hotel", der Antworttext beugt das Wort selbst. */
  hotelGehoben: "Steinbach",
  /** @demo */ almstueberl: "Unternberg-Almstüberl",
  /** @demo */ weitseealm: "Weitseealm",
  /** @demo */ laubaualm: "Laubaualm",
  /** @demo */ ruhetage: "Montag oder Dienstag",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const FAMILIE = {
  /** @demo */ freizeitpark: "Freizeitpark Ruhpolding",
  /** @demo */ freizeitparkOeffnung: "ab 9:30 Uhr",
  /** @demo */ freizeitparkOeffnungEn: "from 9.30 am",
  /** @demo */ vitalwelt: "Vitalwelt",
  /** @demo */ barfussweg: "Barfußweg",
  /** @demo */ barfusswegEn: "barefoot trail",
  /** @demo */ bergbahnMuseum: "Bergbahn-Museum",
  /** @demo */ bergbahnMuseumEn: "mountain lift museum",
  /** @demo */ kletterhalle: "Kletterhalle in Inzell",
  /** @demo */ kletterhalleFahrzeit: "15 Minuten",
  /** @demo */ heimatmuseum: "Heimatmuseum",
} as const

/** Quelle: noch offen. Stand: noch offen. */
export const UNTERKUNFT = {
  /** @demo */ hoechsteKategorie: "4-Sterne-Hotel",
  /** @demo */ hoechsteKategorieEn: "four star hotel",
  /** @demo Steht am Satzanfang, deshalb groß geschrieben. */
  hoefeAnzahl: "Rund 20",
  /** @demo */ zertifizierung: "Reisen für Alle",
  /** @demo */ barrierefreiHaeuser: "zwei Hotels im Zentrum und ein Gästehaus am Kurpark",
} as const

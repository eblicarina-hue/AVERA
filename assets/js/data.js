/*
 * AVERA-Inhalte (Admonter Veränderungsrad).
 * Grundlage: "AVERA White Paper 2.0 – Ein Gestaltungsframework für Lernen und
 * Veränderung in Organisationen", Corporate Learning Community Österreich (#CLCA).
 * Lizenz der inhaltlichen Grundlage: CC BY-SA 4.0.
 * Texte hier sind für die App-Nutzung redaktionell verdichtet.
 */
(function (global) {
  "use strict";

  // Reihenfolge = "Drehrichtung" des Rads. raumzeit steht im Zentrum und
  // ist kein Schritt in der Kette, sondern permanente Voraussetzung.
  var SEQUENCE = ["intention", "story", "orgkultur", "fuehrung", "entdecken", "peers", "methoden"];

  var DIMENSIONS = {
    wollen: { label: "Wollen", subtitle: "emotional begeistern", stations: ["story", "entdecken"] },
    duerfen: { label: "Dürfen", subtitle: "sozial ermächtigen", stations: ["orgkultur", "peers"] },
    koennen: { label: "Können", subtitle: "zur Handlung befähigen", stations: ["fuehrung", "methoden"] }
  };

  var STATIONS = [
    {
      key: "intention",
      num: "Start",
      title: "Intention",
      subtitle: "Der Nullpunkt jeder Gestaltung",
      dimension: "ursprung",
      intro: "Jede Veränderung beginnt mit einer Intention – nicht mit einer Maßnahme. Sie beschreibt, was anders werden soll, warum das bedeutsam ist und welche Wirkung entstehen soll. Ohne tragfähige Intention wird schnell alles beliebig.",
      wasZuTun: [
        "Intention klären und so abgrenzen, dass sie konkret und bearbeitbar bleibt.",
        "Das Wozu offenlegen – das Motiv ist der Kern der Veränderung.",
        "Ein konkretes Zukunftsbild zeichnen: Wie ist es, wenn erreicht ist, was erreichbar ist?",
        "Die Wirkung beschreiben, nicht die Aktivität."
      ],
      hinweise: [
        "Gemeinsam entwickeln statt verordnen – unterschiedliche Perspektiven schärfen die Intention.",
        "Auf eine Intention fokussieren, nicht mehrere parallel verfolgen.",
        "Regelmäßig überprüfen und evolutionär anpassen."
      ],
      fallen: [
        { name: "Aktivitätsfalle", text: "Es wird mit Workshops, Trainings oder Kampagnen gestartet, bevor klar ist, welches Problem gelöst werden soll." },
        { name: "Kennzahlenfalle", text: "Kennzahlen ersetzen keine gemeinsame Vorstellung davon, was sich wirklich verändern soll." },
        { name: "Beliebigkeitsfalle", text: "Die Intention bleibt so generisch, dass sich jede:r ihr eigenes Verständnis herausfiltert." }
      ],
      beobachtung: [],
      kernfrage: "Worum geht es uns wirklich – und warum ist das wichtig?",
      reflexionsfragen: [
        "Welches Problem möchten wir wirklich lösen? Welche Chance nutzen – und wofür eigentlich?",
        "Warum ist diese Veränderung wichtig oder nötig? Was passiert, wenn nichts passiert?",
        "Wie sieht die gewünschte Zukunft konkret aus? Woran erkennen wir, dass wir sie erreicht haben?",
        "Welche Entscheidungen würden wir anders treffen, wenn wir unsere Intention konsequent zum Maßstab machen?"
      ],
      objekte: [
        { aspekt: "Zielbild", beispiele: ["Zukunftsbild", "Leitfrage", "Auftragsklärung"] }
      ]
    },
    {
      key: "story",
      num: "01",
      title: "Story & Narrativ",
      subtitle: "schafft Bedeutung",
      dimension: "wollen",
      intro: "Menschen folgen selten Strategien – sie folgen Geschichten. Eine gemeinsame Geschichte macht verständlich, warum Veränderung notwendig ist, und lädt dazu ein, Teil davon zu werden.",
      wasZuTun: [
        "Die Geschichte der Veränderung schreiben: Woher kommen wir, warum verändern wir uns, wohin wollen wir?",
        "Ein tragfähiges Narrativ entwickeln, das Vergangenheit, Gegenwart und Zukunft verbindet.",
        "Eine Dramaturgie gestalten – Veränderung als gemeinsames Lernabenteuer, nicht als Projektplan.",
        "Eine gemeinsame Sprache finden: Begriffe, Bilder, Metaphern bewusst wählen."
      ],
      hinweise: [
        "Geschichten statt Foliensätze.",
        "Einfach erzählen, einfach erleben – leicht weitererzählbar.",
        "Konsistent bleiben und gemeinsam weiterschreiben."
      ],
      fallen: [
        { name: "Ignoranzfalle", text: "Jede Organisation erzählt bereits Geschichten. Wer sie ignoriert, arbeitet gegen die kulturelle Wirklichkeit." },
        { name: "Kommunikationsfalle", text: "Informationen ersetzen keine Geschichte." },
        { name: "Framingfalle", text: "Unklare Begriffe oder widersprüchliche Botschaften erzeugen Unsicherheit statt Orientierung." },
        { name: "Hochglanzfalle", text: "Eine perfekt erzählte Geschichte überzeugt nicht, wenn sie im Alltag nicht erlebbar ist." }
      ],
      beobachtung: [
        "Welche Geschichten erzählen sich Menschen? Welche Begriffe fallen immer wieder?",
        "Was gilt als Erfolg – worüber wird gelacht oder geklagt?",
        "Welche Widersprüche zwischen offizieller Kommunikation und Alltag sind sichtbar?"
      ],
      kernfrage: "Schreibe Geschichte. Nimm die gewünschte Zukunft bereits vorweg.",
      reflexionsfragen: [
        "Welche Begriffe, Bilder oder Metaphern prägen unser Verständnis der Veränderung?",
        "Welche Geschichten erzählen Menschen heute schon – und welche wollen wir künftig gemeinsam weitererzählen?",
        "Warum sollten Menschen Teil dieser Geschichte werden wollen?",
        "Woran erkennen wir, dass unsere Geschichte im Alltag weiterlebt?"
      ],
      objekte: [
        { aspekt: "Geschichte", beispiele: ["Leitnarrativ", "Zukunftsbild", "Veränderungsgeschichte"] },
        { aspekt: "Kommunikation", beispiele: ["Kommunikationskampagne", "Townhall", "Newsletter", "Video"] },
        { aspekt: "Orientierung", beispiele: ["Leitbegriffe", "Metaphern", "Glossar"] }
      ]
    },
    {
      key: "orgkultur",
      num: "02",
      title: "Organisation & Kultur",
      subtitle: "schafft Möglichkeiten",
      dimension: "duerfen",
      intro: "Verhalten entsteht selten allein aus Überzeugung. Es entsteht im Zusammenspiel organisationaler Bedingungen – Strukturen, Routinen, Regeln und kulturellen Mustern. Wer Verhalten verändern will, muss Organisation gestalten.",
      wasZuTun: [
        "Die Eigenlogik der Organisation erkennen: formelle und informelle Regeln, Routinen, Überzeugungen.",
        "Beim Business ansetzen – dort, wo Wertschöpfung stattfindet.",
        "Strukturen, Prozesse, Zielsysteme und Zusammenarbeit so gestalten, dass sie die Intention unterstützen.",
        "Neue Erfahrungen der Zusammenarbeit ermöglichen, bis sie selbstverständlich werden."
      ],
      hinweise: [
        "Formelles und Informelles zusammendenken – Routinen prägen oft stärker als Vorschriften.",
        "Artefakte, Symbole und Sprache bewusst gestalten.",
        "Widersprüche ernst nehmen – sie zeigen, wo Organisation und Intention noch nicht zusammenpassen."
      ],
      fallen: [
        { name: "Schönwetterfalle", text: "Verhalten soll sich ändern, ohne die organisationalen Bedingungen zu verändern." },
        { name: "Trainingsfalle", text: "Organisationale Probleme werden zu Lernproblemen erklärt." },
        { name: "Organigrammfalle", text: "Organisation wird auf Strukturen reduziert – informelle Netzwerke und Kultur bleiben unbeachtet." }
      ],
      beobachtung: [
        "Welche Regeln, Routinen oder Strukturen prägen das heutige Verhalten?",
        "Welche impliziten Regeln verhindern die gewünschte Veränderung?",
        "Wo entstehen Wartezeiten oder Reibungen?"
      ],
      kernfrage: "Welche organisationalen Bedingungen machen die gewünschte Zukunft wahrscheinlich – welche bremsen sie heute?",
      reflexionsfragen: [
        "Welche Regeln, Routinen oder Strukturen erleichtern das gewünschte Verhalten bereits? Welche fehlen noch?",
        "Welche Artefakte, Soziofakte und Mentefakte wollen wir bewusst gestalten?",
        "Welche Widersprüche zeigen, dass Organisation und Intention noch nicht zusammenpassen?",
        "Woran erkennen wir, dass die Organisation die Entwicklung tatsächlich unterstützt?"
      ],
      objekte: [
        { aspekt: "Strukturen", beispiele: ["Rollen", "Prozesse", "Verantwortlichkeiten", "Governance"] },
        { aspekt: "Zusammenarbeit", beispiele: ["Meetingformate", "Entscheidungsprozesse", "Schnittstellen"] },
        { aspekt: "Kultur", beispiele: ["Wertebilder", "Rituale", "Symbole"] }
      ]
    },
    {
      key: "fuehrung",
      num: "03",
      title: "Führung & Alltag",
      subtitle: "schafft Relevanz – der Zündfunke",
      dimension: "koennen",
      intro: "Veränderung entsteht im Alltag – dort, wo Menschen entscheiden, zusammenarbeiten und Prioritäten setzen. Führung übersetzt die Intention in den Arbeitsalltag und beantwortet: Was bedeutet das für mich?",
      wasZuTun: [
        "Führung in Führung gehen lassen – Gestaltungsverantwortung aller Rollen schärfen, die den Alltag prägen.",
        "Die Intention in den Alltag übersetzen: Was bedeutet sie für die tägliche Arbeit?",
        "Begleiten statt delegieren – Veränderung bleibt Führungsaufgabe.",
        "Gelegenheiten zum Ausprobieren, Reflektieren und Weiterentwickeln priorisieren."
      ],
      hinweise: [
        "Anlass statt Anweisung.",
        "Vertrauen und Verantwortung verbinden.",
        "Anerkennung verstärkt Entwicklung – Fortschritte sichtbar machen und würdigen."
      ],
      fallen: [
        { name: "Delegationsfalle", text: "Lernen und Veränderung werden an HR oder externe Partner abgegeben." },
        { name: "Effizienzfalle", text: "Kurzfristige Zielerreichung verdrängt Lernen und Reflexion aus dem Alltag." },
        { name: "Drillfalle", text: "Veränderung wird eingefordert und kontrolliert statt ermöglicht." },
        { name: "Übersetzungsfalle", text: "Die Intention bleibt auf strategischer Ebene – niemand versteht, was sie für die eigene Arbeit bedeutet." }
      ],
      beobachtung: [
        "Worüber sprechen Führungskräfte im Alltag tatsächlich?",
        "Welches Verhalten wird gelobt, welches toleriert?",
        "Welche Prioritäten werden sichtbar gesetzt?"
      ],
      kernfrage: "Welche Funken müssen wir zünden, damit die Intention im Alltag bedeutsam wird?",
      reflexionsfragen: [
        "Was bedeutet die Veränderung konkret für den Arbeitsalltag? Woran würde man sie erkennen?",
        "Wer übernimmt die Verantwortung, die Intention im Alltag lebendig zu machen?",
        "Wo entstehen Gelegenheiten, Neues auszuprobieren, zu reflektieren und gemeinsam zu lernen?",
        "Woran erkennen wir, dass Lernen im Alltag tatsächlich stattfindet?"
      ],
      objekte: [
        { aspekt: "Führungsarbeit", beispiele: ["Führungsdialoge", "Feedback", "Zielvereinbarungen"] },
        { aspekt: "Alltag", beispiele: ["Routinen", "Check-ins", "Teammeetings"] },
        { aspekt: "Unterstützung", beispiele: ["Coaching", "Reflexionsgespräche", "Priorisierung"] }
      ]
    },
    {
      key: "entdecken",
      num: "04",
      title: "Entdecken & Aneignen",
      subtitle: "ermöglicht individuelle Aneignung",
      dimension: "wollen",
      intro: "Lernen entsteht nicht durch Wissensvermittlung, sondern wenn Menschen selbst aktiv werden, Fragen verfolgen und Erfahrungen machen. Lernen ist die Leistung der Lernenden.",
      wasZuTun: [
        "Neugier aufgreifen und in Herausforderungen, Erfahrungen und Suchbewegungen übersetzen.",
        "Erfahrungen gestalten – Gelegenheiten zum Ausprobieren und Reflektieren schaffen.",
        "Experience before Content: erst die Erfahrung, aus der Lernbedarf entsteht.",
        "Lernen mit realen Herausforderungen der Arbeit verbinden."
      ],
      hinweise: [
        "Aktivität vor Konsum.",
        "Offenheit zulassen – nicht jeder Lernweg lässt sich vorab festlegen.",
        "Soziales Lernen ermöglichen: Erfahrungen teilen und gemeinsam weiterentwickeln."
      ],
      fallen: [
        { name: "Contentfalle", text: "Lernen wird mit dem Bereitstellen von Inhalten verwechselt." },
        { name: "Treatmentfalle", text: "Inhalte werden verordnet und konsumiert statt aktiv angeeignet." },
        { name: "Steuerungsfalle", text: "Lernen wird wie ein Projekt geplant, obwohl es sich nur begrenzt steuern lässt." },
        { name: "One-Size-Fits-All-Falle", text: "Alle erhalten dieselben Inhalte – individuelle Fragen bleiben unberücksichtigt." }
      ],
      beobachtung: [
        "Wo experimentieren Menschen bereits? Wo ist Nicht-Wissen akzeptiert?",
        "Welche Fragen werden gestellt?",
        "Wo helfen sich Kolleg:innen gegenseitig?"
      ],
      kernfrage: "Schaffe Herausforderungen. Wer selbst entdeckt, macht Veränderung zur eigenen Sache.",
      reflexionsfragen: [
        "Welche Herausforderungen regen Menschen an, nach neuen Lösungen zu suchen?",
        "Welche Erfahrungen sollen Menschen machen, damit sich ihr Handeln verändert?",
        "Welche Unterstützung ist wirklich nötig – wo würden wir den Lernprozess unnötig vorwegnehmen?",
        "Woran erkennen wir, dass Menschen ihre Praxis tatsächlich weiterentwickeln?"
      ],
      objekte: [
        { aspekt: "Entdecken", beispiele: ["Praxisaufgaben", "Experimente", "Challenges"] },
        { aspekt: "Reflexion", beispiele: ["Lernjournale", "Retrospektiven", "Reflexionsfragen"] },
        { aspekt: "Teilen", beispiele: ["Lerngruppen", "Erfahrungsberichte", "Brown-Bag-Sessions"] }
      ]
    },
    {
      key: "peers",
      num: "05",
      title: "Peers & Resonanz",
      subtitle: "verstärkt sozial",
      dimension: "duerfen",
      intro: "Menschen orientieren sich an Menschen. Erst wenn Erfahrungen geteilt und im sozialen Umfeld aufgegriffen werden, trägt Veränderung über Einzelne hinaus – sie wird zur gemeinsamen Normalität.",
      wasZuTun: [
        "Die Kraft von Peers nutzen – Vorbilder, Communities und informelle Netzwerke einbinden.",
        "Soziale Anwendungsräume schaffen, die Lernen und Alltag verbinden.",
        "Veränderung sichtbar machen – gute Erfahrungen weitererzählbar machen.",
        "Beteiligung passend zu Rolle, Verantwortung und Lerntiefe gestalten."
      ],
      hinweise: [
        "Gemeinsam vor Einzelkampf.",
        "In Zielgruppen und Lerntiefen denken.",
        "Resonanz vor Reichweite – entscheidend sind Gespräche, nicht Teilnehmerzahlen."
      ],
      fallen: [
        { name: "One-Size-Fits-All-Falle", text: "Alle Zielgruppen erhalten dieselben Angebote." },
        { name: "Broadcast-Falle", text: "Informationen werden verteilt, ohne soziale Resonanz zu erzeugen." },
        { name: "Multiplikatorenfalle", text: "Botschafter:innen werden ernannt, ohne dass echte Glaubwürdigkeit entsteht." },
        { name: "Isolationsfalle", text: "Lernen bleibt individuell und wird nicht sichtbar geteilt." }
      ],
      beobachtung: [
        "Welche Rolle spielt Lernen im Alltag – ist es sozial anerkannt?",
        "Wer prägt die Meinung im Team?",
        "Welche Verhaltensweisen werden sozial belohnt?"
      ],
      kernfrage: "Woran würden Menschen erkennen, dass die gewünschte Veränderung bei uns zur Normalität geworden ist?",
      reflexionsfragen: [
        "Welche Gruppen und Netzwerke prägen Einstellungen und Verhalten besonders stark?",
        "Wo entstehen Gelegenheiten, die gewünschte Zukunft gemeinsam zu erleben?",
        "Welche Zielgruppen brauchen welche Form der Beteiligung?",
        "Woran erkennen wir, dass sich die Veränderung zunehmend selbst verstärkt?"
      ],
      objekte: [
        { aspekt: "Gemeinschaft", beispiele: ["Communities of Practice", "Peer Groups", "Lernpartnerschaften"] },
        { aspekt: "Austausch", beispiele: ["Peer-Feedback", "Hospitationen", "Kollegiale Beratung"] },
        { aspekt: "Sichtbarkeit", beispiele: ["Erfolgsgeschichten", "Best Practices", "Anerkennungsformate"] }
      ]
    },
    {
      key: "methoden",
      num: "06",
      title: "Methoden & Formate",
      subtitle: "unterstützt professionell",
      dimension: "koennen",
      intro: "Methoden und Formate machen Veränderung erlebbar – sie bewirken sie nicht. Gute Gestaltung beginnt nicht mit der Methode, sondern mit der Frage nach der beabsichtigten Wirkung.",
      wasZuTun: [
        "Wirkungsvoll gestalten: erst klären, welche Veränderung unterstützt werden soll, dann Methode wählen.",
        "Erfahrungen gestalten, die die gewünschte Zukunft erlebbar machen.",
        "Eine stimmige Lernarchitektur bauen statt Einzelmaßnahmen aneinanderzureihen.",
        "Vielfalt nutzen: analog/digital, individuell/sozial, formell/informell kombinieren."
      ],
      hinweise: [
        "Experience vor Content.",
        "Architektur statt Einzelmaßnahmen.",
        "Einfach vor spektakulär – bewährte Methoden wirken oft stärker als Trends."
      ],
      fallen: [
        { name: "Toolfalle", text: "Die Suche nach der richtigen Methode ersetzt die Klärung der Gestaltungsfrage." },
        { name: "Trendfalle", text: "Neue Formate werden eingesetzt, weil sie attraktiv wirken – nicht weil sie zur Wirkung beitragen." },
        { name: "One-Hit-Wonder-Falle", text: "Einzelne Maßnahmen bleiben isoliert, ohne Einbettung in eine Lernarchitektur." }
      ],
      beobachtung: [
        "Welche Formate sind etabliert und werden tatsächlich genutzt?",
        "Welche Methoden erzeugen echte interne Gespräche?",
        "Welche Lernangebote verschwinden schnell wieder?"
      ],
      kernfrage: "Welche Gestaltung braucht unsere Intention – und welche Methoden unterstützen sie am besten?",
      reflexionsfragen: [
        "Welche Erfahrungen sollen Menschen in den gewählten Formaten machen?",
        "Welche Methoden leisten den größten Beitrag zur Intention?",
        "Wie greifen unsere Formate zu einer stimmigen Lernarchitektur ineinander?",
        "Welche Methoden nutzen wir aus Gewohnheit – welche bewusst?"
      ],
      objekte: [
        { aspekt: "Lernformate", beispiele: ["Workshops", "Trainings", "Learning Journeys", "Microlearning"] },
        { aspekt: "Methoden", beispiele: ["Fallarbeit", "Simulationen", "Design Thinking"] },
        { aspekt: "Unterstützung", beispiele: ["Lernplattformen", "Toolkits", "Leitfäden"] }
      ]
    },
    {
      key: "raumzeit",
      num: "Zentrum",
      title: "Raum & Zeit",
      subtitle: "Dreh- und Angelpunkt",
      dimension: "zentrum",
      intro: "Ohne Raum und Zeit bleibt Veränderung Absicht. Raum und Zeit sind kein weiteres Element, sondern die gemeinsame Voraussetzung, damit alle anderen Elemente überhaupt wirksam werden können.",
      wasZuTun: [
        "Raum und Zeit bewusst schaffen – und gegen den Druck des Tagesgeschäfts verteidigen.",
        "Räume mehrdimensional denken: physisch, virtuell, sozial und als Handlungsspielraum.",
        "Entwicklung als festen Bestandteil erfolgreicher Arbeit planen, nicht als Restgröße.",
        "Rhythmen etablieren, die Lernen und Reflexion regelmäßig ermöglichen."
      ],
      hinweise: [
        "Lernen braucht Platz zum risikofreien Ausprobieren.",
        "Arbeitszeit ist Lernzeit – und umgekehrt.",
        "Entwicklung braucht Spielräume zum Erproben und Anpassen."
      ],
      fallen: [
        { name: "Zusatzaufgabenfalle", text: "Veränderung wird erwartet, ohne dafür Raum und Zeit vorzusehen." },
        { name: "Effizienzfalle", text: "Zeit für Lernen und Reflexion erscheint als unproduktiver Aufwand." },
        { name: "Funktionalitätsfalle", text: "Raum wird auf Infrastruktur reduziert." },
        { name: "Kontrollfalle", text: "Lernzeiten werden so stark reglementiert, dass sie ihre Wirkung verlieren." }
      ],
      beobachtung: [
        "Welche Zeit steht tatsächlich für Lernen und Reflexion zur Verfügung?",
        "Welche Termine oder Routinen verhindern heute Entwicklung?",
        "Welche Räume sind für Experimente vorhanden?"
      ],
      kernfrage: "Gib Veränderung Raum und Zeit. Ermögliche Lernen dort, wo Arbeit stattfindet.",
      reflexionsfragen: [
        "Wo und wann kann und soll die gewünschte Entwicklung tatsächlich stattfinden?",
        "Welche physischen, virtuellen und sozialen Räume unterstützen unsere Intention?",
        "Wo konkurrieren Arbeits- und Lernzeit noch miteinander?",
        "Woran erkennen wir, dass Raum und Zeit Entwicklung wirklich ermöglichen?"
      ],
      objekte: [
        { aspekt: "Räume", beispiele: ["Lernräume", "Projekträume", "digitale Plattformen"] },
        { aspekt: "Zeit", beispiele: ["Lernzeiten", "Experimentierzeiten", "Reflexionszeiten"] },
        { aspekt: "Rhythmen", beispiele: ["Sprintzyklen", "Reviewformate", "Retrospektiven"] }
      ]
    }
  ];

  var STATUS = {
    offen: { key: "offen", label: "Offen", weight: 0 },
    in_arbeit: { key: "in_arbeit", label: "In Arbeit", weight: 0.5 },
    etabliert: { key: "etabliert", label: "Lebt im Alltag", weight: 1 }
  };

  function getStation(key) {
    for (var i = 0; i < STATIONS.length; i++) {
      if (STATIONS[i].key === key) return STATIONS[i];
    }
    return null;
  }

  global.AVERA_DATA = {
    SEQUENCE: SEQUENCE,
    DIMENSIONS: DIMENSIONS,
    STATIONS: STATIONS,
    STATUS: STATUS,
    getStation: getStation
  };
})(window);

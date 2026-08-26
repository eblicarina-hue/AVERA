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
      ziel: "Ein Satz, den alle im Kernteam gleich sagen können – was sich ändern soll, warum es wichtig ist und wie die gewünschte Zukunft konkret aussieht. Ohne dieses gemeinsame Zielbild bleibt jede folgende Maßnahme beliebig.",
      diagnose: [
        {
          frage: "Können alle im Kernteam die Intention in einem Satz gleich wiedergeben?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Sehr gut – eine geteilte, prägnante Intention ist die seltenste und wichtigste Grundlage. Haltet sie sichtbar (z. B. als Leitsatz in jedem Kickoff) und prüft sie bei jeder größeren Entscheidung erneut." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt eine Richtung, aber noch keine gemeinsame Sprache dafür. Setzt einen Termin an, an dem ihr die Intention gemeinsam in einem Satz formuliert – nicht top-down verordnet, sondern mit den relevanten Perspektiven geschärft." },
            { label: "Nein", score: 0, empfehlung: "Ihr steckt in der Beliebigkeitsfalle: Ohne gemeinsames Verständnis interpretiert jede:r die Veränderung anders, und einzelne Maßnahmen verlieren ihre Kraft. Bevor irgendetwas anderes geplant wird: Intention klären und schriftlich fixieren." }
          ]
        },
        {
          frage: "Wisst ihr, welches Problem oder welche Chance den Ausschlag für dieses Vorhaben gegeben hat – über die reine Kennzahl hinaus?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Ihr kennt das Wozu hinter dem Was. Nutzt dieses Motiv aktiv in der Kommunikation – es trägt weiter als jede Zahl." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt eine Kennzahl oder einen Auftrag, aber das dahinterliegende Motiv ist noch nicht klar benannt. Fragt: Was passiert, wenn wir nichts tun? Das schärft das eigentliche Motiv." },
            { label: "Nein", score: 0, empfehlung: "Ihr steckt in der Kennzahlenfalle: Eine Kennzahl ersetzt keine gemeinsame Vorstellung davon, was sich wirklich verändern soll. Klärt zuerst das Motiv, bevor Maßnahmen geplant werden." }
          ]
        },
        {
          frage: "Verfolgt ihr aktuell genau eine klar priorisierte Intention – nicht mehrere parallel?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Fokus ist da. Achtet darauf, neue Themen nicht einfach zusätzlich draufzupacken, sondern bewusst gegen die Intention zu prüfen." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt mehrere Stoßrichtungen, die noch nicht klar zueinander in Beziehung stehen. Ordnet sie: Was ist die eine übergeordnete Intention, welche anderen sind Unterpunkte oder sollten verschoben werden?" },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Aktivitätsfalle: mehrere parallele Vorhaben ohne gemeinsamen Nenner schwächen sich gegenseitig. Bringt die Verantwortlichen zusammen und einigt euch auf eine führende Intention." }
          ]
        }
      ],
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
      ziel: "Eine Geschichte der Veränderung, die Mitarbeitende in eigenen Worten weitererzählen – nicht nur eine Kommunikationskampagne, sondern eine Erzählung, die im Alltag lebt und Orientierung gibt.",
      diagnose: [
        {
          frage: "Gibt es eine erzählbare Geschichte der Veränderung (woher – warum – wohin), die Mitarbeitende in eigenen Worten weitererzählen können?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Die Geschichte lebt. Beobachtet weiter, wie sie sich im Alltag verändert, und schreibt bewusst mit." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt Kommunikation, aber noch keine Geschichte, die hängen bleibt. Sammelt konkrete Szenen und Beispiele aus dem Alltag statt abstrakter Botschaften – daraus entsteht die Erzählung." },
            { label: "Nein", score: 0, empfehlung: "Ihr steckt in der Kommunikationsfalle: Informationen wurden verteilt, aber es gibt keine Geschichte, die Bedeutung erzeugt. Startet mit einer einfachen Frage im Team: Wie würden wir das einem Kollegen in der Kaffeeküche erklären?" }
          ]
        },
        {
          frage: "Ist eure interne Sprache zur Veränderung konsistent – oder kursieren widersprüchliche Begriffe und Buzzwords?",
          optionen: [
            { label: "Konsistent", score: 2, empfehlung: "Gute Basis. Ein kleines Glossar der Leitbegriffe hilft, das auch bei neuen Mitarbeitenden konsistent zu halten." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt erste gemeinsame Begriffe, aber noch Verwirrung. Einigt euch auf drei bis fünf Leitbegriffe und nutzt sie konsequent in jeder Kommunikation." },
            { label: "Widersprüchlich", score: 0, empfehlung: "Ihr seid in der Framingfalle: Unklare oder widersprüchliche Begriffe erzeugen Unsicherheit statt Orientierung. Klärt zuerst intern eine gemeinsame Sprache, bevor mehr kommuniziert wird." }
          ]
        },
        {
          frage: "Erleben Mitarbeitende die Geschichte auch im Alltag – oder bleibt sie auf Hochglanz-Kommunikation (Townhall, Newsletter) beschränkt?",
          optionen: [
            { label: "Auch im Alltag", score: 2, empfehlung: "Erzählung und Erfahrung passen zusammen – das schafft Glaubwürdigkeit. Sammelt weiter Alltagsbeispiele, die die Geschichte bestätigen." },
            { label: "Teilweise", score: 1, empfehlung: "Die große Erzählung existiert, aber der Alltag hinkt hinterher. Prüft im Element Führung & Alltag, wo genau die Lücke entsteht." },
            { label: "Nur Hochglanz", score: 0, empfehlung: "Ihr seid in der Hochglanzfalle: eine perfekt erzählte Geschichte, die im Alltag nicht einlösbar ist, untergräbt Vertrauen. Reduziert die Kommunikation, bis Führung & Alltag nachgezogen haben." }
          ]
        }
      ],
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
      ziel: "Strukturen, Prozesse und Routinen, die das gewünschte Verhalten tatsächlich ermöglichen – nicht nur Appelle, sondern veränderte Rahmenbedingungen, an denen sich neues Verhalten festmachen kann.",
      diagnose: [
        {
          frage: "Wurden Strukturen, Prozesse oder Zielsysteme bereits konkret verändert, um das neue Verhalten zu ermöglichen – oder wird vor allem appelliert?",
          optionen: [
            { label: "Konkret verändert", score: 2, empfehlung: "Die Bedingungen ziehen mit. Prüft regelmäßig, ob neue Routinen tatsächlich stabil werden." },
            { label: "Teilweise", score: 1, empfehlung: "Erste Anpassungen laufen, aber die zentralen Strukturen (Ziele, Prozesse, Entscheidungswege) sind noch unverändert. Identifiziert die ein bis zwei wichtigsten Strukturhebel und plant deren Anpassung konkret." },
            { label: "Nur Appell", score: 0, empfehlung: "Ihr seid in der Schönwetterfalle: Verhalten soll sich ändern, ohne dass sich die organisationalen Bedingungen ändern. Das trägt nicht. Benennt konkret, welche Struktur oder welcher Prozess dem gewünschten Verhalten aktuell widerspricht." }
          ]
        },
        {
          frage: "Werden Widersprüche zwischen offizieller Botschaft und gelebter Praxis offen angesprochen?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Ihr nutzt Widersprüche als Gestaltungshinweis – genau richtig. Macht das sichtbar (z. B. in Retros), damit es Routine wird." },
            { label: "Teilweise", score: 1, empfehlung: "Widersprüche werden bemerkt, aber selten offen besprochen. Schafft ein festes Format (z. B. eine Retro), in dem das explizit Thema ist." },
            { label: "Nein", score: 0, empfehlung: "Widersprüche zwischen Organisation und Intention bleiben unausgesprochen – das untergräbt Glaubwürdigkeit. Fragt aktiv nach: Wo passt unser Alltag nicht zur Story?" }
          ]
        },
        {
          frage: "Wird das gewünschte Verhalten eher trainiert (den Menschen beigebracht) oder werden die organisationalen Rahmenbedingungen dafür verändert?",
          optionen: [
            { label: "Rahmenbedingungen", score: 2, empfehlung: "Ihr setzt an der richtigen Stelle an. Kombiniert das weiterhin mit gezielten Lerngelegenheiten (Entdecken & Aneignen), aber die Struktur bleibt die Basis." },
            { label: "Beides, unkoordiniert", score: 1, empfehlung: "Beides passiert parallel, aber unkoordiniert. Klärt: Welches Problem ist strukturell, welches ist wirklich ein Lernthema?" },
            { label: "Vor allem Training", score: 0, empfehlung: "Ihr seid in der Trainingsfalle: ein organisationales Problem wird zum Lernproblem erklärt. Kein Training kompensiert dauerhaft fehlende strukturelle Voraussetzungen." }
          ]
        }
      ],
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
      ziel: "Führungskräfte, die die Veränderung im Alltag sichtbar vorleben, dafür geschützte Zeit schaffen und Mitarbeitenden konkret übersetzen, was sich für ihre tägliche Arbeit ändert.",
      diagnose: [
        {
          frage: "Sprechen Führungskräfte im Alltag – nicht nur in offiziellen Terminen – aktiv über die Veränderung?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Der Zündfunke ist da. Achtet darauf, dass das über alle Führungsebenen hinweg konsistent bleibt." },
            { label: "Teilweise", score: 1, empfehlung: "Einzelne Führungskräfte tun das, andere nicht. Macht es konkret erwartbar: Was genau sollen Führungskräfte im Alltag ansprechen?" },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Delegationsfalle: Veränderung wird an HR oder Corporate Learning abgegeben, Führung hält sich raus. Ohne Führung im Alltag bleibt die Intention ein strategisches Versprechen." }
          ]
        },
        {
          frage: "Haben Führungskräfte im Tagesgeschäft tatsächlich Zeit und Priorität für Reflexion und Ausprobieren eingeräumt – oder frisst das Tagesgeschäft alles auf?",
          optionen: [
            { label: "Ja, geschützt", score: 2, empfehlung: "Gute Priorisierung. Macht diese Zeiträume sichtbar (z. B. feste Termine), damit sie nicht wieder verschwinden." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt Ansätze, aber unter Druck fällt Reflexion meist zuerst weg. Blockt feste, geschützte Zeiten – lose Absicht reicht nicht." },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Effizienzfalle: kurzfristige Zielerreichung verdrängt jede Lern- und Reflexionszeit. Ohne Raum & Zeit dafür bleibt jede Absicht folgenlos." }
          ]
        },
        {
          frage: "Wissen Mitarbeitende konkret, was die Veränderung für ihre eigene tägliche Arbeit bedeutet?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Die Übersetzung in den Alltag ist gelungen. Prüft das regelmäßig erneut, wenn sich die Intention weiterentwickelt." },
            { label: "Nur die große Linie", score: 1, empfehlung: "Die große Linie ist klar, die konkrete Übersetzung auf einzelne Rollen fehlt noch. Übersetzt gemeinsam mit den Teams: Was heißt das für dich konkret?" },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Übersetzungsfalle: die Intention bleibt auf strategischer Ebene stecken. Ohne diese Übersetzung wird die Veränderung nicht relevant." }
          ]
        }
      ],
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
      ziel: "Echte Gelegenheiten zum Ausprobieren an realen Herausforderungen – Menschen eignen sich die Veränderung an, indem sie selbst handeln, nicht indem sie Inhalte konsumieren.",
      diagnose: [
        {
          frage: "Können Menschen im Rahmen der Initiative selbst ausprobieren, statt nur Inhalte zu konsumieren?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Aktivität vor Konsum – genau richtig. Achtet darauf, genug Raum für eigene Fragen zu lassen, statt alles vorzugeben." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt Inhalte, aber noch wenig eigenes Tun. Baut mindestens eine konkrete Praxisaufgabe oder ein Experiment mit echtem Alltagsbezug ein." },
            { label: "Nein, nur Inhalte", score: 0, empfehlung: "Ihr seid in der Contentfalle: Wissen wird bereitgestellt, aber es fehlt die aktive Auseinandersetzung. Wissen allein verändert kein Handeln." }
          ]
        },
        {
          frage: "Gibt es echte Anlässe und Herausforderungen aus dem Alltag, an denen gelernt wird – oder ist das Lernangebot losgelöst vom Tagesgeschäft?",
          optionen: [
            { label: "Echte Anlässe", score: 2, empfehlung: "Lernen ist mit echter Arbeit verbunden – das erzeugt Relevanz. Sammelt diese Anlässe systematisch für weitere Formate." },
            { label: "Teilweise", score: 1, empfehlung: "Einige Bezüge zum Alltag sind da, aber noch konstruiert. Fragt Teams direkt: Woran arbeitet ihr gerade, das hierzu passt?" },
            { label: "Losgelöst", score: 0, empfehlung: "Ihr seid in der Steuerungsfalle: Lernen wird wie ein Projekt von oben geplant, losgelöst vom echten Alltag. Sucht euch reale Herausforderungen als Ausgangspunkt." }
          ]
        },
        {
          frage: "Dürfen unterschiedliche Menschen unterschiedliche Lernwege und -tempi haben, oder bekommen alle dasselbe Programm?",
          optionen: [
            { label: "Individuell", score: 2, empfehlung: "Individuelle Aneignung wird ernst genommen. Behaltet im Blick, dass trotzdem genug soziale Anschlussfähigkeit bleibt (siehe Peers & Resonanz)." },
            { label: "Leicht differenziert", score: 1, empfehlung: "Es gibt leichte Differenzierung, aber im Kern ein Standardprogramm. Baut mindestens eine Wahlmöglichkeit oder ein individuelles Format ein." },
            { label: "Alle dasselbe", score: 0, empfehlung: "Ihr seid in der One-Size-Fits-All-Falle: alle erhalten dieselben Inhalte, individuelle Fragen bleiben unberücksichtigt. Das verringert die Aneignung erheblich." }
          ]
        }
      ],
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
      ziel: "Ein soziales Umfeld, in dem sich Menschen über die Veränderung austauschen, glaubwürdige Vorbilder sichtbar werden und neues Verhalten Schritt für Schritt zur gemeinsamen Normalität wird.",
      diagnose: [
        {
          frage: "Tauschen sich Menschen über die Veränderung informell aus – auch ohne dass ihr das organisiert habt?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Es entsteht organische Resonanz. Gebt diesen informellen Räumen bewusst noch mehr Sichtbarkeit." },
            { label: "Vereinzelt", score: 1, empfehlung: "Es gibt vereinzelten Austausch, aber noch keine verlässlichen Räume dafür. Schafft ein festes, niedrigschwelliges Format, z. B. eine wiederkehrende Austauschrunde." },
            { label: "Kaum", score: 0, empfehlung: "Ihr seid in der Isolationsfalle: Lernen bleibt individuell, es wird nichts sichtbar geteilt. Ohne sozialen Austausch trägt Veränderung nicht über Einzelne hinaus." }
          ]
        },
        {
          frage: "Gibt es glaubwürdige Vorbilder, die das neue Verhalten bereits sichtbar vorleben – nicht nur offiziell ernannte Botschafter:innen?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Echte Vorbilder wirken stärker als jede Kampagne. Macht ihre Geschichten aktiv sichtbar." },
            { label: "Ansatzweise", score: 1, empfehlung: "Es gibt Ansätze, aber noch zu wenig Sichtbarkeit. Fragt gezielt: Wer lebt das bereits – und wie können wir das teilen?" },
            { label: "Nur ernannt", score: 0, empfehlung: "Ihr seid in der Multiplikatorenfalle: Botschafter:innen wurden ernannt, ohne dass echte Glaubwürdigkeit oder Beziehung entstanden ist. Sucht organisch entstandene Vorbilder, statt sie zu verordnen." }
          ]
        },
        {
          frage: "Passt euer Beteiligungsformat zur jeweiligen Zielgruppe – oder bekommt jede Gruppe dasselbe Format und dieselbe Intensität?",
          optionen: [
            { label: "Passt zur Zielgruppe", score: 2, empfehlung: "Ihr denkt in Zielgruppen und Lerntiefen – das erhöht die Wirkung deutlich." },
            { label: "Teilweise", score: 1, empfehlung: "Es gibt leichte Unterschiede, aber im Kern ein Format für alle. Identifiziert zwei bis drei Zielgruppen mit unterschiedlichem Bedarf und passt die Formate gezielt an." },
            { label: "Alle gleich", score: 0, empfehlung: "Ihr seid in der One-Size-Fits-All-Falle bei Peers & Resonanz: Alle Zielgruppen erhalten dieselben Angebote, unterschiedliche Rollen und Bedürfnisse bleiben unberücksichtigt." }
          ]
        }
      ],
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
      ziel: "Eine stimmige Lernarchitektur, deren Formate bewusst aus der gewünschten Wirkung abgeleitet sind – nicht Methoden um ihrer selbst willen, sondern gezielt gewählte Formate, die aufeinander aufbauen.",
      diagnose: [
        {
          frage: "Wurde die Methode bzw. das Format erst gewählt, nachdem klar war, welche Wirkung erzielt werden soll?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Wirkung vor Methode – genau die richtige Reihenfolge. Überprüft das bei jeder neuen Maßnahme erneut." },
            { label: "Teilweise", score: 1, empfehlung: "Teilweise stand die Methode schon fest, bevor die Wirkung klar war. Nehmt euch vor der nächsten Maßnahme kurz Zeit, die Wirkungsfrage zu klären." },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Toolfalle: Die Suche nach der richtigen Methode hat die Klärung der eigentlichen Gestaltungsfrage ersetzt. Geht einen Schritt zurück und klärt zuerst die Wirkung." }
          ]
        },
        {
          frage: "Bilden eure Formate eine zusammenhängende Lernarchitektur – oder sind es einzelne, lose Maßnahmen?",
          optionen: [
            { label: "Zusammenhängend", score: 2, empfehlung: "Ihr denkt in Architektur statt Einzelmaßnahmen. Das ist der stärkste Hebel bei Methoden & Formate." },
            { label: "Teilweise verbunden", score: 1, empfehlung: "Es gibt mehrere Formate, aber ihr Zusammenspiel ist noch nicht klar geplant. Zeichnet den Lernpfad einmal end-to-end auf und prüft die Übergänge." },
            { label: "Lose Einzelmaßnahmen", score: 0, empfehlung: "Ihr seid in der One-Hit-Wonder-Falle: einzelne aufwändige Maßnahmen stehen isoliert ohne Einbettung. Das verpufft meist schnell wieder." }
          ]
        },
        {
          frage: "Nutzt ihr Methoden, weil sie zur Intention passen – oder eher, weil sie gerade im Trend sind?",
          optionen: [
            { label: "Passt zur Intention", score: 2, empfehlung: "Bewusste Methodenwahl – das trägt langfristig mehr als jeder Trend." },
            { label: "Beides mischt sich", score: 1, empfehlung: "Es mischt sich beides. Prüft eure aktuelle Formatliste einmal explizit gegen die Intention." },
            { label: "Eher Trend", score: 0, empfehlung: "Ihr seid in der Trendfalle: neue Formate, weil sie attraktiv wirken – nicht weil sie zur Wirkung beitragen. Bewährte, einfache Methoden wirken oft stärker." }
          ]
        }
      ],
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
      ziel: "Geschützte, wiederkehrende Zeit und ein sicherer Raum, in dem Ausprobieren, Reflexion und Austausch tatsächlich stattfinden können – ohne dieses Fundament bleibt jedes andere Element folgenlos.",
      diagnose: [
        {
          frage: "Ist für diese Initiative geschützte Zeit im Kalender/Alltag reserviert – nicht nur 'wenn Zeit übrig ist'?",
          optionen: [
            { label: "Ja, fest reserviert", score: 2, empfehlung: "Zeit ist da. Verteidigt sie aktiv gegen den Druck des Tagesgeschäfts – das wird die eigentliche Herausforderung bleiben." },
            { label: "Vage Zusagen", score: 1, empfehlung: "Es gibt vage Zusagen, aber keine festen, geschützten Termine. Blockt konkrete, wiederkehrende Zeitfenster im Kalender." },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Zusatzaufgabenfalle: Veränderung wird erwartet, ohne dass dafür Zeit vorgesehen ist. Ohne feste Zeit bleibt jede Absicht folgenlos." }
          ]
        },
        {
          frage: "Gibt es einen Ort oder Raum (physisch oder virtuell), an dem Ausprobieren und Reflexion risikofrei möglich ist?",
          optionen: [
            { label: "Ja", score: 2, empfehlung: "Ein geschützter Raum zum Ausprobieren ist ein starker Hebel. Macht ihn allen sichtbar zugänglich." },
            { label: "Vereinzelt", score: 1, empfehlung: "Es gibt vereinzelte Gelegenheiten, aber keinen verlässlichen Ort dafür. Etabliert einen festen Rahmen, physisch oder virtuell." },
            { label: "Nein", score: 0, empfehlung: "Ihr seid in der Funktionalitätsfalle: Raum wird auf reine Infrastruktur reduziert. Ohne einen echten Möglichkeitsraum bleibt Ausprobieren die Ausnahme." }
          ]
        },
        {
          frage: "Wird die investierte Zeit an ihrer Wirkung gemessen – oder vor allem daran, wie viele Stunden 'ordentlich' dokumentiert wurden?",
          optionen: [
            { label: "An der Wirkung", score: 2, empfehlung: "Ihr bewertet Lern- und Veränderungszeit richtig – nach Wirkung, nicht nach Stundenzettel." },
            { label: "Beides mischt sich", score: 1, empfehlung: "Beides mischt sich noch. Klärt im Team, welche Wirkung ihr eigentlich sehen wollt, und macht das zum Maßstab." },
            { label: "Vor allem Dokumentation", score: 0, empfehlung: "Ihr seid in der Kontrollfalle: Lernzeiten werden so stark reglementiert oder dokumentiert, dass sie ihre Wirkung verlieren. Löst euch von reiner Zeiterfassung." }
          ]
        }
      ],
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

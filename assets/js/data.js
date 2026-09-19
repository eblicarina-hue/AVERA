/*
 * AVERA-Inhalte (Admonter Veränderungsrad) – episodischer Workflow.
 * Grundlage: AVERA White Paper 2.0, Workflow-Beschreibung "Episode & Schleife"
 * und die Fragen-/4Fakte-Matrix der Corporate Learning Community Österreich (#CLCA).
 * Fragen- und 4Fakte-Texte sind wörtlich aus der Quelle übernommen.
 */
(function (global) {
  "use strict";

  var SPHERES = {
  "business": {
    "label": "Business",
    "note": "wird meist vom Business getrieben"
  },
  "corporate_learning": {
    "label": "Corporate Learning",
    "note": "wird meist von Corporate Learning / HR getrieben"
  },
  "cross_spheric": {
    "label": "Cross-Spheric",
    "note": "verbindet Business und Corporate Learning"
  }
};

  // Reihenfolge = Drehrichtung des Rads. Raum & Zeit steht im Zentrum.
  var SEQUENCE = [
  "story",
  "orgkultur",
  "fuehrung",
  "entdecken",
  "peers",
  "methoden"
];

  // Die vier Schleifen einer Episode (vgl. AVERA-Workflow: 'Observe -> Understand -> Design -> Architect').
  var LOOPS = [
  {
    "key": "observe",
    "label": "Beobachten",
    "funktion": "Status quo erfassen und differenzieren",
    "ergebnis": "relevante Befunde"
  },
  {
    "key": "understand",
    "label": "Verstehen",
    "funktion": "Wirkgefüge erkennen und modellieren",
    "ergebnis": "Wirkmodell, Hebel und Gestaltungshypothesen"
  },
  {
    "key": "design",
    "label": "Entwerfen",
    "funktion": "Gestaltungsmöglichkeiten finden",
    "ergebnis": "mögliche Gestaltungsimpulse"
  },
  {
    "key": "architect",
    "label": "Komponieren",
    "funktion": "Möglichkeiten reduzieren und komponieren",
    "ergebnis": "minimal hinreichende Gestaltungsarchitektur"
  }
];

  // Elementunabhängige Leitfragen je Schleife (gelten für die ganze Episode, nicht pro Element).
  var LOOP_GENERAL_FRAGEN = {
  "observe": {
    "fokus": "Was beobachten wir mit Blick auf unsere Intention aktuell?",
    "wirkgefuege": "Was davon unterstützt, erschwert oder widerspricht unserer Intention?",
    "potenziale": "Welche vorhandenen Ressourcen, funktionierenden Praktiken oder positiven Abweichungen sehen wir?",
    "pruefung": "Haben wir aus ausreichend unterschiedlichen Perspektiven beobachtet – und was wissen wir noch nicht?",
    "gate": "Haben wir genug unterschiedliche, konkrete Beobachtungen, um über Zusammenhänge nachdenken zu können?"
  },
  "understand": {
    "fokus": "Was könnte erklären, warum sich das beobachtete Verhalten heute so zeigt?",
    "wirkgefuege": "Was verstärkt oder schwächt sich gegenseitig? Welche Spannungen oder Rückkopplungen könnten relevant sein?",
    "potenziale": "Welche vorhandenen Ressourcen könnten Bewegung im Sinne unserer Intention unterstützen?",
    "pruefung": "Welche andere oder gar widersprechende Interpretation wäre ebenfalls plausibel?",
    "gate": "Haben wir plausible Erklärungen dafür, was Verhalten heute hervorbringt oder stabilisiert – und können wir begründen, wo Gestaltung ansetzen könnte?"
  },
  "design": {
    "fokus": "Welche unterschiedlichen Gestaltungsoptionen könnten die Intention unterstützen?",
    "wirkgefuege": "Welche vorhandenen Ressourcen und funktionierenden Praktiken könnten wir nutzen oder verstärken, statt Neues hinzuzufügen?",
    "potenziale": "Welche 4Fakte könnten wir nutzen oder gestalten, um das intendierte Verhalten wahrscheinlicher zu machen?",
    "pruefung": "Wie könnte man es noch anlegen? Haben wir echte Alternativen entwickelt – oder folgen wir nur unserer ersten Lösungsidee?",
    "gate": "Haben wir den Gestaltungsraum hinreichend geöffnet, um aus echten Alternativen eine kohärente Architektur komponieren zu können?"
  },
  "architect": {
    "fokus": "Welche der Gestaltungsoptionen verstärken sich gegenseitig – und welche widersprechen sich?",
    "wirkgefuege": "Was funktioniert plausibel nur im Zusammenspiel mit etwas anderem? Was können wir weglassen, ohne die erwartete Gesamtwirkung wesentlich zu schwächen?",
    "potenziale": "Wie schaffen wir möglichst hohe Anschlussfähigkeit an das Bestehende? Welche vorhandenen Ressourcen und funktionierenden Praktiken können wir nutzen?",
    "pruefung": "Ermöglicht unsere Architektur Menschen, das intendierte Verhalten tatsächlich auszuprobieren – auch wenn dabei Unsicherheit, Nicht-Wissen, Fehler oder Widerspruch sichtbar werden?",
    "gate": "Können wir begründen, warum genau diese wenigen, aufeinander abgestimmten Impulse jetzt hinreichend sein könnten, um unsere Intention wahrscheinlicher zu machen?"
  }
};

  var FAKTE_TYPEN = [
  {
    "key": "artefakt",
    "label": "Artefakte",
    "subtitle": "das Sichtbare"
  },
  {
    "key": "soziofakt",
    "label": "Soziofakte",
    "subtitle": "das Praktizierte"
  },
  {
    "key": "mentefakt",
    "label": "Mentefakte",
    "subtitle": "das Geglaubte"
  },
  {
    "key": "ethofakt",
    "label": "Ethofakte",
    "subtitle": "das Verinnerlichte"
  }
];

  var WIRKSTUFEN = [
  {
    "key": "beruehren",
    "label": "Berühren & Orientieren",
    "subtitle": "Emotion, Erwartung & Fokus"
  },
  {
    "key": "begreifen",
    "label": "Begreifen & Einordnen",
    "subtitle": "Erkennen, Wissen & Verständnis"
  },
  {
    "key": "erproben",
    "label": "Erproben & Handeln",
    "subtitle": "Praxis & Lösung"
  },
  {
    "key": "reflektieren",
    "label": "Reflektieren & Verankern",
    "subtitle": "Erfahrung, Stabilisieren & Teilen"
  }
];

  // 4Fakte-Katalog: je Fakt-Typ x Wirkstufe eine Liste von Unterkategorien mit Beispielen.
  var FAKTE = {
  "artefakt": {
    "beruehren": [
      {
        "kategorie": "Informations- & Symbolobjekte",
        "beispiele": [
          "Plakat",
          "Teaser",
          "Kampagnenkarte",
          "Flyer",
          "Sticker",
          "Give-away",
          "Start-Symbol",
          "Kurzvideo"
        ]
      },
      {
        "kategorie": "Arbeits- & Handlungshilfen",
        "beispiele": [
          "Quick Guide",
          "Orientierungskarte",
          "Spickzettel",
          "Impulskarten"
        ]
      },
      {
        "kategorie": "Dokumentations- & Kollaborationsflächen",
        "beispiele": [
          "Statusanzeige",
          "Fortschrittsboard",
          "Countdown-Screen",
          "Prozesswand"
        ]
      },
      {
        "kategorie": "Ordnungs-, Steuerungs- & Raumstrukturen",
        "beispiele": [
          "Verantwortungslandkarte",
          "Prinzipienübersicht",
          "Beschilderung",
          "Visuelle Raummarker"
        ]
      }
    ],
    "begreifen": [
      {
        "kategorie": "Informations- & Symbolobjekte",
        "beispiele": [
          "Infografik",
          "Erklärvideo",
          "FAQ",
          "Broschüre",
          "Prozess-Roadmap",
          "Anschauungsobjekt"
        ]
      },
      {
        "kategorie": "Arbeits- & Handlungshilfen",
        "beispiele": [
          "Glossar",
          "Entscheidungshilfe",
          "Referenzkarte"
        ]
      },
      {
        "kategorie": "Dokumentations- & Kollaborationsflächen",
        "beispiele": [
          "Dashboard",
          "Prozess-Monitor",
          "Soll-Ist-Visualisierung",
          "Infowand"
        ]
      },
      {
        "kategorie": "Ordnungs-, Steuerungs- & Raumstrukturen",
        "beispiele": [
          "Rollen- & Schnittstellenmatrix",
          "Governance-Modell",
          "Eskalationsmatrix",
          "Orientierungszone"
        ]
      }
    ],
    "erproben": [
      {
        "kategorie": "Informations- & Symbolobjekte",
        "beispiele": [
          "How-to-Video",
          "Anleitung",
          "Tutorial",
          "Lernkarte",
          "Prompt Card",
          "Reminder-Objekt",
          "Challenge-Token"
        ]
      },
      {
        "kategorie": "Arbeits- & Handlungshilfen",
        "beispiele": [
          "Checkliste",
          "Job Aid",
          "Template",
          "Gesprächsleitfaden",
          "Problemlösungs-Canvas",
          "Kreativkarten"
        ]
      },
      {
        "kategorie": "Dokumentations- & Kollaborationsflächen",
        "beispiele": [
          "Kanban-Board",
          "Experiment-Tracker",
          "Problemboard",
          "Ideenwand",
          "Prototyping-Fläche"
        ]
      },
      {
        "kategorie": "Ordnungs-, Steuerungs- & Raumstrukturen",
        "beispiele": [
          "Arbeitsstandards",
          "Freigaberegeln",
          "Working Agreements",
          "Arbeitsplatz-Setup",
          "(digitale) Defaults"
        ]
      }
    ],
    "reflektieren": [
      {
        "kategorie": "Informations- & Symbolobjekte",
        "beispiele": [
          "Erfahrungsbericht",
          "Case Study",
          "Video-Testimonial",
          "Badge",
          "Award",
          "Zertifikat",
          "Commitment-Token"
        ]
      },
      {
        "kategorie": "Arbeits- & Handlungshilfen",
        "beispiele": [
          "Selbstcheck",
          "Reflexionsbogen",
          "Feedback-Guide",
          "Lessons-Learned-Vorlage",
          "Übergabe-Template"
        ]
      },
      {
        "kategorie": "Dokumentations- & Kollaborationsflächen",
        "beispiele": [
          "Feedback-Dashboard",
          "Verhaltens-Tracker",
          "Review-Board",
          "Lessons-Learned-Board",
          "Knowledge Wall"
        ]
      },
      {
        "kategorie": "Ordnungs-, Steuerungs- & Raumstrukturen",
        "beispiele": [
          "Standard-/SOP-Bibliothek",
          "Pattern Library",
          "Audit-Bogen",
          "Community-Fläche",
          "Retrospektiven-Setup"
        ]
      }
    ]
  },
  "soziofakt": {
    "beruehren": [
      {
        "kategorie": "Geführte Impulse & Instruktion",
        "beispiele": [
          "(Impuls-)Vortrag",
          "Keynote",
          "Webinar",
          "Lernimpuls (Microlearning)",
          "Brown Bag",
          "Lunch & Learn"
        ]
      },
      {
        "kategorie": "Individuelle Praxis & Begleitung",
        "beispiele": [
          "Intranet-Information",
          "Selbstcheck",
          "Selbsteinschätzung",
          "Standortbestimmung",
          "Hospitation"
        ]
      },
      {
        "kategorie": "Kollaboratives Arbeiten & Lernen",
        "beispiele": [
          "Kick-off",
          "Dialogrunde",
          "Q&A",
          "Townhall",
          "gemeinsame Exploration",
          "Ask-me-anything-Session",
          "Fireside Chat",
          "Huddle",
          "Check-in"
        ]
      },
      {
        "kategorie": "Ordnung, Steuerung & Vereinbarungen",
        "beispiele": [
          "Rollen-/Erwartungsklärung",
          "Commitment-Auftakt"
        ]
      }
    ],
    "begreifen": [
      {
        "kategorie": "Geführte Impulse & Instruktion",
        "beispiele": [
          "Fachvortrag",
          "Expert Talk",
          "Erklärsession",
          "Schulung",
          "Seminar",
          "Best-Practice-Input",
          "Expert:innenforum",
          "Fachkonferenz"
        ]
      },
      {
        "kategorie": "Individuelle Praxis & Begleitung",
        "beispiele": [
          "(Medien-)Selbststudium",
          "eLearning",
          "Online-Kurs",
          "MOOC",
          "Rechercheauftrag",
          "Debriefing",
          "Review"
        ]
      },
      {
        "kategorie": "Kollaboratives Arbeiten & Lernen",
        "beispiele": [
          "Workshop",
          "Diskussion",
          "Fach-/Klärungsdialog",
          "Sensemaking-Workshop",
          "Appreciative Inquiry",
          "Sprechstunden",
          "Lernkonferenz",
          "Barcamp",
          "Study Visit",
          "Show & Tell",
          "Regelkommunikation (zB Meetings)",
          "Tutoring"
        ]
      },
      {
        "kategorie": "Ordnung, Steuerung & Vereinbarungen",
        "beispiele": [
          "Mandats-/Ziel-/ Schnittstellen-/Regelklärung"
        ]
      }
    ],
    "erproben": [
      {
        "kategorie": "Geführte Impulse & Instruktion",
        "beispiele": [
          "(Live-)Demonstration",
          "Training",
          "Training-on-the-Job",
          "Übung",
          "Simulation",
          "Rollenspiel",
          "Bootcamp",
          "Skills Lab",
          "Planspiel"
        ]
      },
      {
        "kategorie": "Individuelle Praxis & Begleitung",
        "beispiele": [
          "Selbstlernübung",
          "Praxis-/Gestaltungs-/Projektauftrag",
          "Fall-/Problembearbeitung",
          "Lern-Challenge",
          "Job Shadowing",
          "Schulterblick",
          "Floorwalking",
          "Coaching",
          "Mentoring",
          "Sparring",
          "Entwicklungsdialog",
          "Transferaufgabe"
        ]
      },
      {
        "kategorie": "Kollaboratives Arbeiten & Lernen",
        "beispiele": [
          "Peer Learning",
          "Lerntandem",
          "/-zirkel/-reisen",
          "Troubleshooting-Session",
          "Case Clinic",
          "Lernwerkstatt",
          "Zukunftslabor",
          "Co-Creation",
          "Innovation Lab",
          "Taskforce",
          "Experiment",
          "Gesundheits-/Qualitätszirkel",
          "Action Learning"
        ]
      },
      {
        "kategorie": "Ordnung, Steuerung & Vereinbarungen",
        "beispiele": [
          "SOPs",
          "Handlungsvereinbarungen",
          "Teamkontrakt",
          "Steuerkreis",
          "Entscheidungsinstanz"
        ]
      }
    ],
    "reflektieren": [
      {
        "kategorie": "Geführte Impulse & Instruktion",
        "beispiele": [
          "Geleitete Reflexion",
          "Supervision",
          "Feedback-Session",
          "Development Center",
          "Erfahrungsbericht"
        ]
      },
      {
        "kategorie": "Individuelle Praxis & Begleitung",
        "beispiele": [
          "Lern- bzw Transferjournal",
          "Praxistagebuch",
          "Transfer-Challenge",
          "Praxisreflexion",
          "Transfercoaching"
        ]
      },
      {
        "kategorie": "Kollaboratives Arbeiten & Lernen",
        "beispiele": [
          "Retro/Feedback/Reflexionsdialog (Daily/Weekly)",
          "Team-Workshop",
          "Intervision",
          "Peer Coaching",
          "Fuck-up Night",
          "Kollegiale Fallberatung",
          "After Action Review",
          "Check-out",
          "Erfahrungsaustausch",
          "Open Space",
          "World Café",
          "Support-/Lern-Community"
        ]
      },
      {
        "kategorie": "Ordnung, Steuerung & Vereinbarungen",
        "beispiele": [
          "Praxis- bzw Umsetzungs-Review",
          "Anerkennungs-/Lessons-Learned-Runde"
        ]
      }
    ]
  },
  "mentefakt": {
    "beruehren": [
      {
        "kategorie": "Verdichtungen",
        "beispiele": [
          "Provokanter Claim",
          "mobilisierendes Motto",
          "Appell",
          "Weckruf",
          "Mutmacher"
        ]
      },
      {
        "kategorie": "Narrative & Deutungen",
        "beispiele": [
          "Change Story",
          "Krisen-/Aufbruchsgeschichte",
          "Dringlichkeitsdeutung",
          "Chancen-/Bedrohungsframing"
        ]
      },
      {
        "kategorie": "Metaphern & Vorstellungen/Zielbilder",
        "beispiele": [
          "Zukunftsmetapher (Expedition",
          "Reise)",
          "attraktives Zukunftsbild",
          "Gefährdungs- oder Gegenbild"
        ]
      },
      {
        "kategorie": "Modelle & Konzepte",
        "beispiele": [
          "Energiebilanz",
          "Change Readiness Modell"
        ]
      }
    ],
    "begreifen": [
      {
        "kategorie": "Verdichtungen",
        "beispiele": [
          "Definition",
          "Merksatz",
          "Kernbotschaft",
          "Erklärungssatz"
        ]
      },
      {
        "kategorie": "Narrative & Deutungen",
        "beispiele": [
          "Fallgeschichte",
          "Beispielgeschichte",
          "Erklärgeschichte",
          "Ursache-Wirkungs-Deutung"
        ]
      },
      {
        "kategorie": "Metaphern & Vorstellungen/Zielbilder",
        "beispiele": [
          "Analogie",
          "Eselsbrücke",
          "Erklärmetapher",
          "Sprachbild"
        ]
      },
      {
        "kategorie": "Modelle & Konzepte",
        "beispiele": [
          "Begriffskonzept",
          "Taxonomie",
          "Referenzmodell",
          "Denkmodell"
        ]
      }
    ],
    "erproben": [
      {
        "kategorie": "Verdichtungen",
        "beispiele": [
          "Handlungsmaxime",
          "Faustregel",
          "aktivierender Leitsatz",
          "Zielaussage"
        ]
      },
      {
        "kategorie": "Narrative & Deutungen",
        "beispiele": [
          "Evidenz- oder Erfolgsgeschichte",
          "Handlungsbegründung",
          "Reframing im Tun"
        ]
      },
      {
        "kategorie": "Metaphern & Vorstellungen/Zielbilder",
        "beispiele": [
          "Aktivitätsbild",
          "Handlungsanalogie",
          "Vorstellungen über Handlungswirkungen"
        ]
      },
      {
        "kategorie": "Modelle & Konzepte",
        "beispiele": [
          "Wirkmodell",
          "Prozessmodell",
          "Framework",
          "Handlungskonzept"
        ]
      }
    ],
    "reflektieren": [
      {
        "kategorie": "Verdichtungen",
        "beispiele": [
          "Credo",
          "Wertstatement",
          "Maxime",
          "Purpose-Statement",
          "Identitätssatz"
        ]
      },
      {
        "kategorie": "Narrative & Deutungen",
        "beispiele": [
          "Vorbildgeschichte",
          "Dilemma-Geschichte",
          "Wertegeschichte",
          "Identitätsstory",
          "geteiltes Leitnarrativ"
        ]
      },
      {
        "kategorie": "Metaphern & Vorstellungen/Zielbilder",
        "beispiele": [
          "Sinnbild",
          "Wertmetapher",
          "Rollen-/Identitätsmetapher",
          "Organisationsbild",
          "geteiltes Idealbild"
        ]
      },
      {
        "kategorie": "Modelle & Konzepte",
        "beispiele": [
          "Prinzipienmodell",
          "Wertekonzept",
          "Rollen- & Führungskonzept",
          "Zusammenarbeitskonzept"
        ]
      }
    ]
  },
  "ethofakt": {
    "beruehren": [
      {
        "kategorie": "Impulse & persönliche Leitlinien",
        "beispiele": [
          "Aktivierender Vorsatz",
          "persönlicher Handlungsimpuls",
          "Mottoziel"
        ]
      },
      {
        "kategorie": "Handlungsskripte & Sequenzen",
        "beispiele": [
          "Einstiegsskript",
          "triggergebundene Startsequenz"
        ]
      },
      {
        "kategorie": "Mikro- & Arbeitsroutinen",
        "beispiele": [
          "Startroutine",
          "triggergebundene Aktivierungsroutine"
        ]
      },
      {
        "kategorie": "Grenzziehung & Unterlassen",
        "beispiele": [
          "Stopp-Impuls",
          "Achtsamkeits-Trigger für alte Muster"
        ]
      }
    ],
    "begreifen": [
      {
        "kategorie": "Impulse & persönliche Leitlinien",
        "beispiele": [
          "Entwicklungsmaxime",
          "Verhaltensabsicht",
          "Haltungsvorsatz"
        ]
      },
      {
        "kategorie": "Handlungsskripte & Sequenzen",
        "beispiele": [
          "Lernskript (Shu / exakte Vorlage)",
          "Orientierungsskript"
        ]
      },
      {
        "kategorie": "Mikro- & Arbeitsroutinen",
        "beispiele": [
          "Lern- & Beobachtungsroutine",
          "Vorbereitungsroutine"
        ]
      },
      {
        "kategorie": "Grenzziehung & Unterlassen",
        "beispiele": [
          "Stopp-Prinzip",
          "bewusst gemachte persönliche Grenze"
        ]
      }
    ],
    "erproben": [
      {
        "kategorie": "Impulse & persönliche Leitlinien",
        "beispiele": [
          "Situative Handlungsmaxime",
          "Wenn-Dann-Impuls",
          "neues Leitmotiv"
        ]
      },
      {
        "kategorie": "Handlungsskripte & Sequenzen",
        "beispiele": [
          "Alternatives Handlungsskript",
          "Reaktionsskript",
          "Coping-Skript im Problemfall"
        ]
      },
      {
        "kategorie": "Mikro- & Arbeitsroutinen",
        "beispiele": [
          "Übungsroutine",
          "neue Arbeitsroutine",
          "veränderte Nachbereitungsroutine"
        ]
      },
      {
        "kategorie": "Grenzziehung & Unterlassen",
        "beispiele": [
          "Ersatzroutine (altes Verhalten aktiv ersetzen)",
          "Unterbrechungsroutine"
        ]
      }
    ],
    "reflektieren": [
      {
        "kategorie": "Impulse & persönliche Leitlinien",
        "beispiele": [
          "Persönliche Maxime",
          "Gefestigtes Leitmotiv",
          "internalisierter Wertevorsatz"
        ]
      },
      {
        "kategorie": "Handlungsskripte & Sequenzen",
        "beispiele": [
          "Eingeübtes Standardskript",
          "automatisierte Verhaltenssequenz",
          "Meisterschaft (Ha/Ri)"
        ]
      },
      {
        "kategorie": "Mikro- & Arbeitsroutinen",
        "beispiele": [
          "Tages-/Wochenroutine",
          "Reflexionsroutine",
          "verankerte Team-/Arbeitsgewohnheit Soziale Selbstverpflichtung"
        ]
      },
      {
        "kategorie": "Grenzziehung & Unterlassen",
        "beispiele": [
          "Stopp-Skript",
          "Ausstiegsroutine",
          "fest verankerte No-Go-Grenze",
          "De-Routinisierung"
        ]
      }
    ]
  }
};

  // Intention: drei Phasen, die über alle Episoden hinweg gelten (nicht pro Episode neu).
  var INTENTION_PHASEN = {
  "erarbeiten": {
    "leitfrage": "Was wollen wir warum erreichen?",
    "fragen": [
      {
        "kategorie": "Anlasse",
        "frage": "Welches reale Problem oder welche Chance macht Veränderung notwendig – und warum gerade jetzt?"
      },
      {
        "kategorie": "Verhalten",
        "frage": "Welches Verhalten soll für wen in welchen konkreten Situationen künftig wahrscheinlicher werden?"
      },
      {
        "kategorie": "Zweck",
        "frage": "Welchen relevanten Beitrag soll dieses Verhalten für Organisation, Wertschöpfung oder Zusammenarbeit leisten?"
      },
      {
        "kategorie": "Status Quo",
        "frage": "Welches Verhalten zeigt sich heute stattdessen – und was haben bisherige Veränderungsversuche bewirkt?"
      }
    ]
  },
  "schaerfen": {
    "leitfrage": "Ist unsere Intention präzise und offen genug, um damit arbeiten zu können?",
    "fragen": [
      {
        "kategorie": "Beobachtbarkeit",
        "frage": "Könnten wir das intendierte Verhalten im Alltag beobachten oder filmen – und ist klar, wer es in welchen Situationen zeigen soll?"
      },
      {
        "kategorie": "Gestaltungsoffenheit",
        "frage": "Beschreiben wir tatsächlich gewünschtes Verhalten – oder verstecken sich darin noch Haltungen, Kennzahlen, Lösungen, Methoden oder Maßnahmen?"
      },
      {
        "kategorie": "Relevanz",
        "frage": "Ist das Wozu nachvollziehbar und relevant genug, um zu verstehen, warum diese Veränderung einen Unterschied macht?"
      },
      {
        "kategorie": "Eindeutigkeit",
        "frage": "Ist ausreichend klar, was mit der Intention gemeint ist – und was ausdrücklich nicht?"
      }
    ]
  },
  "reflektieren": {
    "leitfrage": "Was haben wir gelernt – und was bedeutet das für unsere Intention?",
    "fragen": [
      {
        "kategorie": "Reflexionsfragen",
        "frage": "Was haben wir seit der letzten Formulierung der Intention über die Wirklichkeit gelernt, das wir damals noch nicht wussten?"
      },
      {
        "kategorie": "Reflexionsfragen",
        "frage": "Ist das intendierte Verhalten angesichts dieser Erkenntnisse weiterhin das richtige – oder müssen wir es präzisieren, eingrenzen oder verändern?"
      },
      {
        "kategorie": "Reflexionsfragen",
        "frage": "Ist die Intention weiterhin verständlich und hilfreich genug, um Entscheidungen und Gestaltungsimpulse daran auszurichten?"
      },
      {
        "kategorie": "Reflexionsfragen",
        "frage": "Welche Beobachtungen sprechen für unsere bisherige Intention – und welche stellen sie infrage?"
      }
    ]
  }
};

  // Die 7 Gestaltungselemente inkl. ihrer Fragen je Schleife.
  var ELEMENTS = [
  {
    "key": "story",
    "num": "01",
    "title": "Story & Narrativ",
    "subtitle": "schafft Bedeutung",
    "teaser": "Jede Veränderung hat und ist Geschichte.",
    "sphere": "business",
    "zitat": {
      "text": "Geschichten sind die Form, in der wir Menschen Veränderung denken.",
      "autor": "Tobias Grewe"
    },
    "intro": "Menschen folgen selten Strategien – sie folgen Geschichten. Eine gemeinsame Geschichte macht verständlich, warum Veränderung notwendig ist, und lädt dazu ein, Teil davon zu werden.",
    "ziel": "Eine Geschichte der Veränderung, die Mitarbeitende in eigenen Worten weitererzählen – nicht nur eine Kommunikationskampagne, sondern eine Erzählung, die im Alltag lebt und Orientierung gibt.",
    "loops": {
      "observe": {
        "leitfrage": "Was wird erzählt?",
        "fragen": [
          "Welche Geschichten über die Organisation, ihre Vergangenheit, Veränderungen, Erfolge und Misserfolge sind für unsere Intention relevant – und wer erzählt sie?",
          "Welche Bilder, Begriffe und Metaphern verwenden Menschen, wenn sie über Themen und Situationen sprechen, die unsere Intention berühren?",
          "Welche inoffiziellen Erzählungen und Interpretationen kursieren neben der offiziellen Kommunikation?",
          "Worauf sind Menschen erkennbar stolz – und was möchten sie aus ihrer bisherigen Geschichte und Identität bewahren?",
          "Wo zeigen sich Widersprüche zwischen dem, was erzählt oder angekündigt wird, und dem, was tatsächlich geschieht?"
        ]
      },
      "understand": {
        "leitfrage": "Welche Deutungen und Identitäten machen Verhalten plausibel?",
        "fragen": [
          "Welche Geschichten und Narrative könnten Verhalten unterstützen, erschweren oder bestehendes Verhalten legitimieren und stabilisieren?",
          "Welche Werte, Erfahrungen und Identitätsmuster könnten erklären, warum bestimmte Narrative Resonanz erzeugen und andere nicht?",
          "Welche Hoffnungen, Befürchtungen oder emotional bedeutsamen Erfahrungen könnten erklären, warum bestimmte Geschichten Resonanz erzeugen – und andere nicht?",
          "Welche Spannungen zwischen erzählter und erlebter Wirklichkeit könnten erklären, wie Menschen unsere Intention aufnehmen, umdeuten oder zurückweisen?"
        ]
      },
      "design": {
        "leitfrage": "Womit können wir Bedeutung und Anschluss gestalten?",
        "fragen": [
          "Wie könnten wir die Intention mit bestehenden Geschichten, Erfahrungen, Werten und Identitäten verbinden, ohne das Bisherige zu entwerten?",
          "Wie könnten wir Veränderungsnotwendigkeit und angestrebte Zukunft so erzählen, dass die Intention nachvollziehbar wird – einschließlich realer Herausforderungen und Zumutungen?",
          "Welche Bilder, Begriffe, Geschichten oder sichtbaren Zeichen könnten die mit der Intention verbundene Zukunft konkret und handlungsrelevant machen?",
          "Wie könnten wir die Geschichte so offen gestalten, dass Menschen sie in eigenen Worten, gemeinsamen Gesprächen und konkretem Handeln weiterschreiben können?"
        ]
      },
      "architect": {
        "leitfrage": "Ist unsere Geschichte glaubwürdig und durch die Architektur einlösbar?",
        "fragen": [
          "Ergeben Herkunft, Veränderungsnotwendigkeit, angestrebte Zukunft und Beitrag der Beteiligten eine stimmige Geschichte?",
          "Versprechen wir narrativ etwas, das Organisation, Führung und Alltag tatsächlich einlösen können?",
          "Würdigt die Geschichte das Bestehende und macht zugleich nachvollziehbar, warum Veränderung notwendig ist?",
          "Ist die Geschichte einfach, ehrlich und offen genug, dass Menschen sie in eigenen Worten und durch eigenes Handeln weitertragen können?"
        ]
      }
    }
  },
  {
    "key": "orgkultur",
    "num": "02",
    "title": "Organisation & Kultur",
    "subtitle": "schafft Möglichkeiten",
    "teaser": "Der limitierende Kontext. Wer Veränderung will, darf nicht nur bei den Menschen ansetzen.",
    "sphere": "business",
    "zitat": {
      "text": "A bad system will beat a good person every time.",
      "autor": "W. Edwards Deming"
    },
    "intro": "Verhalten entsteht selten allein aus Überzeugung. Es entsteht im Zusammenspiel organisationaler Bedingungen – Strukturen, Routinen, Regeln und kulturellen Mustern. Wer Verhalten verändern will, muss Organisation gestalten.",
    "ziel": "Strukturen, Prozesse und Routinen, die das gewünschte Verhalten tatsächlich ermöglichen – nicht nur Appelle, sondern veränderte Rahmenbedingungen, an denen sich neues Verhalten festmachen kann.",
    "loops": {
      "observe": {
        "leitfrage": "Welche Spielregeln gelten?",
        "fragen": [
          "Welche formellen und informellen Regeln und Entscheidungswege prägen das relevante Verhalten tatsächlich?",
          "Welches Verhalten wird real belohnt, anerkannt oder erleichtert – und welches erschwert oder sanktioniert?",
          "Welche Ziele, Kennzahlen, Berichtspflichten oder Freigaben beeinflussen das relevante Verhalten im Alltag?",
          "Wo entstehen durch Prozesse und Schnittstellen Reibung, Bürokratie oder Wartezeiten – und welche informellen Wege nutzen Menschen, um trotzdem handlungsfähig zu bleiben?"
        ]
      },
      "understand": {
        "leitfrage": "Warum ist Verhalten unter den bestehenden Spielregeln logisch?",
        "fragen": [
          "Welche Strukturen, Routinen und kulturellen Muster könnten erklären, warum das heutige Verhalten unter den bestehenden Bedingungen organisationslogisch sinnvoll ist?",
          "Wo könnten Widersprüche zwischen unserer Intention und bestehenden Regeln, Zielen, Kennzahlen oder Anreizen das heutige Verhalten stabilisieren?",
          "Wie könnten formelle Vorgaben und informelle Regeln zusammenwirken – sich gegenseitig verstärken, abschwächen oder umgehen?",
          "Wo könnten wir ein organisational bedingtes Verhalten fälschlicherweise als individuelles Lern-, Motivations- oder Haltungsproblem interpretieren?",
          "Welche frühen realen Erfahrungen könnten Menschen machen, an denen sie erkennen, dass das neue Verhalten möglich und hilfreich ist?"
        ]
      },
      "design": {
        "leitfrage": "Welche Spielregeln und reale Erfahrungen könnten wir verändern?",
        "fragen": [
          "Welche Regeln, Prozesse oder Freigaben könnten wir verändern, vereinfachen oder streichen, damit das intendierte Verhalten leichter wird?",
          "Wie könnten wir Rollen und Entscheidungsrechte gestalten, damit Menschen im Sinne unserer Intention tatsächlich handeln dürfen?",
          "Welche Ziele, Kennzahlen oder Anreize könnten wir neu ausrichten, damit das intendierte Verhalten organisationslogischer wird?",
          "Welche bestehenden informellen Wege, Netzwerke oder funktionierenden Praktiken könnten wir nutzen oder stärken?",
          "Welche organisationalen Erfahrungen könnten Menschen erleben lassen, dass anderes Verhalten tatsächlich möglich, erwünscht und erlaubt ist?"
        ]
      },
      "architect": {
        "leitfrage": "Macht die Systemlogik das intendierte Verhalten tatsächlich möglich?",
        "fragen": [
          "Sind Prozesse, Entscheidungsrechte, Ziele und Anreize so aufeinander abgestimmt, dass das intendierte Verhalten organisationslogisch möglich wird?",
          "Sind notwendige Handlungsspielräume so verlässlich abgesichert, dass Menschen sie tatsächlich nutzen können, ohne Nachteile befürchten zu müssen?",
          "Welche bestehenden Regeln, Kennzahlen oder Routinen müssen tatsächlich verändert oder abgebaut werden, weil sie der gewählten Architektur entgegenwirken?",
          "Verändern wir relevante organisationale Bedingungen – oder versuchen wir weiterhin, Menschen durch Kommunikation, Führung oder Lernen an unveränderte Bedingungen anzupassen?"
        ]
      }
    }
  },
  {
    "key": "fuehrung",
    "num": "03",
    "title": "Führung & Alltag",
    "subtitle": "schafft Relevanz – der Zündfunke",
    "teaser": "Der Alltag bremst. Führung ist Anstifterin und Ermöglicherin.",
    "sphere": "business",
    "zitat": {
      "text": "Führung ist zugleich der Schlüssel und der Verschluss für nahezu alle Prozesse in Organisationen.",
      "autor": "Rüdiger Hossiep"
    },
    "intro": "Veränderung entsteht im Alltag – dort, wo Menschen entscheiden, zusammenarbeiten und Prioritäten setzen. Führung übersetzt die Intention in den Arbeitsalltag und beantwortet: Was bedeutet das für mich?",
    "ziel": "Führungskräfte, die die Veränderung im Alltag sichtbar vorleben, dafür geschützte Zeit schaffen und Mitarbeitenden konkret übersetzen, was sich für ihre tägliche Arbeit ändert.",
    "loops": {
      "observe": {
        "leitfrage": "Was zählt im Alltag tatsächlich?",
        "fragen": [
          "Welche Prioritäten setzen Führungskräfte tatsächlich – insbesondere wenn Zeit-, Leistungs- oder Zielkonflikte entstehen?",
          "Welches Verhalten, welche Entscheidungen und welche Mikrosignale von Führungskräften und anderen Schlüsselpersonen zeigen Menschen, was tatsächlich wichtig ist?",
          "Welches Verhalten wird im Alltag anerkannt oder eingefordert – und welches trotz unserer Intention toleriert, weil andere Leistungen oder Erfolge es rechtfertigen?",
          "Wie reagieren Führungskräfte tatsächlich auf Zweifel, Widerspruch, Fehler und Nicht-Wissen – und was lernen Menschen daraus darüber, wie sicher eigenes Ausprobieren ist?"
        ]
      },
      "understand": {
        "leitfrage": "Welche sozialen Signale und Prioritäten machen Verhalten im Alltag plausibel?",
        "fragen": [
          "Welche Führungssignale könnten erklären, welches Verhalten Menschen für tatsächlich erwünscht, wichtig oder riskant halten?",
          "Wie könnten Vorbildhandeln, Anerkennung und stillschweigende Toleranz dazu beitragen, dass sich bestimmtes Verhalten verstärkt oder stabilisiert?",
          "Welche Prioritäts- und Zielkonflikte könnten erklären, warum Verhalten im Sinne unserer Intention unter operativem Druck zurücktritt?",
          "Was könnte erklären, warum Menschen vorhandene Gelegenheiten zum Ausprobieren, Reflektieren oder Lernen tatsächlich nutzen – oder nicht nutzen?"
        ]
      },
      "design": {
        "leitfrage": "Wie können wir gewünschtes Verhalten vorleben, ermöglichen und priorisieren?",
        "fragen": [
          "Wie könnten Führungskräfte die Intention durch ihr eigenes Verhalten und ihre täglichen Entscheidungen sichtbar vorleben?",
          "Welche konkreten Anlässe und Situationen könnten Führungskräfte schaffen oder nutzen, in denen Menschen im Sinne unserer Intention handeln, ausprobieren und lernen können?",
          "Welche Führungs- und Teamroutinen könnten helfen, Erfahrungen, Zielkonflikte und Fortschritte regelmäßig zu reflektieren und daraus zu handeln?",
          "Was könnten Führungskräfte bewusst priorisieren, pausieren oder beenden, damit reale Aufmerksamkeit für das Neue entsteht?",
          "Was könnten Führungskräfte bewusst zulassen oder loslassen, damit Menschen mehr Verantwortung im Sinne unserer Intention übernehmen können?"
        ]
      },
      "architect": {
        "leitfrage": "Wird das Neue im Tagesgeschäft tatsächlich vorgelebt und geschützt?",
        "fragen": [
          "Signalisieren Vorbildhandeln, Erwartungen, Anerkennung und tägliche Prioritäten klar und konsistent dieselbe Richtung?",
          "Was muss Führung konkret priorisieren, pausieren oder beenden, damit das Neue im Alltag eine reale Chance bekommt?",
          "Sind Ausprobieren, Lernen und eigenverantwortliches Handeln ausreichend legitimiert und vor operativem Verdrängungsdruck geschützt?",
          "Übernimmt Führung die notwendige Gestaltungsverantwortung – oder hängt das Gelingen weiterhin überwiegend an HR, Corporate Learning oder einzelnen Formaten?"
        ]
      }
    }
  },
  {
    "key": "entdecken",
    "num": "04",
    "title": "Entdecken & Aneignen",
    "subtitle": "ermöglicht individuelle Aneignung",
    "teaser": "Jedes Lernen beginnt mit einer Frage. Entdecken ist die natürliche Antwort darauf.",
    "sphere": "corporate_learning",
    "zitat": {
      "text": "Man kann einen Menschen nichts lehren, man kann ihm nur helfen, es in sich selbst zu entdecken.",
      "autor": "Galileo Galilei"
    },
    "intro": "Lernen entsteht nicht durch Wissensvermittlung, sondern wenn Menschen selbst aktiv werden, Fragen verfolgen und Erfahrungen machen. Lernen ist die Leistung der Lernenden.",
    "ziel": "Echte Gelegenheiten zum Ausprobieren an realen Herausforderungen – Menschen eignen sich die Veränderung an, indem sie selbst handeln, nicht indem sie Inhalte konsumieren.",
    "loops": {
      "observe": {
        "leitfrage": "Wie erschließen Menschen sich selbst Neues?",
        "fragen": [
          "Wo probieren Menschen eigeninitiativ neue Wege aus – und wo warten sie eher auf fertige Lösungen oder Anweisungen?",
          "Welche Fragen stellen Menschen bei relevanten Herausforderungen – und wo und wie suchen sie selbst nach Antworten?",
          "Welche unterschiedlichen Quellen und Wege nutzen Menschen, um Feedback zu erhalten und bei eigenen Suchprozessen weiterzukommen?",
          "Wo reflektieren Menschen eigene Erfahrungen und passen ihr Vorgehen daraufhin selbstständig an – und wo bleibt es beim einmaligen Ausprobieren?"
        ]
      },
      "understand": {
        "leitfrage": "Warum kommen Menschen selbst ins Suchen, Erproben und Übernehmen – oder nicht?",
        "fragen": [
          "Was könnte erklären, warum bestimmte Herausforderungen genügend persönliche Relevanz erzeugen, damit Menschen selbst nach neuen Handlungsmöglichkeiten suchen – und andere nicht?",
          "Welche Bedingungen könnten erklären, warum Menschen sich trauen, Nicht-Wissen zuzulassen, Neues auszuprobieren und aus Fehlern zu lernen – oder dies vermeiden?",
          "Wo könnten Vorgaben, fertige Lösungen oder vorbereitete Lernpfade eigene Such- und Aneignungsprozesse unbeabsichtigt ersetzen oder begrenzen?",
          "Was könnte erklären, warum neue Erfahrungen in das eigene Handlungsrepertoire übernommen werden – oder nach dem ersten Ausprobieren wieder verschwinden?"
        ]
      },
      "design": {
        "leitfrage": "Welche Such- und Erfahrungsräume ermöglichen und begünstigen das neue Verhalten?",
        "fragen": [
          "Welche realen Herausforderungen oder Praxisaufgaben könnten Menschen dazu anregen, selbst nach neuen Lösungen zu suchen und sie auszuprobieren?",
          "Welche Freiräume und Entscheidungsmöglichkeiten könnten eigenes Erkunden ermöglichen, statt den Lernweg vorzugeben?",
          "Welche einfachen Handläufe, Orientierungshilfen oder Reflexionsimpulse könnten das eigene Erkunden unterstützen, ohne fertige Antworten zu liefern?",
          "Wie könnten wir Lernen so mit realer Arbeit und Verantwortung verbinden, dass aus Erfahrungen zunehmend eigenes Handeln entsteht?"
        ]
      },
      "architect": {
        "leitfrage": "Ermöglichen wir Selbstaneignung, ohne zu übersteuern oder alleinzulassen?",
        "fragen": [
          "Beginnt unsere Gestaltung mit einer relevanten Herausforderung oder Erfahrung – oder wieder mit Content, den wir vermitteln wollen?",
          "Gibt es genügend Freiraum für eigenes Erkunden und Ausprobieren, ohne Suchwege und Ergebnisse unnötig vorzugeben?",
          "Ist zugleich genügend Orientierung und Unterstützung vorhanden, damit Selbststeuerung nicht zum Alleinlassen wird?",
          "Ist die Gestaltung eng genug mit realer Arbeit, Reflexion und Anwendung verbunden, damit aus einzelnen Erfahrungen eigenes Handeln entstehen kann?"
        ]
      }
    }
  },
  {
    "key": "peers",
    "num": "05",
    "title": "Peers & Resonanz",
    "subtitle": "verstärkt sozial",
    "teaser": "Soziales Lernen ist eine geteilte Erfahrung. Was eine Gruppe verstärkt, wird wahrscheinlicher.",
    "sphere": "corporate_learning",
    "zitat": {
      "text": "Wenn es ein Dorf braucht, um ein Kind aufzuziehen, dann braucht es einen Circle, um einen voll entwickelten Erwachsenen zu formen.",
      "autor": "Joe Lightfoot"
    },
    "intro": "Menschen orientieren sich an Menschen. Erst wenn Erfahrungen geteilt und im sozialen Umfeld aufgegriffen werden, trägt Veränderung über Einzelne hinaus – sie wird zur gemeinsamen Normalität.",
    "ziel": "Ein soziales Umfeld, in dem sich Menschen über die Veränderung austauschen, glaubwürdige Vorbilder sichtbar werden und neues Verhalten Schritt für Schritt zur gemeinsamen Normalität wird.",
    "loops": {
      "observe": {
        "leitfrage": "Was wird sozial gespiegelt und verstärkt?",
        "fragen": [
          "An wen wenden sich Menschen bei relevanten Fragen oder Unsicherheiten tatsächlich – und wessen Einschätzung hat besonderes Gewicht?",
          "Wo und wie sprechen Menschen untereinander über relevante Erfahrungen und Herausforderungen?",
          "Welches Verhalten erfährt unter Peers Zustimmung, Anerkennung oder Nachahmung – und welches Irritation, Schweigen oder Ablehnung?",
          "Wo werden Erfahrungen, Lösungen und Praktiken spontan weitergegeben und von anderen aufgegriffen?"
        ]
      },
      "understand": {
        "leitfrage": "Wie machen soziale Normen und Resonanz Verhalten legitim, riskant oder normal?",
        "fragen": [
          "Welche Personen, Gruppen, Netzwerke oder Gruppengrenzen könnten prägen, welches Verhalten als glaubwürdig, akzeptiert oder erstrebenswert gilt?",
          "Welche informellen sozialen Normen könnten erklären, warum Menschen neues Verhalten zeigen, vermeiden oder nach ersten Versuchen wieder aufgeben?",
          "Was könnte erklären, warum bestimmte Peer-Beziehungen Sicherheit für Ausprobieren, Feedback und gegenseitige Unterstützung schaffen – und andere nicht?",
          "Wie könnten wir gegenseitige Unterstützung so erleichtern, dass Rat suchen, Feedback geben und Erfahrungen teilen zunehmend selbstverständlich werden?"
        ]
      },
      "design": {
        "leitfrage": "Womit fördern wir soziale Resonanz und ermöglichen Normalität?",
        "fragen": [
          "Welche Gelegenheiten könnten wir schaffen, in denen Menschen reale Erfahrungen auf Augenhöhe teilen, spiegeln und gemeinsam weiterentwickeln?",
          "Wie könnten wir bestehende Netzwerke und informelle Schlüsselpersonen nutzen oder stärken, ohne sie zu zentral gesteuerten „Multiplikatoren“ zu machen?",
          "Wie könnten glaubwürdige Versuche, Erfahrungen und Vorbilder unter Peers sichtbar und weitererzählbar werden?",
          "Wie könnten wir gegenseitige Unterstützung so erleichtern, dass Peer-Feedback, Rat und Teilen zunehmend selbstverständlich werden?",
          "Welche bestehenden Beziehungen/Netzwerke können wir nutzen – und wo müssen neue Verbindungen entstehen, damit andere Erfahrungen und Perspektiven miteinander in Kontakt kommen?"
        ]
      },
      "architect": {
        "leitfrage": "Kann echte, dezentrale soziale Verstärkung entstehen?",
        "fragen": [
          "Erreichen oder stärken wir tatsächlich jene Peer-Beziehungen, Gruppen und Netzwerke, die für soziale Orientierung und Resonanz relevant sind?",
          "Ermöglichen die gewählten Impulse echten Austausch auf Augenhöhe – oder produzieren wir lediglich zentral gesteuerte Kommunikation und „Multiplikation“?",
          "Sind die Peer-Gelegenheiten nah genug an realen Herausforderungen, damit Menschen einander tatsächlich helfen, spiegeln und voneinander lernen können?",
          "Kann Resonanz zunehmend dezentral und selbsttragend entstehen – oder bleibt sie dauerhaft von organisierter Aktivierung abhängig?"
        ]
      }
    }
  },
  {
    "key": "methoden",
    "num": "06",
    "title": "Methoden & Formate",
    "subtitle": "unterstützt professionell",
    "teaser": "Methoden und Formate erleichtern Veränderung. Sie erzeugen sie nicht.",
    "sphere": "corporate_learning",
    "zitat": {
      "text": "Lernen ist Erfahrung. Alles andere ist nur Information.",
      "autor": "Albert Einstein"
    },
    "intro": "Methoden und Formate machen Veränderung erlebbar – sie bewirken sie nicht. Gute Gestaltung beginnt nicht mit der Methode, sondern mit der Frage nach der beabsichtigten Wirkung.",
    "ziel": "Eine stimmige Lernarchitektur, deren Formate bewusst aus der gewünschten Wirkung abgeleitet sind – nicht Methoden um ihrer selbst willen, sondern gezielt gewählte Formate, die aufeinander aufbauen.",
    "loops": {
      "observe": {
        "leitfrage": "Welche gestaltete Unterstützung wird tatsächlich genutzt?",
        "fragen": [
          "Welche Methoden, Formate und Hilfsmittel stehen zur Verfügung – und welche werden tatsächlich genutzt?",
          "Was geschieht bei ihrer Nutzung: konsumieren Menschen überwiegend oder werden Ausprobieren, Austausch, Reflexion und Handeln sichtbar?",
          "Wie leicht finden und nutzen Menschen Unterstützung genau dann, wenn sie diese im Arbeitsalltag brauchen?",
          "Welche Methoden, Werkzeuge oder Vorgehensweisen werden anschließend selbstständig im Arbeitsalltag weiterverwendet – und welche verschwinden wieder?"
        ]
      },
      "understand": {
        "leitfrage": "Warum führt gestaltete Unterstützung zu Nutzung und Anwendung – oder nicht?",
        "fragen": [
          "Was könnte erklären, warum Menschen bestimmte Methoden oder Hilfsmittel im relevanten Arbeitsmoment tatsächlich nutzen – und andere nicht?",
          "Welche Merkmale bestehender Formate könnten erklären, warum Menschen aktiv ausprobieren, reflektieren und handeln – oder überwiegend passiv bleiben?",
          "Was könnte erklären, warum bestimmte Methoden Orientierung und Handlungssicherheit geben, während andere zusätzliche Komplexität erzeugen?",
          "Was könnte erklären, warum Erfahrungen aus Methoden und Formaten in den Arbeitsalltag übernommen werden – oder dort wieder verschwinden?",
          "Wo gestalten Menschen vorhandene Methoden, Hilfsmittel oder Formate bereits selbst weiter, damit sie für ihre reale Arbeit brauchbar werden?"
        ]
      },
      "design": {
        "leitfrage": "Womit können wir gezielte Handlungsunterstützung gestalten?",
        "fragen": [
          "Welche realen Erfahrungen, Übungen oder Simulationen könnten Menschen helfen, relevantes Verhalten auszuprobieren und Handlungssicherheit aufzubauen?",
          "Welche einfachen Werkzeuge oder Orientierungshilfen könnten genau im Moment der Anwendung Handeln erleichtern?",
          "Welche Formate könnten gemeinsames Üben, Feedback und Reflexion an realen Fällen ermöglichen?",
          "Wie könnten Methoden und Formate so mit der Arbeit verbunden werden, dass sie zunehmend selbstständiges Handeln unterstützen statt dauerhafte Abhängigkeit von Lernangeboten zu erzeugen?",
          "Wie könnten die Menschen, die mit der Unterstützung arbeiten sollen, an ihrer Gestaltung und Weiterentwicklung beteiligt werden?"
        ]
      },
      "architect": {
        "leitfrage": "Unterstützen wir das richtige Problem – arbeitsnah und ohne Abhängigkeit?",
        "fragen": [
          "Brauchen wir hier überhaupt eine Methode oder ein Format – und falls ja: Adressiert es einen relevanten Befähigungs- oder Unterstützungsbedarf?",
          "Sind Erfahrung, Übung, Reflexion und Anwendung so verbunden, dass methodische Unterstützung in den realen Arbeitsalltag hineinführt statt eine parallele Lernwelt zu erzeugen?",
          "Unterstützen die gewählten Methoden zunehmend selbstständiges Handeln – oder erzeugen wir dauerhafte Abhängigkeit von Trainings, Trainern oder Lernangeboten?"
        ]
      }
    }
  },
  {
    "key": "raumzeit",
    "num": "Zentrum",
    "title": "Raum & Zeit",
    "subtitle": "Dreh- und Angelpunkt",
    "teaser": "Veränderung braucht Raum. Entwicklung braucht Zeit.",
    "sphere": "cross_spheric",
    "zitat": {
      "text": "Wenn Du keine Zeit hast besser zu werden, dann hast du eben keine Zeit, besser zu werden.",
      "autor": "Markus Ebner"
    },
    "intro": "Ohne Raum und Zeit bleibt Veränderung Absicht. Raum und Zeit sind kein weiteres Element, sondern die gemeinsame Voraussetzung, damit alle anderen Elemente überhaupt wirksam werden können.",
    "ziel": "Geschützte, wiederkehrende Zeit und ein sicherer Raum, in dem Ausprobieren, Reflexion und Austausch tatsächlich stattfinden können – ohne dieses Fundament bleibt jedes andere Element folgenlos.",
    "loops": {
      "observe": {
        "leitfrage": "Wo und wann bekommt das Ganze Platz?",
        "fragen": [
          "Wann und wo entstehen tatsächlich Gelegenheiten für relevantes Handeln, Ausprobieren, Austausch oder Reflexion – und wie selbstständig können Menschen sie nutzen?",
          "Welche bestehenden Termine, Orte und Arbeitsrhythmen geben unserer Intention bereits Raum – und welche stehen mit ihr in Konkurrenz?",
          "Wo werden relevante Gelegenheiten durch Zeitdruck, Unterbrechungen oder andere Anforderungen verdrängt?",
          "Wo schaffen sich Menschen selbst Zeit, Orte oder informelle Gelegenheiten, weil die vorgesehenen Strukturen nicht ausreichen?"
        ]
      },
      "understand": {
        "leitfrage": "Wie beeinflussen Gelegenheit, Taktung und Umgebung, was sich entwickeln kann?",
        "fragen": [
          "Welche zeitlichen Bedingungen könnten erklären, warum Menschen relevantes Verhalten ausprobieren und weiterentwickeln – oder unter Alltagsdruck auf bestehende Routinen zurückfallen?",
          "Welche Rhythmen und Abstände könnten erklären, warum Erfahrungen aufgegriffen, reflektiert und weitergeführt werden – oder wieder versanden?",
          "Welche physischen oder digitalen Räume könnten Konzentration, Erprobung, geplante oder spontane Begegnung und Zusammenarbeit unterstützen?",
          "Wo könnte vermeintlich fehlende Motivation oder Lernbereitschaft eigentlich Ausdruck fehlender Zeit, ungünstiger Taktung oder konkurrierender Anforderungen sein?"
        ]
      },
      "design": {
        "leitfrage": "Wie und wo schaffen wir Gelegenheit und Rhythmus und schützen diese?",
        "fragen": [
          "Welche bestehenden Zeitfenster, Orte oder Arbeitsrhythmen könnten wir anders nutzen, bevor wir zusätzliche schaffen?",
          "Welche Rhythmen und Zeiträume könnten Ausprobieren, Anwenden und Reflektieren sinnvoll miteinander verbinden?",
          "Welche physischen oder digitalen Räume könnten die benötigte Konzentration, Erprobung, Begegnung oder Zusammenarbeit unterstützen?",
          "Wie könnten Zeit und Aufmerksamkeit für relevantes Handeln so geschützt werden, dass sie im Tagesgeschäft nicht immer wieder verdrängt werden?"
        ]
      },
      "architect": {
        "leitfrage": "Bekommt die Architektur realen und geschützten Platz im richtigen Rhythmus?",
        "fragen": [
          "Bekommt unsere Gestaltungsarchitektur dort Raum und Zeit, wo relevantes Handeln, Lernen, Austausch und Reflexion tatsächlich stattfinden sollen?",
          "Passen Dauer, Abstände, Rhythmus und zeitliche Zugänglichkeit zu den Menschen und der Entwicklung, die wir ermöglichen wollen?",
          "Sind die notwendigen Räume und Zeiten durch Führung und Organisation so legitimiert und geschützt, dass sie unter operativem Druck nicht als Erstes entfallen?",
          "Schaffen wir wirklich notwendige neue Räume und Zeitgefäße – oder könnten wir vorhandene Termine, Orte und Rhythmen intelligenter nutzen?",
          "Wie wirken die vorgesehenen Räume, Zeiten und Rhythmen mit den übrigen Elementen unserer Architektur zusammen – was ermöglichen, verstärken oder begrenzen sie?"
        ]
      }
    }
  }
];


  // ---------------------------------------------------------------------------
  // Inhalte aus dem AVERA White Paper 2.0 (Seiten 4-9): Einleitung, Idee,
  // Gestaltungsframework, drei Dimensionen, Drehrichtung, Gestaltungsauftrag.
  // Texte wörtlich aus dem White Paper übernommen.
  // ---------------------------------------------------------------------------
  var FRAMEWORK = {
    scheitern: {
      label: "Einleitung",
      pill: "purple",
      headline: "Warum Veränderung oft scheitert",
      sub: "Gute Absichten reichen nicht. Es braucht ein neues Verständnis.",
      text:
        "Viele Veränderungsvorhaben scheitern – nicht an Strategien oder Expertenwissen, sondern daran, " +
        "dass der Mensch im Mittelpunkt zu wenig berücksichtigt wird. Veränderung ist kein rein rationaler " +
        "Prozess, sondern ein komplexes Zusammenspiel aus Emotionen, Beziehungen und Kontext.",
      stolpersteine: [
        { icon: "🎯", text: "Zu stark auf Steuerung statt Gestaltung" },
        { icon: "👥", text: "Menschen werden zu spät einbezogen" },
        { icon: "⚡", text: "Sinn und Nutzen bleiben unklar" },
        { icon: "⊗", text: "Der Alltag holt die Initiative ein" }
      ],
      zitat: "Veränderung scheitert selten an der Idee, sondern an ihrer Umsetzung im realen Leben."
    },
    idee: {
      label: "Die Idee hinter AVERA",
      pill: "pink",
      headline: "Gestaltung statt Steuerung",
      sub: "Ein neues Verständnis für wirksame Veränderung.",
      text:
        "AVERA steht für einen Perspektivenwechsel: Weg von der reinen Steuerung – hin zu einem " +
        "ganzheitlichen, menschenzentrierten Gestaltungsansatz. Das Admonter Veränderungsrad bietet " +
        "einen klaren Orientierungsrahmen, um Lernen und Veränderung wirksam, nachhaltig und gemeinsam zu gestalten.",
      kernsatz: "Menschen befähigen. Zukunft gestalten.",
      kernsatzText:
        "AVERA verbindet Strategie, Kultur und Kompetenz – und macht Veränderung zu einem gemeinsamen " +
        "Lernweg, der im Alltag wirkt und nachhaltig Bestand hat."
    },
    rad: {
      label: "Das Gestaltungsframework",
      pill: "blue",
      headline: "Das Admonter Veränderungsrad",
      sub: "Sechs Elemente. Eine gemeinsame Intention.",
      text:
        "Das Veränderungsrad zeigt sechs zentrale Gestaltungselemente, die gemeinsam wirksame Veränderung " +
        "ermöglichen. Sie greifen ineinander, verstärken sich gegenseitig und entfalten ihre Wirkung in der " +
        "richtigen Reihenfolge – im Uhrzeigersinn entlang einer gemeinsamen Intention.",
      kernsatz: "Eine klare Intention gibt die Richtung vor.",
      kernsatzText:
        "Alle Elemente sind auf eine gemeinsame Intention ausgerichtet: Lernen ermöglichen. " +
        "Menschen stärken. Nachhaltige Wirkung erzielen."
    },
    dimensionen: {
      label: "Drei Dimensionen",
      pill: "green",
      headline: "Wollen. Dürfen. Können.",
      sub: "Die Grundlage für nachhaltige Veränderung.",
      text:
        "Wirksame Veränderung entsteht, wenn Menschen einen inneren Sinn spüren (Wollen), wenn die " +
        "Rahmenbedingungen es ermöglichen (Dürfen) und wenn die nötigen Kompetenzen vorhanden sind (Können). " +
        "Erst das Zusammenspiel dieser drei Dimensionen schafft echte Handlungsfähigkeit – sowohl individuell " +
        "als auch organisational.",
      mitte: "Wirksam verändern",
      items: [
        {
          key: "wollen",
          icon: "♥",
          label: "Wollen",
          sub: "Sinn & Motivation",
          punkte: ["Sinn stiften", "Begeisterung wecken", "Richtung geben"]
        },
        {
          key: "duerfen",
          icon: "👥",
          label: "Dürfen",
          sub: "Kultur & Rahmen",
          punkte: ["Rahmen schaffen", "Vertrauen ermöglichen", "Kultur leben"]
        },
        {
          key: "koennen",
          icon: "⚙",
          label: "Können",
          sub: "Kompetenz & Ressourcen",
          punkte: ["Kompetenzen stärken", "Lernen ermöglichen", "Ressourcen bereitstellen"]
        }
      ]
    },
    drehrichtung: {
      label: "Die richtige Drehrichtung",
      pill: "orange",
      headline: "Von innen nach außen. In die Umsetzung.",
      sub: "Veränderung beginnt mit Sinn – und wirkt im Alltag.",
      text:
        "Die sechs Elemente des Veränderungsrads entfalten ihre Wirkung in einer klaren Reihenfolge. " +
        "Sie beginnt mit Story & Narrativ und verläuft im Uhrzeigersinn bis zu Methoden & Formate. " +
        "So entsteht ein natürlicher Prozess – von der inneren Ausrichtung bis zur sichtbaren Umsetzung im Alltag."
    },
    auftrag: {
      label: "Gestaltungsauftrag",
      pill: "purple",
      headline: "Unsere gemeinsame Intention.",
      sub: "Lernen ermöglichen. Menschen stärken. Nachhaltige Wirkung erzielen.",
      text:
        "Der Gestaltungsauftrag von AVERA ist eine Einladung an alle, die Veränderung in Organisationen " +
        "gestalten wollen. Er verbindet fachliche Exzellenz mit menschlicher Entwicklung – und schafft damit " +
        "die Basis für eine zukunftsfähige Arbeitswelt.",
      kernsatz: "Gemeinsam Zukunft möglich machen.",
      kernsatzText:
        "AVERA ist ein offener Orientierungsrahmen für alle, die Lernen und Veränderung wirksam, " +
        "verantwortungsvoll und menschenzentriert gestalten wollen – in Organisationen, Teams und für sich selbst."
    },
    hub: {
      titel: "Raum & Zeit",
      sub: "Für Reflexion, Austausch und nachhaltige Wirkung"
    }
  };

  // Kurzwirkung je Element aus der Drehrichtungs-Grafik des White Papers
  // ("Sinn stiften" … "Lernen gestalten") plus die dort verwendeten Symbole.
  var ELEMENT_EXTRA = {
    story: { wirkung: "Sinn stiften", dimension: "wollen" },
    orgkultur: { wirkung: "Vertrauen ermöglichen", dimension: "duerfen" },
    fuehrung: { wirkung: "Orientierung geben", dimension: "duerfen" },
    entdecken: { wirkung: "Wissen nutzen", dimension: "koennen" },
    peers: { wirkung: "Gemeinsam wachsen", dimension: "koennen" },
    methoden: { wirkung: "Lernen gestalten", dimension: "koennen" },
    raumzeit: { wirkung: "Wirkung ermöglichen", dimension: "duerfen" }
  };

  ELEMENTS.forEach(function (el) {
    var extra = ELEMENT_EXTRA[el.key];
    if (!extra) return;
    el.wirkung = extra.wirkung;
    el.dimension = extra.dimension;
  });


  // ---------------------------------------------------------------------------
  // Prozessmodell aus "AVERA App – Konzept (Option 3: KI eingebettet je
  // Schleife)": Rollenverteilung Mensch/KI je Schleife, die Gate-Fragen und
  // die Rücksprünge, wenn ein Gate nicht passiert wird.
  // ---------------------------------------------------------------------------
  var PROZESS = {
    observe: {
      mensch: "Beobachtungen als strukturierte Karten erfassen, getrennt in Fakt und Vermutung, getaggt nach AVERA-Gestaltungselement.",
      ki: "Schlägt fehlende Gestaltungselemente vor (welche Blickwinkel sind noch unberührt?) und unterstützt beim Taggen.",
      kiNicht: "Interpretiert nicht, erklärt nicht.",
      gateFrage: "Ist das Bild hinreichend differenziert?",
      zurueckZu: "observe",
      zurueckLabel: "Weiter beobachten"
    },
    understand: {
      mensch: "Bewertet und priorisiert die Vorschläge, formuliert Hebel und Gestaltungshypothesen final.",
      ki: "Schlägt aus den Befunden mögliche Muster vor (Verstärkungen, Widersprüche) – immer mit mindestens einer Gegenhypothese; jeder Vorschlag ist als Hypothese markiert, nie als Befund.",
      kiNicht: "Erklärt Verhalten nicht vorschnell über Motivations- oder Kompetenzdefizite; liefert kein „objektives“ Wirkmodell.",
      gateFrage: "Ist unser Wirkverständnis tragfähig genug – und hält die Intention noch?",
      zurueckZu: "observe",
      zurueckLabel: "Zurück zu Beobachten"
    },
    design: {
      mensch: "Wählt, kombiniert und ergänzt Gestaltungsobjekte zu Impulsen.",
      ki: "Schlägt pro Gestaltungshypothese Objekte vor, sortiert nach den 4Fakten – und schlägt mehrere Kombinationen vor.",
      kiNicht: "Entscheidet nicht, was umgesetzt wird.",
      gateFrage: "Liegen plausible, unterschiedliche Gestaltungsmöglichkeiten vor?",
      zurueckZu: "understand",
      zurueckLabel: "Zurück zu Verstehen"
    },
    architect: {
      mensch: "Trifft die Auswahl und priorisiert nach dem Minimalismusprinzip.",
      ki: "Prüft die gewählten Impulse auf Widersprüche und Doppelungen; stellt bei jedem Impuls die Frage „Was passiert, wenn er entfällt?“.",
      kiNicht: "Trifft die Auswahl nicht selbst.",
      gateFrage: "Ist die Architektur minimal hinreichend und kohärent?",
      zurueckZu: "design",
      zurueckLabel: "Zurück zu Entwerfen"
    }
  };

  // Die vier KI-Funktionen mit ihrem festgelegten Kontextzuschnitt. Der
  // Zuschnitt ist bewusst eng: nie die komplette Episoden-Historie, sondern
  // genau das, was die Funktion braucht.
  var KI_FUNKTIONEN = {
    observe: {
      titel: "Lücken-Hinweis",
      beschreibung: "Welche Gestaltungselemente sind bisher unberührt geblieben?",
      kontext: "nur die aktuelle Episode",
      modell: "kleines/günstiges Modell"
    },
    understand: {
      titel: "Muster- und Hebel-Vorschlag",
      beschreibung: "Mögliche Muster aus den Befunden – mit Pflicht-Gegenhypothese.",
      kontext: "Observe-Befunde der aktuellen Episode + Kurzfassung des Vorgänger-Wirkmodells (nicht die volle Historie)",
      modell: "leistungsfähigeres Modell (Synthese-Aufgabe)"
    },
    design: {
      titel: "Objektvorschläge je 4Fakt",
      beschreibung: "Passende Gestaltungsobjekte je Hypothese, sortiert nach den vier Fakt-Ebenen.",
      kontext: "gewählte Gestaltungshypothese(n)",
      modell: "mittleres Modell"
    },
    architect: {
      titel: "Kohärenz-Check",
      beschreibung: "Widersprüche, Doppelungen und die Weglass-Frage je Impuls.",
      kontext: "gewählte Impulse der aktuellen Episode",
      modell: "mittleres/leistungsfähiges Modell"
    }
  };

  var BEOBACHTUNG_TYPEN = [
    { key: "fakt", label: "Fakt", hinweis: "beobachtbar, überprüfbar, ohne Deutung" },
    { key: "vermutung", label: "Vermutung", hinweis: "Eindruck, Deutung, Hörensagen – bewusst als solche markiert" }
  ];

  function getElement(key) {
    for (var i = 0; i < ELEMENTS.length; i++) {
      if (ELEMENTS[i].key === key) return ELEMENTS[i];
    }
    return null;
  }

  function getLoop(key) {
    for (var i = 0; i < LOOPS.length; i++) {
      if (LOOPS[i].key === key) return LOOPS[i];
    }
    return null;
  }

  global.AVERA_DATA = {
    SPHERES: SPHERES,
    SEQUENCE: SEQUENCE,
    LOOPS: LOOPS,
    LOOP_GENERAL_FRAGEN: LOOP_GENERAL_FRAGEN,
    FAKTE_TYPEN: FAKTE_TYPEN,
    WIRKSTUFEN: WIRKSTUFEN,
    FAKTE: FAKTE,
    INTENTION_PHASEN: INTENTION_PHASEN,
    FRAMEWORK: FRAMEWORK,
    PROZESS: PROZESS,
    KI_FUNKTIONEN: KI_FUNKTIONEN,
    BEOBACHTUNG_TYPEN: BEOBACHTUNG_TYPEN,
    ELEMENTS: ELEMENTS,
    getElement: getElement,
    getLoop: getLoop
  };
})(window);

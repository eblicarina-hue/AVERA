/*
 * KI-Funktionen je Schleife – nach "AVERA App – Konzept (Option 3)".
 *
 * Kein durchgehendes Chat-Fenster: pro Schleife genau eine fest definierte
 * Funktion mit eigenem Prompt-Gerüst und eigenem Kontextzuschnitt. Der
 * Zuschnitt ist hier Code, nicht Konvention – buildRequest() schickt je
 * Funktion ausschließlich die in der Konzepttabelle festgelegten Daten mit.
 * Insbesondere geht nie die komplette Episoden-Historie mit; Vorgänger-
 * Episoden erscheinen nur als Kurzfassung des Wirkmodells.
 *
 * Es ist in dieser Fassung kein Modellzugang hinterlegt (die Frage BYOK vs.
 * eigener API-Key ist im Konzept ausdrücklich offen). Solange keiner
 * konfiguriert ist, baut das Modul den fertigen Prompt zum Kopieren. Sobald
 * ein Zugang feststeht, wird nur sendRequest() ersetzt – die Prompts und der
 * Kontextzuschnitt bleiben, wie sie hier stehen.
 */
(function (global) {
  "use strict";

  var GRUNDREGELN = [
    "Du arbeitest im AVERA-Veränderungsrad (Admonter Veränderungsrad).",
    "Du lieferst Vorschläge, Gegenfragen und Prüfhinweise – nie die Entscheidung.",
    "Die Entscheidung trifft der Mensch am Gate dieser Schleife.",
    "Antworte knapp, auf Deutsch, als Liste."
  ];

  var FUNKTIONEN = {
    observe: {
      rolle: [
        "Deine Aufgabe in der Schleife BEOBACHTEN: benenne, welche Gestaltungselemente bisher unberührt geblieben sind, und schlage je einen konkreten Blickwinkel vor, unter dem man dort hinsehen könnte.",
        "Du interpretierst nicht und erklärst nicht. Du nennst keine Ursachen, keine Muster und keine Lösungen.",
        "Du bewertest die vorhandenen Beobachtungen nicht – du zeigst nur, wo noch nichts steht."
      ]
    },
    understand: {
      rolle: [
        "Deine Aufgabe in der Schleife VERSTEHEN: schlage aus den Befunden mögliche Muster vor – Verstärkungen, Widersprüche, Rückkopplungen.",
        "Zu JEDEM Vorschlag gehört mindestens eine Gegenhypothese, die genauso plausibel wäre. Ohne Gegenhypothese ist der Vorschlag unvollständig.",
        "Markiere jeden Vorschlag ausdrücklich als Hypothese, nie als Befund.",
        "Erkläre Verhalten NICHT vorschnell über Motivations- oder Kompetenzdefizite – nach AVERA entsteht Verhalten aus dem Kontext, nicht aus Mängeln der Personen.",
        "Liefere kein „objektives“ Wirkmodell. Was du lieferst, sind Lesarten."
      ]
    },
    design: {
      rolle: [
        "Deine Aufgabe in der Schleife ENTWERFEN: schlage je Gestaltungshypothese Gestaltungsobjekte vor, sortiert nach den vier Fakt-Ebenen – Artefakte (das Sichtbare), Soziofakte (das Praktizierte), Mentefakte (das Geglaubte), Ethofakte (das Verinnerlichte).",
        "Schlage mehrere, deutlich unterschiedliche Kombinationen vor – nicht eine Lösung mit Varianten.",
        "Du entscheidest nicht, was umgesetzt wird."
      ]
    },
    architect: {
      rolle: [
        "Deine Aufgabe in der Schleife KOMPONIEREN: prüfe die gewählten Impulse auf Widersprüche und Doppelungen.",
        "Stelle zu jedem einzelnen Impuls die Frage: Was passiert, wenn er entfällt? Beantworte sie in einem Satz.",
        "Du triffst die Auswahl nicht selbst und schlägst keine zusätzlichen Impulse vor."
      ]
    }
  };

  function elementLabel(key) {
    var el = AVERA_DATA.getElement(key);
    return el ? el.title : "(ohne Element)";
  }

  // Der Kontextzuschnitt je Funktion, exakt nach der Konzepttabelle.
  function buildKontext(loopKey, vorhaben, episode) {
    var k = {
      intention: (vorhaben.intention.text || "").trim() || "(noch nicht formuliert)",
      zielgruppe: (vorhaben.intention.zielgruppe || "").trim(),
      episodeNr: episode.nr
    };

    if (loopKey === "observe") {
      // nur die aktuelle Episode
      k.beobachtungen = episode.beobachtungen.map(function (b) {
        return { typ: b.typ, element: b.element ? elementLabel(b.element) : "(ungetaggt)", text: b.text };
      });
      k.unberuehrteElemente = AVERA_DATA.ELEMENTS.filter(function (el) {
        return !episode.beobachtungen.some(function (b) { return b.element === el.key; });
      }).map(function (el) { return el.title; });
      return k;
    }

    if (loopKey === "understand") {
      // Observe-Befunde + Kurzfassung des Vorgänger-Wirkmodells, nicht die volle Historie
      k.befunde = episode.beobachtungen.map(function (b) {
        return { typ: b.typ, element: b.element ? elementLabel(b.element) : "(ungetaggt)", text: b.text };
      });
      var vorgaenger = null;
      if (episode.vorgaengerNr != null) {
        vorgaenger = AVERA_STORE.wirkmodellKurzfassung(AVERA_STORE.getEpisode(vorhaben, episode.vorgaengerNr));
      }
      k.vorgaengerWirkmodell = vorgaenger;
      return k;
    }

    if (loopKey === "design") {
      // gewählte Gestaltungshypothese(n)
      k.hypothesen = episode.wirkmodell.hypothesen.map(function (h) {
        return { text: h.text, gegenhypothese: h.gegenhypothese, element: h.element ? elementLabel(h.element) : "" };
      });
      k.hebel = episode.wirkmodell.hebel.map(function (h) { return h.text; });
      return k;
    }

    // architect: gewählte Impulse der aktuellen Episode
    var gewaehlt = episode.architektur.gewaehlt || [];
    k.impulse = episode.impulse
      .filter(function (imp) { return gewaehlt.indexOf(imp.id) !== -1; })
      .map(function (imp) {
        var hyp = episode.wirkmodell.hypothesen.find(function (h) { return h.id === imp.hypotheseId; });
        return {
          titel: imp.titel,
          hypothese: hyp ? hyp.text : "(keiner Hypothese zugeordnet)",
          objekte: imp.objekte.map(function (o) { return o.beispiel + " (" + o.typ + ")"; })
        };
      });
    return k;
  }

  function buildRequest(loopKey, vorhaben, episode) {
    var meta = AVERA_DATA.KI_FUNKTIONEN[loopKey];
    var fn = FUNKTIONEN[loopKey];
    var kontext = buildKontext(loopKey, vorhaben, episode);
    var systemPrompt = GRUNDREGELN.concat(fn.rolle).join("\n");
    return {
      loopKey: loopKey,
      titel: meta.titel,
      beschreibung: meta.beschreibung,
      kontextLabel: meta.kontext,
      modell: meta.modell,
      systemPrompt: systemPrompt,
      kontext: kontext
    };
  }

  // Der Prompt als ein Textblock – so, wie er an ein Modell ginge, und so, wie
  // man ihn ohne hinterlegten Zugang herauskopieren kann.
  function toText(req) {
    return (
      req.systemPrompt +
      "\n\n---\n\nKontext (" + req.kontextLabel + "):\n\n" +
      JSON.stringify(req.kontext, null, 2)
    );
  }

  // Grober Umfang des Kontexts, damit sichtbar bleibt, was ein Aufruf kostet.
  function groesse(req) {
    var zeichen = toText(req).length;
    return { zeichen: zeichen, tokenSchaetzung: Math.round(zeichen / 3.6) };
  }

  // Ist ein Modellzugang hinterlegt? Sobald es einen gibt, liefert diese
  // Funktion true und sendRequest() ruft ihn auf.
  function verfuegbar() {
    return typeof global.AVERA_AI_BACKEND === "function";
  }

  function sendRequest(req) {
    if (!verfuegbar()) {
      return Promise.reject(new Error("Kein Modellzugang hinterlegt."));
    }
    return Promise.resolve(global.AVERA_AI_BACKEND(req));
  }

  global.AVERA_AI = {
    buildRequest: buildRequest,
    toText: toText,
    groesse: groesse,
    verfuegbar: verfuegbar,
    sendRequest: sendRequest
  };
})(window);

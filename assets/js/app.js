/*
 * AVERA-Change-App: Steuerung der Ansichten über einen einfachen Hash-Router.
 * Führt durch den episodischen AVERA-Workflow: eine Episode ist eine volle
 * Drehung im Rad mit den Schleifen Observe -> Understand -> Design -> Architect,
 * gefolgt von der Realisierung. Keine Frameworks, keine Build-Tools.
 */
(function () {
  "use strict";

  var root = document.getElementById("app");
  var LOOP_ORDER = ["observe", "understand", "design", "architect"];

  // Formular-Entwurf beim Sammeln von Gestaltungsobjekten in der Design-Schleife
  // (bewusst nicht persistiert, bis der Impuls gespeichert wird).
  var designDraft = { scopeKey: null, objekte: [], name: "", notiz: "" };
  var designFilter = { typ: "artefakt", wirkstufe: "beruehren" };

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseHash() {
    var hash = location.hash.replace(/^#\/?/, "");
    if (!hash) return { view: "start" };
    var parts = hash.split("/");
    if (parts[0] === "init" && parts[1]) {
      var id = parts[1];
      if (parts[2] === "intention") return { view: "intention", id: id };
      if (parts[2] === "export") return { view: "export", id: id };
      if (parts[2] === "episode" && parts[3] && parts[4]) {
        var nr = parseInt(parts[3], 10);
        if (parts[4] === "realize") return { view: "realize", id: id, nr: nr };
        return { view: "loop", id: id, nr: nr, loop: parts[4] };
      }
      return { view: "overview", id: id };
    }
    return { view: "start" };
  }

  function navigate(hash) {
    location.hash = hash;
  }

  function resetDesignDraft(scopeKey) {
    designDraft = { scopeKey: scopeKey, objekte: [], name: "", notiz: "" };
  }

  // ---------- Ableitungen für die Rad-Übersicht ----------

  function buildWheelAdapter(init, episode) {
    var adapter = { stations: {} };
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      adapter.stations[elm.key] = { status: AVERA_STORE.deriveElementStatus(episode, elm.key) };
    });
    adapter.stations.intention = { status: AVERA_STORE.deriveIntentionStatus(init) };
    return adapter;
  }

  function firstUnfinishedLoop(episode) {
    for (var i = 0; i < LOOP_ORDER.length; i++) {
      if (!episode.loops[LOOP_ORDER[i]].gate) return LOOP_ORDER[i];
    }
    return null;
  }

  function loopDotsHtml(id, nr, currentLoop, episode) {
    return (
      '<div class="loop-dots">' +
      LOOP_ORDER.map(function (lk, i) {
        var loop = AVERA_DATA.getLoop(lk);
        var cls = "loop-dot";
        if (lk === currentLoop) cls += " active";
        if (episode.loops[lk].gate) cls += " done";
        return (
          '<a class="' + cls + '" href="#/init/' + id + "/episode/" + nr + "/" + lk + '" title="' +
          escapeHtml(loop.label) + '">' +
          '<span class="loop-dot-num">' + (i + 1) + "</span>" +
          '<span class="loop-dot-label">' + escapeHtml(loop.label) + "</span>" +
          "</a>"
        );
      }).join("") +
      "</div>"
    );
  }

  // ---------- Start ----------

  function episodeStatusLabel(init) {
    var ep = AVERA_STORE.currentEpisode(init);
    if (ep.realized) return "Episode " + ep.nr + " abgeschlossen";
    var loopKey = firstUnfinishedLoop(ep);
    if (!loopKey) return "Episode " + ep.nr + " · bereit für Realisierung";
    return "Episode " + ep.nr + " · " + AVERA_DATA.getLoop(loopKey).label;
  }

  function renderStart() {
    var initiatives = AVERA_STORE.list();
    var listHtml = initiatives.length
      ? initiatives
          .map(function (init) {
            return (
              '<li class="initiative-row">' +
              '<a class="initiative-link" href="#/init/' + encodeURIComponent(init.id) + '">' +
              '<span class="initiative-name">' + escapeHtml(init.name) + "</span>" +
              (init.org ? '<span class="initiative-org">' + escapeHtml(init.org) + "</span>" : "") +
              '<span class="initiative-progress-num">' + escapeHtml(episodeStatusLabel(init)) + "</span>" +
              "</a>" +
              '<button class="btn-icon-delete" data-delete-id="' + init.id + '" title="Löschen" aria-label="Initiative löschen">✕</button>' +
              "</li>"
            );
          })
          .join("")
      : '<p class="empty-hint">Noch keine Initiative angelegt. Starte oben eine neue Veränderungsinitiative.</p>';

    root.innerHTML =
      '<div class="view view-start">' +
      '<header class="hero">' +
      "<h1>AVERA – das Rad ins Rollen bringen</h1>" +
      "<p>Diese App begleitet euch durch den AVERA-Workflow: Veränderung entsteht nicht in einem einmaligen Durchlauf, sondern in <strong>Episoden</strong> – jede Episode ist eine volle Drehung im Rad mit vier Schleifen: <strong>Beobachten → Verstehen → Entwerfen → Komponieren</strong>. Am Ende jeder Episode wird die entwickelte Gestaltung in die Welt gebracht; die nächste Episode setzt dort an, wo die Organisation tatsächlich angekommen ist. Die Intention bleibt dabei die stabile Richtung – nicht der Weg.</p>" +
      '<div class="how-it-works">' +
      '<div class="how-step"><span class="how-num">1</span><div><strong>Beobachten &amp; Verstehen</strong><p>Ihr erfasst den Status quo je Gestaltungselement und entwickelt ein plausibles Wirkmodell – noch ohne zu gestalten.</p></div></div>' +
      '<div class="how-step"><span class="how-num">2</span><div><strong>Entwerfen &amp; Komponieren</strong><p>Aus einem Katalog von Artefakten, Soziofakten, Mentefakten und Ethofakten baut ihr Gestaltungsimpulse und verdichtet sie zu einer minimal hinreichenden Architektur.</p></div></div>' +
      '<div class="how-step"><span class="how-num">3</span><div><strong>In die Welt bringen</strong><p>Die Architektur wird realisiert. Was sich dabei tatsächlich zeigt, ist der Ausgangspunkt der nächsten Episode.</p></div></div>' +
      "</div>" +
      "</header>" +

      '<section class="panel new-initiative">' +
      "<h2>Neue Veränderungsinitiative starten</h2>" +
      '<form id="new-initiative-form" class="inline-form">' +
      '<input type="text" id="new-initiative-name" placeholder="Titel des Vorhabens (z. B. „Führung neu denken“)" required />' +
      '<input type="text" id="new-initiative-org" placeholder="Unternehmen / Team (optional)" />' +
      '<button type="submit" class="btn btn-primary">Initiative anlegen</button>' +
      "</form>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Laufende Initiativen</h2>" +
      '<ul class="initiative-list">' + listHtml + "</ul>" +
      "</section>" +

      '<section class="panel about-panel">' +
      "<h2>Worauf AVERA hinweist</h2>" +
      '<p><strong>Die Geisterfahrt:</strong> Viele Change-Vorhaben scheitern, weil vorschnell von einer Beobachtung zu einer vertrauten Maßnahme gesprungen wird – ohne Verstehen und Entwerfen dazwischen. Die vier Schleifen sind gerichtet, aber rekursiv: Fehlt die Grundlage, geht es zurück.</p>' +
      '<p><strong>Veränderung oder Lernangebot? Beides – kein Entweder-Oder:</strong> AVERA behandelt Change und Lernen als gemeinsame Gestaltungsaufgabe. Story, Organisation und Führung treibt meist das Business, Entdecken, Peers und Methoden meist Corporate Learning/HR – Raum &amp; Zeit verbindet beide. Jedes Element zeigt seine Sphäre, damit klar bleibt, wer gerade am Zug ist.</p>' +
      '<p><strong>Hinreichend statt vollständig:</strong> AVERA strebt keine vollständige Erfassung der Wirklichkeit an, sondern eine für diese Episode, unter den gegenwärtigen Bedingungen tragfähige Grundlage für den nächsten Schritt.</p>' +
      '<p class="source-note">Grundlage: AVERA White Paper 2.0, Workflow „Episode &amp; Schleife“ und die Fragen-/4Fakte-Matrix, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>' +
      "</section>" +
      "</div>";

    document.getElementById("new-initiative-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      var name = document.getElementById("new-initiative-name").value.trim();
      var org = document.getElementById("new-initiative-org").value.trim();
      if (!name) return;
      var init = AVERA_STORE.create(name, org);
      navigate("#/init/" + init.id);
    });

    root.querySelectorAll("[data-delete-id]").forEach(function (btn) {
      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var id = btn.getAttribute("data-delete-id");
        var init = AVERA_STORE.get(id);
        if (init && confirm('Initiative "' + init.name + '" wirklich löschen?')) {
          AVERA_STORE.remove(id);
          renderStart();
        }
      });
    });
  }

  // ---------- Initiative-Übersicht ----------

  function renderOverview(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var ep = AVERA_STORE.currentEpisode(init);
    var adapter = buildWheelAdapter(init, ep);

    var pastEpisodes = init.episodes.filter(function (e) { return e.nr !== ep.nr || e.realized; });
    var historyHtml = pastEpisodes.length
      ? pastEpisodes
          .map(function (e) {
            return (
              '<div class="episode-card' + (e.realized ? " realized" : "") + '">' +
              '<div class="episode-card-head"><strong>Episode ' + e.nr + "</strong>" +
              (e.realized ? '<span class="episode-card-date">realisiert am ' + new Date(e.realized.at).toLocaleDateString("de-AT") + "</span>" : '<span class="episode-card-date">läuft noch</span>') +
              "</div>" +
              (e.realized && e.realized.notiz ? "<p>" + escapeHtml(e.realized.notiz) + "</p>" : "") +
              '<a class="btn btn-ghost btn-small" href="#/init/' + id + "/episode/" + e.nr + '/observe">Ansehen</a>' +
              "</div>"
            );
          })
          .join("")
      : "";

    var ctaHtml;
    if (ep.realized) {
      ctaHtml =
        '<div class="ok-box">✓ Episode ' + ep.nr + " abgeschlossen am " + new Date(ep.realized.at).toLocaleDateString("de-AT") + ".</div>" +
        '<button id="next-episode-btn" class="btn btn-primary btn-block">Nächste Episode starten</button>';
    } else {
      var loopKey = firstUnfinishedLoop(ep);
      if (loopKey) {
        var loop = AVERA_DATA.getLoop(loopKey);
        ctaHtml =
          '<a class="btn btn-primary btn-block" href="#/init/' + id + "/episode/" + ep.nr + "/" + loopKey + '">' +
          "Weiter in Episode " + ep.nr + ": " + escapeHtml(loop.label) + " →</a>";
      } else {
        ctaHtml =
          '<a class="btn btn-primary btn-block" href="#/init/' + id + "/episode/" + ep.nr + '/realize">Bereit für die Realisierung →</a>';
      }
    }

    var intentionHint = init.intention.statement && init.intention.statement.trim()
      ? '<blockquote class="intention-statement">„' + escapeHtml(init.intention.statement) + "“</blockquote>"
      : '<p class="hint-text">Die Intention ist noch nicht verdichtet – das ist die Grundlage, an der sich alle Episoden orientieren.</p>';

    root.innerHTML =
      '<div class="view view-rad">' +
      '<a href="#/" class="back-link">← Alle Initiativen</a>' +
      '<div class="rad-header">' +
      "<h1>" + escapeHtml(init.name) + "</h1>" +
      (init.org ? "<p class='rad-org'>" + escapeHtml(init.org) + "</p>" : "") +
      "<button id='edit-initiative-btn' class='btn btn-ghost btn-small'>Titel/Unternehmen bearbeiten</button>" +
      "</div>" +

      '<div class="rad-layout">' +
      '<div id="wheel-container" class="wheel-container"></div>' +
      '<aside class="rad-sidebar">' +
      '<div class="intention-box">' +
      '<span class="ziel-tag">Intention</span>' +
      intentionHint +
      '<a class="btn btn-ghost btn-small" href="#/init/' + id + '/intention">Intention bearbeiten →</a>' +
      "</div>" +
      "<p class='sphere-legend'>Story–Führung: Business · Entdecken–Methoden: Corporate Learning · Raum &amp; Zeit: beide gemeinsam</p>" +
      ctaHtml +
      '<button id="export-btn" class="btn btn-secondary btn-block">Gestaltungsarchitektur exportieren</button>' +
      "</aside>" +
      "</div>" +

      '<p class="wheel-hint">Klicke auf ein Segment, um direkt in die aktuelle Episode zu springen. Eingefärbt ist, wie weit ein Element in der laufenden Episode bereits bearbeitet ist.</p>' +

      (historyHtml ? '<section class="panel"><h2>Episoden-Historie</h2><div class="episode-history">' + historyHtml + "</div></section>" : "") +
      "</div>";

    AVERA_WHEEL.render(document.getElementById("wheel-container"), adapter, function (key) {
      if (key === "intention") {
        navigate("#/init/" + id + "/intention");
        return;
      }
      navigate("#/init/" + id + "/episode/" + ep.nr + "/observe");
    });

    document.getElementById("export-btn").addEventListener("click", function () {
      navigate("#/init/" + id + "/export");
    });

    document.getElementById("edit-initiative-btn").addEventListener("click", function () {
      var name = prompt("Titel des Vorhabens", init.name);
      if (name === null) return;
      var org = prompt("Unternehmen / Team", init.org || "");
      if (org === null) return;
      AVERA_STORE.rename(init.id, name.trim() || init.name, org.trim());
      renderOverview(id);
    });

    var nextBtn = document.getElementById("next-episode-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var next = AVERA_STORE.startNextEpisode(id);
        navigate("#/init/" + id + "/episode/" + next.nr + "/observe");
      });
    }
  }

  // ---------- Intention ----------

  function intentionPhaseHtml(id, phaseKey, values) {
    var phase = AVERA_DATA.INTENTION_PHASEN[phaseKey];
    var items = phase.fragen
      .map(function (fr, i) {
        var val = values[i] || "";
        return (
          '<div class="reflexion-item">' +
          '<label class="reflexion-label"><strong>' + escapeHtml(fr.kategorie) + ":</strong> " + escapeHtml(fr.frage) + "</label>" +
          '<textarea data-intention-phase="' + phaseKey + '" data-intention-index="' + i + '" rows="2" placeholder="Notiz…">' + escapeHtml(val) + "</textarea>" +
          "</div>"
        );
      })
      .join("");
    return (
      '<section class="panel">' +
      "<h2>" + escapeHtml(phase.leitfrage) + "</h2>" +
      items +
      "</section>"
    );
  }

  function renderIntention(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var reflexionen = init.intention.reflexionen || [];
    var reflexionHtml = reflexionen.length
      ? '<section class="panel"><h2>Bisherige Reflexionen</h2>' +
        reflexionen
          .map(function (r) {
            return (
              '<div class="reflexion-item">' +
              '<label class="reflexion-label">Episode ' + r.episodeNr + " · " + new Date(r.datum).toLocaleDateString("de-AT") + "</label>" +
              "<p>" + escapeHtml(r.text) + "</p>" +
              "</div>"
            );
          })
          .join("") +
        "</section>"
      : "";

    root.innerHTML =
      '<div class="view view-station">' +
      '<a href="#/init/' + id + '" class="back-link">← Zurück zur Initiative</a>' +
      "<header class='station-header'>" +
      "<h1>Intention</h1>" +
      "<p class='station-teaser'>Der Nullpunkt jeder Gestaltung – gibt Richtung, nicht den Weg.</p>" +
      "</header>" +

      '<div class="ziel-box">' +
      '<span class="ziel-tag">Verdichtete Intention</span>' +
      '<textarea id="intention-statement" rows="3" placeholder="Ein Satz: welches Verhalten soll für wen, in welchen Situationen, wozu wahrscheinlicher werden?">' + escapeHtml(init.intention.statement || "") + "</textarea>" +
      "</div>" +

      intentionPhaseHtml(id, "erarbeiten", init.intention.erarbeiten) +
      intentionPhaseHtml(id, "schaerfen", init.intention.schaerfen) +
      reflexionHtml +
      "</div>";

    document.getElementById("intention-statement").addEventListener("blur", function (evt) {
      AVERA_STORE.setIntentionStatement(id, evt.target.value);
    });

    root.querySelectorAll("[data-intention-phase]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        var phase = ta.getAttribute("data-intention-phase");
        var index = parseInt(ta.getAttribute("data-intention-index"), 10);
        AVERA_STORE.setIntentionField(id, phase, index, ta.value);
      });
    });
  }

  // ---------- Episode-Schleife ----------

  function generalSectionHtml(episode, loopKey) {
    var general = AVERA_DATA.LOOP_GENERAL_FRAGEN[loopKey];
    var state = episode.loops[loopKey];
    var fields = ["fokus", "wirkgefuege", "potenziale", "pruefung"];
    var itemsHtml = fields
      .map(function (fk) {
        return (
          '<div class="reflexion-item">' +
          '<label class="reflexion-label">' + escapeHtml(general[fk]) + "</label>" +
          '<textarea data-general-field="' + fk + '" rows="2" placeholder="Notiz…">' + escapeHtml(state.general[fk] || "") + "</textarea>" +
          "</div>"
        );
      })
      .join("");

    return (
      '<section class="panel">' +
      "<h2>Übergeordnete Reflexion</h2>" +
      "<p class='hint-text'>Diese Fragen gelten für die ganze Episode, unabhängig vom einzelnen Element.</p>" +
      itemsHtml +
      '<div class="gate-box">' +
      '<label class="gate-check"><input type="checkbox" id="gate-checkbox" ' + (state.gate ? "checked" : "") + " />" +
      "<span>" + escapeHtml(general.gate) + "</span></label>" +
      '<textarea id="gate-notiz" rows="1" placeholder="Kurze Begründung (optional)…">' + escapeHtml(state.gateNotiz || "") + "</textarea>" +
      "</div>" +
      "</section>"
    );
  }

  function elementAccordionHtml(episode, loopKey) {
    return AVERA_DATA.ELEMENTS
      .map(function (elm) {
        var sphere = AVERA_DATA.SPHERES[elm.sphere];
        var loopInfo = elm.loops[loopKey];
        var text = episode.loops[loopKey].elemente[elm.key] || "";
        var fragenHtml = loopInfo.fragen.map(function (f) { return "<li>" + escapeHtml(f) + "</li>"; }).join("");
        return (
          "<details class='reference-details element-details'" + (text.trim() ? " open" : "") + ">" +
          "<summary><span class='sphere-tag sphere-" + elm.sphere + "'>" + escapeHtml(sphere.label) + "</span> " +
          "<strong>" + escapeHtml(elm.title) + "</strong> — " + escapeHtml(loopInfo.leitfrage) + "</summary>" +
          "<div class='details-body'>" +
          "<ul class='fragen-liste'>" + fragenHtml + "</ul>" +
          '<textarea data-element-note="' + elm.key + '" rows="3" placeholder="Notiz zu ' + escapeHtml(elm.title) + '…">' + escapeHtml(text) + "</textarea>" +
          "</div>" +
          "</details>"
        );
      })
      .join("");
  }

  function fakteFilterBarHtml() {
    var typOpts = AVERA_DATA.FAKTE_TYPEN
      .map(function (t) {
        return '<option value="' + t.key + '"' + (t.key === designFilter.typ ? " selected" : "") + ">" + escapeHtml(t.label) + " — " + escapeHtml(t.subtitle) + "</option>";
      })
      .join("");
    var wsOpts = AVERA_DATA.WIRKSTUFEN
      .map(function (w) {
        return '<option value="' + w.key + '"' + (w.key === designFilter.wirkstufe ? " selected" : "") + ">" + escapeHtml(w.label) + "</option>";
      })
      .join("");
    return (
      '<div class="fakte-filter-bar">' +
      '<label>Fakt-Typ<select id="fakte-typ-select">' + typOpts + "</select></label>" +
      '<label>Wirkstufe<select id="fakte-wirkstufe-select">' + wsOpts + "</select></label>" +
      "</div>"
    );
  }

  function fakteCatalogHtml() {
    var groups = AVERA_DATA.FAKTE[designFilter.typ][designFilter.wirkstufe];
    return groups
      .map(function (g) {
        var chips = g.beispiele
          .map(function (beispiel) {
            var active = designDraft.objekte.some(function (o) {
              return o.typ === designFilter.typ && o.wirkstufe === designFilter.wirkstufe && o.kategorie === g.kategorie && o.beispiel === beispiel;
            });
            return (
              '<button type="button" class="chip fakte-chip' + (active ? " active" : "") + '" data-fakte-beispiel="' + escapeHtml(beispiel) + '" data-fakte-kategorie="' + escapeHtml(g.kategorie) + '">' +
              escapeHtml(beispiel) +
              "</button>"
            );
          })
          .join("");
        return '<div class="objekt-group"><div class="objekt-aspekt">' + escapeHtml(g.kategorie) + '</div><div class="chip-row">' + chips + "</div></div>";
      })
      .join("");
  }

  function draftObjekteHtml() {
    if (!designDraft.objekte.length) return "<p class='hint-text'>Noch keine Gestaltungsobjekte für diesen Impuls ausgewählt.</p>";
    return (
      '<div class="chip-row">' +
      designDraft.objekte
        .map(function (o, i) {
          return '<button type="button" class="chip active" data-draft-remove="' + i + '">' + escapeHtml(o.beispiel) + " ✕</button>";
        })
        .join("") +
      "</div>"
    );
  }

  function designSectionHtml(episode) {
    var impulse = episode.loops.design.impulse;
    var impulseHtml = impulse.length
      ? impulse
          .map(function (imp) {
            var tags = imp.objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("");
            return (
              '<div class="impuls-card">' +
              '<div class="impuls-card-head"><strong>' + escapeHtml(imp.name) + "</strong>" +
              '<button type="button" class="btn-icon-delete" data-remove-impuls="' + imp.id + '" title="Löschen">✕</button></div>' +
              '<div class="impuls-objekte">' + tags + "</div>" +
              (imp.notiz ? "<p>" + escapeHtml(imp.notiz) + "</p>" : "") +
              "</div>"
            );
          })
          .join("")
      : "<p class='hint-text'>Noch keine Gestaltungsimpulse gebaut.</p>";

    return (
      '<section class="panel">' +
      "<h2>Gestaltungsobjekte sammeln</h2>" +
      "<p class='hint-text'>Ein wirksamer Gestaltungsimpuls kombiniert idealerweise alle vier 4Fakte-Ebenen. Filtert nach Typ und Wirkstufe, klickt Beispiele an und bündelt sie zu einem benannten Impuls.</p>" +
      fakteFilterBarHtml() +
      '<div id="fakte-catalog">' + fakteCatalogHtml() + "</div>" +
      "<h3>Ausgewählt für diesen Impuls</h3>" +
      '<div id="draft-objekte">' + draftObjekteHtml() + "</div>" +
      '<form id="impuls-form" class="inline-form small">' +
      '<input type="text" id="impuls-name-input" placeholder="Name des Gestaltungsimpulses…" value="' + escapeHtml(designDraft.name) + '" />' +
      '<button type="submit" class="btn btn-secondary">Impuls speichern</button>' +
      "</form>" +
      "<h3>Gesammelte Impulse dieser Episode</h3>" +
      impulseHtml +
      "</section>"
    );
  }

  function architectSectionHtml(episode) {
    var impulse = episode.loops.design.impulse;
    var selected = episode.loops.architect.ausgewaehlt || [];
    if (!impulse.length) {
      return (
        '<section class="panel">' +
        "<h2>Architektur komponieren</h2>" +
        "<p class='hint-text'>In der Design-Schleife wurden noch keine Gestaltungsimpulse gebaut. Geht zurück zu Entwerfen, um Impulse zu sammeln.</p>" +
        "</section>"
      );
    }
    var itemsHtml = impulse
      .map(function (imp) {
        var checked = selected.indexOf(imp.id) !== -1;
        var tags = imp.objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("");
        return (
          '<label class="impuls-select-row">' +
          '<input type="checkbox" data-select-impuls="' + imp.id + '" ' + (checked ? "checked" : "") + " />" +
          '<span><strong>' + escapeHtml(imp.name) + "</strong><br />" + tags + "</span>" +
          "</label>"
        );
      })
      .join("");
    return (
      '<section class="panel">' +
      "<h2>Architektur komponieren</h2>" +
      "<p class='hint-text'>So wenig wie möglich, so viel wie nötig: Wählt die Impulse aus, denen ihr unter den gegenwärtigen Bedingungen die größte Wirkwahrscheinlichkeit zuschreibt – und die sich gegenseitig stützen statt widersprechen.</p>" +
      itemsHtml +
      "<h3>Begründung</h3>" +
      '<textarea id="architect-begruendung" rows="3" placeholder="Warum sind genau diese Impulse jetzt hinreichend?">' + escapeHtml(episode.loops.architect.begruendung || "") + "</textarea>" +
      "</section>"
    );
  }

  function renderLoop(id, nr, loopKey) {
    var init = AVERA_STORE.get(id);
    var ep = init ? AVERA_STORE.getEpisode(init, nr) : null;
    var loop = AVERA_DATA.getLoop(loopKey);
    if (!init || !ep || !loop) {
      navigate("#/init/" + id);
      return;
    }
    var scopeKey = id + ":" + nr;
    if (designDraft.scopeKey !== scopeKey) resetDesignDraft(scopeKey);

    var idx = LOOP_ORDER.indexOf(loopKey);
    var prevLoop = idx > 0 ? LOOP_ORDER[idx - 1] : null;
    var nextLoop = idx < LOOP_ORDER.length - 1 ? LOOP_ORDER[idx + 1] : null;

    root.innerHTML =
      '<div class="view view-station">' +
      '<a href="#/init/' + id + '" class="back-link">← Zurück zur Initiative</a>' +
      "<header class='station-header'>" +
      "<div class='station-tags'><span class='station-num'>Episode " + ep.nr + "</span></div>" +
      "<h1>" + escapeHtml(loop.label) + "</h1>" +
      "<p class='station-teaser'>" + escapeHtml(loop.funktion) + " → " + escapeHtml(loop.ergebnis) + "</p>" +
      "</header>" +

      loopDotsHtml(id, nr, loopKey, ep) +

      generalSectionHtml(ep, loopKey) +

      '<section class="panel">' +
      "<h2>Je Element</h2>" +
      "<p class='hint-text'>" + escapeHtml(elementLeitfrageHint(loopKey)) + "</p>" +
      elementAccordionHtml(ep, loopKey) +
      "</section>" +

      (loopKey === "design" ? designSectionHtml(ep) : "") +
      (loopKey === "architect" ? architectSectionHtml(ep) : "") +
      (loopKey === "understand" ? understandIntentionHtml(init, ep) : "") +

      '<div class="station-nav">' +
      (prevLoop
        ? '<a class="btn btn-ghost" href="#/init/' + id + "/episode/" + nr + "/" + prevLoop + '">← ' + escapeHtml(AVERA_DATA.getLoop(prevLoop).label) + "</a>"
        : '<a class="btn btn-ghost" href="#/init/' + id + '">← Zur Übersicht</a>') +
      (nextLoop
        ? '<a class="btn btn-primary btn-next" href="#/init/' + id + "/episode/" + nr + "/" + nextLoop + '">Weiter zu ' + escapeHtml(AVERA_DATA.getLoop(nextLoop).label) + " →</a>"
        : '<a class="btn btn-primary btn-next" href="#/init/' + id + "/episode/" + nr + '/realize">Weiter zur Realisierung →</a>') +
      "</div>" +
      "</div>";

    wireLoopEvents(id, nr, loopKey, ep, init);
  }

  function elementLeitfrageHint(loopKey) {
    if (loopKey === "observe") return "Was beobachten wir je Element mit Blick auf unsere Intention?";
    if (loopKey === "understand") return "Warum zeigt sich das beobachtete Verhalten heute so, je Element?";
    if (loopKey === "design") return "Welche Gestaltungsoptionen könnten je Element die Intention unterstützen?";
    return "Wie spielen die Gestaltungsoptionen je Element zusammen oder widersprechen sich?";
  }

  function understandIntentionHtml(init, episode) {
    var phase = AVERA_DATA.INTENTION_PHASEN.reflektieren;
    var fragenHtml = phase.fragen.map(function (f) { return "<li>" + escapeHtml(f.frage) + "</li>"; }).join("");
    return (
      "<details class='reference-details'>" +
      "<summary><strong>Intention kurz reflektieren</strong> — " + escapeHtml(phase.leitfrage) + "</summary>" +
      "<div class='details-body'>" +
      "<ul class='fragen-liste'>" + fragenHtml + "</ul>" +
      '<textarea id="intention-reflexion-input" rows="3" placeholder="Was bedeutet das für unsere Intention?"></textarea>' +
      '<button type="button" id="save-intention-reflexion-btn" class="btn btn-secondary btn-small">Reflexion speichern</button>' +
      "</div>" +
      "</details>"
    );
  }

  function wireLoopEvents(id, nr, loopKey, ep, init) {
    root.querySelectorAll("[data-general-field]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setLoopGeneralNote(id, nr, loopKey, ta.getAttribute("data-general-field"), ta.value);
      });
    });

    var gateBox = document.getElementById("gate-checkbox");
    var gateNotiz = document.getElementById("gate-notiz");
    function saveGate() {
      AVERA_STORE.setLoopGate(id, nr, loopKey, gateBox.checked, gateNotiz.value);
    }
    gateBox.addEventListener("change", saveGate);
    gateNotiz.addEventListener("blur", saveGate);

    root.querySelectorAll("[data-element-note]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setLoopElementNote(id, nr, loopKey, ta.getAttribute("data-element-note"), ta.value);
      });
    });

    if (loopKey === "design") {
      document.getElementById("fakte-typ-select").addEventListener("change", function (evt) {
        designFilter.typ = evt.target.value;
        renderLoop(id, nr, loopKey);
      });
      document.getElementById("fakte-wirkstufe-select").addEventListener("change", function (evt) {
        designFilter.wirkstufe = evt.target.value;
        renderLoop(id, nr, loopKey);
      });
      root.querySelectorAll("[data-fakte-beispiel]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var beispiel = chip.getAttribute("data-fakte-beispiel");
          var kategorie = chip.getAttribute("data-fakte-kategorie");
          var idx = designDraft.objekte.findIndex(function (o) {
            return o.typ === designFilter.typ && o.wirkstufe === designFilter.wirkstufe && o.kategorie === kategorie && o.beispiel === beispiel;
          });
          if (idx === -1) {
            designDraft.objekte.push({ typ: designFilter.typ, wirkstufe: designFilter.wirkstufe, kategorie: kategorie, beispiel: beispiel });
          } else {
            designDraft.objekte.splice(idx, 1);
          }
          renderLoop(id, nr, loopKey);
        });
      });
      root.querySelectorAll("[data-draft-remove]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          designDraft.objekte.splice(parseInt(chip.getAttribute("data-draft-remove"), 10), 1);
          renderLoop(id, nr, loopKey);
        });
      });
      document.getElementById("impuls-form").addEventListener("submit", function (evt) {
        evt.preventDefault();
        var input = document.getElementById("impuls-name-input");
        var name = input.value.trim();
        if (!name || !designDraft.objekte.length) return;
        AVERA_STORE.addImpuls(id, nr, { name: name, objekte: designDraft.objekte.slice(), notiz: "" });
        resetDesignDraft(id + ":" + nr);
        renderLoop(id, nr, loopKey);
      });
      root.querySelectorAll("[data-remove-impuls]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          AVERA_STORE.removeImpuls(id, nr, btn.getAttribute("data-remove-impuls"));
          renderLoop(id, nr, loopKey);
        });
      });
    }

    if (loopKey === "architect") {
      root.querySelectorAll("[data-select-impuls]").forEach(function (box) {
        box.addEventListener("change", function () {
          var current = (AVERA_STORE.getEpisode(AVERA_STORE.get(id), nr).loops.architect.ausgewaehlt || []).slice();
          var impId = box.getAttribute("data-select-impuls");
          var idx = current.indexOf(impId);
          if (box.checked && idx === -1) current.push(impId);
          if (!box.checked && idx !== -1) current.splice(idx, 1);
          AVERA_STORE.setArchitectSelection(id, nr, current);
        });
      });
      document.getElementById("architect-begruendung").addEventListener("blur", function (evt) {
        AVERA_STORE.setArchitectBegruendung(id, nr, evt.target.value);
      });
    }

    if (loopKey === "understand") {
      document.getElementById("save-intention-reflexion-btn").addEventListener("click", function () {
        var ta = document.getElementById("intention-reflexion-input");
        var text = ta.value.trim();
        if (!text) return;
        AVERA_STORE.addIntentionReflexion(id, nr, text);
        ta.value = "";
        alert("Reflexion gespeichert. Ihr findet sie auf der Intention-Seite wieder.");
      });
    }
  }

  // ---------- Realisierung ----------

  function renderRealize(id, nr) {
    var init = AVERA_STORE.get(id);
    var ep = init ? AVERA_STORE.getEpisode(init, nr) : null;
    if (!init || !ep) {
      navigate("#/init/" + id);
      return;
    }
    var impulse = ep.loops.design.impulse;
    var selected = ep.loops.architect.ausgewaehlt || [];
    var chosenImpulse = impulse.filter(function (imp) { return selected.indexOf(imp.id) !== -1; });
    var isLatest = init.episodes[init.episodes.length - 1].nr === ep.nr;

    var architekturHtml = chosenImpulse.length
      ? chosenImpulse
          .map(function (imp) {
            var tags = imp.objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("");
            return '<div class="impuls-card"><strong>' + escapeHtml(imp.name) + "</strong><div class='impuls-objekte'>" + tags + "</div></div>";
          })
          .join("")
      : "<p class='hint-text'>Noch keine Impulse für die Architektur ausgewählt (siehe Komponieren-Schleife).</p>";

    var bodyHtml;
    if (ep.realized) {
      bodyHtml =
        '<div class="ok-box">✓ Realisiert am ' + new Date(ep.realized.at).toLocaleDateString("de-AT") + "</div>" +
        (ep.realized.notiz ? "<p>" + escapeHtml(ep.realized.notiz) + "</p>" : "") +
        (isLatest ? '<button id="next-episode-btn" class="btn btn-primary btn-block">Nächste Episode starten</button>' : "");
    } else {
      bodyHtml =
        '<textarea id="realize-notiz" rows="4" placeholder="Wie kommt die Architektur in der Wirklichkeit an? Welche Bewegung entsteht, was bleibt stabil, was überrascht?"></textarea>' +
        '<button id="realize-btn" class="btn btn-primary btn-block">In die Welt gebracht — Episode abschließen</button>';
    }

    root.innerHTML =
      '<div class="view view-station">' +
      '<a href="#/init/' + id + "/episode/" + nr + '/architect" class="back-link">← Zurück zu Komponieren</a>' +
      "<header class='station-header'>" +
      "<div class='station-tags'><span class='station-num'>Episode " + ep.nr + "</span></div>" +
      "<h1>In die Welt bringen</h1>" +
      "<p class='station-teaser'>Die konzeptionelle Arbeit endet hier – jetzt trifft die Gestaltung auf die organisationale Wirklichkeit.</p>" +
      "</header>" +
      '<section class="panel"><h2>Ausgewählte Architektur</h2>' + architekturHtml + "</section>" +
      '<section class="panel">' + bodyHtml + "</section>" +
      "</div>";

    var realizeBtn = document.getElementById("realize-btn");
    if (realizeBtn) {
      realizeBtn.addEventListener("click", function () {
        var text = document.getElementById("realize-notiz").value.trim();
        AVERA_STORE.realizeEpisode(id, nr, text);
        renderRealize(id, nr);
      });
    }
    var nextBtn = document.getElementById("next-episode-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var next = AVERA_STORE.startNextEpisode(id);
        navigate("#/init/" + id + "/episode/" + next.nr + "/observe");
      });
    }
  }

  // ---------- Export ----------

  function renderExport(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var md = AVERA_EXPORT.toMarkdown(init);

    root.innerHTML =
      '<div class="view view-export">' +
      '<a href="#/init/' + id + '" class="back-link">← Zurück zur Initiative</a>' +
      "<h1>Gestaltungsarchitektur: " + escapeHtml(init.name) + "</h1>" +
      '<div class="export-actions">' +
      '<button id="download-md-btn" class="btn btn-primary">Als Markdown herunterladen</button>' +
      '<button id="print-btn" class="btn btn-secondary">Drucken / als PDF speichern</button>' +
      "</div>" +
      '<pre class="export-doc" id="export-doc"></pre>' +
      "</div>";

    document.getElementById("export-doc").textContent = md;
    document.getElementById("download-md-btn").addEventListener("click", function () {
      AVERA_EXPORT.downloadMarkdown(init);
    });
    document.getElementById("print-btn").addEventListener("click", function () {
      window.print();
    });
  }

  // ---------- Router ----------

  function route() {
    var r = parseHash();
    if (r.view === "start") renderStart();
    else if (r.view === "overview") renderOverview(r.id);
    else if (r.view === "intention") renderIntention(r.id);
    else if (r.view === "loop") renderLoop(r.id, r.nr, r.loop);
    else if (r.view === "realize") renderRealize(r.id, r.nr);
    else if (r.view === "export") renderExport(r.id);
    else renderStart();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    route();
  }
})();

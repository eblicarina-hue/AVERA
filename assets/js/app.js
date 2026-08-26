/*
 * AVERA-Change-App: Steuerung der Ansichten (Start, Rad, Station, Export)
 * über einen einfachen Hash-Router. Keine Frameworks, keine Build-Tools.
 */
(function () {
  "use strict";

  var root = document.getElementById("app");

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function parseHash() {
    var hash = location.hash.replace(/^#\/?/, "");
    if (!hash) return { view: "start" };
    var parts = hash.split("/");
    if (parts[0] === "rad" && parts[1]) return { view: "rad", id: parts[1] };
    if (parts[0] === "station" && parts[1] && parts[2]) return { view: "station", id: parts[1], key: parts[2] };
    if (parts[0] === "plan" && parts[1]) return { view: "plan", id: parts[1] };
    if (parts[0] === "export" && parts[1]) return { view: "export", id: parts[1] };
    return { view: "start" };
  }

  function navigate(hash) {
    location.hash = hash;
  }

  function stationWeight(stState) {
    return (AVERA_DATA.STATUS[(stState && stState.status) || "offen"] || AVERA_DATA.STATUS.offen).weight;
  }

  function computeBalance(initiative) {
    var dims = AVERA_DATA.DIMENSIONS;
    var result = {};
    Object.keys(dims).forEach(function (dimKey) {
      var stations = dims[dimKey].stations;
      var sum = 0;
      stations.forEach(function (k) {
        sum += stationWeight(initiative.stations[k]);
      });
      result[dimKey] = sum / stations.length;
    });
    return result;
  }

  function computeOverallProgress(initiative) {
    var keys = Object.keys(initiative.stations);
    var sum = 0;
    keys.forEach(function (k) {
      sum += stationWeight(initiative.stations[k]);
    });
    return keys.length ? sum / keys.length : 0;
  }

  function computeGeisterfahrtWarnings(initiative) {
    var seq = AVERA_DATA.SEQUENCE;
    var warnings = [];
    for (var i = 1; i < seq.length; i++) {
      var prevKey = seq[i - 1];
      var currKey = seq[i];
      var prevW = stationWeight(initiative.stations[prevKey]);
      var currW = stationWeight(initiative.stations[currKey]);
      if (prevW === 0 && currW > 0) {
        warnings.push({
          prev: AVERA_DATA.getStation(prevKey),
          curr: AVERA_DATA.getStation(currKey)
        });
      }
    }
    return warnings;
  }

  // Baut den zusammengeführten, priorisierten Aktionsplan über alle acht
  // Elemente: Reihenfolge = Drehrichtung des Rads (Intention zuerst), pro
  // Element zuerst die dringenden (Score 0), dann die zu beobachtenden
  // (Score 1) Empfehlungen. Raum & Zeit steht als Grundvoraussetzung am
  // Ende, weil es alle anderen Elemente erst wirksam werden lässt.
  function buildActionPlan(initiative) {
    var mainSteps = [];
    var raumzeitSteps = [];
    var totalQuestions = 0;
    var answeredQuestions = 0;

    function collect(stationKey, target) {
      var station = AVERA_DATA.getStation(stationKey);
      var stState = initiative.stations[stationKey] || { diagnose: {} };
      var diagnoseAnswers = stState.diagnose || {};
      totalQuestions += station.diagnose.length;

      var results = station.diagnose
        .map(function (frage, qi) {
          var oi = diagnoseAnswers[qi];
          if (oi === undefined || oi === null || !frage.optionen[oi]) return null;
          answeredQuestions++;
          return { qi: qi, frage: frage.frage, opt: frage.optionen[oi] };
        })
        .filter(function (r) { return r !== null; });

      if (!results.length) {
        target.push({
          type: "diagnose",
          stationKey: stationKey,
          stationTitle: station.title
        });
        return;
      }

      results
        .filter(function (r) { return r.opt.score < 2; })
        .sort(function (a, b) { return a.opt.score - b.opt.score; })
        .forEach(function (r) {
          target.push({
            type: "action",
            stationKey: stationKey,
            stationTitle: station.title,
            stepKey: stationKey + ":" + r.qi,
            text: r.opt.empfehlung,
            severity: r.opt.score === 0 ? "hoch" : "mittel"
          });
        });
    }

    AVERA_DATA.SEQUENCE.forEach(function (key) { collect(key, mainSteps); });
    collect("raumzeit", raumzeitSteps);

    return {
      mainSteps: mainSteps,
      raumzeitSteps: raumzeitSteps,
      totalQuestions: totalQuestions,
      answeredQuestions: answeredQuestions
    };
  }

  // ---------- Views ----------

  function renderStart() {
    var initiatives = AVERA_STORE.list();
    var listHtml = initiatives.length
      ? initiatives
          .map(function (init) {
            var progress = Math.round(computeOverallProgress(init) * 100);
            return (
              '<li class="initiative-row">' +
              '<a class="initiative-link" href="#/rad/' + encodeURIComponent(init.id) + '">' +
              '<span class="initiative-name">' + escapeHtml(init.name) + "</span>" +
              (init.org ? '<span class="initiative-org">' + escapeHtml(init.org) + "</span>" : "") +
              '<span class="initiative-progress"><span class="initiative-progress-bar" style="width:' + progress + '%"></span></span>' +
              '<span class="initiative-progress-num">' + progress + "% im Alltag verankert</span>" +
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
      "<p>Diese App ist ein interaktiver Coach für euer Veränderungsvorhaben: Sie diagnostiziert gemeinsam mit euch, wie tragfähig jedes der sieben AVERA-Gestaltungselemente aktuell ist, und leitet daraus konkrete, priorisierte Handlungsempfehlungen ab. Das Ziel ist kein ausgefülltes Formular, sondern ein belastbarer, Schritt-für-Schritt-Aktionsplan, mit dem ihr eure Initiative auf den Boden bringt – in der Reihenfolge, die AVERA für wirksame Veränderung vorschlägt: nicht bei der sichtbarsten Maßnahme beginnen, sondern bei der Intention.</p>" +
      '<div class="how-it-works">' +
      '<div class="how-step"><span class="how-num">1</span><div><strong>Diagnostizieren</strong><p>Für jedes der acht Elemente beantwortet ihr drei kurze Fragen zum Ist-Zustand – ehrlich, nicht wunschgemäß.</p></div></div>' +
      '<div class="how-step"><span class="how-num">2</span><div><strong>Empfehlungen erhalten</strong><p>Aus jeder Antwort entsteht sofort eine konkrete, auf euch zugeschnittene Handlungsempfehlung.</p></div></div>' +
      '<div class="how-step"><span class="how-num">3</span><div><strong>Aktionsplan umsetzen</strong><p>Sobald genug diagnostiziert ist, bündelt die App alles zu einem priorisierten Schritt-für-Schritt-Plan für die ganze Initiative.</p></div></div>' +
      "</div>" +
      "</header>" +

      '<section class="panel new-initiative">' +
      "<h2>Neue Veränderungsinitiative starten</h2>" +
      '<form id="new-initiative-form" class="inline-form">' +
      '<input type="text" id="new-initiative-name" placeholder="Titel des Vorhabens (z. B. „Führung neu denken“)" required />' +
      '<input type="text" id="new-initiative-org" placeholder="Unternehmen / Team (optional)" />' +
      '<button type="submit" class="btn btn-primary">Rad anlegen</button>' +
      "</form>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Laufende Initiativen</h2>" +
      '<ul class="initiative-list">' + listHtml + "</ul>" +
      "</section>" +

      '<section class="panel about-panel">' +
      "<h2>Worauf AVERA hinweist</h2>" +
      '<p><strong>Die Geisterfahrt:</strong> Viele Change-Vorhaben scheitern, weil dort gestaltet wird, wo Veränderung sichtbar wird (Training, Kommunikation, Tools) – nicht dort, wo sie entsteht. Diese App macht sichtbar, wenn eine sichtbare Maßnahme vorausläuft, während ihre Grundlage im Rad noch offen ist.</p>' +
      '<p><strong>Kein lineares Projekt, sondern ein Rad:</strong> Alle sieben Gestaltungselemente wirken gleichzeitig. Kein Element muss perfekt sein – bleibt eines aber dauerhaft unterentwickelt, verliert das ganze System an Wirkung.</p>' +
      '<p class="source-note">Grundlage: AVERA White Paper 2.0, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>' +
      "</section>" +
      "</div>";

    document.getElementById("new-initiative-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      var name = document.getElementById("new-initiative-name").value.trim();
      var org = document.getElementById("new-initiative-org").value.trim();
      if (!name) return;
      var init = AVERA_STORE.create(name, org);
      navigate("#/rad/" + init.id);
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

  function renderRad(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var balance = computeBalance(init);
    var overall = Math.round(computeOverallProgress(init) * 100);
    var warnings = computeGeisterfahrtWarnings(init);

    var dimBars = Object.keys(AVERA_DATA.DIMENSIONS)
      .map(function (dimKey) {
        var dim = AVERA_DATA.DIMENSIONS[dimKey];
        var pct = Math.round(balance[dimKey] * 100);
        return (
          '<div class="dim-bar-row">' +
          '<div class="dim-bar-label">' + dim.label + '<span class="dim-bar-sub">' + dim.subtitle + "</span></div>" +
          '<div class="dim-bar-track"><div class="dim-bar-fill dim-' + dimKey + '" style="width:' + pct + '%"></div></div>' +
          '<div class="dim-bar-pct">' + pct + "%</div>" +
          "</div>"
        );
      })
      .join("");

    var warningsHtml = warnings.length
      ? '<div class="warning-box"><strong>⚠ Geisterfahrt-Check:</strong> ' +
        warnings
          .map(function (w) {
            return (
              '<div class="warning-item">„' + escapeHtml(w.curr.title) + '“ ist schon in Bearbeitung, aber „' +
              escapeHtml(w.prev.title) + '“ – ein Schritt davor im Rad – ist noch offen. ' +
              "Prüft, ob hier am sichtbaren Ende statt an der Ursache gestaltet wird.</div>"
            );
          })
          .join("") +
        "</div>"
      : '<div class="ok-box">✓ Keine Geisterfahrt erkennbar – die Bearbeitung folgt bislang der Wirkungskette.</div>';

    var plan = buildActionPlan(init);

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
      '<div class="overall-progress"><strong>' + overall + "%</strong> des Rads lebt bereits im Alltag</div>" +
      '<div class="dim-bars">' + dimBars + "</div>" +
      warningsHtml +
      '<button id="plan-btn" class="btn btn-primary btn-block">Aktionsplan ansehen</button>' +
      '<p class="plan-progress-hint">' + plan.answeredQuestions + " / " + plan.totalQuestions + " Diagnosefragen beantwortet</p>" +
      '<button id="export-btn" class="btn btn-secondary btn-block">Gestaltungsarchitektur exportieren</button>' +
      "</aside>" +
      "</div>" +

      '<p class="wheel-hint">Klicke auf ein Segment des Rads, um es zu bearbeiten. Die Reihenfolge im Kreis ist die empfohlene Drehrichtung – kein starres Projektschema, sondern die Wirklogik, an der ihr euch orientieren könnt.</p>' +
      "</div>";

    AVERA_WHEEL.render(document.getElementById("wheel-container"), init, function (key) {
      navigate("#/station/" + init.id + "/" + key);
    });

    document.getElementById("plan-btn").addEventListener("click", function () {
      navigate("#/plan/" + init.id);
    });

    document.getElementById("export-btn").addEventListener("click", function () {
      navigate("#/export/" + init.id);
    });

    document.getElementById("edit-initiative-btn").addEventListener("click", function () {
      var name = prompt("Titel des Vorhabens", init.name);
      if (name === null) return;
      var org = prompt("Unternehmen / Team", init.org || "");
      if (org === null) return;
      AVERA_STORE.rename(init.id, name.trim() || init.name, org.trim());
      renderRad(id);
    });
  }

  function statusBadgeHtml(status) {
    var s = AVERA_DATA.STATUS[status] || AVERA_DATA.STATUS.offen;
    return '<span class="status-badge status-' + status + '">' + s.label + "</span>";
  }

  function diagnoseHtml(station, stState) {
    var answers = stState.diagnose || {};
    return station.diagnose
      .map(function (frage, qi) {
        var chosen = answers[qi];
        var optsHtml = frage.optionen
          .map(function (opt, oi) {
            var active = chosen === oi ? " active" : "";
            return (
              '<button type="button" class="chip diag-chip' + active + '" data-diag-q="' + qi + '" data-diag-opt="' + oi + '">' +
              escapeHtml(opt.label) +
              "</button>"
            );
          })
          .join("");
        return '<div class="diagnose-item"><p class="diagnose-frage">' + escapeHtml(frage.frage) + '</p><div class="chip-row">' + optsHtml + "</div></div>";
      })
      .join("");
  }

  function diagnoseResults(station, stState) {
    var answers = stState.diagnose || {};
    return station.diagnose
      .map(function (frage, qi) {
        var oi = answers[qi];
        if (oi === undefined || oi === null || !frage.optionen[oi]) return null;
        return { frage: frage.frage, opt: frage.optionen[oi] };
      })
      .filter(function (r) { return r !== null; });
  }

  function empfehlungenHtml(results) {
    if (!results.length) {
      return '<p class="hint-text">Beantwortet oben die Fragen zur Standortbestimmung – daraus leitet die App konkrete Handlungsempfehlungen für dieses Element ab.</p>';
    }
    var groups = [
      { list: results.filter(function (r) { return r.opt.score === 0; }), cls: "severity-hoch", tag: "Dringend" },
      { list: results.filter(function (r) { return r.opt.score === 1; }), cls: "severity-mittel", tag: "Im Blick behalten" },
      { list: results.filter(function (r) { return r.opt.score === 2; }), cls: "severity-gut", tag: "Läuft bereits gut" }
    ];
    return groups
      .map(function (g) {
        return g.list
          .map(function (r) {
            return (
              '<div class="empfehlung-card ' + g.cls + '">' +
              '<span class="empfehlung-tag">' + g.tag + "</span>" +
              '<p class="empfehlung-frage">' + escapeHtml(r.frage) + "</p>" +
              '<p class="empfehlung-text">' + escapeHtml(r.opt.empfehlung) + "</p>" +
              "</div>"
            );
          })
          .join("");
      })
      .join("");
  }

  function renderStation(id, key) {
    var init = AVERA_STORE.get(id);
    var station = AVERA_DATA.getStation(key);
    if (!init || !station) {
      navigate("#/rad/" + id);
      return;
    }
    var stState = init.stations[key] || { status: "offen", diagnose: {}, checked: [], answers: {}, objekte: [], notiz: "" };
    var results = diagnoseResults(station, stState);
    var answeredCount = results.length;
    var totalCount = station.diagnose.length;

    var checklistHtml = station.wasZuTun
      .map(function (item, i) {
        var checked = (stState.checked || []).indexOf(i) !== -1;
        return (
          '<li class="checklist-item">' +
          '<label><input type="checkbox" data-check-index="' + i + '" ' + (checked ? "checked" : "") + " />" +
          "<span>" + escapeHtml(item) + "</span></label></li>"
        );
      })
      .join("");

    var hinweiseHtml = station.hinweise.map(function (h) {
      return "<li>" + escapeHtml(h) + "</li>";
    }).join("");

    var fallenHtml = station.fallen
      .map(function (f) {
        return '<div class="falle-card"><strong>' + escapeHtml(f.name) + "</strong><p>" + escapeHtml(f.text) + "</p></div>";
      })
      .join("");

    var beobachtungHtml = station.beobachtung.length
      ? "<ul>" + station.beobachtung.map(function (b) { return "<li>" + escapeHtml(b) + "</li>"; }).join("") + "</ul>"
      : "";

    var reflexionHtml = station.reflexionsfragen
      .map(function (frage, i) {
        var antwort = (stState.answers && stState.answers[i]) || "";
        return (
          '<div class="reflexion-item">' +
          '<label class="reflexion-label">' + escapeHtml(frage) + "</label>" +
          '<textarea data-answer-index="' + i + '" rows="2" placeholder="Antwort im Team festhalten…">' + escapeHtml(antwort) + "</textarea>" +
          "</div>"
        );
      })
      .join("");

    var selectedObjekte = stState.objekte || [];
    var objekteHtml = station.objekte
      .map(function (grp) {
        var chips = grp.beispiele
          .map(function (beispiel) {
            var active = selectedObjekte.indexOf(beispiel) !== -1 ? " active" : "";
            return '<button type="button" class="chip' + active + '" data-objekt="' + escapeHtml(beispiel) + '">' + escapeHtml(beispiel) + "</button>";
          })
          .join("");
        return '<div class="objekt-group"><div class="objekt-aspekt">' + escapeHtml(grp.aspekt) + "</div><div class='chip-row'>" + chips + "</div></div>";
      })
      .join("");

    var customObjekte = selectedObjekte.filter(function (o) {
      return !station.objekte.some(function (grp) {
        return grp.beispiele.indexOf(o) !== -1;
      });
    });
    var customChipsHtml = customObjekte
      .map(function (o) {
        return '<button type="button" class="chip active" data-objekt="' + escapeHtml(o) + '">' + escapeHtml(o) + "</button>";
      })
      .join("");

    var seqIndex = AVERA_DATA.SEQUENCE.indexOf(key);
    var prevKey = seqIndex > 0 ? AVERA_DATA.SEQUENCE[seqIndex - 1] : null;
    var nextKey = seqIndex >= 0 && seqIndex < AVERA_DATA.SEQUENCE.length - 1 ? AVERA_DATA.SEQUENCE[seqIndex + 1] : null;
    if (key === "intention") nextKey = "story";
    if (key === "methoden") nextKey = "raumzeit";

    root.innerHTML =
      '<div class="view view-station">' +
      '<a href="#/rad/' + id + '" class="back-link">← Zurück zum Rad</a>' +
      '<header class="station-header">' +
      '<span class="station-num">' + escapeHtml(station.num) + "</span>" +
      "<h1>" + escapeHtml(station.title) + "</h1>" +
      '<p class="station-subtitle">' + escapeHtml(station.subtitle) + "</p>" +
      '<div class="status-line">' + statusBadgeHtml(stState.status) +
      '<span class="diagnose-progress">' + answeredCount + " / " + totalCount + " Fragen beantwortet</span></div>" +
      "</header>" +

      '<p class="station-intro">' + escapeHtml(station.intro) + "</p>" +

      '<div class="ziel-box"><span class="ziel-tag">Ziel dieses Elements</span><p>' + escapeHtml(station.ziel) + "</p></div>" +

      '<section class="panel">' +
      "<h2>Standortbestimmung</h2>" +
      "<p class='hint-text'>Beantwortet die Fragen so, wie es aktuell tatsächlich ist – daraus berechnet sich der Status dieses Elements automatisch.</p>" +
      diagnoseHtml(station, stState) +
      "</section>" +

      '<section class="panel">' +
      "<h2>Handlungsempfehlungen</h2>" +
      empfehlungenHtml(results) +
      "</section>" +

      '<section class="panel">' +
      "<h2>Gestaltungsobjekte / konkrete Maßnahmen</h2>" +
      "<p class='hint-text'>Wählt aus, was ihr konkret umsetzen wollt, oder ergänzt eigene Maßnahmen.</p>" +
      objekteHtml +
      (customChipsHtml ? '<div class="objekt-group"><div class="objekt-aspekt">Eigene</div><div class="chip-row">' + customChipsHtml + "</div></div>" : "") +
      '<form id="custom-objekt-form" class="inline-form small">' +
      '<input type="text" id="custom-objekt-input" placeholder="Eigene Maßnahme hinzufügen…" />' +
      '<button type="submit" class="btn btn-secondary">Hinzufügen</button>' +
      "</form>" +
      "</section>" +

      "<details class='reference-details'>" +
      "<summary>Hintergrund aus dem AVERA-Framework</summary>" +
      "<div class='details-body'>" +

      "<div class='subsection'>" +
      "<h2>Was ist grundsätzlich zu tun?</h2>" +
      '<ul class="checklist">' + checklistHtml + "</ul>" +
      "</div>" +

      "<div class='subsection'>" +
      "<h2>Hinweise zur Gestaltung</h2>" +
      "<ul>" + hinweiseHtml + "</ul>" +
      "</div>" +

      "<div class='subsection'>" +
      "<h2>Achtung Falle!</h2>" +
      '<div class="fallen-grid">' + fallenHtml + "</div>" +
      "</div>" +

      (beobachtungHtml
        ? "<div class='subsection'><h2>Beobachtungshinweise</h2>" + beobachtungHtml + "</div>"
        : "") +

      "<div class='subsection'>" +
      "<h2>Freie Reflexion im Team</h2>" +
      '<p class="kernfrage">Kernfrage: ' + escapeHtml(station.kernfrage) + "</p>" +
      reflexionHtml +
      "</div>" +

      "<div class='subsection'>" +
      "<h2>Notiz</h2>" +
      '<textarea id="station-notiz" rows="3" placeholder="Freie Notizen zu diesem Element…">' + escapeHtml(stState.notiz || "") + "</textarea>" +
      "</div>" +

      "</div>" +
      "</details>" +

      '<div class="station-nav">' +
      (prevKey ? '<a class="btn btn-ghost" href="#/station/' + id + "/" + prevKey + '">← ' + escapeHtml(AVERA_DATA.getStation(prevKey).title) + "</a>" : "<span></span>") +
      (nextKey ? '<a class="btn btn-ghost" href="#/station/' + id + "/" + nextKey + '">' + escapeHtml(AVERA_DATA.getStation(nextKey).title) + " →</a>" : "<span></span>") +
      "</div>" +
      "</div>";

    // Event wiring
    root.querySelectorAll("[data-diag-q]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var qIndex = parseInt(btn.getAttribute("data-diag-q"), 10);
        var optIndex = parseInt(btn.getAttribute("data-diag-opt"), 10);
        AVERA_STORE.setDiagnoseAnswer(id, key, qIndex, optIndex);
        renderStation(id, key);
      });
    });

    root.querySelectorAll("[data-check-index]").forEach(function (box) {
      box.addEventListener("change", function () {
        AVERA_STORE.toggleChecklist(id, key, parseInt(box.getAttribute("data-check-index"), 10), box.checked);
      });
    });

    root.querySelectorAll("[data-answer-index]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setAnswer(id, key, parseInt(ta.getAttribute("data-answer-index"), 10), ta.value);
      });
    });

    document.getElementById("station-notiz").addEventListener("blur", function (evt) {
      AVERA_STORE.setNotiz(id, key, evt.target.value);
    });

    function bindObjektChips() {
      root.querySelectorAll("[data-objekt]").forEach(function (chip) {
        chip.addEventListener("click", function () {
          var value = chip.getAttribute("data-objekt");
          var current = (AVERA_STORE.get(id).stations[key].objekte || []).slice();
          var idx = current.indexOf(value);
          if (idx === -1) current.push(value);
          else current.splice(idx, 1);
          AVERA_STORE.setObjekte(id, key, current);
          renderStation(id, key);
        });
      });
    }
    bindObjektChips();

    document.getElementById("custom-objekt-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      var input = document.getElementById("custom-objekt-input");
      var value = input.value.trim();
      if (!value) return;
      var current = (AVERA_STORE.get(id).stations[key].objekte || []).slice();
      if (current.indexOf(value) === -1) current.push(value);
      AVERA_STORE.setObjekte(id, key, current);
      renderStation(id, key);
    });
  }

  function renderPlan(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var plan = buildActionPlan(init);
    var erledigt = init.planErledigt || {};
    var balance = computeBalance(init);

    var dimEntries = Object.keys(AVERA_DATA.DIMENSIONS)
      .map(function (k) { return { key: k, dim: AVERA_DATA.DIMENSIONS[k], value: balance[k] }; })
      .sort(function (a, b) { return a.value - b.value; });
    var weakest = dimEntries[0];

    var allSteps = plan.mainSteps.concat(plan.raumzeitSteps);
    var actionSteps = allSteps.filter(function (s) { return s.type === "action"; });
    var openDiagnoseCount = allSteps.filter(function (s) { return s.type === "diagnose"; }).length;
    var progressPct = plan.totalQuestions ? Math.round((plan.answeredQuestions / plan.totalQuestions) * 100) : 0;

    var summaryHtml;
    if (plan.answeredQuestions === 0) {
      summaryHtml =
        '<section class="panel plan-empty">' +
        "<h2>Noch keine Diagnose</h2>" +
        "<p>Beantwortet zuerst die Standortbestimmung in den einzelnen Elementen – beginnt am besten bei der Intention, dem Nullpunkt des Rads. Erst daraus kann die App einen belastbaren, maßgeschneiderten Plan ableiten.</p>" +
        '<a class="btn btn-primary" href="#/station/' + id + '/intention">Jetzt mit Intention starten</a>' +
        "</section>";
    } else {
      var summaryLines = [
        plan.answeredQuestions + " von " + plan.totalQuestions + " Fragen beantwortet (" + progressPct + " %)."
      ];
      if (weakest) {
        summaryLines.push(
          'Euer größter Hebel liegt aktuell in der Dimension „' + weakest.dim.label + '“ (' + weakest.dim.subtitle + "), im Schnitt bei " + Math.round(weakest.value * 100) + " %."
        );
      }
      if (openDiagnoseCount > 0) {
        summaryLines.push(openDiagnoseCount + " von 8 Element" + (openDiagnoseCount === 1 ? "" : "en") + " sind noch gar nicht diagnostiziert.");
      }
      if (actionSteps.length === 0 && plan.answeredQuestions === plan.totalQuestions) {
        summaryLines.push("Kein akuter Handlungsbedarf – alle diagnostizierten Elemente stehen stabil.");
      }
      summaryHtml =
        '<section class="panel plan-summary">' +
        "<h2>Zusammenfassung</h2>" +
        "<p>" + summaryLines.map(escapeHtml).join(" ") + "</p>" +
        (plan.answeredQuestions < plan.totalQuestions
          ? '<p class="hint-text">Je vollständiger die Diagnose, desto präziser der Plan – ergänzt die fehlenden Elemente, sobald ihr könnt.</p>'
          : "") +
        "</section>";
    }

    var stepCounter = 1;

    function renderStepList(steps) {
      return steps
        .map(function (step) {
          if (step.type === "diagnose") {
            return (
              '<div class="plan-step plan-step-diagnose">' +
              '<span class="plan-step-station-tag">' + escapeHtml(step.stationTitle) + "</span>" +
              "<p>Noch nicht diagnostiziert – ohne Antworten lässt sich hier kein konkreter Schritt ableiten.</p>" +
              '<a class="btn btn-secondary btn-small" href="#/station/' + id + "/" + step.stationKey + '">Jetzt diagnostizieren →</a>' +
              "</div>"
            );
          }
          var n = stepCounter++;
          var done = !!erledigt[step.stepKey];
          return (
            '<div class="plan-step' + (done ? " done" : "") + '">' +
            '<label class="plan-step-check">' +
            '<input type="checkbox" data-plan-step="' + escapeHtml(step.stepKey) + '" ' + (done ? "checked" : "") + " />" +
            '<span class="plan-step-number">' + n + "</span>" +
            "</label>" +
            '<div class="plan-step-body">' +
            '<div class="plan-step-meta">' +
            '<span class="plan-step-station-tag">' + escapeHtml(step.stationTitle) + "</span>" +
            '<span class="plan-step-severity severity-' + step.severity + '">' + (step.severity === "hoch" ? "Dringend" : "Wichtig") + "</span>" +
            "</div>" +
            '<p class="plan-step-text">' + escapeHtml(step.text) + "</p>" +
            "</div></div>"
          );
        })
        .join("");
    }

    var mainStepsHtml = plan.mainSteps.length
      ? '<section class="panel"><h2>Schritt für Schritt</h2>' + renderStepList(plan.mainSteps) + "</section>"
      : "";

    var raumzeitHtml = plan.raumzeitSteps.length
      ? '<section class="panel plan-raumzeit"><h2>Grundvoraussetzung prüfen: Raum &amp; Zeit</h2>' +
        "<p class='hint-text'>Raum &amp; Zeit ist der Dreh- und Angelpunkt des Rads – ohne diese Voraussetzung verpuffen alle Schritte oben.</p>" +
        renderStepList(plan.raumzeitSteps) +
        "</section>"
      : "";

    root.innerHTML =
      '<div class="view view-plan">' +
      '<a href="#/rad/' + id + '" class="back-link">← Zurück zum Rad</a>' +
      "<h1>Aktionsplan: " + escapeHtml(init.name) + "</h1>" +
      "<p class='station-intro'>Maßgeschneiderte, priorisierte Handlungsempfehlungen für die gesamte Initiative – abgeleitet aus eurer Standortbestimmung, in der Reihenfolge der AVERA-Wirkungskette.</p>" +
      summaryHtml +
      mainStepsHtml +
      raumzeitHtml +
      "</div>";

    root.querySelectorAll("[data-plan-step]").forEach(function (box) {
      box.addEventListener("change", function () {
        AVERA_STORE.togglePlanStep(id, box.getAttribute("data-plan-step"), box.checked);
        renderPlan(id);
      });
    });
  }

  function renderExport(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/");
      return;
    }
    var md = AVERA_EXPORT.toMarkdown(init);

    root.innerHTML =
      '<div class="view view-export">' +
      '<a href="#/rad/' + id + '" class="back-link">← Zurück zum Rad</a>' +
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

  function route() {
    var r = parseHash();
    if (r.view === "start") renderStart();
    else if (r.view === "rad") renderRad(r.id);
    else if (r.view === "station") renderStation(r.id, r.key);
    else if (r.view === "plan") renderPlan(r.id);
    else if (r.view === "export") renderExport(r.id);
    else renderStart();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    route();
  }
})();

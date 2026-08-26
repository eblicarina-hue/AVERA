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
      "<p>Diese App begleitet Unternehmen dabei, Veränderungsvorhaben so aufzusetzen, wie es das Admonter Veränderungsrad (AVERA) vorschlägt: nicht bei der sichtbarsten Maßnahme beginnen, sondern bei der Intention – und von dort Schritt für Schritt Bedeutung, Möglichkeiten, Relevanz, Lernen, soziale Verstärkung und passende Methoden gestalten.</p>" +
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
      '<button id="export-btn" class="btn btn-primary btn-block">Gestaltungsarchitektur exportieren</button>' +
      "</aside>" +
      "</div>" +

      '<p class="wheel-hint">Klicke auf ein Segment des Rads, um es zu bearbeiten. Die Reihenfolge im Kreis ist die empfohlene Drehrichtung – kein starres Projektschema, sondern die Wirklogik, an der ihr euch orientieren könnt.</p>' +
      "</div>";

    AVERA_WHEEL.render(document.getElementById("wheel-container"), init, function (key) {
      navigate("#/station/" + init.id + "/" + key);
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

  function statusButtonsHtml(currentStatus) {
    return Object.keys(AVERA_DATA.STATUS)
      .map(function (statusKey) {
        var s = AVERA_DATA.STATUS[statusKey];
        var active = statusKey === currentStatus ? " active" : "";
        return '<button class="status-btn status-' + statusKey + active + '" data-status="' + statusKey + '">' + s.label + "</button>";
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
    var stState = init.stations[key] || { status: "offen", checked: [], answers: {}, objekte: [], notiz: "" };

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
      '<div class="status-btns">' + statusButtonsHtml(stState.status) + "</div>" +
      "</header>" +

      '<p class="station-intro">' + escapeHtml(station.intro) + "</p>" +

      '<section class="panel">' +
      "<h2>Was ist zu tun?</h2>" +
      '<ul class="checklist">' + checklistHtml + "</ul>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Hinweise zur Gestaltung</h2>" +
      "<ul>" + hinweiseHtml + "</ul>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Achtung Falle!</h2>" +
      '<div class="fallen-grid">' + fallenHtml + "</div>" +
      "</section>" +

      (beobachtungHtml
        ? '<section class="panel"><h2>Beobachtungshinweise</h2>' + beobachtungHtml + "</section>"
        : "") +

      '<section class="panel">' +
      "<h2>Reflexion im Team</h2>" +
      '<p class="kernfrage">Kernfrage: ' + escapeHtml(station.kernfrage) + "</p>" +
      reflexionHtml +
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

      '<section class="panel">' +
      "<h2>Notiz</h2>" +
      '<textarea id="station-notiz" rows="3" placeholder="Freie Notizen zu diesem Element…">' + escapeHtml(stState.notiz || "") + "</textarea>" +
      "</section>" +

      '<div class="station-nav">' +
      (prevKey ? '<a class="btn btn-ghost" href="#/station/' + id + "/" + prevKey + '">← ' + escapeHtml(AVERA_DATA.getStation(prevKey).title) + "</a>" : "<span></span>") +
      (nextKey ? '<a class="btn btn-ghost" href="#/station/' + id + "/" + nextKey + '">' + escapeHtml(AVERA_DATA.getStation(nextKey).title) + " →</a>" : "<span></span>") +
      "</div>" +
      "</div>";

    // Event wiring
    root.querySelectorAll(".status-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        AVERA_STORE.setStatus(id, key, btn.getAttribute("data-status"));
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
    else if (r.view === "export") renderExport(r.id);
    else renderStart();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    route();
  }
})();

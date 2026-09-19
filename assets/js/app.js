/*
 * AVERA-App – Steuerung der Ansichten über einen einfachen Hash-Router.
 *
 * Aufbau nach "AVERA App – Konzept (Option 3: KI eingebettet je Schleife)":
 * Ein Vorhaben startet bei der Intention und läuft in Episoden durch die vier
 * Schleifen Beobachten -> Verstehen -> Entwerfen -> Komponieren. Zwischen den
 * Schleifen liegt je ein Gate: kein einfacher "Weiter"-Button, sondern eine
 * Reflexionsfrage mit Freitext-Begründung, die den Übergang freischaltet.
 * Die KI hat je Schleife genau eine begrenzte Funktion – Vorschläge,
 * Gegenfragen, Kohärenz-Checks; entschieden wird am Gate, vom Menschen.
 *
 * Keine Frameworks, keine Build-Tools.
 */
(function () {
  "use strict";

  var root = document.getElementById("app");
  var LOOP_ORDER = ["observe", "understand", "design", "architect"];

  var SIDEBAR_ITEMS = [
    { key: "dashboard", label: "Dashboard", icon: "📊", href: "#/" },
    { key: "projekte", label: "Projekte", icon: "📁", href: "#/projekte" },
    { key: "framework", label: "Das Rad", icon: "🎡", href: "#/framework" },
    { key: "massnahmen", label: "Maßnahmen", icon: "✅", href: "#/soon/massnahmen", soon: true },
    { key: "people", label: "People & Kultur", icon: "👥", href: "#/soon/people", soon: true },
    { key: "wissen", label: "Wissen", icon: "📚", href: "#/soon/wissen", soon: true },
    { key: "analyse", label: "Analyse", icon: "📈", href: "#/soon/analyse", soon: true },
    { key: "community", label: "Community", icon: "💬", href: "#/soon/community", soon: true },
    { key: "tools", label: "Tools", icon: "🧰", href: "#/soon/tools", soon: true }
  ];

  var SOON_LABELS = {
    massnahmen: { title: "Maßnahmen", text: "Eine bereichsübergreifende Sicht auf alle Maßnahmen eurer Projekte – gebündelt statt Projekt für Projekt." },
    people: { title: "People & Kultur", text: "Perspektiven aus HR und Führung auf laufende Veränderungsprojekte." },
    wissen: { title: "Wissen", text: "Eine Wissensbasis rund um AVERA, Change- und Lernformate." },
    analyse: { title: "Analyse", text: "Auswertungen über mehrere Projekte hinweg: Fortschritt, Muster, Wirkung." },
    community: { title: "Community", text: "Austausch mit anderen, die mit AVERA arbeiten." },
    tools: { title: "Tools", text: "Weitere Werkzeuge rund um die Gestaltung von Veränderung." }
  };

  var TIPS = [
    "Beobachten, bevor ihr erklärt – und erklären, bevor ihr gestaltet.",
    "Hinreichend statt vollständig: Eine für diesen Moment tragfähige Grundlage reicht, um den nächsten Schritt zu gehen.",
    "Trennt beim Beobachten Fakt und Vermutung. Eine Vermutung ist nicht schlechter – sie ist nur etwas anderes.",
    "Zu jeder Hypothese gehört eine Gegenhypothese. Wer keine findet, hat noch nicht genug gesucht.",
    "Entwerfen öffnet den Gestaltungsraum – Komponieren reduziert ihn wieder. Beides braucht seine Zeit.",
    "Ein Gestaltungsimpuls wirkt am stärksten im Zusammenspiel von Artefakt, Soziofakt, Mentefakt und Ethofakt.",
    "Die Geisterfahrt: Wer am sichtbaren Ende gestaltet, ohne die Ursache zu verstehen, verpufft schnell wieder.",
    "Die Intention gibt Richtung, nicht den Weg. Sie darf sich schärfen, wenn neue Erkenntnisse ihre Annahmen infrage stellen.",
    "Ein Gate ist kein Weiter-Button. Wenn die Begründung schwerfällt, ist die Schleife noch nicht fertig.",
    "Fragt bei jedem Impuls: Was passiert, wenn er entfällt? Was dann nichts ändert, kann weg."
  ];

  // Entwurf beim Zusammenstellen eines Gestaltungsimpulses in der
  // Entwerfen-Schleife (bewusst nicht persistiert, bis er gespeichert wird).
  var designDraft = { scope: null, hypotheseId: null, titel: "", objekte: [] };
  var designWirkstufe = "beruehren";
  var observeFilter = "alle";

  // Welches Gestaltungselement ist in der aktuellen Schleife aufgeschlagen?
  // Eine Schleife beginnt beim ersten Element – von dort klickt man sich
  // durch; "ueberblick" am Ende zeigt alles auf einmal.
  var elementTab = { scope: null, key: null };

  function erstesElement() {
    return AVERA_DATA.ELEMENTS[0].key;
  }

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
    if (!hash) return { view: "dashboard" };
    var parts = hash.split("/");
    if (parts[0] === "projekte") return { view: "projekte" };
    if (parts[0] === "framework") return { view: "framework" };
    if (parts[0] === "hilfe") return { view: "hilfe" };
    if (parts[0] === "soon" && parts[1]) return { view: "soon", key: parts[1] };
    if (parts[0] === "v" && parts[1]) {
      var id = parts[1];
      if (parts[2] === "intention") return { view: "intention", id: id };
      if (parts[2] === "export") return { view: "export", id: id };
      if (parts[2] === "ep" && parts[3]) {
        var nr = parseInt(parts[3], 10);
        if (parts[4] === "welt") return { view: "welt", id: id, nr: nr };
        if (LOOP_ORDER.indexOf(parts[4]) !== -1) return { view: "loop", id: id, nr: nr, loop: parts[4] };
        return { view: "loop", id: id, nr: nr, loop: "observe" };
      }
      return { view: "overview", id: id };
    }
    return { view: "dashboard" };
  }

  function navigate(hash) {
    location.hash = hash;
  }

  function resetDesignDraft(scope, hypotheseId) {
    designDraft = { scope: scope, hypotheseId: hypotheseId || null, titel: "", objekte: [] };
  }

  function loopUrl(id, nr, loopKey) {
    return "#/v/" + id + "/ep/" + nr + "/" + loopKey;
  }

  // ---------- App-Shell (Sidebar + Topbar) ----------

  // AVERA-Blütenlogo (6 Blütenblätter) – dieselbe Form wie im Rad-Zentrum
  // (assets/js/wheel.js), hier als HTML-String fürs Sidebar-Icon.
  var LOGO_PETAL_D = "M50,50 C36,45 26,26 41,8 C46,2 54,2 59,8 C74,26 64,45 50,50 Z";
  var LOGO_COLORS = [
    ["#2f6fe0", "#9cc9f7"],
    ["#16b892", "#a7f0dc"],
    ["#f0a72e", "#ffdd8f"],
    ["#f0654f", "#ffb7a3"],
    ["#e0468f", "#f6a9d3"],
    ["#7c4fd1", "#c6aef2"]
  ];
  var LOGO_MARK =
    '<svg class="sidebar-logo-mark" viewBox="0 0 100 100" aria-hidden="true">' +
    "<defs>" +
    LOGO_COLORS.map(function (pair, i) {
      return '<linearGradient id="app-logo-' + i + '" x1="0.5" y1="1" x2="0.5" y2="0">' +
        '<stop offset="0%" stop-color="' + pair[0] + '" />' +
        '<stop offset="100%" stop-color="' + pair[1] + '" />' +
        "</linearGradient>";
    }).join("") +
    "</defs>" +
    LOGO_COLORS.map(function (pair, i) {
      return '<path d="' + LOGO_PETAL_D + '" fill="url(#app-logo-' + i + ')" transform="rotate(' + i * 60 + ' 50 50)" />';
    }).join("") +
    "</svg>";

  function sidebarHtml(activeKey) {
    var items = SIDEBAR_ITEMS
      .map(function (item) {
        var cls = "sidebar-nav-item" + (item.key === activeKey ? " active" : "") + (item.soon ? " soon" : "");
        return (
          '<a class="' + cls + '" href="' + item.href + '">' +
          '<span class="sidebar-nav-icon">' + item.icon + "</span>" +
          '<span class="label">' + escapeHtml(item.label) + "</span>" +
          "</a>"
        );
      })
      .join("");

    return (
      '<aside class="app-sidebar">' +
      '<a class="sidebar-logo" href="#/">' +
      LOGO_MARK +
      "<div><strong>AVERA</strong><span>Lernen. Verändern. Wirken.</span></div>" +
      "</a>" +
      '<nav class="sidebar-nav">' + items + "</nav>" +
      '<div class="sidebar-footer">' +
      '<a class="sidebar-nav-item' + (activeKey === "hilfe" ? " active" : "") + '" href="#/hilfe">' +
      '<span class="sidebar-nav-icon">❓</span><span class="label">Hilfe</span>' +
      "</a>" +
      "</div>" +
      "</aside>"
    );
  }

  function topbarHtml() {
    return (
      '<div class="app-topbar">' +
      '<div class="app-topbar-search"><input type="search" placeholder="Projekte durchsuchen…" id="topbar-search" /></div>' +
      '<a class="btn btn-primary btn-small" href="#/projekte">+ Neues Projekt</a>' +
      "</div>"
    );
  }

  function autosizeTextarea(ta) {
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }

  // Jedes Notizfeld wächst mit seinem Inhalt, statt den Text zu verstecken und
  // intern wegzuscrollen. Läuft einmal je Render über alle Textareas (auch die
  // in noch geschlossenen <details>, die beim Öffnen nachgemessen werden).
  function wireAutosize(container) {
    container.querySelectorAll("textarea").forEach(function (ta) {
      autosizeTextarea(ta);
      ta.addEventListener("input", function () {
        autosizeTextarea(ta);
      });
    });
    container.querySelectorAll("details").forEach(function (det) {
      det.addEventListener("toggle", function () {
        if (det.open) det.querySelectorAll("textarea").forEach(autosizeTextarea);
      });
    });
  }

  function renderShell(activeKey, contentHtml) {
    root.innerHTML =
      '<div class="app-shell">' +
      sidebarHtml(activeKey) +
      '<div class="app-body">' +
      topbarHtml() +
      '<main class="app-main">' + contentHtml + "</main>" +
      "</div>" +
      '<div id="overlay-root"></div>' +
      "</div>";

    wireAutosize(root);

    var search = document.getElementById("topbar-search");
    if (search) {
      search.addEventListener("input", function () {
        var rows = root.querySelectorAll("[data-search-name]");
        var q = search.value.trim().toLowerCase();
        rows.forEach(function (row) {
          var name = row.getAttribute("data-search-name").toLowerCase();
          row.style.display = !q || name.indexOf(q) !== -1 ? "" : "none";
        });
      });
    }
  }

  // ---------- Overlay (Gate, KI-Prompt) ----------

  function closeOverlay() {
    var host = document.getElementById("overlay-root");
    if (host) host.innerHTML = "";
  }

  function showOverlay(cls, innerHtml, onMount) {
    var host = document.getElementById("overlay-root");
    if (!host) return;
    host.innerHTML =
      '<div class="overlay-backdrop" id="overlay-backdrop">' +
      '<div class="overlay-panel ' + cls + '" role="dialog" aria-modal="true">' + innerHtml + "</div>" +
      "</div>";
    wireAutosize(host);
    document.getElementById("overlay-backdrop").addEventListener("click", function (evt) {
      if (evt.target.id === "overlay-backdrop") closeOverlay();
    });
    host.querySelectorAll("[data-overlay-close]").forEach(function (btn) {
      btn.addEventListener("click", closeOverlay);
    });
    if (onMount) onMount(host);
  }

  // ---------- Ableitungen ----------

  function elementEverTouched(v, elementKey) {
    return v.episodes.some(function (ep) {
      return LOOP_ORDER.some(function (lk) {
        return AVERA_STORE.elementLoopBeruehrt(ep, elementKey, lk);
      });
    });
  }

  function buildWheelAdapter(v, episode) {
    var adapter = { stations: {} };
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      adapter.stations[elm.key] = {
        status: AVERA_STORE.deriveElementStatus(episode, elm.key),
        touchedBefore: elementEverTouched(v, elm.key)
      };
    });
    adapter.stations.intention = { status: AVERA_STORE.deriveIntentionStatus(v) };
    return adapter;
  }

  function projectProgressPct(v) {
    var ep = AVERA_STORE.currentEpisode(v);
    var gates = LOOP_ORDER.filter(function (lk) { return AVERA_STORE.gateOffen(ep, lk); }).length;
    return Math.round((gates / LOOP_ORDER.length) * 100);
  }

  function episodeStatusLabel(v) {
    var ep = AVERA_STORE.currentEpisode(v);
    if (ep.realized) return "Episode " + ep.nr + " abgeschlossen";
    var loopKey = AVERA_STORE.ersteOffeneSchleife(ep);
    if (!loopKey) return "Episode " + ep.nr + " · bereit, in die Welt zu gehen";
    return "Episode " + ep.nr + " · " + AVERA_DATA.getLoop(loopKey).label;
  }

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  function elementOptionsHtml(selected, leerLabel) {
    return (
      '<option value=""' + (selected ? "" : " selected") + ">" + escapeHtml(leerLabel || "— Element wählen —") + "</option>" +
      AVERA_DATA.ELEMENTS.map(function (el) {
        return '<option value="' + el.key + '"' + (el.key === selected ? " selected" : "") + ">" + escapeHtml(el.title) + "</option>";
      }).join("")
    );
  }

  function elementTagHtml(key) {
    if (!key) return '<span class="el-tag el-tag-leer">ungetaggt</span>';
    var el = AVERA_DATA.getElement(key);
    if (!el) return "";
    return '<span class="el-tag" style="background: var(--el-' + key + '-soft); color: var(--el-' + key + ')">' + escapeHtml(el.title) + "</span>";
  }

  // ---------- Prozessrad ----------

  function prozessradAsideHtml(v) {
    var text = (v.intention.text || "").trim();
    return (
      '<aside class="prozess-aside">' +
      '<div class="prozess-aside-head">Wo stehen wir?</div>' +
      '<div id="prozessrad-container"></div>' +
      '<a class="prozess-aside-intention" href="#/v/' + v.id + '/intention">' +
      "<span>Intention</span>" +
      (text ? "„" + escapeHtml(text) + "“" : "<em>noch nicht formuliert</em>") +
      "</a>" +
      '<p class="prozess-aside-hint">Klick auf ein Segment wechselt die Schleife, Klick auf ein Tor öffnet das Gate, Klick auf einen Ring eine Episode.</p>' +
      "</aside>"
    );
  }

  function mountProzessrad(v, ep, aktiveSchleife) {
    var container = document.getElementById("prozessrad-container");
    if (!container) return;
    AVERA_PROZESSRAD.render(
      container,
      {
        vorhaben: v,
        episode: ep,
        aktiveSchleife: aktiveSchleife,
        gateOffen: function (k) { return AVERA_STORE.gateOffen(ep, k); },
        erreichbar: function (k) { return AVERA_STORE.loopErreichbar(ep, k); }
      },
      {
        onSchleife: function (k) { navigate(loopUrl(v.id, ep.nr, k)); },
        onGate: function (k) { openGate(v.id, ep.nr, k); },
        onIntention: function () { navigate("#/v/" + v.id + "/intention"); },
        onEpisode: function (nr) { navigate("#/v/" + v.id + "/ep/" + nr + "/observe"); }
      }
    );
  }

  // ---------- Gate-Overlay ----------

  // Was hat diese Schleife hervorgebracht? Steht im Gate mit drin, damit die
  // Entscheidung nicht blind getroffen wird.
  function gateBilanzHtml(ep, loopKey) {
    var zeilen = [];
    if (loopKey === "observe") {
      var fakten = ep.beobachtungen.filter(function (b) { return b.typ === "fakt"; }).length;
      var vermutungen = ep.beobachtungen.length - fakten;
      var getaggt = {};
      ep.beobachtungen.forEach(function (b) { if (b.element) getaggt[b.element] = true; });
      zeilen.push(fakten + " Fakten, " + vermutungen + " Vermutungen");
      zeilen.push(Object.keys(getaggt).length + " von " + AVERA_DATA.ELEMENTS.length + " Gestaltungselementen berührt");
    } else if (loopKey === "understand") {
      var ohneGegen = ep.wirkmodell.hypothesen.filter(function (h) { return !h.gegenhypothese || !h.gegenhypothese.trim(); }).length;
      zeilen.push(ep.wirkmodell.hebel.length + " Hebel, " + ep.wirkmodell.hypothesen.length + " Gestaltungshypothesen");
      if (ohneGegen) zeilen.push("⚠ " + ohneGegen + " Hypothese(n) ohne Gegenhypothese");
    } else if (loopKey === "design") {
      var hypMitImpuls = {};
      ep.impulse.forEach(function (i) { if (i.hypotheseId) hypMitImpuls[i.hypotheseId] = true; });
      zeilen.push(ep.impulse.length + " Gestaltungsimpulse");
      zeilen.push(Object.keys(hypMitImpuls).length + " von " + ep.wirkmodell.hypothesen.length + " Hypothesen mit Impuls hinterlegt");
    } else {
      zeilen.push(ep.architektur.gewaehlt.length + " von " + ep.impulse.length + " Impulsen in der Architektur");
      var ohneWeglass = ep.architektur.gewaehlt.filter(function (impId) {
        var t = ep.architektur.weglassen[impId];
        return !t || !t.trim();
      }).length;
      if (ohneWeglass) zeilen.push("⚠ " + ohneWeglass + " Impuls(e) ohne Weglass-Prüfung");
    }
    return '<ul class="gate-bilanz">' + zeilen.map(function (z) { return "<li>" + escapeHtml(z) + "</li>"; }).join("") + "</ul>";
  }

  function openGate(id, nr, loopKey) {
    var v = AVERA_STORE.get(id);
    var ep = v ? AVERA_STORE.getEpisode(v, nr) : null;
    if (!v || !ep) return;
    var prozess = AVERA_DATA.PROZESS[loopKey];
    var gate = ep.gates[loopKey];
    var gateNr = LOOP_ORDER.indexOf(loopKey) + 1;
    var pruefFrage = AVERA_DATA.LOOP_GENERAL_FRAGEN[loopKey].gate;
    var nextLoop = LOOP_ORDER[gateNr];

    var html =
      '<div class="gate-overlay-head">' +
      '<span class="gate-badge">Gate ' + gateNr + "</span>" +
      '<button type="button" class="overlay-close" data-overlay-close aria-label="Schließen">✕</button>' +
      "</div>" +
      "<h2 class='gate-frage'>" + escapeHtml(prozess.gateFrage) + "</h2>" +
      "<p class='gate-pruef'>" + escapeHtml(pruefFrage) + "</p>" +
      gateBilanzHtml(ep, loopKey) +
      '<label class="gate-label" for="gate-begruendung">Begründung – warum ja, warum jetzt?</label>' +
      '<textarea id="gate-begruendung" rows="3" placeholder="Ohne Begründung bleibt das Tor zu.">' + escapeHtml(gate.begruendung || "") + "</textarea>" +
      (gate.offen && gate.entschiedenAm
        ? "<p class='gate-stamp'>Geöffnet am " + new Date(gate.entschiedenAm).toLocaleDateString("de-AT") + "</p>"
        : "") +
      '<div class="gate-actions">' +
      '<button type="button" class="btn btn-ghost" id="gate-zurueck">← ' + escapeHtml(prozess.zurueckLabel) + "</button>" +
      '<button type="button" class="btn btn-primary" id="gate-oeffnen" disabled>' +
      (nextLoop ? "Tor öffnen → " + escapeHtml(AVERA_DATA.getLoop(nextLoop).label) : "Tor öffnen → In die Welt bringen") +
      "</button>" +
      "</div>";

    showOverlay("gate-overlay", html, function () {
      var ta = document.getElementById("gate-begruendung");
      var btn = document.getElementById("gate-oeffnen");
      function sync() {
        btn.disabled = !ta.value.trim();
      }
      ta.addEventListener("input", sync);
      sync();
      ta.focus();

      btn.addEventListener("click", function () {
        AVERA_STORE.setGate(id, nr, loopKey, true, ta.value.trim());
        closeOverlay();
        navigate(nextLoop ? loopUrl(id, nr, nextLoop) : "#/v/" + id + "/ep/" + nr + "/welt");
      });

      document.getElementById("gate-zurueck").addEventListener("click", function () {
        // Begründung als Notiz behalten, Tor aber ausdrücklich zulassen.
        AVERA_STORE.setGate(id, nr, loopKey, false, ta.value.trim());
        closeOverlay();
        navigate(loopUrl(id, nr, prozess.zurueckZu));
      });
    });
  }

  // ---------- KI-Panel je Schleife ----------

  function kiPanelHtml(loopKey) {
    var fn = AVERA_DATA.KI_FUNKTIONEN[loopKey];
    var prozess = AVERA_DATA.PROZESS[loopKey];
    return (
      '<section class="panel ki-panel">' +
      '<div class="ki-panel-head"><span class="ki-badge">KI-Funktion</span><strong>' + escapeHtml(fn.titel) + "</strong></div>" +
      "<p class='ki-desc'>" + escapeHtml(fn.beschreibung) + "</p>" +
      '<dl class="ki-meta">' +
      "<div><dt>Kontext</dt><dd>" + escapeHtml(fn.kontext) + "</dd></div>" +
      "<div><dt>Modell</dt><dd>" + escapeHtml(fn.modell) + "</dd></div>" +
      "<div><dt>Tut nicht</dt><dd>" + escapeHtml(prozess.kiNicht) + "</dd></div>" +
      "</dl>" +
      '<button type="button" class="btn btn-secondary btn-small" id="ki-prompt-btn">Prompt für diese Funktion ansehen</button>' +
      "</section>"
    );
  }

  function wireKiPanel(loopKey, v, ep) {
    var btn = document.getElementById("ki-prompt-btn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var req = AVERA_AI.buildRequest(loopKey, v, ep);
      var groesse = AVERA_AI.groesse(req);
      var text = AVERA_AI.toText(req);
      var html =
        '<div class="gate-overlay-head">' +
        '<span class="ki-badge">' + escapeHtml(req.titel) + "</span>" +
        '<button type="button" class="overlay-close" data-overlay-close aria-label="Schließen">✕</button>' +
        "</div>" +
        "<p class='ki-desc'>" + escapeHtml(req.beschreibung) + "</p>" +
        '<dl class="ki-meta">' +
        "<div><dt>Kontext</dt><dd>" + escapeHtml(req.kontextLabel) + "</dd></div>" +
        "<div><dt>Modell</dt><dd>" + escapeHtml(req.modell) + "</dd></div>" +
        "<div><dt>Umfang</dt><dd>~" + groesse.tokenSchaetzung + " Tokens</dd></div>" +
        "</dl>" +
        (AVERA_AI.verfuegbar()
          ? ""
          : "<p class='hint-text'>Für diese App ist kein Modellzugang hinterlegt – die Frage BYOK oder eigener API-Key ist im Konzept noch offen. Bis dahin: Prompt kopieren, im Modell eurer Wahl ausführen und die Vorschläge hier eintragen. Entschieden wird ohnehin am Gate.</p>") +
        '<pre class="ki-prompt" id="ki-prompt-text"></pre>' +
        '<div class="gate-actions">' +
        '<button type="button" class="btn btn-ghost" data-overlay-close>Schließen</button>' +
        '<button type="button" class="btn btn-primary" id="ki-copy-btn">Prompt kopieren</button>' +
        "</div>";
      showOverlay("ki-overlay", html, function () {
        document.getElementById("ki-prompt-text").textContent = text;
        document.getElementById("ki-copy-btn").addEventListener("click", function (evt) {
          var b = evt.currentTarget;
          function done() {
            b.textContent = "Kopiert ✓";
            setTimeout(function () { b.textContent = "Prompt kopieren"; }, 1800);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, done);
          } else {
            var pre = document.getElementById("ki-prompt-text");
            var range = document.createRange();
            range.selectNodeContents(pre);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            done();
          }
        });
      });
    });
  }

  // ---------- Dashboard ----------

  function wpHeadHtml(sec) {
    return (
      '<span class="section-pill ' + (sec.pill || "blue") + '">' + escapeHtml(sec.label) + "</span>" +
      '<h2 class="wp-headline">' + escapeHtml(sec.headline) + "</h2>" +
      '<p class="wp-sub">' + escapeHtml(sec.sub) + "</p>" +
      '<p class="wp-text">' + escapeHtml(sec.text) + "</p>"
    );
  }

  function kernsatzHtml(sec, icon) {
    if (!sec.kernsatz) return "";
    return (
      '<div class="kernsatz-box">' +
      '<span class="kernsatz-icon">' + icon + "</span>" +
      "<div><strong>" + escapeHtml(sec.kernsatz) + "</strong>" +
      "<p>" + escapeHtml(sec.kernsatzText) + "</p></div>" +
      "</div>"
    );
  }

  function renderFirstVisitDashboard() {
    var F = AVERA_DATA.FRAMEWORK;
    var html =
      '<div class="view view-dashboard">' +
      "<h1>Willkommen bei AVERA</h1>" +
      "<p class='hint-text'>Diese App begleitet euch durch den AVERA-Workflow: Ein Vorhaben läuft in <strong>Episoden</strong>, jede Episode einmal durch vier Schleifen – Beobachten → Verstehen → Entwerfen → Komponieren. Zwischen den Schleifen liegt je ein <strong>Gate</strong>: eine Frage, die ihr beantwortet, bevor es weitergeht.</p>" +
      '<div class="dash-hero">' +
      "<blockquote class='dash-hero-quote'>Legt euer erstes Veränderungsprojekt an und startet mit der Intention – dem Nullpunkt jeder Gestaltung.</blockquote>" +
      '<a class="btn btn-primary" href="#/projekte">Erstes Projekt anlegen →</a>' +
      "</div>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.scheitern) +
      '<div class="stolperstein-grid">' +
      F.scheitern.stolpersteine
        .map(function (st) {
          return '<div class="stolperstein"><span class="icon">' + st.icon + "</span>" + escapeHtml(st.text) + "</div>";
        })
        .join("") +
      "</div>" +
      '<div class="wp-quote"><span class="mark">„</span><p>' + escapeHtml(F.scheitern.zitat) + "“</p></div>" +
      "</section>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.idee) +
      kernsatzHtml(F.idee, "↗") +
      '<a class="btn btn-ghost btn-small" href="#/framework">Das ganze Framework ansehen →</a>' +
      '<div class="rainbow-bar"></div>' +
      "</section>" +
      "</div>";
    renderShell("dashboard", html);
  }

  function renderDashboard() {
    var projects = AVERA_STORE.list();
    if (!projects.length) {
      renderFirstVisitDashboard();
      return;
    }
    var today = new Date();

    var quotedElements = AVERA_DATA.ELEMENTS.filter(function (e) { return e.zitat; });
    var quote = quotedElements[dayOfYear(today) % quotedElements.length].zitat;
    var tip = TIPS[dayOfYear(today) % TIPS.length];

    var avgProgress = Math.round(
      projects.reduce(function (sum, p) { return sum + projectProgressPct(p); }, 0) / projects.length
    );
    var totalEpisodes = projects.reduce(function (sum, p) { return sum + p.episodes.length; }, 0);
    var offeneGates = projects.reduce(function (sum, p) {
      var ep = AVERA_STORE.currentEpisode(p);
      return sum + LOOP_ORDER.filter(function (lk) { return !AVERA_STORE.gateOffen(ep, lk); }).length;
    }, 0);
    var beobachtungen = projects.reduce(function (sum, p) {
      return sum + p.episodes.reduce(function (s, ep) { return s + ep.beobachtungen.length; }, 0);
    }, 0);

    var heroHtml =
      '<div class="dash-hero">' +
      '<blockquote class="dash-hero-quote">„' + escapeHtml(quote.text) + '“<cite>— ' + escapeHtml(quote.autor) + "</cite></blockquote>" +
      '<a class="btn btn-primary" href="#/projekte">Neues Projekt starten →</a>' +
      "</div>";

    var statHtml =
      '<div class="stat-grid">' +
      '<div class="stat-tile"><div class="stat-tile-icon c1">📁</div><div><div class="stat-tile-value">' + projects.length + '</div><div class="stat-tile-label">Aktive Projekte</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c2">📈</div><div><div class="stat-tile-value">' + avgProgress + '%</div><div class="stat-tile-label">Ø Gates in der aktuellen Episode</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c3">🔁</div><div><div class="stat-tile-value">' + totalEpisodes + '</div><div class="stat-tile-label">Episoden insgesamt</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c4">🔎</div><div><div class="stat-tile-value">' + beobachtungen + '</div><div class="stat-tile-label">Beobachtungen erfasst</div></div></div>' +
      "</div>";

    var progressListHtml = projects
      .slice(0, 6)
      .map(function (p) {
        var pct = projectProgressPct(p);
        return (
          '<div class="project-progress-row">' +
          '<div class="project-progress-head"><a href="#/v/' + p.id + '">' + escapeHtml(p.name) + "</a><span>" + pct + "%</span></div>" +
          '<div class="project-progress-track"><div class="project-progress-fill" style="width:' + pct + '%"></div></div>' +
          "</div>"
        );
      })
      .join("");

    var activityHtml = projects
      .slice(0, 5)
      .map(function (p) {
        return (
          '<div class="activity-item">' +
          "<strong>" + escapeHtml(p.name) + "</strong>" +
          "<span>" + escapeHtml(episodeStatusLabel(p)) + " · " + new Date(p.updatedAt).toLocaleDateString("de-AT") + "</span>" +
          "</div>"
        );
      })
      .join("");

    var html =
      '<div class="view view-dashboard">' +
      "<h1>Willkommen zurück</h1>" +
      "<p class='hint-text'>" + offeneGates + " Gate(s) warten in den laufenden Episoden auf eine Entscheidung.</p>" +
      heroHtml +
      statHtml +
      '<div class="dash-columns">' +
      '<section class="panel"><h2>Gates der aktuellen Episode</h2>' + progressListHtml + "</section>" +
      "<div>" +
      '<section class="panel" style="margin-bottom:16px;"><h2>Aktuelle Aktivitäten</h2><div class="activity-feed">' + activityHtml + "</div></section>" +
      '<div class="tip-card"><span class="tip-card-label">Change-Tipp des Tages</span><p>' + escapeHtml(tip) + "</p></div>" +
      "</div>" +
      "</div>" +
      "</div>";

    renderShell("dashboard", html);
  }

  // ---------- Projekte ----------

  function renderProjekte() {
    var projects = AVERA_STORE.list();
    var listHtml = projects.length
      ? projects
          .map(function (v) {
            return (
              '<li class="initiative-row" data-search-name="' + escapeHtml(v.name + " " + (v.org || "")) + '">' +
              '<a class="initiative-link" href="#/v/' + encodeURIComponent(v.id) + '">' +
              '<span class="initiative-name">' + escapeHtml(v.name) + "</span>" +
              (v.org ? '<span class="initiative-org">' + escapeHtml(v.org) + "</span>" : "<span></span>") +
              '<span class="initiative-progress-num">' + escapeHtml(episodeStatusLabel(v)) + "</span>" +
              "</a>" +
              '<button class="btn-icon-delete" data-delete-id="' + v.id + '" title="Löschen" aria-label="Projekt löschen">✕</button>' +
              "</li>"
            );
          })
          .join("")
      : '<p class="empty-hint">Noch kein Projekt angelegt. Starte oben ein neues Veränderungsprojekt.</p>';

    var html =
      '<div class="view view-start">' +
      "<h1>Projekte</h1>" +
      "<p class='hint-text'>Jedes Projekt ist ein Veränderungsvorhaben mit einer Intention, das ihr Episode für Episode durch die vier Schleifen führt.</p>" +

      '<section class="panel new-initiative">' +
      "<h2>Neues Projekt starten</h2>" +
      '<form id="new-initiative-form" class="inline-form">' +
      '<input type="text" id="new-initiative-name" placeholder="Titel des Vorhabens (z. B. „Führung neu denken“)" required />' +
      '<input type="text" id="new-initiative-org" placeholder="Unternehmen / Team (optional)" />' +
      '<button type="submit" class="btn btn-primary">Projekt anlegen</button>' +
      "</form>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Laufende Projekte</h2>" +
      '<ul class="initiative-list">' + listHtml + "</ul>" +
      "</section>" +

      '<section class="panel about-panel">' +
      "<h2>Worauf AVERA hinweist</h2>" +
      "<p><strong>Die Geisterfahrt:</strong> Viele Change-Vorhaben scheitern, weil vorschnell von einer Beobachtung zu einer vertrauten Maßnahme gesprungen wird – ohne Verstehen und Entwerfen dazwischen. Die vier Schleifen sind gerichtet, aber rekursiv: Fehlt die Grundlage, führt das Gate zurück.</p>" +
      "<p><strong>Hinreichend statt vollständig:</strong> AVERA strebt keine vollständige Erfassung der Wirklichkeit an, sondern eine für diese Episode tragfähige Grundlage für den nächsten Schritt.</p>" +
      '<p class="source-note">Grundlage: AVERA White Paper 2.0, die Fragen-/4Fakte-Matrix und das App-Konzept „Option 3“, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>' +
      "</section>" +
      "</div>";

    renderShell("projekte", html);

    document.getElementById("new-initiative-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      var name = document.getElementById("new-initiative-name").value.trim();
      var org = document.getElementById("new-initiative-org").value.trim();
      if (!name) return;
      var v = AVERA_STORE.create(name, org);
      navigate("#/v/" + v.id + "/intention");
    });

    root.querySelectorAll("[data-delete-id]").forEach(function (btn) {
      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var id = btn.getAttribute("data-delete-id");
        var v = AVERA_STORE.get(id);
        if (v && confirm('Projekt "' + v.name + '" wirklich löschen?')) {
          AVERA_STORE.remove(id);
          renderProjekte();
        }
      });
    });
  }

  // ---------- Bald verfügbar / Hilfe ----------

  function renderSoon(key) {
    var info = SOON_LABELS[key] || { title: "Bald verfügbar", text: "Dieser Bereich ist noch nicht verfügbar." };
    var html =
      '<div class="view">' +
      '<div class="coming-soon-panel">' +
      "<span class='icon'>🚧</span>" +
      "<h1>" + escapeHtml(info.title) + "</h1>" +
      "<p>" + escapeHtml(info.text) + "</p>" +
      "<p class='hint-text'>Bald verfügbar.</p>" +
      "</div>" +
      "</div>";
    var activeKey = SIDEBAR_ITEMS.some(function (i) { return i.key === key; }) ? key : "dashboard";
    renderShell(activeKey, html);
  }

  function renderHilfe() {
    var rollenHtml = LOOP_ORDER.map(function (lk) {
      var loop = AVERA_DATA.getLoop(lk);
      var p = AVERA_DATA.PROZESS[lk];
      return (
        '<tr><th scope="row">' + escapeHtml(loop.label) + "</th>" +
        "<td>" + escapeHtml(p.mensch) + "</td>" +
        "<td>" + escapeHtml(p.ki) + "</td>" +
        "<td>" + escapeHtml(p.kiNicht) + "</td>" +
        "<td>" + escapeHtml(p.gateFrage) + "</td></tr>"
      );
    }).join("");

    var html =
      '<div class="view">' +
      "<h1>Hilfe</h1>" +
      '<section class="panel">' +
      "<h2>So läuft eine Episode</h2>" +
      "<p>Jedes <strong>Projekt</strong> hat eine Intention und läuft in <strong>Episoden</strong>. Eine Episode ist eine volle Drehung: <strong>Beobachten → Verstehen → Entwerfen → Komponieren</strong>, danach „in die Welt bringen“. Das erneute Beobachten startet die nächste Episode.</p>" +
      "<p>Zwischen den Schleifen liegt je ein <strong>Gate</strong>. Ein Gate ist kein Weiter-Button: Ihr beantwortet eine Reflexionsfrage und begründet sie schriftlich. Erst dann wird die nächste Schleife freigeschaltet. Reicht die Grundlage nicht, führt das Gate ausdrücklich zurück.</p>" +
      "<p>Innerhalb einer Schleife arbeitet ihr <strong>Element für Element</strong>: Sie öffnet beim ersten Gestaltungselement mit dessen Leitfrage und den Denkanstößen der AVERA-Matrix für genau diese Schleife – und darunter erfasst ihr, was dabei herauskommt. Über „Nächstes Element“ klickt ihr euch durch alle sieben; am Ende steht der <strong>Überblick</strong>, der alles auf einmal zeigt.</p>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Wer macht was – Mensch und KI</h2>" +
      "<p class='hint-text'>Die KI ist kein Gesprächsfenster, sondern je Schleife genau eine begrenzte Funktion. Die Entscheidung am Gate trifft immer der Mensch.</p>" +
      '<div class="table-scroll"><table class="rollen-tabelle">' +
      "<thead><tr><th>Schleife</th><th>Mensch</th><th>KI</th><th>KI tut nicht</th><th>Gate-Frage</th></tr></thead>" +
      "<tbody>" + rollenHtml + "</tbody></table></div>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Die beiden Räder</h2>" +
      "<p>Das <strong>Prozessrad</strong> begleitet euch auf jedem Schleifen-Screen: vier Segmente, die Tore dazwischen, die Episoden als Ringe, die Intention im Zentrum.</p>" +
      "<p>Das <strong>Veränderungsrad</strong> mit den sechs Gestaltungselementen ist die inhaltliche Landkarte – ihr findet es auf der Projekt-Übersicht und unter „Das Rad“. Beobachtungen, Hypothesen und Impulse werden nach diesen Elementen getaggt, dadurch färbt es sich mit eurer Arbeit ein.</p>" +
      "</section>" +
      "</div>";
    renderShell("hilfe", html);
  }

  // ---------- Das Veränderungsrad (White-Paper-Inhalte) ----------

  function vennHtml() {
    var circle = function (cx, cy, token) {
      return '<circle cx="' + cx + '" cy="' + cy + '" r="62" fill="var(--el-' + token + ')" opacity="0.32" />';
    };
    return (
      '<svg class="dim-venn" viewBox="0 0 260 220" role="img" aria-label="Wollen, Dürfen und Können überschneiden sich in wirksamer Veränderung">' +
      circle(130, 78, "story") +
      circle(86, 140, "orgkultur") +
      circle(174, 140, "fuehrung") +
      '<circle cx="130" cy="119" r="36" fill="var(--panel-bg)" />' +
      '<text x="130" y="42" text-anchor="middle" class="venn-label" fill="var(--el-story)">Wollen</text>' +
      '<text x="62" y="182" text-anchor="middle" class="venn-label" fill="var(--el-orgkultur)">Dürfen</text>' +
      '<text x="198" y="182" text-anchor="middle" class="venn-label" fill="var(--el-fuehrung)">Können</text>' +
      '<text x="130" y="115" text-anchor="middle" class="venn-center" fill="var(--heading)">Wirksam</text>' +
      '<text x="130" y="130" text-anchor="middle" class="venn-center" fill="var(--heading)">verändern</text>' +
      "</svg>"
    );
  }

  function drehStripHtml(adapter, hrefFor) {
    return (
      '<div class="dreh-strip">' +
      AVERA_DATA.SEQUENCE.map(function (key) {
        var elm = AVERA_DATA.getElement(key);
        var status = adapter && adapter.stations[key] ? adapter.stations[key].status : null;
        var inner =
          '<span class="dreh-num" style="background: var(--el-' + key + ')">' +
          escapeHtml(String(parseInt(elm.num, 10) || elm.num)) +
          "</span>" +
          "<strong>" + escapeHtml(elm.title) + "</strong>" +
          "<span>" + escapeHtml(elm.wirkung || elm.subtitle) + "</span>" +
          (status && status !== "offen"
            ? '<span class="dreh-status ' + status + '">' + (status === "etabliert" ? "✓ bearbeitet" : "in Arbeit") + "</span>"
            : "");
        return hrefFor
          ? '<a class="dreh-item" href="' + hrefFor(key) + '">' + inner + "</a>"
          : '<div class="dreh-item">' + inner + "</div>";
      }).join("") +
      "</div>"
    );
  }

  function renderFramework() {
    var F = AVERA_DATA.FRAMEWORK;

    var html =
      '<div class="view view-framework">' +
      "<h1>Das Admonter Veränderungsrad</h1>" +
      "<p class='hint-text'>Der Orientierungsrahmen hinter dieser App – die Grundlagen aus dem AVERA White Paper 2.0.</p>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.scheitern) +
      '<div class="stolperstein-grid">' +
      F.scheitern.stolpersteine
        .map(function (st) {
          return '<div class="stolperstein"><span class="icon">' + st.icon + "</span>" + escapeHtml(st.text) + "</div>";
        })
        .join("") +
      "</div>" +
      '<div class="wp-quote"><span class="mark">„</span><p>' + escapeHtml(F.scheitern.zitat) + "“</p></div>" +
      "</section>" +

      '<section class="wp-section">' + wpHeadHtml(F.idee) + kernsatzHtml(F.idee, "↗") + "</section>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.rad) +
      '<div id="framework-wheel" class="wheel-container framework-wheel"></div>' +
      kernsatzHtml(F.rad, "🎯") +
      "</section>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.dimensionen) +
      vennHtml() +
      '<div class="dim-grid">' +
      F.dimensionen.items
        .map(function (d) {
          return (
            '<div class="dim-card ' + d.key + '">' +
            '<div class="dim-card-head"><span class="icon">' + d.icon + "</span>" +
            "<div><strong>" + escapeHtml(d.label) + "</strong><span>" + escapeHtml(d.sub) + "</span></div></div>" +
            "<ul>" + d.punkte.map(function (pt) { return "<li>" + escapeHtml(pt) + "</li>"; }).join("") + "</ul>" +
            "</div>"
          );
        })
        .join("") +
      "</div>" +
      "</section>" +

      '<section class="wp-section">' + wpHeadHtml(F.drehrichtung) + drehStripHtml(null, null) + "</section>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.auftrag) +
      kernsatzHtml(F.auftrag, "✹") +
      '<div class="rainbow-bar"></div>' +
      "</section>" +

      "<p class='source-note'>Grundlage: AVERA White Paper 2.0 und die Fragen-/4Fakte-Matrix, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>" +
      "</div>";

    renderShell("framework", html);

    var neutral = { stations: {} };
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      neutral.stations[elm.key] = { status: "showcase" };
    });
    neutral.stations.intention = { status: "showcase" };
    AVERA_WHEEL.render(document.getElementById("framework-wheel"), neutral, function () {
      navigate("#/projekte");
    });
  }

  // ---------- Projekt-Übersicht ----------

  function renderOverview(id) {
    var v = AVERA_STORE.get(id);
    if (!v) {
      navigate("#/projekte");
      return;
    }
    var ep = AVERA_STORE.currentEpisode(v);
    var adapter = buildWheelAdapter(v, ep);

    var gateListHtml = LOOP_ORDER.map(function (lk, i) {
      var loop = AVERA_DATA.getLoop(lk);
      var g = ep.gates[lk];
      var offen = AVERA_STORE.gateOffen(ep, lk);
      var erreichbar = AVERA_STORE.loopErreichbar(ep, lk);
      return (
        '<div class="gate-row' + (offen ? " offen" : "") + (erreichbar ? "" : " gesperrt") + '">' +
        '<span class="gate-row-num">' + (i + 1) + "</span>" +
        "<div><strong>" + escapeHtml(loop.label) + "</strong>" +
        "<span>" + escapeHtml(AVERA_DATA.PROZESS[lk].gateFrage) + "</span>" +
        (offen && g.begruendung ? "<em>„" + escapeHtml(g.begruendung) + "“</em>" : "") +
        "</div>" +
        '<span class="gate-row-state">' + (offen ? "offen ✓" : erreichbar ? "zu" : "gesperrt") + "</span>" +
        "</div>"
      );
    }).join("");

    var ctaHtml;
    if (ep.realized) {
      ctaHtml =
        '<div class="ok-box">✓ Episode ' + ep.nr + " in die Welt gebracht am " + new Date(ep.realized.at).toLocaleDateString("de-AT") + ".</div>" +
        '<button id="next-episode-btn" class="btn btn-primary btn-block">Nächste Episode starten</button>';
    } else {
      var loopKey = AVERA_STORE.ersteOffeneSchleife(ep);
      ctaHtml = loopKey
        ? '<a class="btn btn-primary btn-block" href="' + loopUrl(id, ep.nr, loopKey) + '">Weiter in Episode ' + ep.nr + ": " + escapeHtml(AVERA_DATA.getLoop(loopKey).label) + " →</a>"
        : '<a class="btn btn-primary btn-block" href="#/v/' + id + "/ep/" + ep.nr + '/welt">Bereit: in die Welt bringen →</a>';
    }

    var intentionHint = v.intention.text && v.intention.text.trim()
      ? '<blockquote class="intention-statement">„' + escapeHtml(v.intention.text) + "“</blockquote>" +
        (v.intention.zielgruppe ? "<p class='hint-text'>Zielgruppe: " + escapeHtml(v.intention.zielgruppe) + "</p>" : "")
      : '<p class="hint-text">Die Intention ist noch nicht formuliert – sie ist die Grundlage, an der sich alle Episoden orientieren.</p>';

    var historyHtml = v.episodes
      .map(function (e) {
        var gates = LOOP_ORDER.filter(function (lk) { return AVERA_STORE.gateOffen(e, lk); }).length;
        return (
          '<div class="episode-card' + (e.realized ? " realized" : "") + (e.nr === ep.nr ? " aktuell" : "") + '">' +
          '<div class="episode-card-head"><strong>Episode ' + e.nr + "</strong>" +
          '<span class="episode-card-date">' +
          (e.realized ? "in die Welt gebracht am " + new Date(e.realized.at).toLocaleDateString("de-AT") : gates + "/4 Gates offen") +
          "</span></div>" +
          "<p class='episode-card-stats'>" +
          e.beobachtungen.length + " Beobachtungen · " +
          e.wirkmodell.hypothesen.length + " Hypothesen · " +
          e.impulse.length + " Impulse · " +
          e.architektur.gewaehlt.length + " in der Architektur" +
          "</p>" +
          (e.realized && e.realized.notiz ? "<p>" + escapeHtml(e.realized.notiz) + "</p>" : "") +
          '<a class="btn btn-ghost btn-small" href="' + loopUrl(id, e.nr, "observe") + '">Öffnen</a>' +
          "</div>"
        );
      })
      .join("");

    var html =
      '<div class="view view-rad">' +
      '<a href="#/projekte" class="back-link">← Alle Projekte</a>' +
      '<div class="rad-header">' +
      "<h1>" + escapeHtml(v.name) + "</h1>" +
      (v.org ? "<p class='rad-org'>" + escapeHtml(v.org) + "</p>" : "") +
      "<button id='edit-initiative-btn' class='btn btn-ghost btn-small'>Titel/Unternehmen bearbeiten</button>" +
      "</div>" +

      '<div class="overview-top">' +
      '<section class="panel prozess-panel">' +
      "<h2>Episode " + ep.nr + " – wo stehen wir?</h2>" +
      '<div id="prozessrad-container"></div>' +
      '<div class="gate-list">' + gateListHtml + "</div>" +
      "</section>" +
      '<aside class="rad-sidebar">' +
      '<div class="intention-box">' +
      '<span class="ziel-tag">Intention</span>' +
      intentionHint +
      '<a class="btn btn-ghost btn-small" href="#/v/' + id + '/intention">Intention bearbeiten →</a>' +
      "</div>" +
      ctaHtml +
      '<button id="export-btn" class="btn btn-secondary btn-block">Gestaltungsarchitektur exportieren</button>' +
      "</aside>" +
      "</div>" +

      '<section class="panel">' +
      "<h2>Das Veränderungsrad in dieser Episode</h2>" +
      "<p class='hint-text'>Eingefärbt ist, wie weit ein Gestaltungselement in Episode " + ep.nr + " berührt wurde – aus getaggten Beobachtungen, Hypothesen und Impulsen.</p>" +
      '<div id="wheel-container" class="wheel-container overview-wheel"></div>' +
      drehStripHtml(adapter, function () { return loopUrl(id, ep.nr, "observe"); }) +
      '<div class="rainbow-bar"></div>' +
      "</section>" +

      '<section class="panel"><h2>Episoden</h2><div class="episode-history">' + historyHtml + "</div></section>" +
      "</div>";

    renderShell("projekte", html);

    mountProzessrad(v, ep, AVERA_STORE.ersteOffeneSchleife(ep) || "architect");

    AVERA_WHEEL.render(document.getElementById("wheel-container"), adapter, function (key) {
      if (key === "intention") {
        navigate("#/v/" + id + "/intention");
        return;
      }
      navigate(loopUrl(id, ep.nr, "observe"));
    });

    document.getElementById("export-btn").addEventListener("click", function () {
      navigate("#/v/" + id + "/export");
    });

    document.getElementById("edit-initiative-btn").addEventListener("click", function () {
      var name = prompt("Titel des Vorhabens", v.name);
      if (name === null) return;
      var org = prompt("Unternehmen / Team", v.org || "");
      if (org === null) return;
      AVERA_STORE.rename(v.id, name.trim() || v.name, org.trim());
      renderOverview(id);
    });

    var nextBtn = document.getElementById("next-episode-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var next = AVERA_STORE.startNextEpisode(id);
        navigate(loopUrl(id, next.nr, "observe"));
      });
    }
  }

  // ---------- Intention ----------

  function intentionPhaseHtml(phaseKey, values) {
    var phase = AVERA_DATA.INTENTION_PHASEN[phaseKey];
    var items = phase.fragen
      .map(function (fr, i) {
        return (
          '<div class="reflexion-item">' +
          '<label class="reflexion-label"><strong>' + escapeHtml(fr.kategorie) + ":</strong> " + escapeHtml(fr.frage) + "</label>" +
          '<textarea data-intention-phase="' + phaseKey + '" data-intention-index="' + i + '" rows="2" placeholder="Notiz…">' + escapeHtml(values[i] || "") + "</textarea>" +
          "</div>"
        );
      })
      .join("");
    return '<section class="panel"><h2>' + escapeHtml(phase.leitfrage) + "</h2>" + items + "</section>";
  }

  function renderIntention(id) {
    var v = AVERA_STORE.get(id);
    if (!v) {
      navigate("#/projekte");
      return;
    }
    var ep = AVERA_STORE.currentEpisode(v);

    var reflexionen = v.intention.reflexionen || [];
    var reflexionHtml = reflexionen.length
      ? '<section class="panel"><h2>Reflexionen im Verlauf</h2>' +
        reflexionen
          .map(function (r) {
            return (
              '<div class="reflexion-item">' +
              '<label class="reflexion-label">Episode ' + r.episodeNr + " · " + new Date(r.datum).toLocaleDateString("de-AT") + "</label>" +
              "<p>" + escapeHtml(r.text) + "</p></div>"
            );
          })
          .join("") +
        "</section>"
      : "";

    var historie = v.intention.historie || [];
    var historieHtml = historie.length
      ? "<details class='reference-details'><summary><strong>Frühere Fassungen der Intention</strong> — " + historie.length + "</summary><div class='details-body'>" +
        historie
          .map(function (h) {
            return '<div class="reflexion-item"><label class="reflexion-label">bis ' + new Date(h.geaendertAm).toLocaleDateString("de-AT") + "</label><p>„" + escapeHtml(h.text) + "“</p></div>";
          })
          .join("") +
        "</div></details>"
      : "";

    var html =
      '<div class="view view-station">' +
      '<a href="#/v/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
      "<header class='station-header'>" +
      "<h1>Intention</h1>" +
      "<p class='station-teaser'>Der Nullpunkt jeder Gestaltung – gibt Richtung, nicht den Weg. Sie gilt über alle Episoden hinweg.</p>" +
      "</header>" +

      '<div class="ziel-box">' +
      '<span class="ziel-tag">Die Intention</span>' +
      '<textarea id="intention-text" rows="3" placeholder="Ein Satz: welches Verhalten soll für wen, in welchen Situationen, wozu wahrscheinlicher werden?">' + escapeHtml(v.intention.text || "") + "</textarea>" +
      '<label class="reflexion-label" for="intention-zielgruppe">Zielgruppe</label>' +
      '<input type="text" id="intention-zielgruppe" class="text-input" placeholder="Für wen gilt das? (z. B. Schichtleitungen in der Produktion)" value="' + escapeHtml(v.intention.zielgruppe || "") + '" />' +
      "</div>" +
      historieHtml +

      intentionPhaseHtml("erarbeiten", v.intention.erarbeiten) +
      intentionPhaseHtml("schaerfen", v.intention.schaerfen) +
      reflexionHtml +

      '<div class="station-nav">' +
      '<a class="btn btn-ghost" href="#/v/' + id + '">← Zur Übersicht</a>' +
      '<a class="btn btn-primary btn-next" href="' + loopUrl(id, ep.nr, "observe") + '">Weiter zu Episode ' + ep.nr + ": Beobachten →</a>" +
      "</div>" +
      "</div>";

    renderShell("projekte", html);

    document.getElementById("intention-text").addEventListener("blur", function (evt) {
      AVERA_STORE.setIntentionText(id, evt.target.value);
    });
    document.getElementById("intention-zielgruppe").addEventListener("blur", function (evt) {
      AVERA_STORE.setIntentionZielgruppe(id, evt.target.value);
    });
    root.querySelectorAll("[data-intention-phase]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setIntentionField(id, ta.getAttribute("data-intention-phase"), parseInt(ta.getAttribute("data-intention-index"), 10), ta.value);
      });
    });
  }

  // ---------- Gemeinsame Bausteine der Schleifen-Screens ----------

  function rollenBoxHtml(loopKey) {
    var p = AVERA_DATA.PROZESS[loopKey];
    return (
      '<div class="rollen-box">' +
      '<div class="rollen-spalte mensch"><span class="rollen-kopf">Ihr macht</span><p>' + escapeHtml(p.mensch) + "</p></div>" +
      '<div class="rollen-spalte ki"><span class="rollen-kopf">Die KI schlägt vor</span><p>' + escapeHtml(p.ki) + "</p></div>" +
      "</div>"
    );
  }

  function statusQuoHtml(episode) {
    if (episode.nr === 1 && !episode.statusQuo) {
      return "<p class='hint-text'>Episode 1 startet ohne Vorgeschichte – der Status quo entsteht erst aus euren Beobachtungen.</p>";
    }
    return (
      '<div class="statusquo-box">' +
      '<span class="ziel-tag">Status quo' + (episode.vorgaengerNr ? " (aus Episode " + episode.vorgaengerNr + ")" : "") + "</span>" +
      '<textarea id="statusquo-input" rows="2" placeholder="Wo steht das Vorhaben zu Beginn dieser Episode?">' + escapeHtml(episode.statusQuo || "") + "</textarea>" +
      "</div>"
    );
  }

  function loopNavHtml(id, nr, loopKey, episode) {
    var idx = LOOP_ORDER.indexOf(loopKey);
    var prevLoop = idx > 0 ? LOOP_ORDER[idx - 1] : null;
    var gateNr = idx + 1;
    var offen = AVERA_STORE.gateOffen(episode, loopKey);
    return (
      '<div class="station-nav">' +
      (prevLoop
        ? '<a class="btn btn-ghost" href="' + loopUrl(id, nr, prevLoop) + '">← ' + escapeHtml(AVERA_DATA.getLoop(prevLoop).label) + "</a>"
        : '<a class="btn btn-ghost" href="#/v/' + id + '">← Zur Übersicht</a>') +
      '<button type="button" class="btn btn-primary btn-next" id="gate-open-btn">' +
      (offen ? "Gate " + gateNr + " ansehen ✓" : "Zu Gate " + gateNr + " →") +
      "</button>" +
      "</div>"
    );
  }

  function loopHeaderHtml(id, nr, loopKey, episode) {
    var loop = AVERA_DATA.getLoop(loopKey);
    var idx = LOOP_ORDER.indexOf(loopKey);
    var dots = LOOP_ORDER.map(function (lk, i) {
      var l = AVERA_DATA.getLoop(lk);
      var cls = "loop-dot loop-" + lk;
      if (lk === loopKey) cls += " active";
      if (AVERA_STORE.gateOffen(episode, lk)) cls += " done";
      if (!AVERA_STORE.loopErreichbar(episode, lk)) cls += " locked";
      return (
        '<a class="' + cls + '" href="' + loopUrl(id, nr, lk) + '" title="' + escapeHtml(l.funktion) + '">' +
        '<span class="loop-dot-num">' + (i + 1) + "</span>" +
        '<span class="loop-dot-label">' + escapeHtml(l.label) + "</span></a>"
      );
    }).join("");

    return (
      '<a href="#/v/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
      "<header class='station-header'>" +
      "<div class='station-tags'><span class='station-num'>Episode " + episode.nr + "</span>" +
      "<span class='station-num schleife'>Schleife " + (idx + 1) + " von 4</span></div>" +
      "<h1>" + escapeHtml(loop.label) + "</h1>" +
      "<p class='station-teaser'>" + escapeHtml(loop.funktion) + " → " + escapeHtml(loop.ergebnis) + "</p>" +
      "</header>" +
      '<div class="loop-dots">' + dots + "</div>"
    );
  }

  function gesperrtHtml(id, nr, loopKey) {
    var idx = LOOP_ORDER.indexOf(loopKey);
    var vorher = LOOP_ORDER[idx - 1];
    return (
      '<section class="panel locked-panel">' +
      "<span class='icon'>🚧</span>" +
      "<h2>Diese Schleife ist noch gesperrt</h2>" +
      "<p>Gate " + idx + " nach <strong>" + escapeHtml(AVERA_DATA.getLoop(vorher).label) + "</strong> ist noch zu. Ein Gate öffnet sich nur mit einer schriftlichen Begründung – das ist die Schwelle, die die Geisterfahrt verhindert.</p>" +
      '<a class="btn btn-primary" href="' + loopUrl(id, nr, vorher) + '">Zurück zu ' + escapeHtml(AVERA_DATA.getLoop(vorher).label) + "</a>" +
      "</section>"
    );
  }

  // ---------- Element-für-Element-Durchgang ----------
  //
  // Die Fragen der AVERA-Matrix sind der Einstieg in die Arbeit, nicht ein
  // Nachschlagewerk darunter: Man wählt ein Gestaltungselement, liest die
  // Denkanstöße dieser Schleife dazu und erfasst direkt daneben, was dabei
  // herauskommt – und klickt sich so durch alle Elemente.

  // Was liegt in dieser Schleife bereits zu einem Element vor?
  function elementCount(ep, loopKey, elKey) {
    if (loopKey === "observe") {
      return ep.beobachtungen.filter(function (b) { return b.element === elKey; }).length;
    }
    if (loopKey === "understand") {
      return ep.wirkmodell.hypothesen.filter(function (h) { return h.element === elKey; }).length;
    }
    var hypIds = ep.wirkmodell.hypothesen
      .filter(function (h) { return h.element === elKey; })
      .map(function (h) { return h.id; });
    var impulse = ep.impulse.filter(function (imp) { return imp.hypotheseId && hypIds.indexOf(imp.hypotheseId) !== -1; });
    if (loopKey === "design") return impulse.length;
    return impulse.filter(function (imp) { return ep.architektur.gewaehlt.indexOf(imp.id) !== -1; }).length;
  }

  function elementTabsHtml(ep, loopKey) {
    var tabs = AVERA_DATA.ELEMENTS.map(function (el) {
      var n = elementCount(ep, loopKey, el.key);
      var aktiv = elementTab.key === el.key;
      return (
        '<button type="button" class="el-tab' + (aktiv ? " active" : "") + (n ? " gefuellt" : "") + '"' +
        ' data-el-tab="' + el.key + '" style="--tab-farbe: var(--el-' + el.key + '); --tab-farbe-soft: var(--el-' + el.key + '-soft)">' +
        '<span class="el-tab-num">' + escapeHtml(String(parseInt(el.num, 10) || "★")) + "</span>" +
        '<span class="el-tab-name">' + escapeHtml(el.title) + "</span>" +
        (n ? '<span class="el-tab-count">' + n + "</span>" : "") +
        "</button>"
      );
    }).join("");

    return (
      '<div class="el-tabs">' +
      tabs +
      '<button type="button" class="el-tab ueberblick' + (elementTab.key === "ueberblick" ? " active" : "") + '" data-el-tab="ueberblick">' +
      '<span class="el-tab-num">≡</span><span class="el-tab-name">Überblick</span></button>' +
      "</div>"
    );
  }

  function denkanstoesseHtml(elm, loopKey) {
    var loopInfo = elm.loops[loopKey];
    return (
      '<div class="denkanstoesse">' +
      '<span class="denkanstoesse-kopf">Denkanstöße</span>' +
      "<ul>" + loopInfo.fragen.map(function (f) { return "<li>" + escapeHtml(f) + "</li>"; }).join("") + "</ul>" +
      "</div>"
    );
  }

  function elementKopfHtml(elm, loopKey) {
    var sphere = AVERA_DATA.SPHERES[elm.sphere];
    var loopInfo = elm.loops[loopKey];
    return (
      '<div class="element-kopf" style="--el-farbe: var(--el-' + elm.key + '); --el-farbe-soft: var(--el-' + elm.key + '-soft)">' +
      '<div class="element-kopf-meta">' +
      '<span class="element-kopf-num">' + escapeHtml(String(parseInt(elm.num, 10) || "★")) + "</span>" +
      "<div><strong>" + escapeHtml(elm.title) + "</strong>" +
      "<span>" + escapeHtml(sphere.label) + (elm.wirkung ? " · " + escapeHtml(elm.wirkung) : "") + "</span></div>" +
      "</div>" +
      '<p class="element-leitfrage">' + escapeHtml(loopInfo.leitfrage) + "</p>" +
      "</div>"
    );
  }

  function elementNotizHtml(ep, loopKey, elKey, label) {
    return (
      '<div class="element-notiz">' +
      '<label class="reflexion-label" for="element-notiz-feld">' + escapeHtml(label) + "</label>" +
      '<textarea id="element-notiz-feld" data-element-note="' + elKey + '" rows="2" placeholder="Optional – was sonst noch zu diesem Element gehört.">' +
      escapeHtml(ep.loops[loopKey].elemente[elKey] || "") + "</textarea>" +
      "</div>"
    );
  }

  function elementNavHtml(elKey) {
    var keys = AVERA_DATA.ELEMENTS.map(function (e) { return e.key; });
    var i = keys.indexOf(elKey);
    var prev = i > 0 ? AVERA_DATA.getElement(keys[i - 1]) : null;
    var next = i < keys.length - 1 ? AVERA_DATA.getElement(keys[i + 1]) : null;
    return (
      '<div class="element-nav">' +
      (prev
        ? '<button type="button" class="btn btn-ghost btn-small" data-el-tab="' + prev.key + '">← ' + escapeHtml(prev.title) + "</button>"
        : "<span></span>") +
      '<span class="element-nav-pos">' + (i + 1) + " von " + keys.length + "</span>" +
      (next
        ? '<button type="button" class="btn btn-secondary btn-small" data-el-tab="' + next.key + '">' + escapeHtml(next.title) + " →</button>"
        : '<button type="button" class="btn btn-secondary btn-small" data-el-tab="ueberblick">Zum Überblick →</button>') +
      "</div>"
    );
  }

  function elementPanelHtml(elm, loopKey, innenHtml, ep, notizLabel) {
    return (
      '<section class="panel element-panel">' +
      elementKopfHtml(elm, loopKey) +
      denkanstoesseHtml(elm, loopKey) +
      innenHtml +
      elementNotizHtml(ep, loopKey, elm.key, notizLabel) +
      elementNavHtml(elm.key) +
      "</section>"
    );
  }

  function typWahlHtml() {
    return (
      '<div class="segmented" id="beob-typ-group">' +
      AVERA_DATA.BEOBACHTUNG_TYPEN.map(function (t, i) {
        return '<button type="button" class="seg-btn' + (i === 0 ? " active" : "") + '" data-beob-typ-choice="' + t.key + '" title="' + escapeHtml(t.hinweis) + '">' + escapeHtml(t.label) + "</button>";
      }).join("") +
      "</div>"
    );
  }

  function beobKarteHtml(b, mitTag) {
    return (
      '<article class="beob-karte typ-' + b.typ + '" data-beob-id="' + b.id + '">' +
      '<p class="beob-text">' + escapeHtml(b.text) + "</p>" +
      '<div class="beob-foot">' +
      (mitTag ? elementTagHtml(b.element) : '<span class="befund-typ ' + b.typ + '">' + (b.typ === "fakt" ? "Fakt" : "Vermutung") + "</span>") +
      '<span class="beob-actions">' +
      '<button type="button" class="btn-icon-delete" data-beob-typ="' + b.id + '" title="Als ' + (b.typ === "fakt" ? "Vermutung" : "Fakt") + ' markieren">⇄</button>' +
      '<button type="button" class="btn-icon-delete" data-beob-edit="' + b.id + '" title="Bearbeiten">✎</button>' +
      '<button type="button" class="btn-icon-delete" data-beob-del="' + b.id + '" title="Löschen">✕</button>' +
      "</span></div></article>"
    );
  }

  // ---------- Schleife 1: Beobachten ----------

  function observeUeberblickHtml(ep) {
    var gefiltert = ep.beobachtungen.filter(function (b) {
      return observeFilter === "alle" || b.element === observeFilter || (observeFilter === "ungetaggt" && !b.element);
    });

    var spalten = AVERA_DATA.BEOBACHTUNG_TYPEN.map(function (t) {
      var karten = gefiltert.filter(function (b) { return b.typ === t.key; });
      return (
        '<div class="beob-spalte spalte-' + t.key + '">' +
        '<div class="beob-spalte-kopf"><strong>' + escapeHtml(t.label) + "</strong><span>" + karten.length + "</span>" +
        "<em>" + escapeHtml(t.hinweis) + "</em></div>" +
        (karten.length ? karten.map(function (b) { return beobKarteHtml(b, true); }).join("") : "<p class='hint-text'>Noch keine Karte.</p>") +
        "</div>"
      );
    }).join("");

    var filterChips =
      '<button type="button" class="chip' + (observeFilter === "alle" ? " active" : "") + '" data-obs-filter="alle">Alle (' + ep.beobachtungen.length + ")</button>" +
      AVERA_DATA.ELEMENTS.map(function (el) {
        var n = ep.beobachtungen.filter(function (b) { return b.element === el.key; }).length;
        return '<button type="button" class="chip' + (observeFilter === el.key ? " active" : "") + '" data-obs-filter="' + el.key + '">' + escapeHtml(el.title) + " (" + n + ")</button>";
      }).join("") +
      (function () {
        var n = ep.beobachtungen.filter(function (b) { return !b.element; }).length;
        return n ? '<button type="button" class="chip' + (observeFilter === "ungetaggt" ? " active" : "") + '" data-obs-filter="ungetaggt">ungetaggt (' + n + ")</button>" : "";
      })();

    // Lücken-Hinweis: welche Elemente sind bisher unberührt? Das kann die App
    // selbst ausrechnen – die KI ergänzt nur die Blickwinkel dazu.
    var unberuehrt = AVERA_DATA.ELEMENTS.filter(function (el) {
      return !ep.beobachtungen.some(function (b) { return b.element === el.key; });
    });
    var luecken = unberuehrt.length
      ? '<div class="luecken-box"><strong>Noch unberührt:</strong> ' +
        unberuehrt.map(function (el) {
          return '<button type="button" class="el-tag el-tag-link" data-el-tab="' + el.key + '" style="background: var(--el-' + el.key + '-soft); color: var(--el-' + el.key + ')">' + escapeHtml(el.title) + "</button>";
        }).join(" ") +
        "</div>"
      : '<div class="luecken-box ok"><strong>Alle Gestaltungselemente sind berührt.</strong> Das heißt nicht, dass das Bild vollständig ist – aber kein Blickwinkel fehlt ganz.</div>';

    return (
      '<section class="panel">' +
      "<h2>Alle Beobachtungen</h2>" +
      luecken +
      '<div class="chip-row obs-filter">' + filterChips + "</div>" +
      '<div class="beob-board">' + spalten + "</div>" +
      "</section>" +

      '<section class="panel">' +
      "<h2>Beobachtung ohne Element erfassen</h2>" +
      "<p class='hint-text'>Wenn ihr schon wisst, wohin sie gehört, geht es oben über das Gestaltungselement schneller – dort stehen auch die passenden Fragen.</p>" +
      '<form id="beob-form" class="beob-form">' +
      '<textarea id="beob-text" rows="2" placeholder="Was habt ihr beobachtet?" required></textarea>' +
      '<div class="beob-form-row">' + typWahlHtml() +
      '<select id="beob-element" class="text-input">' + elementOptionsHtml("", "— Gestaltungselement —") + "</select>" +
      '<button type="submit" class="btn btn-primary">Karte hinzufügen</button>' +
      "</div></form>" +
      "</section>"
    );
  }

  function observeElementHtml(ep, elm) {
    var karten = ep.beobachtungen.filter(function (b) { return b.element === elm.key; });
    var inner =
      '<form id="beob-form" class="beob-form element-form">' +
      '<textarea id="beob-text" rows="2" placeholder="Was habt ihr zu ' + escapeHtml(elm.title) + ' beobachtet?" required></textarea>' +
      '<div class="beob-form-row">' + typWahlHtml() +
      '<input type="hidden" id="beob-element" value="' + elm.key + '" />' +
      '<button type="submit" class="btn btn-primary">Beobachtung erfassen</button>' +
      "</div></form>" +
      '<div class="element-liste">' +
      '<div class="element-liste-kopf">Erfasst zu diesem Element<span>' + karten.length + "</span></div>" +
      (karten.length
        ? karten.map(function (b) { return beobKarteHtml(b, false); }).join("")
        : "<p class='hint-text'>Noch nichts erfasst – die Fragen oben sind der Einstieg.</p>") +
      "</div>";
    return elementPanelHtml(elm, "observe", inner, ep, "Zwischenfazit zu " + elm.title);
  }

  function observeBodyHtml(v, ep) {
    var elm = elementTab.key === "ueberblick" ? null : AVERA_DATA.getElement(elementTab.key);
    return (
      statusQuoHtml(ep) +
      rollenBoxHtml("observe") +
      elementTabsHtml(ep, "observe") +
      (elm ? observeElementHtml(ep, elm) : observeUeberblickHtml(ep)) +
      kiPanelHtml("observe")
    );
  }

  function wireObserve(id, nr, ep) {
    var typWahl = "fakt";
    root.querySelectorAll("[data-beob-typ-choice]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        typWahl = btn.getAttribute("data-beob-typ-choice");
        root.querySelectorAll("[data-beob-typ-choice]").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
      });
    });

    var form = document.getElementById("beob-form");
    if (form) {
      form.addEventListener("submit", function (evt) {
        evt.preventDefault();
        var text = document.getElementById("beob-text").value.trim();
        if (!text) return;
        AVERA_STORE.addBeobachtung(id, nr, {
          text: text,
          typ: typWahl,
          element: document.getElementById("beob-element").value
        });
        renderLoop(id, nr, "observe");
      });
    }

    root.querySelectorAll("[data-obs-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        observeFilter = btn.getAttribute("data-obs-filter");
        renderLoop(id, nr, "observe");
      });
    });

    root.querySelectorAll("[data-beob-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        AVERA_STORE.removeBeobachtung(id, nr, btn.getAttribute("data-beob-del"));
        renderLoop(id, nr, "observe");
      });
    });

    root.querySelectorAll("[data-beob-typ]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var beobId = btn.getAttribute("data-beob-typ");
        var b = ep.beobachtungen.find(function (x) { return x.id === beobId; });
        if (!b) return;
        AVERA_STORE.updateBeobachtung(id, nr, beobId, { typ: b.typ === "fakt" ? "vermutung" : "fakt" });
        renderLoop(id, nr, "observe");
      });
    });

    root.querySelectorAll("[data-beob-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var beobId = btn.getAttribute("data-beob-edit");
        var b = ep.beobachtungen.find(function (x) { return x.id === beobId; });
        if (!b) return;
        var html =
          '<div class="gate-overlay-head"><span class="gate-badge">Beobachtung</span>' +
          '<button type="button" class="overlay-close" data-overlay-close aria-label="Schließen">✕</button></div>' +
          '<label class="reflexion-label" for="edit-beob-text">Text</label>' +
          '<textarea id="edit-beob-text" rows="3">' + escapeHtml(b.text) + "</textarea>" +
          '<label class="reflexion-label" for="edit-beob-element">Gestaltungselement</label>' +
          '<select id="edit-beob-element" class="text-input">' + elementOptionsHtml(b.element, "— ungetaggt —") + "</select>" +
          '<div class="gate-actions"><button type="button" class="btn btn-ghost" data-overlay-close>Abbrechen</button>' +
          '<button type="button" class="btn btn-primary" id="edit-beob-save">Speichern</button></div>';
        showOverlay("edit-overlay", html, function () {
          document.getElementById("edit-beob-save").addEventListener("click", function () {
            AVERA_STORE.updateBeobachtung(id, nr, beobId, {
              text: document.getElementById("edit-beob-text").value.trim(),
              element: document.getElementById("edit-beob-element").value
            });
            closeOverlay();
            renderLoop(id, nr, "observe");
          });
        });
      });
    });
  }

  // ---------- Schleife 2: Verstehen ----------

  function hypKarteHtml(h, mitTag) {
    var fehlt = !h.gegenhypothese || !h.gegenhypothese.trim();
    return (
      '<article class="hyp-karte' + (fehlt ? " unvollstaendig" : "") + '">' +
      '<div class="hyp-kopf">' + (mitTag ? elementTagHtml(h.element) : "<span></span>") +
      '<button type="button" class="btn-icon-delete" data-hyp-del="' + h.id + '" title="Löschen">✕</button></div>' +
      '<div class="hyp-paar">' +
      '<div class="hyp-seite these"><span class="hyp-label">Hypothese</span>' +
      '<textarea data-hyp-text="' + h.id + '" rows="2">' + escapeHtml(h.text) + "</textarea></div>" +
      '<div class="hyp-seite gegen"><span class="hyp-label">Gegenhypothese</span>' +
      '<textarea data-hyp-gegen="' + h.id + '" rows="2" placeholder="Was wäre genauso plausibel?">' + escapeHtml(h.gegenhypothese || "") + "</textarea></div>" +
      "</div>" +
      (fehlt ? '<p class="hyp-warnung">Ohne Gegenhypothese ist die Hypothese unvollständig – dann ist es ein Befund, der keiner ist.</p>' : "") +
      "</article>"
    );
  }

  function hypFormHtml(elKey) {
    return (
      '<form id="hyp-form" class="hyp-form">' +
      '<div class="hyp-paar">' +
      '<div class="hyp-seite these"><span class="hyp-label">Neue Hypothese</span>' +
      '<textarea id="hyp-text" rows="2" placeholder="Was könnte erklären, warum sich das Verhalten so zeigt?" required></textarea></div>' +
      '<div class="hyp-seite gegen"><span class="hyp-label">Gegenhypothese (Pflicht)</span>' +
      '<textarea id="hyp-gegen" rows="2" placeholder="Welche andere Erklärung wäre genauso plausibel?" required></textarea></div>' +
      "</div>" +
      '<div class="beob-form-row">' +
      (elKey
        ? '<input type="hidden" id="hyp-element" value="' + elKey + '" />'
        : '<select id="hyp-element" class="text-input">' + elementOptionsHtml("", "— Gestaltungselement —") + "</select>") +
      '<button type="submit" class="btn btn-primary">Hypothese anlegen</button></div>' +
      "</form>"
    );
  }

  function hebelSectionHtml(ep) {
    var hebelHtml = ep.wirkmodell.hebel.length
      ? ep.wirkmodell.hebel.map(function (h) {
          return (
            '<div class="hebel-zeile">' +
            '<textarea data-hebel-id="' + h.id + '" rows="1">' + escapeHtml(h.text) + "</textarea>" +
            '<button type="button" class="btn-icon-delete" data-hebel-del="' + h.id + '" title="Löschen">✕</button>' +
            "</div>"
          );
        }).join("")
      : "<p class='hint-text'>Noch keine Hebel benannt.</p>";

    return (
      '<section class="panel">' +
      "<h2>Hebel</h2>" +
      "<p class='hint-text'>Wo im Wirkgefüge könnte Gestaltung überhaupt ansetzen? Hebel gelten für die ganze Schleife, nicht für ein einzelnes Element.</p>" +
      '<div id="hebel-liste">' + hebelHtml + "</div>" +
      '<form id="hebel-form" class="inline-form small">' +
      '<input type="text" id="hebel-input" class="text-input" placeholder="Neuer Hebel…" />' +
      '<button type="submit" class="btn btn-secondary">Hebel hinzufügen</button></form>' +
      "</section>"
    );
  }

  function understandUeberblickHtml(ep) {
    var befundeHtml = ep.beobachtungen.length
      ? AVERA_DATA.ELEMENTS.map(function (el) {
          var karten = ep.beobachtungen.filter(function (b) { return b.element === el.key; });
          if (!karten.length) return "";
          return (
            '<div class="befund-gruppe">' + elementTagHtml(el.key) +
            "<ul>" + karten.map(function (b) {
              return '<li><span class="befund-typ ' + b.typ + '">' + (b.typ === "fakt" ? "Fakt" : "Vermutung") + "</span> " + escapeHtml(b.text) + "</li>";
            }).join("") + "</ul></div>"
          );
        }).join("") +
        (function () {
          var ohne = ep.beobachtungen.filter(function (b) { return !b.element; });
          return ohne.length
            ? '<div class="befund-gruppe">' + elementTagHtml("") + "<ul>" + ohne.map(function (b) {
                return '<li><span class="befund-typ ' + b.typ + '">' + (b.typ === "fakt" ? "Fakt" : "Vermutung") + "</span> " + escapeHtml(b.text) + "</li>";
              }).join("") + "</ul></div>"
            : "";
        })()
      : "<p class='hint-text'>In der Beobachten-Schleife wurden noch keine Karten erfasst.</p>";

    var hypothesenHtml = ep.wirkmodell.hypothesen.length
      ? ep.wirkmodell.hypothesen.map(function (h) { return hypKarteHtml(h, true); }).join("")
      : "<p class='hint-text'>Noch keine Gestaltungshypothese formuliert.</p>";

    return (
      "<details class='reference-details' open><summary><strong>Befunde aus Beobachten</strong> — " + ep.beobachtungen.length + " Karten</summary>" +
      "<div class='details-body befund-liste'>" + befundeHtml + "</div></details>" +

      '<section class="panel">' +
      "<h2>Alle Gestaltungshypothesen</h2>" +
      "<p class='hint-text'>Jede Hypothese ist eine Lesart, kein Befund. Zu jeder gehört eine Gegenhypothese, die genauso plausibel wäre.</p>" +
      hypothesenHtml +
      hypFormHtml(null) +
      "</section>"
    );
  }

  function understandElementHtml(ep, elm) {
    var befunde = ep.beobachtungen.filter(function (b) { return b.element === elm.key; });
    var hypothesen = ep.wirkmodell.hypothesen.filter(function (h) { return h.element === elm.key; });

    var inner =
      '<div class="element-befunde">' +
      '<span class="denkanstoesse-kopf">Eure Befunde zu diesem Element</span>' +
      (befunde.length
        ? "<ul>" + befunde.map(function (b) {
            return '<li><span class="befund-typ ' + b.typ + '">' + (b.typ === "fakt" ? "Fakt" : "Vermutung") + "</span> " + escapeHtml(b.text) + "</li>";
          }).join("") + "</ul>"
        : "<p class='hint-text'>Zu diesem Element wurde in der Beobachten-Schleife nichts erfasst. Eine Hypothese ohne Befund ist möglich – sie steht dann aber auf dünnem Eis.</p>") +
      "</div>" +
      '<div class="element-liste">' +
      '<div class="element-liste-kopf">Hypothesen zu diesem Element<span>' + hypothesen.length + "</span></div>" +
      (hypothesen.length
        ? hypothesen.map(function (h) { return hypKarteHtml(h, false); }).join("")
        : "<p class='hint-text'>Noch keine Hypothese zu diesem Element.</p>") +
      "</div>" +
      hypFormHtml(elm.key);

    return elementPanelHtml(elm, "understand", inner, ep, "Zwischenfazit zu " + elm.title);
  }

  function understandBodyHtml(v, ep) {
    var elm = elementTab.key === "ueberblick" ? null : AVERA_DATA.getElement(elementTab.key);
    return (
      rollenBoxHtml("understand") +
      hebelSectionHtml(ep) +
      elementTabsHtml(ep, "understand") +
      (elm ? understandElementHtml(ep, elm) : understandUeberblickHtml(ep)) +
      kiPanelHtml("understand") +

      "<details class='reference-details'><summary><strong>Intention kurz reflektieren</strong> — " + escapeHtml(AVERA_DATA.INTENTION_PHASEN.reflektieren.leitfrage) + "</summary>" +
      "<div class='details-body'>" +
      "<ul class='fragen-liste'>" + AVERA_DATA.INTENTION_PHASEN.reflektieren.fragen.map(function (f) { return "<li>" + escapeHtml(f.frage) + "</li>"; }).join("") + "</ul>" +
      '<textarea id="intention-reflexion-input" rows="3" placeholder="Was bedeutet das für unsere Intention?"></textarea>' +
      '<button type="button" id="save-intention-reflexion-btn" class="btn btn-secondary btn-small">Reflexion speichern</button>' +
      "</div></details>"
    );
  }

  function wireUnderstand(id, nr) {
    var hebelForm = document.getElementById("hebel-form");
    if (hebelForm) {
      hebelForm.addEventListener("submit", function (evt) {
        evt.preventDefault();
        var input = document.getElementById("hebel-input");
        if (!input.value.trim()) return;
        AVERA_STORE.addHebel(id, nr, input.value.trim());
        renderLoop(id, nr, "understand");
      });
    }
    root.querySelectorAll("[data-hebel-id]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.updateHebel(id, nr, ta.getAttribute("data-hebel-id"), ta.value);
      });
    });
    root.querySelectorAll("[data-hebel-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        AVERA_STORE.removeHebel(id, nr, btn.getAttribute("data-hebel-del"));
        renderLoop(id, nr, "understand");
      });
    });

    var hypForm = document.getElementById("hyp-form");
    if (hypForm) {
      hypForm.addEventListener("submit", function (evt) {
        evt.preventDefault();
        var text = document.getElementById("hyp-text").value.trim();
        var gegen = document.getElementById("hyp-gegen").value.trim();
        if (!text || !gegen) return;
        AVERA_STORE.addHypothese(id, nr, { text: text, gegenhypothese: gegen, element: document.getElementById("hyp-element").value });
        renderLoop(id, nr, "understand");
      });
    }
    root.querySelectorAll("[data-hyp-text]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.updateHypothese(id, nr, ta.getAttribute("data-hyp-text"), { text: ta.value });
      });
    });
    root.querySelectorAll("[data-hyp-gegen]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.updateHypothese(id, nr, ta.getAttribute("data-hyp-gegen"), { gegenhypothese: ta.value });
      });
    });
    root.querySelectorAll("[data-hyp-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        AVERA_STORE.removeHypothese(id, nr, btn.getAttribute("data-hyp-del"));
        renderLoop(id, nr, "understand");
      });
    });

    var refBtn = document.getElementById("save-intention-reflexion-btn");
    if (refBtn) {
      refBtn.addEventListener("click", function () {
        var ta = document.getElementById("intention-reflexion-input");
        if (!ta.value.trim()) return;
        AVERA_STORE.addIntentionReflexion(id, nr, ta.value.trim());
        ta.value = "";
        alert("Reflexion gespeichert. Ihr findet sie auf der Intention-Seite wieder.");
      });
    }
  }

  // ---------- Schleife 3: Entwerfen ----------

  function fakteRasterHtml() {
    var wsOpts = AVERA_DATA.WIRKSTUFEN.map(function (w) {
      return '<option value="' + w.key + '"' + (w.key === designWirkstufe ? " selected" : "") + ">" + escapeHtml(w.label) + " — " + escapeHtml(w.subtitle) + "</option>";
    }).join("");

    var spalten = AVERA_DATA.FAKTE_TYPEN.map(function (t) {
      var gruppen = AVERA_DATA.FAKTE[t.key][designWirkstufe];
      var inhalt = gruppen.map(function (g) {
        var chips = g.beispiele.map(function (beispiel) {
          var aktiv = designDraft.objekte.some(function (o) {
            return o.typ === t.key && o.wirkstufe === designWirkstufe && o.kategorie === g.kategorie && o.beispiel === beispiel;
          });
          return (
            '<button type="button" class="chip fakte-chip' + (aktiv ? " active" : "") + '"' +
            ' data-fakte-typ="' + t.key + '" data-fakte-kategorie="' + escapeHtml(g.kategorie) + '" data-fakte-beispiel="' + escapeHtml(beispiel) + '">' +
            escapeHtml(beispiel) + "</button>"
          );
        }).join("");
        return '<div class="raster-gruppe"><div class="objekt-aspekt">' + escapeHtml(g.kategorie) + '</div><div class="chip-row">' + chips + "</div></div>";
      }).join("");
      return (
        '<div class="raster-spalte fakt-' + t.key + '">' +
        '<div class="raster-spalte-kopf"><strong>' + escapeHtml(t.label) + "</strong><span>" + escapeHtml(t.subtitle) + "</span></div>" +
        inhalt + "</div>"
      );
    }).join("");

    return (
      '<div class="fakte-filter-bar">' +
      '<label>Wirkstufe <span class="hint-inline">(auf welcher Stufe der Aneignung setzt der Impuls an?)</span>' +
      '<select id="fakte-wirkstufe-select">' + wsOpts + "</select></label>" +
      "</div>" +
      '<div class="fakte-raster">' + spalten + "</div>"
    );
  }

  function impulsKarteHtml(imp) {
    var proTyp = AVERA_DATA.FAKTE_TYPEN.map(function (t) {
      var objekte = imp.objekte.filter(function (o) { return o.typ === t.key; });
      if (!objekte.length) return "";
      return (
        '<div class="impuls-typ-zeile fakt-' + t.key + '"><span class="impuls-typ-label">' + escapeHtml(t.label) + "</span>" +
        objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("") +
        "</div>"
      );
    }).join("");
    var abdeckung = AVERA_DATA.FAKTE_TYPEN.filter(function (t) {
      return imp.objekte.some(function (o) { return o.typ === t.key; });
    }).length;

    return (
      '<div class="impuls-card">' +
      '<div class="impuls-card-head"><strong>' + escapeHtml(imp.titel) + "</strong>" +
      '<span class="impuls-card-actions">' +
      '<span class="abdeckung" title="Abgedeckte 4Fakte-Ebenen">' + abdeckung + "/4</span>" +
      '<button type="button" class="btn-icon-delete" data-rename-impuls="' + imp.id + '" title="Umbenennen">✎</button>' +
      '<button type="button" class="btn-icon-delete" data-remove-impuls="' + imp.id + '" title="Löschen">✕</button>' +
      "</span></div>" +
      (proTyp || "<p class='hint-text'>Keine Objekte hinterlegt.</p>") +
      "</div>"
    );
  }

  // Das Raster samt Entwurf und Formular – einmal für den Überblick, einmal
  // innerhalb eines Elements, dort auf dessen Hypothesen eingegrenzt.
  function designWerkbankHtml(ep, hypListe) {
    if (!hypListe.length) return "";
    var hypOpts = hypListe.map(function (h) {
      var label = h.text.length > 70 ? h.text.slice(0, 69) + "…" : h.text;
      return '<option value="' + h.id + '"' + (h.id === designDraft.hypotheseId ? " selected" : "") + ">" + escapeHtml(label) + "</option>";
    }).join("");
    var aktuelle = hypListe.find(function (h) { return h.id === designDraft.hypotheseId; });

    var draftHtml = designDraft.objekte.length
      ? '<div class="chip-row">' + designDraft.objekte.map(function (o, i) {
          return '<button type="button" class="chip active" data-draft-remove="' + i + '">' + escapeHtml(o.beispiel) + " ✕</button>";
        }).join("") + "</div>"
      : "<p class='hint-text'>Noch keine Gestaltungsobjekte ausgewählt. Klickt im Raster Beispiele an.</p>";

    return (
      '<div class="design-werkbank">' +
      '<label class="reflexion-label" for="design-hyp-select">Für welche Hypothese entwerft ihr gerade?</label>' +
      '<select id="design-hyp-select" class="text-input">' + hypOpts + "</select>" +
      (aktuelle && aktuelle.gegenhypothese
        ? '<div class="hyp-kontext"><p><strong>Gegenhypothese:</strong> ' + escapeHtml(aktuelle.gegenhypothese) + "</p></div>"
        : "") +
      fakteRasterHtml() +
      "<h3>Ausgewählt für diesen Impuls</h3>" +
      draftHtml +
      '<form id="impuls-form" class="inline-form small">' +
      '<input type="text" id="impuls-titel" class="text-input" placeholder="Titel des Gestaltungsimpulses…" value="' + escapeHtml(designDraft.titel) + '" />' +
      '<button type="submit" class="btn btn-primary">Impuls anlegen</button></form>' +
      "</div>"
    );
  }

  function designUeberblickHtml(v, ep) {
    if (!ep.wirkmodell.hypothesen.length) {
      return (
        '<section class="panel locked-panel">' +
        "<span class='icon'>💭</span><h2>Noch keine Gestaltungshypothese</h2>" +
        "<p>Das 4Fakte-Raster arbeitet je Hypothese. Formuliert in der Verstehen-Schleife mindestens eine Hypothese – sonst entwerft ihr ins Blaue.</p>" +
        '<a class="btn btn-primary" href="' + loopUrl(v.id, ep.nr, "understand") + '">Zurück zu Verstehen</a>' +
        "</section>"
      );
    }

    var impulseHtml = ep.wirkmodell.hypothesen.map(function (h) {
      var impulse = ep.impulse.filter(function (imp) { return imp.hypotheseId === h.id; });
      return (
        '<div class="impuls-gruppe">' +
        '<div class="impuls-gruppe-kopf">' + elementTagHtml(h.element) + "<p>" + escapeHtml(h.text) + "</p></div>" +
        (impulse.length
          ? impulse.map(impulsKarteHtml).join("")
          : "<p class='hint-text'>Für diese Hypothese liegt noch kein Impuls vor.</p>") +
        "</div>"
      );
    }).join("");

    var ohneHyp = ep.impulse.filter(function (imp) { return !imp.hypotheseId; });
    if (ohneHyp.length) {
      impulseHtml +=
        '<div class="impuls-gruppe"><div class="impuls-gruppe-kopf">' + elementTagHtml("") +
        "<p>Ohne Hypothese – aus einer früheren Fassung übernommen</p></div>" +
        ohneHyp.map(impulsKarteHtml).join("") + "</div>";
    }

    return (
      '<section class="panel">' +
      "<h2>4Fakte-Raster</h2>" +
      "<p class='hint-text'>Ein wirksamer Impuls greift auf mehreren Ebenen zugleich an. Wählt eine Hypothese, klickt Beispiele an und bündelt sie zu einem Impuls.</p>" +
      designWerkbankHtml(ep, ep.wirkmodell.hypothesen) +
      "</section>" +

      '<section class="panel">' +
      "<h2>Alle Impulse dieser Episode</h2>" +
      impulseHtml +
      "</section>"
    );
  }

  function designElementHtml(v, ep, elm) {
    var hypListe = ep.wirkmodell.hypothesen.filter(function (h) { return h.element === elm.key; });
    var hypIds = hypListe.map(function (h) { return h.id; });
    var impulse = ep.impulse.filter(function (imp) { return imp.hypotheseId && hypIds.indexOf(imp.hypotheseId) !== -1; });

    var inner;
    if (!hypListe.length) {
      inner =
        "<p class='hint-text'>Zu diesem Element gibt es keine Gestaltungshypothese – hier lässt sich noch nichts entwerfen. " +
        "Entweder ist das Element in dieser Episode bewusst nicht dran, oder in der Verstehen-Schleife fehlt noch eine Lesart dazu.</p>" +
        '<a class="btn btn-ghost btn-small" href="' + loopUrl(v.id, ep.nr, "understand") + '">Zu Verstehen wechseln →</a>';
    } else {
      inner =
        '<div class="element-hypothesen">' +
        '<span class="denkanstoesse-kopf">Eure Hypothesen zu diesem Element</span>' +
        "<ul>" + hypListe.map(function (h) { return "<li>" + escapeHtml(h.text) + "</li>"; }).join("") + "</ul>" +
        "</div>" +
        designWerkbankHtml(ep, hypListe) +
        '<div class="element-liste">' +
        '<div class="element-liste-kopf">Impulse zu diesem Element<span>' + impulse.length + "</span></div>" +
        (impulse.length
          ? impulse.map(impulsKarteHtml).join("")
          : "<p class='hint-text'>Noch kein Impuls zu diesem Element.</p>") +
        "</div>";
    }
    return elementPanelHtml(elm, "design", inner, ep, "Zwischenfazit zu " + elm.title);
  }

  function designBodyHtml(v, ep) {
    var elm = elementTab.key === "ueberblick" ? null : AVERA_DATA.getElement(elementTab.key);
    return (
      rollenBoxHtml("design") +
      elementTabsHtml(ep, "design") +
      (elm ? designElementHtml(v, ep, elm) : designUeberblickHtml(v, ep)) +
      kiPanelHtml("design")
    );
  }

  function wireDesign(id, nr, ep) {
    var wsSelect = document.getElementById("fakte-wirkstufe-select");
    if (wsSelect) {
      wsSelect.addEventListener("change", function (evt) {
        designWirkstufe = evt.target.value;
        renderLoop(id, nr, "design");
      });
    }

    var hypSelect = document.getElementById("design-hyp-select");
    if (hypSelect) {
      hypSelect.addEventListener("change", function (evt) {
        designDraft.hypotheseId = evt.target.value;
        renderLoop(id, nr, "design");
      });
    }

    function merkeTitel() {
      var t = document.getElementById("impuls-titel");
      if (t) designDraft.titel = t.value;
    }

    root.querySelectorAll("[data-fakte-beispiel]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        var eintrag = {
          typ: chip.getAttribute("data-fakte-typ"),
          wirkstufe: designWirkstufe,
          kategorie: chip.getAttribute("data-fakte-kategorie"),
          beispiel: chip.getAttribute("data-fakte-beispiel")
        };
        var idx = designDraft.objekte.findIndex(function (o) {
          return o.typ === eintrag.typ && o.wirkstufe === eintrag.wirkstufe && o.kategorie === eintrag.kategorie && o.beispiel === eintrag.beispiel;
        });
        if (idx === -1) designDraft.objekte.push(eintrag);
        else designDraft.objekte.splice(idx, 1);
        merkeTitel();
        renderLoop(id, nr, "design");
      });
    });

    root.querySelectorAll("[data-draft-remove]").forEach(function (chip) {
      chip.addEventListener("click", function () {
        designDraft.objekte.splice(parseInt(chip.getAttribute("data-draft-remove"), 10), 1);
        merkeTitel();
        renderLoop(id, nr, "design");
      });
    });

    var impulsForm = document.getElementById("impuls-form");
    if (impulsForm) {
      impulsForm.addEventListener("submit", function (evt) {
        evt.preventDefault();
        var titel = document.getElementById("impuls-titel").value.trim();
        if (!titel || !designDraft.objekte.length) {
          alert("Ein Impuls braucht einen Titel und mindestens ein Gestaltungsobjekt.");
          return;
        }
        AVERA_STORE.addImpuls(id, nr, {
          titel: titel,
          hypotheseId: designDraft.hypotheseId,
          objekte: designDraft.objekte.slice()
        });
        resetDesignDraft(id + ":" + nr, designDraft.hypotheseId);
        renderLoop(id, nr, "design");
      });
    }

    root.querySelectorAll("[data-remove-impuls]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        AVERA_STORE.removeImpuls(id, nr, btn.getAttribute("data-remove-impuls"));
        renderLoop(id, nr, "design");
      });
    });

    root.querySelectorAll("[data-rename-impuls]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var impulsId = btn.getAttribute("data-rename-impuls");
        var imp = ep.impulse.find(function (x) { return x.id === impulsId; });
        var titel = prompt("Titel des Gestaltungsimpulses", imp ? imp.titel : "");
        if (titel === null || !titel.trim()) return;
        AVERA_STORE.updateImpuls(id, nr, impulsId, { titel: titel.trim() });
        renderLoop(id, nr, "design");
      });
    });
  }

  // ---------- Schleife 4: Komponieren ----------

  // Lokale Kohärenz-Prüfung: was die App selbst sehen kann, ohne Modell.
  function kohaerenzWarnungen(ep) {
    var warn = [];
    var gewaehlt = ep.architektur.gewaehlt || [];
    var gewaehlteImpulse = ep.impulse.filter(function (i) { return gewaehlt.indexOf(i.id) !== -1; });

    var proHyp = {};
    gewaehlteImpulse.forEach(function (imp) {
      var k = imp.hypotheseId || "_ohne";
      proHyp[k] = (proHyp[k] || 0) + 1;
    });
    Object.keys(proHyp).forEach(function (hypId) {
      if (hypId !== "_ohne" && proHyp[hypId] > 1) {
        var h = ep.wirkmodell.hypothesen.find(function (x) { return x.id === hypId; });
        warn.push({ art: "doppelung", text: proHyp[hypId] + " Impulse zielen auf dieselbe Hypothese" + (h ? ": „" + h.text + "“" : "") + ". Braucht es beide?" });
      }
    });
    if (proHyp._ohne) {
      warn.push({ art: "ungebunden", text: proHyp._ohne + " gewählte(r) Impuls(e) hängen an keiner Hypothese – damit ist nicht begründbar, warum sie wirken sollten." });
    }

    ep.wirkmodell.hypothesen.forEach(function (h) {
      var hat = gewaehlteImpulse.some(function (imp) { return imp.hypotheseId === h.id; });
      if (!hat) warn.push({ art: "luecke", text: "Für die Hypothese „" + h.text + "“ ist kein Impuls in der Architektur. Bewusst weggelassen?" });
    });

    gewaehlteImpulse.forEach(function (imp) {
      var abdeckung = AVERA_DATA.FAKTE_TYPEN.filter(function (t) {
        return imp.objekte.some(function (o) { return o.typ === t.key; });
      }).length;
      if (abdeckung <= 1) {
        warn.push({ art: "flach", text: "„" + imp.titel + "“ greift nur auf einer 4Fakte-Ebene an – erfahrungsgemäß verpufft das schnell." });
      }
    });

    if (gewaehlteImpulse.length > 5) {
      warn.push({ art: "minimalismus", text: gewaehlteImpulse.length + " Impulse sind viel. So wenig wie möglich, so viel wie nötig – was kann weg?" });
    }
    return warn;
  }

  function archZeileHtml(ep, imp, mitHypothese) {
    var checked = (ep.architektur.gewaehlt || []).indexOf(imp.id) !== -1;
    var hyp = ep.wirkmodell.hypothesen.find(function (h) { return h.id === imp.hypotheseId; });
    return (
      '<div class="arch-zeile' + (checked ? " gewaehlt" : "") + '">' +
      '<label class="impuls-select-row">' +
      '<input type="checkbox" data-select-impuls="' + imp.id + '"' + (checked ? " checked" : "") + " />" +
      "<span><strong>" + escapeHtml(imp.titel) + "</strong>" +
      (mitHypothese
        ? hyp
          ? '<span class="arch-hyp">zu: ' + escapeHtml(hyp.text) + "</span>"
          : '<span class="arch-hyp warn">keiner Hypothese zugeordnet</span>'
        : "") +
      '<span class="impuls-objekte">' + imp.objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("") + "</span>" +
      "</span></label>" +
      (checked
        ? '<div class="weglass-box"><label class="reflexion-label">Was passiert, wenn dieser Impuls entfällt?</label>' +
          '<textarea data-weglass="' + imp.id + '" rows="2" placeholder="Ein Satz genügt – aber er muss stehen.">' + escapeHtml(ep.architektur.weglassen[imp.id] || "") + "</textarea></div>"
        : "") +
      "</div>"
    );
  }

  function architectUeberblickHtml(v, ep) {
    if (!ep.impulse.length) {
      return (
        '<section class="panel locked-panel">' +
        "<span class='icon'>🧩</span><h2>Noch keine Impulse zum Komponieren</h2>" +
        "<p>In der Entwerfen-Schleife wurden noch keine Gestaltungsimpulse gebaut.</p>" +
        '<a class="btn btn-primary" href="' + loopUrl(v.id, ep.nr, "design") + '">Zurück zu Entwerfen</a>' +
        "</section>"
      );
    }

    return (
      '<section class="panel">' +
      "<h2>Alle Impulse dieser Episode</h2>" +
      "<p class='hint-text'>So wenig wie möglich, so viel wie nötig: Wählt die Impulse, denen ihr unter den gegenwärtigen Bedingungen die größte Wirkwahrscheinlichkeit zuschreibt – und die sich gegenseitig stützen statt widersprechen.</p>" +
      ep.impulse.map(function (imp) { return archZeileHtml(ep, imp, true); }).join("") +
      "</section>"
    );
  }

  // Der Kohärenz-Check schaut über alle Elemente hinweg – er steht darum
  // immer da, nicht nur im Überblick.
  function kohaerenzSectionHtml(ep) {
    if (!ep.impulse.length) return "";
    var warnungen = kohaerenzWarnungen(ep);
    var warnHtml = (ep.architektur.gewaehlt || []).length
      ? warnungen.length
        ? '<ul class="kohaerenz-liste">' + warnungen.map(function (w) {
            return '<li class="warn-' + w.art + '">' + escapeHtml(w.text) + "</li>";
          }).join("") + "</ul>"
        : '<div class="luecken-box ok"><strong>Keine Auffälligkeiten.</strong> Jede Hypothese ist abgedeckt, keine Doppelung, jeder Impuls greift mehrschichtig an.</div>'
      : "<p class='hint-text'>Wählt Impulse aus, dann prüft die App auf Doppelungen, Lücken und flache Impulse.</p>";

    return (
      '<section class="panel">' +
      "<h2>Kohärenz- und Minimalismus-Check</h2>" +
      warnHtml +
      '<label class="reflexion-label" for="kohaerenz-notiz">Kohärenz-Notiz – warum genau diese Zusammenstellung?</label>' +
      '<textarea id="kohaerenz-notiz" rows="3" placeholder="Wie stützen die gewählten Impulse einander?">' + escapeHtml(ep.architektur.kohaerenzNotiz || "") + "</textarea>" +
      "</section>"
    );
  }

  function architectElementHtml(v, ep, elm) {
    var hypIds = ep.wirkmodell.hypothesen
      .filter(function (h) { return h.element === elm.key; })
      .map(function (h) { return h.id; });
    var impulse = ep.impulse.filter(function (imp) { return imp.hypotheseId && hypIds.indexOf(imp.hypotheseId) !== -1; });

    var inner = impulse.length
      ? '<div class="element-liste">' +
        '<div class="element-liste-kopf">Impulse zu diesem Element<span>' + impulse.length + "</span></div>" +
        impulse.map(function (imp) { return archZeileHtml(ep, imp, false); }).join("") +
        "</div>"
      : "<p class='hint-text'>Zu diesem Element liegt kein Impuls vor. Nicht jedes Element muss in jeder Episode in die Architektur – hinreichend statt vollständig.</p>";

    return elementPanelHtml(elm, "architect", inner, ep, "Zwischenfazit zu " + elm.title);
  }

  function architectBodyHtml(v, ep) {
    var elm = elementTab.key === "ueberblick" ? null : AVERA_DATA.getElement(elementTab.key);
    return (
      rollenBoxHtml("architect") +
      elementTabsHtml(ep, "architect") +
      (elm ? architectElementHtml(v, ep, elm) : architectUeberblickHtml(v, ep)) +
      kohaerenzSectionHtml(ep) +
      kiPanelHtml("architect")
    );
  }

  function wireArchitect(id, nr) {
    root.querySelectorAll("[data-select-impuls]").forEach(function (box) {
      box.addEventListener("change", function () {
        var v = AVERA_STORE.get(id);
        var ep = AVERA_STORE.getEpisode(v, nr);
        var current = (ep.architektur.gewaehlt || []).slice();
        var impId = box.getAttribute("data-select-impuls");
        var idx = current.indexOf(impId);
        if (box.checked && idx === -1) current.push(impId);
        if (!box.checked && idx !== -1) current.splice(idx, 1);
        AVERA_STORE.setArchitekturAuswahl(id, nr, current);
        renderLoop(id, nr, "architect");
      });
    });

    root.querySelectorAll("[data-weglass]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setWeglassNotiz(id, nr, ta.getAttribute("data-weglass"), ta.value);
      });
    });

    var kn = document.getElementById("kohaerenz-notiz");
    if (kn) {
      kn.addEventListener("blur", function () {
        AVERA_STORE.setKohaerenzNotiz(id, nr, kn.value);
      });
    }
  }

  // ---------- Schleifen-Screen ----------

  function renderLoop(id, nr, loopKey) {
    var v = AVERA_STORE.get(id);
    var ep = v ? AVERA_STORE.getEpisode(v, nr) : null;
    var loop = AVERA_DATA.getLoop(loopKey);
    if (!v || !ep || !loop) {
      navigate("#/v/" + id);
      return;
    }

    var scope = id + ":" + nr;
    if (designDraft.scope !== scope) {
      resetDesignDraft(scope, ep.wirkmodell.hypothesen.length ? ep.wirkmodell.hypothesen[0].id : null);
    }
    var tabScope = scope + ":" + loopKey;
    if (elementTab.scope !== tabScope) elementTab = { scope: tabScope, key: erstesElement() };

    // Im Entwerfen hängt der Entwurf an einer Hypothese. Ist ein Element
    // aufgeschlagen, kommen nur dessen Hypothesen in Frage.
    if (loopKey === "design") {
      var hypListe = ep.wirkmodell.hypothesen.filter(function (h) {
        return elementTab.key === "ueberblick" || h.element === elementTab.key;
      });
      if (hypListe.length && !hypListe.some(function (h) { return h.id === designDraft.hypotheseId; })) {
        designDraft.hypotheseId = hypListe[0].id;
      }
    }

    var erreichbar = AVERA_STORE.loopErreichbar(ep, loopKey);
    var bodyHtml;
    if (!erreichbar) {
      bodyHtml = gesperrtHtml(id, nr, loopKey);
    } else if (loopKey === "observe") {
      bodyHtml = observeBodyHtml(v, ep);
    } else if (loopKey === "understand") {
      bodyHtml = understandBodyHtml(v, ep);
    } else if (loopKey === "design") {
      bodyHtml = designBodyHtml(v, ep);
    } else {
      bodyHtml = architectBodyHtml(v, ep);
    }

    var mainHtml =
      loopHeaderHtml(id, nr, loopKey, ep) +
      bodyHtml +
      (erreichbar ? loopNavHtml(id, nr, loopKey, ep) : "");

    var html =
      '<div class="view view-station">' +
      '<div class="station-layout">' +
      '<div class="station-main">' + mainHtml + "</div>" +
      prozessradAsideHtml(v) +
      "</div></div>";

    renderShell("projekte", html);
    mountProzessrad(v, ep, loopKey);

    if (!erreichbar) return;

    document.getElementById("gate-open-btn").addEventListener("click", function () {
      openGate(id, nr, loopKey);
    });

    var sq = document.getElementById("statusquo-input");
    if (sq) {
      sq.addEventListener("blur", function () {
        AVERA_STORE.setStatusQuo(id, nr, sq.value);
      });
    }

    root.querySelectorAll("[data-element-note]").forEach(function (ta) {
      ta.addEventListener("blur", function () {
        AVERA_STORE.setLoopElementNote(id, nr, loopKey, ta.getAttribute("data-element-note"), ta.value);
      });
    });

    root.querySelectorAll("[data-el-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        elementTab = { scope: tabScope, key: btn.getAttribute("data-el-tab") };
        renderLoop(id, nr, loopKey);
      });
    });

    if (loopKey === "observe") wireObserve(id, nr, ep);
    if (loopKey === "understand") wireUnderstand(id, nr);
    if (loopKey === "design") wireDesign(id, nr, ep);
    if (loopKey === "architect") wireArchitect(id, nr);

    wireKiPanel(loopKey, v, ep);
  }

  // ---------- In die Welt bringen ----------

  function renderWelt(id, nr) {
    var v = AVERA_STORE.get(id);
    var ep = v ? AVERA_STORE.getEpisode(v, nr) : null;
    if (!v || !ep) {
      navigate("#/v/" + id);
      return;
    }

    var gewaehlt = ep.architektur.gewaehlt || [];
    var chosen = ep.impulse.filter(function (imp) { return gewaehlt.indexOf(imp.id) !== -1; });
    var isLatest = v.episodes[v.episodes.length - 1].nr === ep.nr;

    var architekturHtml = chosen.length
      ? chosen.map(function (imp) {
          var hyp = ep.wirkmodell.hypothesen.find(function (h) { return h.id === imp.hypotheseId; });
          return (
            '<div class="impuls-card"><strong>' + escapeHtml(imp.titel) + "</strong>" +
            (hyp ? '<span class="arch-hyp">zu: ' + escapeHtml(hyp.text) + "</span>" : "") +
            "<div class='impuls-objekte'>" + imp.objekte.map(function (o) { return '<span class="impuls-objekt-tag">' + escapeHtml(o.beispiel) + "</span>"; }).join("") + "</div></div>"
          );
        }).join("")
      : "<p class='hint-text'>Für die Architektur wurden keine Impulse ausgewählt.</p>";

    var massnahmen = ep.massnahmen || [];
    var massnahmenHtml = massnahmen.length
      ? massnahmen.map(function (m) {
          return (
            '<label class="massnahme-zeile' + (m.status === "erledigt" ? " erledigt" : "") + '">' +
            '<input type="checkbox" data-mn-toggle="' + m.id + '"' + (m.status === "erledigt" ? " checked" : "") + " />" +
            "<span>" + escapeHtml(m.text) + "</span>" +
            '<button type="button" class="btn-icon-delete" data-mn-del="' + m.id + '" title="Löschen">✕</button>' +
            "</label>"
          );
        }).join("")
      : "<p class='hint-text'>Noch keine Maßnahme erfasst.</p>";

    var bodyHtml;
    if (ep.realized) {
      bodyHtml =
        '<div class="ok-box">✓ In die Welt gebracht am ' + new Date(ep.realized.at).toLocaleDateString("de-AT") + "</div>" +
        (ep.realized.notiz ? "<p>" + escapeHtml(ep.realized.notiz) + "</p>" : "") +
        (isLatest
          ? '<button id="next-episode-btn" class="btn btn-primary btn-block">Nächste Episode starten – erneut beobachten</button>' +
            "<p class='hint-text'>Die neue Episode übernimmt diese Notiz als Status quo. Dort setzt das erneute Beobachten an.</p>"
          : "");
    } else {
      bodyHtml =
        '<textarea id="welt-notiz" rows="4" placeholder="Wie kommt die Architektur in der Wirklichkeit an? Welche Bewegung entsteht, was bleibt stabil, was überrascht?"></textarea>' +
        '<button id="welt-btn" class="btn btn-primary btn-block">Episode abschließen</button>';
    }

    var mainHtml =
      '<a href="' + loopUrl(id, nr, "architect") + '" class="back-link">← Zurück zu Komponieren</a>' +
      "<header class='station-header'>" +
      "<div class='station-tags'><span class='station-num'>Episode " + ep.nr + "</span></div>" +
      "<h1>In die Welt bringen</h1>" +
      "<p class='station-teaser'>Die konzeptionelle Arbeit endet hier – jetzt trifft die Gestaltung auf die organisationale Wirklichkeit. KI-Unterstützung ist hier sekundär; es geht um Umsetzung und Nachverfolgung.</p>" +
      "</header>" +

      '<section class="panel"><h2>Gewählte Architektur</h2>' + architekturHtml +
      (ep.architektur.kohaerenzNotiz ? "<p class='hint-text'>" + escapeHtml(ep.architektur.kohaerenzNotiz) + "</p>" : "") +
      "</section>" +

      '<section class="panel">' +
      "<h2>Maßnahmen-Tracking</h2>" +
      "<p class='hint-text'>Was muss konkret passieren, damit die Architektur in der Organisation ankommt?</p>" +
      '<div class="massnahmen-liste">' + massnahmenHtml + "</div>" +
      '<form id="mn-form" class="inline-form small">' +
      '<input type="text" id="mn-input" class="text-input" placeholder="Neue Maßnahme…" />' +
      '<button type="submit" class="btn btn-secondary">Hinzufügen</button></form>' +
      "</section>" +

      '<section class="panel">' + bodyHtml + "</section>";

    var html =
      '<div class="view view-station">' +
      '<div class="station-layout">' +
      '<div class="station-main">' + mainHtml + "</div>" +
      prozessradAsideHtml(v) +
      "</div></div>";

    renderShell("projekte", html);
    mountProzessrad(v, ep, "architect");

    document.getElementById("mn-form").addEventListener("submit", function (evt) {
      evt.preventDefault();
      var input = document.getElementById("mn-input");
      if (!input.value.trim()) return;
      AVERA_STORE.addMassnahme(id, nr, input.value.trim());
      renderWelt(id, nr);
    });
    root.querySelectorAll("[data-mn-toggle]").forEach(function (box) {
      box.addEventListener("change", function () {
        AVERA_STORE.toggleMassnahme(id, nr, box.getAttribute("data-mn-toggle"));
        renderWelt(id, nr);
      });
    });
    root.querySelectorAll("[data-mn-del]").forEach(function (btn) {
      btn.addEventListener("click", function (evt) {
        evt.preventDefault();
        AVERA_STORE.removeMassnahme(id, nr, btn.getAttribute("data-mn-del"));
        renderWelt(id, nr);
      });
    });

    var weltBtn = document.getElementById("welt-btn");
    if (weltBtn) {
      weltBtn.addEventListener("click", function () {
        AVERA_STORE.realizeEpisode(id, nr, document.getElementById("welt-notiz").value.trim());
        renderWelt(id, nr);
      });
    }
    var nextBtn = document.getElementById("next-episode-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var next = AVERA_STORE.startNextEpisode(id);
        navigate(loopUrl(id, next.nr, "observe"));
      });
    }
  }

  // ---------- Export ----------

  function renderExport(id) {
    var v = AVERA_STORE.get(id);
    if (!v) {
      navigate("#/projekte");
      return;
    }
    var md = AVERA_EXPORT.toMarkdown(v);

    var html =
      '<div class="view view-export">' +
      '<a href="#/v/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
      "<h1>Gestaltungsarchitektur: " + escapeHtml(v.name) + "</h1>" +
      '<div class="export-actions">' +
      '<button id="download-md-btn" class="btn btn-primary">Als Markdown herunterladen</button>' +
      '<button id="print-btn" class="btn btn-secondary">Drucken / als PDF speichern</button>' +
      "</div>" +
      '<pre class="export-doc" id="export-doc"></pre>' +
      "</div>";

    renderShell("projekte", html);

    document.getElementById("export-doc").textContent = md;
    document.getElementById("download-md-btn").addEventListener("click", function () {
      AVERA_EXPORT.downloadMarkdown(v);
    });
    document.getElementById("print-btn").addEventListener("click", function () {
      window.print();
    });
  }

  // ---------- Router ----------

  function route() {
    var r = parseHash();
    // Beim Seitenwechsel oben beginnen – ohne das landet man nach einem Klick
    // weit unten auf einer Seite mitten in der nächsten Ansicht.
    window.scrollTo(0, 0);
    if (r.view === "projekte") renderProjekte();
    else if (r.view === "framework") renderFramework();
    else if (r.view === "soon") renderSoon(r.key);
    else if (r.view === "hilfe") renderHilfe();
    else if (r.view === "overview") renderOverview(r.id);
    else if (r.view === "intention") renderIntention(r.id);
    else if (r.view === "loop") renderLoop(r.id, r.nr, r.loop);
    else if (r.view === "welt") renderWelt(r.id, r.nr);
    else if (r.view === "export") renderExport(r.id);
    else renderDashboard();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    route();
  }
})();

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
    massnahmen: { title: "Maßnahmen", text: "Eine bereichsübergreifende Sicht auf alle Gestaltungsimpulse eurer Projekte – gebündelt statt Projekt für Projekt." },
    people: { title: "People & Kultur", text: "Perspektiven aus HR und Führung auf laufende Veränderungsprojekte." },
    wissen: { title: "Wissen", text: "Eine Wissensbasis rund um AVERA, Change- und Lernformate." },
    analyse: { title: "Analyse", text: "Auswertungen über mehrere Projekte hinweg: Fortschritt, Muster, Wirkung." },
    community: { title: "Community", text: "Austausch mit anderen, die mit AVERA arbeiten." },
    tools: { title: "Tools", text: "Weitere Werkzeuge rund um die Gestaltung von Veränderung." }
  };

  var TIPS = [
    "Beobachten, bevor ihr erklärt – und erklären, bevor ihr gestaltet.",
    "Hinreichend statt vollständig: Eine für diesen Moment tragfähige Grundlage reicht, um den nächsten Schritt zu gehen.",
    "Design öffnet den Gestaltungsraum – Architect reduziert ihn wieder. Beides braucht seine Zeit.",
    "So wenig wie möglich, so viel wie nötig: Nicht jedes Element muss in jeder Episode adressiert werden.",
    "Ein Gestaltungsimpuls wirkt am stärksten im Zusammenspiel von Artefakt, Soziofakt, Mentefakt und Ethofakt – nicht als Einzelmaßnahme.",
    "Die Geisterfahrt: Wer am sichtbaren Ende gestaltet, ohne die Ursache zu verstehen, verpufft schnell wieder.",
    "Die Intention gibt Richtung, nicht den Weg. Sie darf sich schärfen, wenn neue Erkenntnisse ihre Annahmen infrage stellen.",
    "Jede Episode setzt dort an, wo die Organisation tatsächlich angekommen ist – nicht dort, wo der Plan sie vermutet.",
    "Raum & Zeit ist kein weiteres Element, sondern die Voraussetzung, damit alle anderen überhaupt wirksam werden.",
    "Nach der Realisierung beginnt das Lernen nicht erst – das erneute Beobachten ist schon der Start der nächsten Drehung."
  ];

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
    if (!hash) return { view: "dashboard" };
    var parts = hash.split("/");
    if (parts[0] === "projekte") return { view: "projekte" };
    if (parts[0] === "framework") return { view: "framework" };
    if (parts[0] === "hilfe") return { view: "hilfe" };
    if (parts[0] === "soon" && parts[1]) return { view: "soon", key: parts[1] };
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
    return { view: "dashboard" };
  }

  function navigate(hash) {
    location.hash = hash;
  }

  function resetDesignDraft(scopeKey) {
    designDraft = { scopeKey: scopeKey, objekte: [], name: "", notiz: "" };
  }

  // ---------- App-Shell (Sidebar + Topbar) ----------

  // AVERA-Blütenlogo (6 Blütenblätter: Blau, Türkis, Gelb, Koralle, Magenta, Violett) —
  // dieselbe Form wie im Rad-Zentrum (assets/js/wheel.js), hier als HTML-String fürs Sidebar-Icon.
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

  // Jedes Notizfeld soll mit seinem Inhalt wachsen, statt den eigenen Text
  // zu verstecken und intern wegzuscrollen. Läuft einmal je Render über
  // alle Textareas (inkl. der in noch geschlossenen <details>, die beim
  // Öffnen per "toggle" nachträglich korrekt bemessen werden).
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

  // ---------- Ableitungen ----------

  // Wurde ein Element in irgendeiner Episode (auch früheren) schon einmal
  // beschrieben? Zeigt sich als dezenter Punkt, wenn die aktuelle Episode
  // dafür noch offen ist – sonst würde jede neue Episode optisch wirken,
  // als wäre die bisherige Arbeit spurlos verschwunden.
  function elementEverTouched(init, elementKey) {
    return init.episodes.some(function (ep) {
      return LOOP_ORDER.some(function (lk) {
        var text = ep.loops[lk].elemente[elementKey];
        return !!(text && text.trim());
      });
    });
  }

  function buildWheelAdapter(init, episode) {
    var adapter = { stations: {} };
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      adapter.stations[elm.key] = {
        status: AVERA_STORE.deriveElementStatus(episode, elm.key),
        touchedBefore: elementEverTouched(init, elm.key)
      };
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

  function projectProgressPct(init) {
    var ep = AVERA_STORE.currentEpisode(init);
    var gates = LOOP_ORDER.filter(function (lk) { return ep.loops[lk].gate; }).length;
    return Math.round((gates / LOOP_ORDER.length) * 100);
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

  function episodeStatusLabel(init) {
    var ep = AVERA_STORE.currentEpisode(init);
    if (ep.realized) return "Episode " + ep.nr + " abgeschlossen";
    var loopKey = firstUnfinishedLoop(ep);
    if (!loopKey) return "Episode " + ep.nr + " · bereit für Realisierung";
    return "Episode " + ep.nr + " · " + AVERA_DATA.getLoop(loopKey).label;
  }

  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  // ---------- Dashboard ----------

  function renderFirstVisitDashboard() {
    var F = AVERA_DATA.FRAMEWORK;
    var html =
      '<div class="view view-dashboard">' +
      "<h1>Willkommen bei AVERA</h1>" +
      "<p class='hint-text'>Diese App begleitet euch durch den AVERA-Workflow: Veränderung entsteht nicht in einem einmaligen Durchlauf, sondern in <strong>Episoden</strong> – jede Episode ist eine volle Drehung im Rad mit vier Schleifen: Beobachten → Verstehen → Entwerfen → Komponieren, gefolgt von der Realisierung.</p>" +
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

    var activeCount = projects.length;
    var avgProgress = projects.length
      ? Math.round(projects.reduce(function (sum, p) { return sum + projectProgressPct(p); }, 0) / projects.length)
      : 0;
    var totalEpisodes = projects.reduce(function (sum, p) { return sum + p.episodes.length; }, 0);
    var openImpulse = projects.reduce(function (sum, p) {
      var ep = AVERA_STORE.currentEpisode(p);
      var selected = ep.loops.architect.ausgewaehlt || [];
      return sum + ep.loops.design.impulse.filter(function (i) { return selected.indexOf(i.id) === -1; }).length;
    }, 0);

    var heroHtml =
      '<div class="dash-hero">' +
      '<blockquote class="dash-hero-quote">„' + escapeHtml(quote.text) + '“<cite>— ' + escapeHtml(quote.autor) + "</cite></blockquote>" +
      '<a class="btn btn-primary" href="#/projekte">Neues Projekt starten →</a>' +
      "</div>";

    var statHtml =
      '<div class="stat-grid">' +
      '<div class="stat-tile"><div class="stat-tile-icon c1">📁</div><div><div class="stat-tile-value">' + activeCount + '</div><div class="stat-tile-label">Aktive Projekte</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c2">📈</div><div><div class="stat-tile-value">' + avgProgress + '%</div><div class="stat-tile-label">Ø Fortschritt aktuelle Episode</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c3">🔁</div><div><div class="stat-tile-value">' + totalEpisodes + '</div><div class="stat-tile-label">Episoden insgesamt</div></div></div>' +
      '<div class="stat-tile"><div class="stat-tile-icon c4">💡</div><div><div class="stat-tile-value">' + openImpulse + '</div><div class="stat-tile-label">Offene Gestaltungsimpulse</div></div></div>' +
      "</div>";

    var progressListHtml = projects.length
      ? projects
          .slice(0, 6)
          .map(function (p) {
            var pct = projectProgressPct(p);
            return (
              '<div class="project-progress-row">' +
              '<div class="project-progress-head"><a href="#/init/' + p.id + '">' + escapeHtml(p.name) + "</a><span>" + pct + "%</span></div>" +
              '<div class="project-progress-track"><div class="project-progress-fill" style="width:' + pct + '%"></div></div>' +
              "</div>"
            );
          })
          .join("")
      : "<p class='hint-text'>Noch keine Projekte angelegt.</p>";

    var activityHtml = projects.length
      ? projects
          .slice(0, 5)
          .map(function (p) {
            return (
              '<div class="activity-item">' +
              '<strong>' + escapeHtml(p.name) + "</strong>" +
              "<span>" + escapeHtml(episodeStatusLabel(p)) + " · " + new Date(p.updatedAt).toLocaleDateString("de-AT") + "</span>" +
              "</div>"
            );
          })
          .join("")
      : "<p class='hint-text'>Noch keine Aktivität.</p>";

    var html =
      '<div class="view view-dashboard">' +
      "<h1>Willkommen zurück</h1>" +
      "<p class='hint-text'>Ein Überblick über eure laufenden Veränderungsprojekte.</p>" +
      heroHtml +
      statHtml +
      '<div class="dash-columns">' +
      '<section class="panel"><h2>Projektfortschritt</h2>' + progressListHtml + "</section>" +
      '<div>' +
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
          .map(function (init) {
            return (
              '<li class="initiative-row" data-search-name="' + escapeHtml(init.name + " " + (init.org || "")) + '">' +
              '<a class="initiative-link" href="#/init/' + encodeURIComponent(init.id) + '">' +
              '<span class="initiative-name">' + escapeHtml(init.name) + "</span>" +
              (init.org ? '<span class="initiative-org">' + escapeHtml(init.org) + "</span>" : "") +
              '<span class="initiative-progress-num">' + escapeHtml(episodeStatusLabel(init)) + "</span>" +
              "</a>" +
              '<button class="btn-icon-delete" data-delete-id="' + init.id + '" title="Löschen" aria-label="Projekt löschen">✕</button>' +
              "</li>"
            );
          })
          .join("")
      : '<p class="empty-hint">Noch kein Projekt angelegt. Starte oben ein neues Veränderungsprojekt.</p>';

    var html =
      '<div class="view view-start">' +
      "<h1>Projekte</h1>" +
      "<p class='hint-text'>Jedes Projekt ist ein Veränderungsvorhaben, das ihr Episode für Episode entlang des AVERA-Rads gestaltet.</p>" +

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
      '<p><strong>Die Geisterfahrt:</strong> Viele Change-Vorhaben scheitern, weil vorschnell von einer Beobachtung zu einer vertrauten Maßnahme gesprungen wird – ohne Verstehen und Entwerfen dazwischen. Die vier Schleifen sind gerichtet, aber rekursiv: Fehlt die Grundlage, geht es zurück.</p>' +
      '<p><strong>Veränderung oder Lernangebot? Beides – kein Entweder-Oder:</strong> AVERA behandelt Change und Lernen als gemeinsame Gestaltungsaufgabe. Story, Organisation und Führung treibt meist das Business, Entdecken, Peers und Methoden meist Corporate Learning/HR – Raum &amp; Zeit verbindet beide.</p>' +
      '<p><strong>Hinreichend statt vollständig:</strong> AVERA strebt keine vollständige Erfassung der Wirklichkeit an, sondern eine für diese Episode, unter den gegenwärtigen Bedingungen tragfähige Grundlage für den nächsten Schritt.</p>' +
      '<p class="source-note">Grundlage: AVERA White Paper 2.0, Workflow „Episode &amp; Schleife“ und die Fragen-/4Fakte-Matrix, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>' +
      "</section>" +
      "</div>";

    renderShell("projekte", html);

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
        if (init && confirm('Projekt "' + init.name + '" wirklich löschen?')) {
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
    var html =
      '<div class="view">' +
      "<h1>Hilfe</h1>" +
      '<section class="panel">' +
      "<h2>So funktioniert AVERA in dieser App</h2>" +
      "<p>Jedes <strong>Projekt</strong> durchläuft <strong>Episoden</strong> – eine Episode ist eine volle Drehung im Rad: <strong>Beobachten → Verstehen → Entwerfen → Komponieren</strong>, gefolgt von der Realisierung.</p>" +
      "<p>In <strong>Beobachten</strong> und <strong>Verstehen</strong> erfasst ihr den Status quo je Gestaltungselement, ohne schon zu gestalten. In <strong>Entwerfen</strong> baut ihr aus dem 4Fakte-Katalog (Artefakte, Soziofakte, Mentefakte, Ethofakte) Gestaltungsimpulse. In <strong>Komponieren</strong> wählt ihr daraus die minimal hinreichende Architektur.</p>" +
      "<p>Die <strong>Intention</strong> bleibt über alle Episoden hinweg stabil und wird nach jedem Verstehen-Schritt kurz reflektiert.</p>" +
      "<p>Über <strong>Projekte</strong> in der Seitenleiste legt ihr neue Projekte an und seht laufende. Das <strong>Dashboard</strong> gibt einen Überblick über alle Projekte. Unter <strong>Das Rad</strong> stehen die Grundlagen aus dem AVERA White Paper 2.0: warum Veränderung oft scheitert, die sechs Gestaltungselemente, die drei Dimensionen Wollen/Dürfen/Können und die Drehrichtung.</p>" +
      "</section>" +
      "</div>";
    renderShell("hilfe", html);
  }

  // ---------- Das Veränderungsrad (White-Paper-Inhalte) ----------

  // Abschnittskopf im Layout der White-Paper-Seiten: farbiges Pill-Label,
  // große Headline, Unterzeile, Fließtext.
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

  // Venn-Diagramm Wollen / Dürfen / Können, wie auf Seite 5 und 7.
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

  // Die sechs Elemente in ihrer Drehrichtung – optional als Links in eine Episode
  // und eingefärbt nach Bearbeitungsstand.
  function drehStripHtml(adapter, hrefFor) {
    return (
      '<div class="dreh-strip">' +
      AVERA_DATA.SEQUENCE.map(function (key) {
        var elm = AVERA_DATA.getElement(key);
        var status = adapter && adapter.stations[key] ? adapter.stations[key].status : null;
        var num =
          '<span class="dreh-num" style="background: var(--el-' + key + ')">' +
          escapeHtml(String(parseInt(elm.num, 10) || elm.num)) +
          "</span>";
        var inner =
          num +
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

      '<section class="wp-section">' +
      wpHeadHtml(F.idee) +
      kernsatzHtml(F.idee, "↗") +
      "</section>" +

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

      '<section class="wp-section">' +
      wpHeadHtml(F.drehrichtung) +
      drehStripHtml(null, null) +
      "</section>" +

      '<section class="wp-section">' +
      wpHeadHtml(F.auftrag) +
      kernsatzHtml(F.auftrag, "✹") +
      '<div class="rainbow-bar"></div>' +
      "</section>" +

      "<p class='source-note'>Grundlage: AVERA White Paper 2.0 und die Fragen-/4Fakte-Matrix, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0.</p>" +
      "</div>";

    renderShell("framework", html);

    // Das Rad hier rein als Schaubild – ohne Projektbezug, daher durchgehend
    // in den Farben des White Papers statt nach Bearbeitungsstand.
    var neutral = { stations: {} };
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      neutral.stations[elm.key] = { status: "showcase" };
    });
    neutral.stations.intention = { status: "showcase" };
    AVERA_WHEEL.render(document.getElementById("framework-wheel"), neutral, function () {
      navigate("#/projekte");
    });
  }

  // ---------- Initiative-Übersicht ----------

  function renderOverview(id) {
    var init = AVERA_STORE.get(id);
    if (!init) {
      navigate("#/projekte");
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

    var html =
      '<div class="view view-rad">' +
      '<a href="#/projekte" class="back-link">← Alle Projekte</a>' +
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

      '<section class="wp-section">' +
      '<span class="section-pill orange">Die richtige Drehrichtung</span>' +
      '<h2 class="wp-headline">Von innen nach außen. In die Umsetzung.</h2>' +
      "<p class='wp-sub'>Veränderung beginnt mit Sinn – und wirkt im Alltag.</p>" +
      drehStripHtml(adapter, function (key) {
        return "#/init/" + id + "/episode/" + ep.nr + "/observe";
      }) +
      '<div class="rainbow-bar"></div>' +
      "</section>" +

      (historyHtml ? '<section class="panel"><h2>Episoden-Historie</h2><div class="episode-history">' + historyHtml + "</div></section>" : "") +
      "</div>";

    renderShell("projekte", html);

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
      navigate("#/projekte");
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

    var html =
      '<div class="view view-station">' +
      '<a href="#/init/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
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
      '<div class="station-nav">' +
      "<span></span>" +
      '<a class="btn btn-primary btn-next" href="#/init/' + id + '">Weiter zur aktuellen Episode →</a>' +
      "</div>" +
      "</div>";

    renderShell("projekte", html);

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
          "<strong>" + escapeHtml(elm.title) + "</strong>" +
          (elm.wirkung ? "<span class='wirkung-tag'>" + escapeHtml(elm.wirkung) + "</span>" : "") +
          " — " + escapeHtml(loopInfo.leitfrage) + "</summary>" +
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
        return '<option value="' + w.key + '"' + (w.key === designFilter.wirkstufe ? " selected" : "") + ">" + escapeHtml(w.label) + " — " + escapeHtml(w.subtitle) + "</option>";
      })
      .join("");
    return (
      '<div class="fakte-filter-bar">' +
      '<label>Fakt-Typ<select id="fakte-typ-select">' + typOpts + "</select></label>" +
      '<label>Wirkstufe <span class="hint-inline">(auf welcher Stufe der Aneignung setzt der Impuls an?)</span><select id="fakte-wirkstufe-select">' + wsOpts + "</select></label>" +
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
              '<span class="impuls-card-actions">' +
              '<button type="button" class="btn-icon-delete" data-rename-impuls="' + imp.id + '" title="Umbenennen">✎</button>' +
              '<button type="button" class="btn-icon-delete" data-remove-impuls="' + imp.id + '" title="Löschen">✕</button>' +
              "</span></div>" +
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

  // Kompaktes Rad, das auf allen Episoden-Seiten mitläuft, damit der
  // Gesamtüberblick beim Arbeiten in einer Schleife sichtbar bleibt.
  function miniWheelAsideHtml(id) {
    return (
      '<aside class="station-mini-wheel">' +
      '<div class="mini-wheel-head">Gesamtüberblick</div>' +
      '<div id="mini-wheel-container" class="wheel-container wheel-container-mini"></div>' +
      '<a class="btn btn-ghost btn-small" href="#/init/' + id + '">Zur Projekt-Übersicht →</a>' +
      "</aside>"
    );
  }

  function mountMiniWheel(id, init, ep) {
    var container = document.getElementById("mini-wheel-container");
    if (!container) return;
    var adapter = buildWheelAdapter(init, ep);
    AVERA_WHEEL.render(container, adapter, function (key) {
      if (key === "intention") {
        navigate("#/init/" + id + "/intention");
        return;
      }
      navigate("#/init/" + id + "/episode/" + ep.nr + "/observe");
    });
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

    var mainHtml =
      '<a href="#/init/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
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
      "</div>";

    var html =
      '<div class="view view-station">' +
      '<div class="station-layout">' +
      '<div class="station-main">' + mainHtml + "</div>" +
      miniWheelAsideHtml(id) +
      "</div>" +
      "</div>";

    renderShell("projekte", html);
    mountMiniWheel(id, init, ep);
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
      root.querySelectorAll("[data-rename-impuls]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var impulsId = btn.getAttribute("data-rename-impuls");
          var current = ep.loops.design.impulse.find(function (i) { return i.id === impulsId; });
          var name = prompt("Name des Gestaltungsimpulses", current ? current.name : "");
          if (name === null || !name.trim()) return;
          AVERA_STORE.renameImpuls(id, nr, impulsId, name.trim());
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
      var begruendungTa = document.getElementById("architect-begruendung");
      if (begruendungTa) {
        begruendungTa.addEventListener("blur", function (evt) {
          AVERA_STORE.setArchitectBegruendung(id, nr, evt.target.value);
        });
      }
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

    var mainHtml =
      '<a href="#/init/' + id + "/episode/" + nr + '/architect" class="back-link">← Zurück zu Komponieren</a>' +
      "<header class='station-header'>" +
      "<div class='station-tags'><span class='station-num'>Episode " + ep.nr + "</span></div>" +
      "<h1>In die Welt bringen</h1>" +
      "<p class='station-teaser'>Die konzeptionelle Arbeit endet hier – jetzt trifft die Gestaltung auf die organisationale Wirklichkeit.</p>" +
      "</header>" +
      '<section class="panel"><h2>Ausgewählte Architektur</h2>' + architekturHtml + "</section>" +
      '<section class="panel">' + bodyHtml + "</section>";

    var html =
      '<div class="view view-station">' +
      '<div class="station-layout">' +
      '<div class="station-main">' + mainHtml + "</div>" +
      miniWheelAsideHtml(id) +
      "</div>" +
      "</div>";

    renderShell("projekte", html);
    mountMiniWheel(id, init, ep);

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
      navigate("#/projekte");
      return;
    }
    var md = AVERA_EXPORT.toMarkdown(init);

    var html =
      '<div class="view view-export">' +
      '<a href="#/init/' + id + '" class="back-link">← Zurück zum Projekt</a>' +
      "<h1>Gestaltungsarchitektur: " + escapeHtml(init.name) + "</h1>" +
      '<div class="export-actions">' +
      '<button id="download-md-btn" class="btn btn-primary">Als Markdown herunterladen</button>' +
      '<button id="print-btn" class="btn btn-secondary">Drucken / als PDF speichern</button>' +
      "</div>" +
      '<pre class="export-doc" id="export-doc"></pre>' +
      "</div>";

    renderShell("projekte", html);

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
    // Beim Seitenwechsel oben beginnen – ohne das landet man nach einem Klick
    // weit unten auf einer Seite mitten in der nächsten Ansicht.
    window.scrollTo(0, 0);
    if (r.view === "dashboard") renderDashboard();
    else if (r.view === "projekte") renderProjekte();
    else if (r.view === "soon") renderSoon(r.key);
    else if (r.view === "framework") renderFramework();
    else if (r.view === "hilfe") renderHilfe();
    else if (r.view === "overview") renderOverview(r.id);
    else if (r.view === "intention") renderIntention(r.id);
    else if (r.view === "loop") renderLoop(r.id, r.nr, r.loop);
    else if (r.view === "realize") renderRealize(r.id, r.nr);
    else if (r.view === "export") renderExport(r.id);
    else renderDashboard();
  }

  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
  if (document.readyState === "complete" || document.readyState === "interactive") {
    route();
  }
})();

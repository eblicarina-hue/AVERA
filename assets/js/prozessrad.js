/*
 * Das Prozessrad – durchgängiges Navigations- und Statuselement nach
 * "AVERA App – Konzept (Option 3)".
 *
 *   - vier Segmente: Beobachten -> Verstehen -> Entwerfen -> Komponieren,
 *     das aktuelle optisch hervorgehoben, noch gesperrte gedämpft,
 *   - zwischen den Segmenten die Gates als Tor-Symbole, die erst nach
 *     beantworteter Gate-Frage durchlässig werden (Schranke oben/unten),
 *   - die Episoden-Historie als Zeitleiste unter dem Rad; ein Klick auf eine
 *     Episode öffnet sie,
 *   - die Intention als Text im Zentrum.
 *
 * Es liest nur den übergebenen Zustand und meldet Klicks zurück – die
 * Navigation selbst liegt in app.js.
 */
(function (global) {
  "use strict";

  var LOOPS = ["observe", "understand", "design", "architect"];
  var SIZE = 380;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var OUTER_R = 96;
  var INNER_R = 58;
  var GATE_R = OUTER_R + 2;
  // Oben und unten steht die Beschriftung dicht am Ring; links und rechts
  // braucht ein waagrechtes Wort mehr Abstand, sonst läuft es ins Segment.
  var LABEL_R_SENKRECHT = OUTER_R + 20;
  var LABEL_R_WAAGRECHT = OUTER_R + 46;
  var PAD_DEG = 3;

  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function annularSector(cx, cy, innerR, outerR, startAngle, endAngle) {
    var p1 = polar(cx, cy, outerR, startAngle);
    var p2 = polar(cx, cy, outerR, endAngle);
    var p3 = polar(cx, cy, innerR, endAngle);
    var p4 = polar(cx, cy, innerR, startAngle);
    var large = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return [
      "M", p1.x, p1.y,
      "A", outerR, outerR, 0, large, 1, p2.x, p2.y,
      "L", p3.x, p3.y,
      "A", innerR, innerR, 0, large, 0, p4.x, p4.y,
      "Z"
    ].join(" ");
  }

  // Segment i liegt bei i*90°, Beobachten oben, dann im Uhrzeigersinn.
  function segmentAngles(i) {
    var center = i * 90;
    return { center: center, start: center - 45, end: center + 45 };
  }

  function bindActivate(node, handler) {
    if (!handler) return;
    node.addEventListener("click", handler);
    node.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        handler();
      }
    });
  }

  function truncate(text, max) {
    if (!text) return "";
    return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
  }

  function wrap(text, maxChars) {
    var words = String(text).split(" ");
    var lines = [];
    var current = "";
    words.forEach(function (w) {
      var test = current ? current + " " + w : w;
      if (test.length > maxChars && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  // Tor-Symbol: zwei Pfosten mit Schranke. Offen = Schranke hochgeklappt.
  function gateNode(x, y, offen) {
    var g = svgEl("g", { class: "pr-gate " + (offen ? "offen" : "zu"), transform: "translate(" + x + " " + y + ")" });
    g.appendChild(svgEl("circle", { cx: 0, cy: 0, r: 12, class: "pr-gate-bg" }));
    g.appendChild(svgEl("path", { d: "M-6 -6 V 7 M6 -6 V 7", class: "pr-gate-post" }));
    g.appendChild(
      svgEl("path", {
        d: offen ? "M-6 2 L 4 -7" : "M-7 2 H 7",
        class: "pr-gate-bar"
      })
    );
    return g;
  }

  /*
   * state = {
   *   vorhaben, episode, aktiveSchleife,
   *   gateOffen(loopKey) -> bool,
   *   erreichbar(loopKey) -> bool
   * }
   * handlers = { onSchleife(key), onGate(key), onIntention(), onEpisode(nr) }
   */
  function render(container, state, handlers) {
    container.innerHTML = "";
    handlers = handlers || {};
    var vorhaben = state.vorhaben;
    var episode = state.episode;

    var svg = svgEl("svg", {
      viewBox: "0 0 " + SIZE + " " + SIZE,
      class: "prozessrad",
      role: "img",
      "aria-label": "Prozessrad: aktuelle Schleife und Gates"
    });

    // ---- Vier Schleifen-Segmente ----
    LOOPS.forEach(function (key, i) {
      var loop = AVERA_DATA.getLoop(key);
      var ang = segmentAngles(i);
      var erledigt = state.gateOffen(key);
      var erreichbar = state.erreichbar(key);
      var aktiv = key === state.aktiveSchleife;

      var zustand = aktiv ? "aktiv" : erledigt ? "erledigt" : erreichbar ? "offen" : "gesperrt";
      var g = svgEl("g", {
        class: "pr-segment loop-" + key + " zustand-" + zustand,
        tabindex: erreichbar ? "0" : "-1",
        role: "button",
        "aria-current": aktiv ? "step" : "false",
        "aria-disabled": erreichbar ? "false" : "true"
      });
      var titleEl = svgEl("title", {});
      titleEl.textContent =
        loop.label + " – " + loop.funktion + (erreichbar ? "" : " (noch gesperrt: vorheriges Gate ist zu)");
      g.appendChild(titleEl);

      g.appendChild(
        svgEl("path", {
          d: annularSector(CX, CY, INNER_R, OUTER_R, ang.start + PAD_DEG, ang.end - PAD_DEG),
          class: "pr-segment-path"
        })
      );

      // Nummer im Segment, Name außerhalb des Rings: ein waagrechtes Wort
      // ist breiter als das Band, im Segment würde es unter der Nabe
      // verschwinden.
      var numPos = polar(CX, CY, (OUTER_R + INNER_R) / 2, ang.center);
      var num = svgEl("text", { x: numPos.x, y: numPos.y + 6, class: "pr-segment-num", "text-anchor": "middle" });
      num.textContent = i + 1;
      g.appendChild(num);

      var waagrecht = ang.center === 90 || ang.center === 270;
      var labelPos = polar(CX, CY, waagrecht ? LABEL_R_WAAGRECHT : LABEL_R_SENKRECHT, ang.center);
      var label = svgEl("text", {
        x: labelPos.x,
        y: labelPos.y + (ang.center === 180 ? 9 : ang.center === 0 ? -2 : 4),
        class: "pr-segment-label",
        "text-anchor": "middle"
      });
      label.textContent = loop.label;
      g.appendChild(label);

      if (erreichbar) bindActivate(g, handlers.onSchleife ? function () { handlers.onSchleife(key); } : null);
      svg.appendChild(g);
    });

    // ---- Gates zwischen den Segmenten ----
    LOOPS.forEach(function (key, i) {
      var ang = segmentAngles(i);
      var pos = polar(CX, CY, GATE_R, ang.end);
      var offen = state.gateOffen(key);
      var wrapG = svgEl("g", {
        class: "pr-gate-wrap",
        tabindex: "0",
        role: "button",
        "aria-label": "Gate " + (i + 1) + (offen ? ": offen" : ": geschlossen")
      });
      var t = svgEl("title", {});
      t.textContent =
        "Gate " + (i + 1) + " – " + AVERA_DATA.PROZESS[key].gateFrage + (offen ? " (beantwortet)" : " (noch offen)");
      wrapG.appendChild(t);
      wrapG.appendChild(gateNode(pos.x, pos.y, offen));
      bindActivate(wrapG, handlers.onGate ? function () { handlers.onGate(key); } : null);
      svg.appendChild(wrapG);
    });

    // ---- Zentrum: Intention ----
    var mitte = svgEl("g", { class: "pr-mitte", tabindex: "0", role: "button", "aria-label": "Intention bearbeiten" });
    mitte.appendChild(svgEl("circle", { cx: CX, cy: CY, r: INNER_R - 3, class: "pr-mitte-kreis" }));
    var kopf = svgEl("text", { x: CX, y: CY - 26, class: "pr-mitte-kopf", "text-anchor": "middle" });
    kopf.textContent = "INTENTION";
    mitte.appendChild(kopf);

    // Nur ein Anriss – der Kreis ist klein. Der volle Text steht daneben und
    // im Tooltip, ein Klick führt in den Intentions-Editor.
    var intentionText = (vorhaben.intention.text || "").trim();
    var zeilen = intentionText ? wrap(truncate(intentionText, 34), 16).slice(0, 2) : ["noch nicht", "formuliert"];
    var body = svgEl("text", {
      x: CX,
      y: CY - 6,
      class: "pr-mitte-text" + (intentionText ? "" : " leer"),
      "text-anchor": "middle"
    });
    zeilen.forEach(function (line, li) {
      var tspan = svgEl("tspan", { x: CX, dy: li === 0 ? 0 : 11 });
      tspan.textContent = line;
      body.appendChild(tspan);
    });
    mitte.appendChild(body);

    var epLabel = svgEl("text", { x: CX, y: CY + 32, class: "pr-mitte-episode", "text-anchor": "middle" });
    epLabel.textContent = "Episode " + episode.nr;
    mitte.appendChild(epLabel);

    var mitteTitle = svgEl("title", {});
    mitteTitle.textContent = intentionText ? "Intention: " + intentionText : "Intention noch nicht formuliert";
    mitte.appendChild(mitteTitle);

    bindActivate(mitte, handlers.onIntention);
    svg.appendChild(mitte);

    container.appendChild(svg);

    // Episoden als Zeitleiste unter dem Rad (die im Konzept genannte
    // Alternative zu konzentrischen Ringen – bleibt auch bei vielen
    // Episoden lesbar).
    var leiste = document.createElement("div");
    leiste.className = "pr-zeitleiste";
    vorhaben.episodes.forEach(function (ep) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "pr-episode" + (ep.nr === episode.nr ? " aktuell" : "") + (ep.realized ? " fertig" : "");
      btn.textContent = "E" + ep.nr;
      btn.title = "Episode " + ep.nr + (ep.realized ? " – in die Welt gebracht" : " – läuft");
      if (handlers.onEpisode) {
        btn.addEventListener("click", function () { handlers.onEpisode(ep.nr); });
      }
      leiste.appendChild(btn);
    });
    container.appendChild(leiste);
  }

  global.AVERA_PROZESSRAD = { render: render };
})(window);

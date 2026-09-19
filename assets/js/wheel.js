/*
 * Rendert das Admonter Veränderungsrad als SVG – nachgebaut nach der
 * Framework-Grafik des AVERA White Paper 2.0 (Seite 6/8):
 *
 *   - sechs pastellfarbene Ringsegmente mit weichen Ecken, in der Drehrichtung
 *     1 Story (links) -> 2 Organisation -> 3 Führung -> 4 Entdecken -> 5 Peers ->
 *     6 Methoden, also von innen nach außen in die Umsetzung,
 *   - je Segment ein Nummern-Badge am Außenrand, ein Icon und der Elementtitel,
 *   - im Zentrum "Raum & Zeit" mit dem AVERA-Blütenlogo,
 *   - außen der magentafarbene Intentions-Bogen mit Pfeilspitze.
 *
 * Funktional bleibt alles anklickbar; die Sättigung eines Segments zeigt den
 * Bearbeitungsstand des Elements in der laufenden Episode.
 */
(function (global) {
  "use strict";

  var RING_KEYS = ["story", "orgkultur", "fuehrung", "entdecken", "peers", "methoden"];

  var SIZE = 620;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var OUTER_R = 248;
  var INNER_R = 136;
  var HUB_R = 112;
  var MID_R = (OUTER_R + INNER_R) / 2;
  var BAND = OUTER_R - INNER_R - 8;
  var PAD_DEG = 2.6;

  var ICON_R = 19;
  var ANCHOR_RADIUS = MID_R;
  var ICON_DY = -31;
  var LABEL_DY = 19;
  var BADGE_RADIUS = OUTER_R + 2;

  var INTENTION_ARC_R = OUTER_R + 28;
  var INTENTION_TEXT_R = OUTER_R + 44;

  // Farbfamilien: je Gestaltungselement eine eigene Farbe (White-Paper-Palette),
  // moduliert nach Bearbeitungsstand (offen / in Arbeit / etabliert).
  var SHADES = {
    story: shadeTrio("el-story"),
    orgkultur: shadeTrio("el-orgkultur"),
    fuehrung: shadeTrio("el-fuehrung"),
    entdecken: shadeTrio("el-entdecken"),
    peers: shadeTrio("el-peers"),
    methoden: shadeTrio("el-methoden"),
    raumzeit: shadeTrio("el-raumzeit"),
    intention: shadeTrio("el-intention")
  };

  function shadeTrio(tokenBase) {
    return {
      offen: "var(--" + tokenBase + "-soft)",
      in_arbeit: "color-mix(in srgb, var(--" + tokenBase + ") 42%, var(--" + tokenBase + "-soft))",
      etabliert: "color-mix(in srgb, var(--" + tokenBase + ") 72%, var(--" + tokenBase + "-soft))",
      showcase: "color-mix(in srgb, var(--" + tokenBase + ") 26%, var(--" + tokenBase + "-soft))"
    };
  }

  function fillFor(key, status) {
    var shades = SHADES[key] || SHADES.story;
    return shades[status] || shades.offen;
  }

  function solid(key) {
    return "var(--el-" + key + ")";
  }

  // Strichzeichnungen im 24x24-Raster, angelehnt an die Symbole der Grafik.
  var ICONS = {
    story: [["path", { d: "M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-6l-4.2 3.6V15h-0.8a2 2 0 0 1-2-2z" }]],
    orgkultur: [
      ["circle", { cx: 9, cy: 8, r: 2.7 }],
      ["path", { d: "M3.8 18.6a5.2 5.2 0 0 1 10.4 0" }],
      ["circle", { cx: 16.8, cy: 9.4, r: 2.1 }],
      ["path", { d: "M15.6 13.1a4.6 4.6 0 0 1 4.6 4.4" }]
    ],
    fuehrung: [
      ["circle", { cx: 12, cy: 12, r: 8 }],
      ["path", { d: "M15.6 8.4l-2.3 5.4-5.4 2.3 2.3-5.4z" }]
    ],
    entdecken: [
      ["path", { d: "M12 20.5v-7" }],
      ["path", { d: "M12 13.5C12 10.4 9.5 7.9 6.4 7.9c0 3.1 2.5 5.6 5.6 5.6z" }],
      ["path", { d: "M12 13.5c0-3.5 2.8-6.3 6.3-6.3 0 3.5-2.8 6.3-6.3 6.3z" }]
    ],
    peers: [
      ["circle", { cx: 12, cy: 5.4, r: 2.3 }],
      ["circle", { cx: 5.6, cy: 17, r: 2.3 }],
      ["circle", { cx: 18.4, cy: 17, r: 2.3 }],
      ["path", { d: "M10.3 7.3 7.1 14.9M13.7 7.3l3.2 7.6M7.9 17h8.2" }]
    ],
    methoden: [
      ["circle", { cx: 12, cy: 12, r: 3.2 }],
      ["path", { d: "M12 3.2v2.6M12 18.2v2.6M3.2 12h2.6M18.2 12h2.6M5.8 5.8l1.9 1.9M16.3 16.3l1.9 1.9M18.2 5.8l-1.9 1.9M7.7 16.3l-1.9 1.9" }]
    ],
    raumzeit: [
      ["circle", { cx: 12, cy: 12, r: 8 }],
      ["path", { d: "M12 6.8v5.5l3.6 2.1" }]
    ]
  };

  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function annularSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
    var p1 = polar(cx, cy, outerR, startAngle);
    var p2 = polar(cx, cy, outerR, endAngle);
    var p3 = polar(cx, cy, innerR, endAngle);
    var p4 = polar(cx, cy, innerR, startAngle);
    var largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return [
      "M", p1.x, p1.y,
      "A", outerR, outerR, 0, largeArc, 1, p2.x, p2.y,
      "L", p3.x, p3.y,
      "A", innerR, innerR, 0, largeArc, 0, p4.x, p4.y,
      "Z"
    ].join(" ");
  }

  // Ein Ringsegment als dick gestrichener, rund gekappter Bogen – das ergibt die
  // weichen Ecken der Segmente in der Original-Grafik.
  function arcPath(cx, cy, r, startAngle, endAngle) {
    var p1 = polar(cx, cy, r, startAngle);
    var p2 = polar(cx, cy, r, endAngle);
    var delta = endAngle - startAngle;
    var largeArc = Math.abs(delta) > 180 ? 1 : 0;
    var sweep = delta >= 0 ? 1 : 0;
    return ["M", p1.x, p1.y, "A", r, r, 0, largeArc, sweep, p2.x, p2.y].join(" ");
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) el.setAttribute(k, attrs[k]);
    }
    return el;
  }

  function wrapLabel(text, maxCharsPerLine) {
    var words = text.split(" ");
    var lines = [];
    var current = "";
    words.forEach(function (w) {
      var test = current ? current + " " + w : w;
      if (test.length > maxCharsPerLine && current) {
        lines.push(current);
        current = w;
      } else {
        current = test;
      }
    });
    if (current) lines.push(current);
    return lines;
  }

  function multilineText(x, y, lines, cls, lineHeight) {
    var text = svgEl("text", { x: x, y: y - ((lines.length - 1) * lineHeight) / 2, class: cls, "text-anchor": "middle" });
    lines.forEach(function (line, li) {
      var tspan = svgEl("tspan", { x: x, dy: li === 0 ? 0 : lineHeight });
      tspan.textContent = line;
      text.appendChild(tspan);
    });
    return text;
  }

  function buildIconNode(key, cx, cy, size) {
    var shapes = ICONS[key] || [];
    var scale = size / 24;
    var g = svgEl("g", {
      class: "wheel-icon-glyph",
      transform: "translate(" + (cx - size / 2) + " " + (cy - size / 2) + ") scale(" + scale + ")"
    });
    shapes.forEach(function (spec) {
      g.appendChild(svgEl(spec[0], spec[1]));
    });
    return g;
  }

  // AVERA-Blütenlogo (6 Blütenblätter: Blau, Türkis, Gelb, Koralle, Magenta, Violett).
  var LOGO_PETAL_D = "M50,50 C36,45 26,26 41,8 C46,2 54,2 59,8 C74,26 64,45 50,50 Z";
  var LOGO_COLORS = [
    ["#2f6fe0", "#9cc9f7"],
    ["#16b892", "#a7f0dc"],
    ["#f0a72e", "#ffdd8f"],
    ["#f0654f", "#ffb7a3"],
    ["#e0468f", "#f6a9d3"],
    ["#7c4fd1", "#c6aef2"]
  ];
  var idSeq = 0;

  function buildLogoNode(x, y, size) {
    idSeq += 1;
    var uid = "avera-logo-" + idSeq;
    var nested = svgEl("svg", { x: x, y: y, width: size, height: size, viewBox: "0 0 100 100" });
    var defs = svgEl("defs", {});
    LOGO_COLORS.forEach(function (pair, i) {
      var grad = svgEl("linearGradient", { id: uid + "-" + i, x1: "0.5", y1: "1", x2: "0.5", y2: "0" });
      var stop1 = svgEl("stop", { offset: "0%" });
      stop1.setAttribute("stop-color", pair[0]);
      var stop2 = svgEl("stop", { offset: "100%" });
      stop2.setAttribute("stop-color", pair[1]);
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });
    nested.appendChild(defs);
    LOGO_COLORS.forEach(function (pair, i) {
      nested.appendChild(
        svgEl("path", {
          d: LOGO_PETAL_D,
          fill: "url(#" + uid + "-" + i + ")",
          transform: "rotate(" + i * 60 + " 50 50)"
        })
      );
    });
    return nested;
  }

  // Segment i liegt bei 270° - i*60° (0° = oben, im Uhrzeigersinn gezählt):
  // Story links, dann in Drehrichtung über unten nach rechts und oben zurück.
  function segmentAngles(i) {
    var center = 270 - i * 60;
    return { center: center, start: center - 30, end: center + 30 };
  }

  function bindActivate(node, handler) {
    node.addEventListener("click", handler);
    node.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        handler();
      }
    });
  }

  function render(container, initiative, onSelect) {
    container.innerHTML = "";
    idSeq += 1;
    var uid = "avera-wheel-" + idSeq;

    var svg = svgEl("svg", {
      viewBox: "0 0 " + SIZE + " " + SIZE,
      class: "avera-wheel",
      role: "img",
      "aria-label": "Das Admonter Veränderungsrad"
    });

    var intentionState = (initiative.stations && initiative.stations.intention) || { status: "offen" };

    var defs = svgEl("defs", {});
    var marker = svgEl("marker", {
      id: uid + "-arrow",
      viewBox: "0 0 10 10",
      refX: "6",
      refY: "5",
      markerWidth: "5",
      markerHeight: "5",
      orient: "auto"
    });
    var head = svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "wheel-arrowhead" });
    head.setAttribute("fill", solid("intention"));
    marker.appendChild(head);
    defs.appendChild(marker);

    // Unsichtbarer Pfad für den Schriftzug "INTENTION" – läuft von unten nach
    // oben an der linken Außenseite, damit die Buchstaben aufrecht lesbar sind.
    defs.appendChild(
      svgEl("path", {
        id: uid + "-intention-text-path",
        d: arcPath(CX, CY, INTENTION_TEXT_R, 232, 296),
        fill: "none"
      })
    );
    svg.appendChild(defs);

    // ---- Intentions-Bogen außen (Drehrichtung 1 -> 2 -> 3 ...) ----
    var intentG = svgEl("g", { class: "wheel-intention", "data-key": "intention", tabindex: "0", role: "button" });
    var intentArc = svgEl("path", {
      d: arcPath(CX, CY, INTENTION_ARC_R, 300, 142),
      class: "wheel-intention-arc status-" + intentionState.status,
      fill: "none",
      stroke: solid("intention"),
      "marker-end": "url(#" + uid + "-arrow)"
    });
    intentG.appendChild(intentArc);

    var intentText = svgEl("text", { class: "wheel-intention-label" });
    intentText.setAttribute("fill", solid("intention"));
    var textPath = svgEl("textPath", { startOffset: "50%", "text-anchor": "middle" });
    textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#" + uid + "-intention-text-path");
    textPath.setAttribute("href", "#" + uid + "-intention-text-path");
    textPath.textContent = "INTENTION";
    intentText.appendChild(textPath);
    intentG.appendChild(intentText);
    bindActivate(intentG, function () {
      onSelect("intention");
    });
    svg.appendChild(intentG);

    // ---- Ringsegmente ----
    RING_KEYS.forEach(function (key, i) {
      var element = AVERA_DATA.getElement(key);
      var stState = (initiative.stations && initiative.stations[key]) || { status: "offen" };
      var ang = segmentAngles(i);
      var startAngle = ang.start + PAD_DEG;
      var endAngle = ang.end - PAD_DEG;

      var g = svgEl("g", {
        class: "wheel-segment",
        "data-key": key,
        tabindex: "0",
        role: "button",
        "aria-label": element.title
      });
      g.appendChild(svgEl("title", {})).textContent = element.title + " – " + (element.wirkung || "");

      // Unsichtbarer Vollsektor als großzügige Klickfläche
      g.appendChild(
        svgEl("path", {
          d: annularSectorPath(CX, CY, INNER_R, OUTER_R + 16, ang.start + 1, ang.end - 1),
          class: "wheel-segment-hit"
        })
      );

      g.appendChild(
        svgEl("path", {
          d: arcPath(CX, CY, MID_R, startAngle, endAngle),
          class: "wheel-segment-path status-" + stState.status + " el-" + key,
          fill: "none",
          stroke: fillFor(key, stState.status),
          "stroke-width": BAND,
          "stroke-linecap": "round"
        })
      );

      // Icon über dem Titel – bewusst im Bildschirmraster gestapelt und nicht
      // radial versetzt, sonst überlagern sich beide bei den waagrechten
      // Segmenten (Story links, Entdecken rechts).
      var anchor = polar(CX, CY, ANCHOR_RADIUS, ang.center);
      var iconY = anchor.y + ICON_DY;
      g.appendChild(
        svgEl("circle", { cx: anchor.x, cy: iconY, r: ICON_R, class: "wheel-icon-circle", fill: solid(key) })
      );
      g.appendChild(buildIconNode(key, anchor.x, iconY, ICON_R * 1.5));
      g.appendChild(
        multilineText(anchor.x, anchor.y + LABEL_DY, wrapLabel(element.title, 10), "wheel-segment-label", 15)
      );

      // Nummern-Badge am Außenrand
      var badgePos = polar(CX, CY, BADGE_RADIUS, ang.center);
      g.appendChild(svgEl("circle", { cx: badgePos.x, cy: badgePos.y, r: 14, class: "wheel-badge", fill: solid(key) }));
      var badgeText = svgEl("text", { x: badgePos.x, y: badgePos.y, class: "wheel-badge-num", "text-anchor": "middle" });
      badgeText.textContent = String(parseInt(element.num, 10) || element.num);
      g.appendChild(badgeText);

      // Dezentes Signal: in einer früheren Episode schon bearbeitet, in der
      // laufenden aber noch offen – sonst wirkte jede neue Episode, als wäre
      // die bisherige Arbeit spurlos verschwunden.
      if (stState.status === "offen" && stState.touchedBefore) {
        var dotPos = polar(CX, CY, BADGE_RADIUS, ang.center + 15);
        g.appendChild(
          svgEl("circle", { cx: dotPos.x, cy: dotPos.y, r: 5, class: "wheel-touched-dot", fill: solid(key) })
        );
      }

      bindActivate(g, function () {
        onSelect(key);
      });
      svg.appendChild(g);
    });

    // ---- Zentrum: Raum & Zeit ----
    var hubState = (initiative.stations && initiative.stations.raumzeit) || { status: "offen" };
    var hubInfo = (AVERA_DATA.FRAMEWORK && AVERA_DATA.FRAMEWORK.hub) || {
      titel: "Raum & Zeit",
      sub: "Für Reflexion, Austausch und nachhaltige Wirkung"
    };
    var hubG = svgEl("g", { class: "wheel-hub", "data-key": "raumzeit", tabindex: "0", role: "button" });
    hubG.appendChild(
      svgEl("circle", {
        cx: CX,
        cy: CY,
        r: HUB_R,
        class: "wheel-hub-circle status-" + hubState.status,
        fill: "var(--panel-bg)",
        stroke: fillFor("raumzeit", hubState.status),
        "stroke-width": 5
      })
    );
    hubG.appendChild(buildLogoNode(CX - 23, CY - 64, 46));
    var hubTitle = svgEl("text", { x: CX, y: CY + 2, class: "wheel-hub-label", "text-anchor": "middle" });
    hubTitle.textContent = hubInfo.titel.toUpperCase();
    hubG.appendChild(hubTitle);
    hubG.appendChild(multilineText(CX, CY + 30, wrapLabel(hubInfo.sub, 26), "wheel-hub-sub", 13));
    bindActivate(hubG, function () {
      onSelect("raumzeit");
    });
    svg.appendChild(hubG);

    container.appendChild(svg);
  }

  global.AVERA_WHEEL = { render: render };
})(window);

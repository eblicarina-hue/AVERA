/*
 * Rendert das AVERA-Rad als SVG: 6 Gestaltungselemente im Kreis (Drehrichtung),
 * Raum & Zeit als Dreh- und Angelpunkt im Zentrum, Intention als Startpunkt oben.
 */
(function (global) {
  "use strict";

  var RING_KEYS = ["story", "orgkultur", "fuehrung", "entdecken", "peers", "methoden"];
  var ELEMENT_ICON = {
    story: "💬",
    orgkultur: "👥",
    fuehrung: "🧭",
    entdecken: "🌱",
    peers: "🤝",
    methoden: "⚙️"
  };
  var SIZE = 600;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var OUTER_R = 260;
  var INNER_R = 150;
  var HUB_R = 100;
  var INTENTION_R = 34;
  var INTENTION_W = 118;
  var INTENTION_CY = 60;

  // Farbfamilien: je Gestaltungselement eine eigene Farbe (aus der Logo-Palette),
  // moduliert nach Standortbestimmung (offen/in Arbeit/etabliert).
  var SHADES = {
    story: shadeTrio("el-story"),
    orgkultur: shadeTrio("el-orgkultur"),
    fuehrung: shadeTrio("el-fuehrung"),
    entdecken: shadeTrio("el-entdecken"),
    peers: shadeTrio("el-peers"),
    methoden: shadeTrio("el-methoden"),
    raumzeit: shadeTrio("sphere-cross"),
    intention: shadeTrio("avera-red")
  };

  function shadeTrio(tokenBase) {
    return {
      offen: "var(--" + tokenBase + "-soft)",
      in_arbeit: "color-mix(in srgb, var(--" + tokenBase + ") 55%, var(--" + tokenBase + "-soft))",
      etabliert: "var(--" + tokenBase + ")"
    };
  }

  function fillFor(key, status) {
    var shades = SHADES[key] || SHADES.story;
    return shades[status] || shades.offen;
  }

  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function annularSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
    var p1 = polar(cx, cy, outerR, startAngle);
    var p2 = polar(cx, cy, outerR, endAngle);
    var p3 = polar(cx, cy, innerR, endAngle);
    var p4 = polar(cx, cy, innerR, startAngle);
    var largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return [
      "M", p1.x, p1.y,
      "A", outerR, outerR, 0, largeArc, 1, p2.x, p2.y,
      "L", p3.x, p3.y,
      "A", innerR, innerR, 0, largeArc, 0, p4.x, p4.y,
      "Z"
    ].join(" ");
  }

  // Ein einzelnes Ring-Segment als dick gestrichener, rund gekappter Bogen
  // (statt spitzer Kuchenstück-Ecken) – das ergibt die weiche, "blobby" Form.
  function arcStrokePath(cx, cy, midR, startAngle, endAngle) {
    var p1 = polar(cx, cy, midR, startAngle);
    var p2 = polar(cx, cy, midR, endAngle);
    var largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return ["M", p1.x, p1.y, "A", midR, midR, 0, largeArc, 1, p2.x, p2.y].join(" ");
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

  // AVERA-Blütenlogo als eigenständiges, wiederverwendbares SVG-Fragment
  // (6 Blütenblätter im Uhrzeigersinn: Blau, Türkis, Gelb, Koralle, Magenta, Violett).
  var LOGO_PETAL_D = "M50,50 C36,45 26,26 41,8 C46,2 54,2 59,8 C74,26 64,45 50,50 Z";
  var LOGO_COLORS = [
    ["#2f6fe0", "#9cc9f7"],
    ["#16b892", "#a7f0dc"],
    ["#f0a72e", "#ffdd8f"],
    ["#f0654f", "#ffb7a3"],
    ["#e0468f", "#f6a9d3"],
    ["#7c4fd1", "#c6aef2"]
  ];
  var logoIdSeq = 0;

  function buildLogoNode(x, y, size) {
    logoIdSeq += 1;
    var uid = "avera-logo-" + logoIdSeq;
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

  function render(container, initiative, onSelect) {
    container.innerHTML = "";
    var svg = svgEl("svg", {
      viewBox: "0 0 " + SIZE + " " + SIZE,
      class: "avera-wheel",
      role: "img",
      "aria-label": "AVERA Veränderungsrad"
    });

    var defs = svgEl("defs", {});
    var marker = svgEl("marker", {
      id: "avera-arrow",
      viewBox: "0 0 10 10",
      refX: "8",
      refY: "5",
      markerWidth: "6",
      markerHeight: "6",
      orient: "auto-start-reverse"
    });
    marker.appendChild(svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "wheel-arrowhead" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var segAngle = 360 / RING_KEYS.length;

    // Grauer Backdrop-Halo hinter dem Ring (dezente Tiefe)
    svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: OUTER_R + 14, class: "wheel-backdrop" }));
    // Gepunkteter Führungsring außen (dekorativ, wie im White Paper)
    svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: OUTER_R + 26, class: "wheel-guide-ring" }));

    // Verbindungsspeichen (dezent)
    RING_KEYS.forEach(function (key, i) {
      var startAngle = i * segAngle;
      var mid = startAngle + segAngle / 2;
      var p1 = polar(CX, CY, HUB_R, mid);
      var p2 = polar(CX, CY, INNER_R, mid);
      svg.appendChild(svgEl("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: "wheel-spoke" }));
    });

    // Ring-Segmente: unsichtbare Sektor-Fläche fürs Klicken + sichtbarer, rund
    // gekappter Bogen fürs Aussehen (weiche "Blob"-Form statt spitzer Ecken).
    var midR = (OUTER_R + INNER_R) / 2;
    var strokeWidth = OUTER_R - INNER_R - 6;
    RING_KEYS.forEach(function (key, i) {
      var element = AVERA_DATA.getElement(key);
      var stState = (initiative.stations && initiative.stations[key]) || { status: "offen" };
      var startAngle = i * segAngle + 3;
      var endAngle = (i + 1) * segAngle - 3;

      var g = svgEl("g", { class: "wheel-segment", "data-key": key, tabindex: "0", role: "button" });

      var hit = svgEl("path", {
        d: annularSectorPath(CX, CY, INNER_R, OUTER_R, i * segAngle + 1, (i + 1) * segAngle - 1),
        class: "wheel-segment-hit"
      });
      g.appendChild(hit);

      var arc = svgEl("path", {
        d: arcStrokePath(CX, CY, midR, startAngle, endAngle),
        class: "wheel-segment-path status-" + stState.status + " el-" + key,
        fill: "none",
        stroke: fillFor(key, stState.status),
        "stroke-width": strokeWidth,
        "stroke-linecap": "round"
      });
      g.appendChild(arc);

      var midAngle = startAngle + (endAngle - startAngle) / 2;

      var iconPos = polar(CX, CY, midR + 12, midAngle);
      var iconText = svgEl("text", { x: iconPos.x, y: iconPos.y, class: "wheel-segment-icon", "text-anchor": "middle" });
      iconText.textContent = ELEMENT_ICON[key] || "";
      g.appendChild(iconText);

      var labelPos = polar(CX, CY, midR - 32, midAngle);
      var lines = wrapLabel(element.title, 12);
      var text = svgEl("text", {
        x: labelPos.x,
        y: labelPos.y - ((lines.length - 1) * 7),
        class: "wheel-segment-label",
        "text-anchor": "middle"
      });
      lines.forEach(function (line, li) {
        var tspan = svgEl("tspan", { x: labelPos.x, dy: li === 0 ? 0 : 14 });
        tspan.textContent = line;
        text.appendChild(tspan);
      });
      g.appendChild(text);

      var badgePos = polar(CX, CY, OUTER_R - 16, startAngle + 4);
      g.appendChild(svgEl("circle", { cx: badgePos.x, cy: badgePos.y, r: 11, class: "wheel-badge" }));
      var badgeText = svgEl("text", { x: badgePos.x, y: badgePos.y, class: "wheel-badge-num", "text-anchor": "middle" });
      badgeText.textContent = element.num;
      g.appendChild(badgeText);

      g.addEventListener("click", function () {
        onSelect(key);
      });
      g.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          onSelect(key);
        }
      });

      svg.appendChild(g);
    });

    // Roter Rahmen um den gesamten Ring (Signaturelement aus dem White Paper)
    svg.appendChild(svgEl("circle", { cx: CX, cy: CY, r: OUTER_R + 4, class: "wheel-frame" }));

    // Zentrum: Raum & Zeit – weißer Kern mit Blütenlogo, Status als Ringfarbe.
    var hubState = (initiative.stations && initiative.stations.raumzeit) || { status: "offen" };
    var hubG = svgEl("g", { class: "wheel-hub", "data-key": "raumzeit", tabindex: "0", role: "button" });
    hubG.appendChild(
      svgEl("circle", {
        cx: CX,
        cy: CY,
        r: HUB_R,
        class: "wheel-hub-circle status-" + hubState.status,
        fill: "var(--panel-bg)",
        stroke: fillFor("raumzeit", hubState.status),
        "stroke-width": 6
      })
    );
    hubG.appendChild(buildLogoNode(CX - 22, CY - 46, 44));
    var hubText1 = svgEl("text", { x: CX, y: CY + 18, class: "wheel-hub-label", "text-anchor": "middle" });
    hubText1.textContent = "Raum & Zeit";
    var hubText2 = svgEl("text", { x: CX, y: CY + 34, class: "wheel-hub-sub", "text-anchor": "middle" });
    hubText2.textContent = "Dreh- und Angelpunkt";
    hubG.appendChild(hubText1);
    hubG.appendChild(hubText2);
    hubG.addEventListener("click", function () {
      onSelect("raumzeit");
    });
    hubG.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        onSelect("raumzeit");
      }
    });
    svg.appendChild(hubG);

    // Intention: Startpunkt oben, außerhalb des Rings – als Pill wie im White Paper.
    var intentionState = (initiative.stations && initiative.stations.intention) || { status: "offen" };
    var iPos = { x: CX, y: INTENTION_CY };
    var connectorStart = { x: CX, y: INTENTION_CY + INTENTION_R };
    var connectorEnd = { x: CX, y: CY - OUTER_R - 26 };
    svg.appendChild(
      svgEl("line", {
        x1: connectorStart.x,
        y1: connectorStart.y,
        x2: connectorEnd.x,
        y2: connectorEnd.y,
        class: "wheel-intention-connector",
        "marker-end": "url(#avera-arrow)"
      })
    );

    var intentG = svgEl("g", { class: "wheel-intention", "data-key": "intention", tabindex: "0", role: "button" });
    intentG.appendChild(
      svgEl("rect", {
        x: iPos.x - INTENTION_W / 2,
        y: iPos.y - INTENTION_R / 2,
        width: INTENTION_W,
        height: INTENTION_R,
        rx: INTENTION_R / 2,
        class: "wheel-intention-circle status-" + intentionState.status,
        fill: fillFor("intention", intentionState.status)
      })
    );
    var intentText = svgEl("text", { x: iPos.x, y: iPos.y + 4, class: "wheel-intention-label", "text-anchor": "middle" });
    intentText.textContent = "Intention";
    intentG.appendChild(intentText);
    intentG.addEventListener("click", function () {
      onSelect("intention");
    });
    intentG.addEventListener("keydown", function (evt) {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        onSelect("intention");
      }
    });
    svg.appendChild(intentG);

    container.appendChild(svg);
  }

  global.AVERA_WHEEL = { render: render };
})(window);

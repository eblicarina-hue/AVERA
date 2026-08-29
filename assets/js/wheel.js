/*
 * Rendert das AVERA-Rad als SVG: 6 Gestaltungselemente im Kreis (Drehrichtung),
 * Raum & Zeit als Dreh- und Angelpunkt im Zentrum, Intention als Startpunkt oben.
 */
(function (global) {
  "use strict";

  var RING_KEYS = ["story", "orgkultur", "fuehrung", "entdecken", "peers", "methoden"];
  var SIZE = 600;
  var CX = SIZE / 2;
  var CY = SIZE / 2;
  var OUTER_R = 260;
  var INNER_R = 150;
  var HUB_R = 110;
  var INTENTION_R = 40;
  var INTENTION_CY = 60;

  // Farbfamilien je Sphäre (Business/Corporate Learning/Cross-Spheric) aus dem
  // AVERA White Paper, moduliert nach Standortbestimmung (offen/in Arbeit/etabliert).
  var SPHERE_SHADES = {
    business: {
      offen: "var(--sphere-business-soft)",
      in_arbeit: "color-mix(in srgb, var(--sphere-business) 55%, var(--sphere-business-soft))",
      etabliert: "var(--sphere-business)"
    },
    corporate_learning: {
      offen: "var(--sphere-cl-soft)",
      in_arbeit: "color-mix(in srgb, var(--sphere-cl) 55%, var(--sphere-cl-soft))",
      etabliert: "var(--sphere-cl)"
    },
    cross_spheric: {
      offen: "var(--sphere-cross-soft)",
      in_arbeit: "color-mix(in srgb, var(--sphere-cross) 55%, var(--sphere-cross-soft))",
      etabliert: "var(--sphere-cross)"
    },
    intention: {
      offen: "var(--avera-red-soft)",
      in_arbeit: "color-mix(in srgb, var(--avera-red) 55%, var(--avera-red-soft))",
      etabliert: "var(--avera-red)"
    }
  };

  function sphereFill(sphereKey, status) {
    var shades = SPHERE_SHADES[sphereKey] || SPHERE_SHADES.business;
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

  function render(container, initiative, onSelect) {
    container.innerHTML = "";
    var svg = svgEl("svg", {
      viewBox: "0 0 " + SIZE + " " + SIZE,
      class: "avera-wheel",
      role: "img",
      "aria-label": "AVERA Veränderungsrad"
    });

    var segAngle = 360 / RING_KEYS.length;

    // Grauer Backdrop-Halo hinter dem Ring (dezente Tiefe)
    svg.appendChild(
      svgEl("circle", { cx: CX, cy: CY, r: OUTER_R + 10, class: "wheel-backdrop" })
    );

    // Verbindungsspeichen (dezent)
    RING_KEYS.forEach(function (key, i) {
      var startAngle = i * segAngle;
      var mid = startAngle + segAngle / 2;
      var p1 = polar(CX, CY, HUB_R, mid);
      var p2 = polar(CX, CY, INNER_R, mid);
      svg.appendChild(svgEl("line", { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, class: "wheel-spoke" }));
    });

    // Ring-Segmente
    RING_KEYS.forEach(function (key, i) {
      var station = AVERA_DATA.getStation(key);
      var stState = (initiative.stations && initiative.stations[key]) || { status: "offen" };
      var startAngle = i * segAngle + 1.2;
      var endAngle = (i + 1) * segAngle - 1.2;
      var d = annularSectorPath(CX, CY, INNER_R, OUTER_R, startAngle, endAngle);

      var g = svgEl("g", { class: "wheel-segment", "data-key": key, tabindex: "0", role: "button" });
      var path = svgEl("path", {
        d: d,
        class: "wheel-segment-path status-" + stState.status + " sphere-" + station.sphere,
        fill: sphereFill(station.sphere, stState.status)
      });
      g.appendChild(path);

      var labelPos = polar(CX, CY, (OUTER_R + INNER_R) / 2, startAngle + (endAngle - startAngle) / 2);
      var lines = wrapLabel(station.title, 12);
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

      var numLabelPos = polar(CX, CY, OUTER_R - 18, startAngle + (endAngle - startAngle) / 2);
      var numText = svgEl("text", {
        x: numLabelPos.x,
        y: numLabelPos.y,
        class: "wheel-segment-num",
        "text-anchor": "middle"
      });
      numText.textContent = station.num;
      g.appendChild(numText);

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

    // Zentrum: Raum & Zeit
    var hubState = (initiative.stations && initiative.stations.raumzeit) || { status: "offen" };
    var hubG = svgEl("g", { class: "wheel-hub", "data-key": "raumzeit", tabindex: "0", role: "button" });
    hubG.appendChild(
      svgEl("circle", {
        cx: CX,
        cy: CY,
        r: HUB_R,
        class: "wheel-hub-circle status-" + hubState.status + " sphere-cross_spheric",
        fill: sphereFill("cross_spheric", hubState.status)
      })
    );
    var hubText1 = svgEl("text", { x: CX, y: CY - 6, class: "wheel-hub-label", "text-anchor": "middle" });
    hubText1.textContent = "Raum & Zeit";
    var hubText2 = svgEl("text", { x: CX, y: CY + 14, class: "wheel-hub-sub", "text-anchor": "middle" });
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

    // Intention: Startpunkt oben, außerhalb des Rings
    var intentionState = (initiative.stations && initiative.stations.intention) || { status: "offen" };
    var iPos = { x: CX, y: INTENTION_CY };
    var connectorStart = { x: CX, y: INTENTION_CY + INTENTION_R };
    var connectorEnd = { x: CX, y: CY - OUTER_R - 4 };
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
    var arrowPath = svgEl("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "wheel-arrowhead" });
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.insertBefore(defs, svg.firstChild);

    var intentG = svgEl("g", { class: "wheel-intention", "data-key": "intention", tabindex: "0", role: "button" });
    intentG.appendChild(
      svgEl("circle", {
        cx: iPos.x,
        cy: iPos.y,
        r: INTENTION_R,
        class: "wheel-intention-circle status-" + intentionState.status + " sphere-intention",
        fill: sphereFill("intention", intentionState.status)
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

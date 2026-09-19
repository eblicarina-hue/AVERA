/*
 * Erzeugt aus einem Vorhaben ein lesbares Markdown-Dokument
 * ("Gestaltungsarchitektur") und bietet den Download als .md an.
 * Der Aufbau folgt dem Datenmodell des App-Konzepts: Intention, dann je
 * Episode die vier Schleifen-Ergebnisse, die Gate-Entscheidungen und die
 * Realisierung samt Maßnahmen.
 */
(function (global) {
  "use strict";

  function elementTitel(key) {
    var el = key && AVERA_DATA.getElement(key);
    return el ? el.title : "ungetaggt";
  }

  function intentionSection(v) {
    var lines = ["## Intention"];
    if (v.intention.text && v.intention.text.trim()) {
      lines.push("> " + v.intention.text.trim(), "");
    }
    if (v.intention.zielgruppe && v.intention.zielgruppe.trim()) {
      lines.push("**Zielgruppe:** " + v.intention.zielgruppe.trim(), "");
    }

    ["erarbeiten", "schaerfen"].forEach(function (phaseKey) {
      var phase = AVERA_DATA.INTENTION_PHASEN[phaseKey];
      var values = v.intention[phaseKey] || [];
      if (!values.some(function (t) { return t && t.trim(); })) return;
      lines.push("**" + phase.leitfrage + "**");
      phase.fragen.forEach(function (fr, i) {
        if (values[i] && values[i].trim()) {
          lines.push("- _" + fr.kategorie + ":_ " + fr.frage);
          lines.push("  > " + values[i].trim());
        }
      });
      lines.push("");
    });

    var reflexionen = v.intention.reflexionen || [];
    if (reflexionen.length) {
      lines.push("**Reflexionen im Verlauf:**");
      reflexionen.forEach(function (r) {
        lines.push("- Episode " + r.episodeNr + " (" + new Date(r.datum).toLocaleDateString("de-AT") + "): " + r.text);
      });
      lines.push("");
    }

    lines.push("---", "");
    return lines;
  }

  function gateLine(ep, loopKey) {
    var g = (ep.gates && ep.gates[loopKey]) || {};
    var frage = AVERA_DATA.PROZESS[loopKey].gateFrage;
    if (g.offen && g.begruendung && g.begruendung.trim()) {
      return "**Gate – " + frage + "** ✓ " +
        (g.entschiedenAm ? "(" + new Date(g.entschiedenAm).toLocaleDateString("de-AT") + ") " : "") +
        "— " + g.begruendung.trim();
    }
    return "_Gate – " + frage + " — noch nicht entschieden._";
  }

  // Die Notizen aus der Fragenmatrix (übergeordnet und je Element), soweit
  // etwas darin steht.
  function notizLines(ep, loopKey) {
    var general = AVERA_DATA.LOOP_GENERAL_FRAGEN[loopKey];
    var state = ep.loops[loopKey];
    var lines = [];
    ["fokus", "wirkgefuege", "potenziale", "pruefung"].forEach(function (fk) {
      var t = state.general[fk];
      if (t && t.trim()) lines.push("**" + general[fk] + "** " + t.trim());
    });
    AVERA_DATA.ELEMENTS.forEach(function (elm) {
      var t = state.elemente[elm.key];
      if (t && t.trim()) lines.push("- **" + elm.title + ":** " + t.trim());
    });
    if (lines.length) lines.push("");
    return lines;
  }

  function observeLines(ep) {
    var lines = ["### 1 Beobachten"];
    if (ep.beobachtungen.length) {
      ["fakt", "vermutung"].forEach(function (typ) {
        var karten = ep.beobachtungen.filter(function (b) { return b.typ === typ; });
        if (!karten.length) return;
        lines.push("**" + (typ === "fakt" ? "Fakten" : "Vermutungen") + " (" + karten.length + "):**");
        karten.forEach(function (b) {
          lines.push("- [" + elementTitel(b.element) + "] " + b.text);
        });
        lines.push("");
      });
    } else {
      lines.push("_Keine Beobachtungen erfasst._", "");
    }
    return lines.concat(notizLines(ep, "observe"), [gateLine(ep, "observe"), ""]);
  }

  function understandLines(ep) {
    var lines = ["### 2 Verstehen"];
    if (ep.wirkmodell.hebel.length) {
      lines.push("**Hebel:**");
      ep.wirkmodell.hebel.forEach(function (h) {
        if (h.text && h.text.trim()) lines.push("- " + h.text.trim());
      });
      lines.push("");
    }
    if (ep.wirkmodell.hypothesen.length) {
      lines.push("**Gestaltungshypothesen:**");
      ep.wirkmodell.hypothesen.forEach(function (h) {
        lines.push("- **[" + elementTitel(h.element) + "]** " + h.text);
        lines.push("  - _Gegenhypothese:_ " + (h.gegenhypothese && h.gegenhypothese.trim() ? h.gegenhypothese.trim() : "fehlt"));
      });
      lines.push("");
    } else {
      lines.push("_Kein Wirkmodell formuliert._", "");
    }
    return lines.concat(notizLines(ep, "understand"), [gateLine(ep, "understand"), ""]);
  }

  function impulsZeilen(imp, prefix) {
    var abdeckung = AVERA_DATA.FAKTE_TYPEN.filter(function (t) {
      return imp.objekte.some(function (o) { return o.typ === t.key; });
    }).length;
    var lines = [prefix + "**" + imp.titel + "** (" + abdeckung + "/4 Ebenen)"];
    AVERA_DATA.FAKTE_TYPEN.forEach(function (t) {
      var objekte = imp.objekte.filter(function (o) { return o.typ === t.key; });
      if (objekte.length) {
        lines.push("  - _" + t.label + ":_ " + objekte.map(function (o) { return o.beispiel; }).join(", "));
      }
    });
    return lines;
  }

  function designLines(ep) {
    var lines = ["### 3 Entwerfen"];
    if (ep.impulse.length) {
      ep.wirkmodell.hypothesen.forEach(function (h) {
        var impulse = ep.impulse.filter(function (imp) { return imp.hypotheseId === h.id; });
        if (!impulse.length) return;
        lines.push("**Zur Hypothese:** " + h.text);
        impulse.forEach(function (imp) {
          lines = lines.concat(impulsZeilen(imp, "- "));
        });
        lines.push("");
      });
      var ohne = ep.impulse.filter(function (imp) { return !imp.hypotheseId; });
      if (ohne.length) {
        lines.push("**Ohne Hypothese:**");
        ohne.forEach(function (imp) {
          lines = lines.concat(impulsZeilen(imp, "- "));
        });
        lines.push("");
      }
    } else {
      lines.push("_Keine Gestaltungsimpulse entworfen._", "");
    }
    return lines.concat(notizLines(ep, "design"), [gateLine(ep, "design"), ""]);
  }

  function architectLines(ep) {
    var lines = ["### 4 Komponieren"];
    var gewaehlt = ep.architektur.gewaehlt || [];
    var chosen = ep.impulse.filter(function (imp) { return gewaehlt.indexOf(imp.id) !== -1; });
    if (chosen.length) {
      lines.push("**Gestaltungsarchitektur (" + chosen.length + " von " + ep.impulse.length + " Impulsen):**");
      chosen.forEach(function (imp) {
        lines = lines.concat(impulsZeilen(imp, "- "));
        var w = ep.architektur.weglassen[imp.id];
        if (w && w.trim()) lines.push("  - _Wenn er entfällt:_ " + w.trim());
      });
      lines.push("");
    } else {
      lines.push("_Keine Impulse in die Architektur übernommen._", "");
    }
    if (ep.architektur.kohaerenzNotiz && ep.architektur.kohaerenzNotiz.trim()) {
      lines.push("**Kohärenz:** " + ep.architektur.kohaerenzNotiz.trim(), "");
    }
    return lines.concat(notizLines(ep, "architect"), [gateLine(ep, "architect"), ""]);
  }

  function episodeSection(ep) {
    var lines = ["## Episode " + ep.nr];
    if (ep.statusQuo && ep.statusQuo.trim()) {
      lines.push("_Status quo:_ " + ep.statusQuo.trim(), "");
    }
    lines = lines
      .concat(observeLines(ep))
      .concat(understandLines(ep))
      .concat(designLines(ep))
      .concat(architectLines(ep));

    lines.push("### In die Welt gebracht");
    if (ep.realized) {
      lines.push("Am " + new Date(ep.realized.at).toLocaleDateString("de-AT"));
      if (ep.realized.notiz && ep.realized.notiz.trim()) lines.push("> " + ep.realized.notiz.trim());
    } else {
      lines.push("_Noch nicht realisiert._");
    }
    var mn = ep.massnahmen || [];
    if (mn.length) {
      lines.push("", "**Maßnahmen:**");
      mn.forEach(function (m) {
        lines.push("- [" + (m.status === "erledigt" ? "x" : " ") + "] " + m.text);
      });
    }
    lines.push("", "---", "");
    return lines;
  }

  function toMarkdown(v) {
    var lines = ["# Gestaltungsarchitektur: " + v.name];
    if (v.org) lines.push("**Unternehmen/Team:** " + v.org);
    lines.push("", "_Erstellt mit der AVERA-App – Episode für Episode, Gate für Gate._", "");

    lines = lines.concat(intentionSection(v));
    v.episodes.forEach(function (ep) {
      lines = lines.concat(episodeSection(ep));
    });

    lines.push("_Grundlage: AVERA White Paper 2.0, die Fragen-/4Fakte-Matrix und das App-Konzept „Option 3“, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0._");
    return lines.join("\n");
  }

  function downloadViaBlob(filename, text) {
    var blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // Läuft die App eingebettet im Artifact-Viewer, gibt es kein direktes
  // Dateisystem – dort liefe der Download über die "downloads"-Capability.
  // Außerhalb eines Viewers existiert window.claude gar nicht, dann greift
  // sofort der Blob-Download.
  async function downloadMarkdown(v) {
    var safeName = (v.name || "avera-vorhaben").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    var filename = "gestaltungsarchitektur-" + (safeName || "vorhaben") + ".md";
    var text = toMarkdown(v);

    if (global.claude && typeof global.claude.use === "function") {
      try {
        var downloads = await global.claude.use("downloads");
        if (downloads) {
          await downloads.save({ filename: filename, data: text });
          return;
        }
      } catch (err) {
        if (err && err.code === "declined") return;
        console.warn("AVERA export: downloads-Capability nicht verfügbar, nutze Browser-Download.", err);
      }
    }
    downloadViaBlob(filename, text);
  }

  global.AVERA_EXPORT = { toMarkdown: toMarkdown, downloadMarkdown: downloadMarkdown };
})(window);

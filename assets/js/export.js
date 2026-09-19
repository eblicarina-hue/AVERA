/*
 * Erzeugt aus einer Initiative ein lesbares Markdown-Dokument
 * ("Gestaltungsarchitektur") und bietet Download als .md an.
 */
(function (global) {
  "use strict";

  var LOOP_ORDER = ["observe", "understand", "design", "architect"];

  function pushIfText(lines, label, text) {
    if (text && String(text).trim()) {
      lines.push("**" + label + ":** " + String(text).trim());
    }
  }

  function intentionSection(initiative) {
    var lines = [];
    lines.push("## Intention");
    if (initiative.intention.statement && initiative.intention.statement.trim()) {
      lines.push("> " + initiative.intention.statement.trim());
      lines.push("");
    }

    ["erarbeiten", "schaerfen"].forEach(function (phaseKey) {
      var phase = AVERA_DATA.INTENTION_PHASEN[phaseKey];
      var values = initiative.intention[phaseKey] || [];
      var any = values.some(function (v) { return v && v.trim(); });
      if (!any) return;
      lines.push("**" + phase.leitfrage + "**");
      phase.fragen.forEach(function (fr, i) {
        if (values[i] && values[i].trim()) {
          lines.push("- _" + fr.kategorie + ":_ " + fr.frage);
          lines.push("  > " + values[i].trim());
        }
      });
      lines.push("");
    });

    var reflexionen = initiative.intention.reflexionen || [];
    if (reflexionen.length) {
      lines.push("**Reflexionen im Verlauf:**");
      reflexionen.forEach(function (r) {
        lines.push("- Episode " + r.episodeNr + " (" + new Date(r.datum).toLocaleDateString("de-AT") + "): " + r.text);
      });
      lines.push("");
    }

    lines.push("---");
    lines.push("");
    return lines;
  }

  function loopSection(episode, loopKey) {
    var lines = [];
    var loop = AVERA_DATA.getLoop(loopKey);
    var general = AVERA_DATA.LOOP_GENERAL_FRAGEN[loopKey];
    var state = episode.loops[loopKey];

    var anyGeneral = ["fokus", "wirkgefuege", "potenziale", "pruefung"].some(function (fk) {
      return state.general[fk] && state.general[fk].trim();
    });
    var anyElemente = AVERA_DATA.ELEMENTS.some(function (elm) {
      return state.elemente[elm.key] && state.elemente[elm.key].trim();
    });
    var anyDesign = loopKey === "design" && state.impulse.length > 0;
    var anyArchitect = loopKey === "architect" && (state.ausgewaehlt.length > 0 || (state.begruendung && state.begruendung.trim()));
    if (!anyGeneral && !anyElemente && !state.gate && !anyDesign && !anyArchitect) return lines;

    lines.push("### " + loop.label + " (" + loop.funktion + ")");

    if (anyGeneral) {
      ["fokus", "wirkgefuege", "potenziale", "pruefung"].forEach(function (fk) {
        pushIfText(lines, general[fk], state.general[fk]);
      });
      lines.push("");
    }
    if (state.gate) {
      lines.push("✓ GATE: " + general.gate + (state.gateNotiz && state.gateNotiz.trim() ? " — " + state.gateNotiz.trim() : ""));
      lines.push("");
    }

    if (anyElemente) {
      AVERA_DATA.ELEMENTS.forEach(function (elm) {
        var text = state.elemente[elm.key];
        if (text && text.trim()) {
          lines.push("- **" + elm.title + ":** " + text.trim());
        }
      });
      lines.push("");
    }

    if (loopKey === "design" && state.impulse.length) {
      lines.push("**Gesammelte Gestaltungsimpulse:**");
      state.impulse.forEach(function (imp) {
        var objekteText = imp.objekte.map(function (o) { return o.beispiel; }).join(", ");
        lines.push("- **" + imp.name + "**: " + objekteText + (imp.notiz ? " — " + imp.notiz : ""));
      });
      lines.push("");
    }

    if (loopKey === "architect") {
      var impulse = episode.loops.design.impulse;
      var selected = state.ausgewaehlt || [];
      var chosen = impulse.filter(function (imp) { return selected.indexOf(imp.id) !== -1; });
      if (chosen.length) {
        lines.push("**Gewählte Architektur:**");
        chosen.forEach(function (imp) {
          lines.push("- " + imp.name);
        });
        lines.push("");
      }
      pushIfText(lines, "Begründung", state.begruendung);
      lines.push("");
    }

    return lines;
  }

  function episodeSection(episode) {
    var lines = [];
    lines.push("## Episode " + episode.nr);
    if (episode.statusQuoNotiz && episode.statusQuoNotiz.trim()) {
      lines.push("_Status quo:_ " + episode.statusQuoNotiz.trim());
      lines.push("");
    }

    LOOP_ORDER.forEach(function (lk) {
      lines = lines.concat(loopSection(episode, lk));
    });

    if (episode.realized) {
      lines.push("**In die Welt gebracht:** " + new Date(episode.realized.at).toLocaleDateString("de-AT"));
      if (episode.realized.notiz && episode.realized.notiz.trim()) {
        lines.push("> " + episode.realized.notiz.trim());
      }
    } else {
      lines.push("_Noch nicht realisiert._");
    }
    lines.push("");
    lines.push("---");
    lines.push("");
    return lines;
  }

  function toMarkdown(initiative) {
    var lines = [];
    lines.push("# Gestaltungsarchitektur: " + initiative.name);
    if (initiative.org) lines.push("**Unternehmen/Team:** " + initiative.org);
    lines.push("");
    lines.push("_Erstellt mit der AVERA-Change-App – Episode für Episode, Drehung für Drehung._");
    lines.push("");

    lines = lines.concat(intentionSection(initiative));

    initiative.episodes.forEach(function (episode) {
      lines = lines.concat(episodeSection(episode));
    });

    lines.push("_Framework-Grundlage: AVERA White Paper 2.0 und Workflow „Episode & Schleife“, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0._");

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
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // Läuft die App eingebettet im Artifact-Viewer, gibt es kein direktes
  // Dateisystem – dort läuft der Download über die "downloads"-Capability.
  // Außerhalb eines Viewers (lokale Nutzung, eigenes Hosting) existiert
  // window.claude gar nicht, dann greift sofort der Blob-Download.
  async function downloadMarkdown(initiative) {
    var safeName = (initiative.name || "avera-initiative").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    var filename = "gestaltungsarchitektur-" + (safeName || "initiative") + ".md";
    var text = toMarkdown(initiative);

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

/*
 * Erzeugt aus einer Initiative ein lesbares Markdown-Dokument
 * ("Gestaltungsarchitektur") und bietet Download als .md an.
 */
(function (global) {
  "use strict";

  function statusLabel(status) {
    return (AVERA_DATA.STATUS[status] || AVERA_DATA.STATUS.offen).label;
  }

  function toMarkdown(initiative) {
    var lines = [];
    lines.push("# Gestaltungsarchitektur: " + initiative.name);
    if (initiative.org) lines.push("**Unternehmen/Team:** " + initiative.org);
    lines.push("");
    lines.push("_Erstellt mit der AVERA-Change-App – auf Basis des Admonter Veränderungsrads (AVERA)._");
    lines.push("");
    lines.push("---");
    lines.push("");

    var order = ["intention"].concat(AVERA_DATA.SEQUENCE.slice(1)).concat(["raumzeit"]);
    // sicherstellen, dass jede Station genau einmal vorkommt
    var seen = {};
    order = order.filter(function (k) {
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });

    order.forEach(function (key) {
      var station = AVERA_DATA.getStation(key);
      var st = (initiative.stations && initiative.stations[key]) || { status: "offen", diagnose: {}, answers: {}, objekte: [], notiz: "" };
      var diagnoseAnswers = st.diagnose || {};

      lines.push("## " + station.num + " " + station.title);
      lines.push("_" + station.subtitle + "_ — Status: **" + statusLabel(st.status) + "**");
      lines.push("");

      var diagnoseResults = station.diagnose
        .map(function (frage, i) {
          var oi = diagnoseAnswers[i];
          if (oi === undefined || oi === null || !frage.optionen[oi]) return null;
          return { frage: frage.frage, opt: frage.optionen[oi] };
        })
        .filter(function (r) { return r !== null; });

      if (diagnoseResults.length) {
        lines.push("**Standortbestimmung:**");
        diagnoseResults.forEach(function (r) {
          lines.push("- " + r.frage + " → **" + r.opt.label + "**");
        });
        lines.push("");

        var dringend = diagnoseResults.filter(function (r) { return r.opt.score === 0; });
        var imBlick = diagnoseResults.filter(function (r) { return r.opt.score === 1; });
        if (dringend.length || imBlick.length) {
          lines.push("**Handlungsempfehlungen:**");
          dringend.forEach(function (r) {
            lines.push("- _Dringend:_ " + r.opt.empfehlung);
          });
          imBlick.forEach(function (r) {
            lines.push("- _Im Blick behalten:_ " + r.opt.empfehlung);
          });
          lines.push("");
        }
      }

      var answered = false;
      station.reflexionsfragen.forEach(function (frage, i) {
        var antwort = (st.answers && st.answers[i]) || "";
        if (antwort.trim()) {
          if (!answered) {
            lines.push("**Reflexion:**");
            answered = true;
          }
          lines.push("- " + frage);
          lines.push("  > " + antwort.trim());
        }
      });
      if (answered) lines.push("");

      if (st.objekte && st.objekte.length) {
        lines.push("**Gewählte Gestaltungsobjekte / Maßnahmen:**");
        st.objekte.forEach(function (obj) {
          lines.push("- " + obj);
        });
        lines.push("");
      }

      if (st.notiz && st.notiz.trim()) {
        lines.push("**Notiz:**");
        lines.push(st.notiz.trim());
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    });

    lines.push("_Framework-Grundlage: AVERA White Paper 2.0, Corporate Learning Community Österreich (#CLCA), CC BY-SA 4.0._");

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

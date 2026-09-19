/*
 * Persistenz für AVERA-Vorhaben im Browser (localStorage).
 *
 * Datenmodell nach "AVERA App – Konzept (Option 3)":
 *   Intention  -> 1 pro Vorhaben, mit Historie
 *   Episode    -> Nummer, Status quo, Vorgänger-Episode
 *   Beobachtung        (Observe-Output)   Text, Typ Fakt/Vermutung, Element-Tag
 *   Wirkmodell         (Understand-Output) Hebel, Gestaltungshypothesen mit
 *                                          Pflicht-Gegenhypothese
 *   Gestaltungsimpuls  (Design-Output)     Titel, Objekte je 4Fakt, zugehörige Hypothese
 *   Gestaltungsarchitektur (Architect-Output) gewählte Impulse, Kohärenz-Notizen
 *   Gate-Entscheidung  je Schleifenübergang: Begründung + Zeitpunkt
 */
(function (global) {
  "use strict";

  var LS_KEY = "avera:vorhaben:v3";
  var LS_KEY_V2 = "avera:initiatives:v2";
  var LOOP_KEYS = ["observe", "understand", "design", "architect"];

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function now() {
    return new Date().toISOString();
  }

  // ---------- Leere Strukturen ----------

  function emptyLoopNotes() {
    var elemente = {};
    AVERA_DATA.ELEMENTS.forEach(function (el) {
      elemente[el.key] = "";
    });
    return {
      general: { fokus: "", wirkgefuege: "", potenziale: "", pruefung: "" },
      elemente: elemente
    };
  }

  function emptyGate() {
    return { offen: false, begruendung: "", entschiedenAm: null };
  }

  function emptyEpisode(nr, statusQuo, vorgaengerNr) {
    var loops = {};
    var gates = {};
    LOOP_KEYS.forEach(function (lk) {
      loops[lk] = emptyLoopNotes();
      gates[lk] = emptyGate();
    });
    return {
      nr: nr,
      startedAt: now(),
      statusQuo: statusQuo || "",
      vorgaengerNr: vorgaengerNr == null ? null : vorgaengerNr,
      beobachtungen: [],
      wirkmodell: { hebel: [], hypothesen: [] },
      impulse: [],
      architektur: { gewaehlt: [], kohaerenzNotiz: "", weglassen: {} },
      gates: gates,
      loops: loops,
      massnahmen: [],
      realized: null
    };
  }

  function emptyIntentionPhase(phaseKey) {
    var count = AVERA_DATA.INTENTION_PHASEN[phaseKey].fragen.length;
    var arr = [];
    for (var i = 0; i < count; i++) arr.push("");
    return arr;
  }

  function newVorhaben(name, org) {
    return {
      id: uid("vorhaben"),
      name: name || "Neues Projekt",
      org: org || "",
      createdAt: now(),
      updatedAt: now(),
      intention: {
        text: "",
        zielgruppe: "",
        erarbeiten: emptyIntentionPhase("erarbeiten"),
        schaerfen: emptyIntentionPhase("schaerfen"),
        historie: [],
        reflexionen: []
      },
      episodes: [emptyEpisode(1, "", null)],
      currentEpisodeNr: 1
    };
  }

  // ---------- Laden, Speichern, Migration ----------

  // Übernimmt Vorhaben aus dem alten Schema (Freitext-Notizen je Element,
  // Impulse unter loops.design) in die neue, strukturierte Form. Notizen und
  // Impulse bleiben erhalten; Beobachtungskarten und Wirkmodell starten leer,
  // weil es sie vorher schlicht nicht gab.
  function migrateFromV2(old) {
    var v = newVorhaben(old.name, old.org);
    v.id = old.id || v.id;
    v.createdAt = old.createdAt || v.createdAt;
    v.updatedAt = old.updatedAt || v.updatedAt;

    var oldIntention = old.intention || {};
    v.intention.text = oldIntention.statement || "";
    v.intention.erarbeiten = oldIntention.erarbeiten || v.intention.erarbeiten;
    v.intention.schaerfen = oldIntention.schaerfen || v.intention.schaerfen;
    v.intention.reflexionen = oldIntention.reflexionen || [];

    v.episodes = (old.episodes || []).map(function (oe, i) {
      var ep = emptyEpisode(oe.nr, oe.statusQuoNotiz || "", i > 0 ? oe.nr - 1 : null);
      ep.startedAt = oe.startedAt || ep.startedAt;

      LOOP_KEYS.forEach(function (lk) {
        var ol = (oe.loops && oe.loops[lk]) || {};
        if (ol.general) ep.loops[lk].general = ol.general;
        if (ol.elemente) ep.loops[lk].elemente = ol.elemente;
        ep.gates[lk] = {
          offen: !!ol.gate,
          begruendung: ol.gateNotiz || "",
          entschiedenAm: ol.gate ? oe.startedAt || null : null
        };
      });

      var oldImpulse = (oe.loops && oe.loops.design && oe.loops.design.impulse) || [];
      ep.impulse = oldImpulse.map(function (imp) {
        return {
          id: imp.id || uid("impuls"),
          titel: imp.name || "Gestaltungsimpuls",
          hypotheseId: null,
          objekte: imp.objekte || [],
          notiz: imp.notiz || ""
        };
      });

      var oldArch = (oe.loops && oe.loops.architect) || {};
      ep.architektur.gewaehlt = oldArch.ausgewaehlt || [];
      ep.architektur.kohaerenzNotiz = oldArch.begruendung || "";

      if (oe.realized) {
        ep.realized = { at: oe.realized.at, notiz: oe.realized.notiz || "" };
      }
      return ep;
    });

    if (!v.episodes.length) v.episodes = [emptyEpisode(1, "", null)];
    v.currentEpisodeNr = old.currentEpisodeNr || v.episodes[v.episodes.length - 1].nr;
    return v;
  }

  function loadAll() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
      var rawOld = localStorage.getItem(LS_KEY_V2);
      if (!rawOld) return [];
      var old = JSON.parse(rawOld);
      if (!Array.isArray(old)) return [];
      var migrated = old.map(migrateFromV2);
      saveAll(migrated);
      return migrated;
    } catch (e) {
      console.error("AVERA store: konnte Daten nicht laden", e);
      return [];
    }
  }

  function saveAll(list) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.error("AVERA store: konnte Daten nicht speichern", e);
      return false;
    }
  }

  function list() {
    return loadAll().sort(function (a, b) {
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });
  }

  function get(id) {
    var all = loadAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function create(name, org) {
    var all = loadAll();
    var v = newVorhaben(name, org);
    all.push(v);
    saveAll(all);
    return v;
  }

  function update(id, mutateFn) {
    var all = loadAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) {
        mutateFn(all[i]);
        all[i].updatedAt = now();
        saveAll(all);
        return all[i];
      }
    }
    return null;
  }

  function remove(id) {
    saveAll(loadAll().filter(function (v) { return v.id !== id; }));
  }

  function rename(id, name, org) {
    return update(id, function (v) {
      v.name = name;
      v.org = org;
    });
  }

  function getEpisode(v, nr) {
    for (var i = 0; i < v.episodes.length; i++) {
      if (v.episodes[i].nr === nr) return v.episodes[i];
    }
    return null;
  }

  function currentEpisode(v) {
    return getEpisode(v, v.currentEpisodeNr) || v.episodes[v.episodes.length - 1];
  }

  // Innerhalb von update(): Episode holen und an die Mutation reichen.
  function inEpisode(id, nr, fn) {
    return update(id, function (v) {
      var ep = getEpisode(v, nr);
      if (ep) fn(ep, v);
    });
  }

  // ---------- Intention ----------

  function setIntentionText(id, text) {
    return update(id, function (v) {
      var prev = v.intention.text || "";
      if (prev.trim() && prev.trim() !== (text || "").trim()) {
        v.intention.historie.push({ text: prev, zielgruppe: v.intention.zielgruppe || "", geaendertAm: now() });
      }
      v.intention.text = text;
    });
  }

  function setIntentionZielgruppe(id, text) {
    return update(id, function (v) {
      v.intention.zielgruppe = text;
    });
  }

  function setIntentionField(id, phase, index, text) {
    return update(id, function (v) {
      if (!v.intention[phase]) v.intention[phase] = emptyIntentionPhase(phase);
      v.intention[phase][index] = text;
    });
  }

  function addIntentionReflexion(id, episodeNr, text) {
    return update(id, function (v) {
      v.intention.reflexionen.push({ episodeNr: episodeNr, text: text, datum: now() });
    });
  }

  // ---------- Observe: Beobachtungskarten ----------

  function addBeobachtung(id, nr, data) {
    var created = null;
    inEpisode(id, nr, function (ep) {
      created = {
        id: uid("beob"),
        text: data.text || "",
        typ: data.typ === "vermutung" ? "vermutung" : "fakt",
        element: data.element || "",
        createdAt: now()
      };
      ep.beobachtungen.push(created);
    });
    return created;
  }

  function updateBeobachtung(id, nr, beobId, patch) {
    return inEpisode(id, nr, function (ep) {
      var b = ep.beobachtungen.find(function (x) { return x.id === beobId; });
      if (!b) return;
      if (patch.text !== undefined) b.text = patch.text;
      if (patch.typ !== undefined) b.typ = patch.typ;
      if (patch.element !== undefined) b.element = patch.element;
    });
  }

  function removeBeobachtung(id, nr, beobId) {
    return inEpisode(id, nr, function (ep) {
      ep.beobachtungen = ep.beobachtungen.filter(function (b) { return b.id !== beobId; });
    });
  }

  // ---------- Understand: Wirkmodell ----------

  function addHebel(id, nr, text) {
    var created = null;
    inEpisode(id, nr, function (ep) {
      created = { id: uid("hebel"), text: text || "" };
      ep.wirkmodell.hebel.push(created);
    });
    return created;
  }

  function updateHebel(id, nr, hebelId, text) {
    return inEpisode(id, nr, function (ep) {
      var h = ep.wirkmodell.hebel.find(function (x) { return x.id === hebelId; });
      if (h) h.text = text;
    });
  }

  function removeHebel(id, nr, hebelId) {
    return inEpisode(id, nr, function (ep) {
      ep.wirkmodell.hebel = ep.wirkmodell.hebel.filter(function (h) { return h.id !== hebelId; });
    });
  }

  function addHypothese(id, nr, data) {
    var created = null;
    inEpisode(id, nr, function (ep) {
      created = {
        id: uid("hyp"),
        text: data.text || "",
        gegenhypothese: data.gegenhypothese || "",
        element: data.element || ""
      };
      ep.wirkmodell.hypothesen.push(created);
    });
    return created;
  }

  function updateHypothese(id, nr, hypId, patch) {
    return inEpisode(id, nr, function (ep) {
      var h = ep.wirkmodell.hypothesen.find(function (x) { return x.id === hypId; });
      if (!h) return;
      if (patch.text !== undefined) h.text = patch.text;
      if (patch.gegenhypothese !== undefined) h.gegenhypothese = patch.gegenhypothese;
      if (patch.element !== undefined) h.element = patch.element;
    });
  }

  function removeHypothese(id, nr, hypId) {
    return inEpisode(id, nr, function (ep) {
      ep.wirkmodell.hypothesen = ep.wirkmodell.hypothesen.filter(function (h) { return h.id !== hypId; });
      ep.impulse.forEach(function (imp) {
        if (imp.hypotheseId === hypId) imp.hypotheseId = null;
      });
    });
  }

  // ---------- Design: Gestaltungsimpulse ----------

  function addImpuls(id, nr, data) {
    var created = null;
    inEpisode(id, nr, function (ep) {
      created = {
        id: uid("impuls"),
        titel: data.titel || "Gestaltungsimpuls",
        hypotheseId: data.hypotheseId || null,
        objekte: data.objekte || [],
        notiz: data.notiz || ""
      };
      ep.impulse.push(created);
    });
    return created;
  }

  function updateImpuls(id, nr, impulsId, patch) {
    return inEpisode(id, nr, function (ep) {
      var imp = ep.impulse.find(function (x) { return x.id === impulsId; });
      if (!imp) return;
      if (patch.titel !== undefined) imp.titel = patch.titel;
      if (patch.hypotheseId !== undefined) imp.hypotheseId = patch.hypotheseId;
      if (patch.objekte !== undefined) imp.objekte = patch.objekte;
      if (patch.notiz !== undefined) imp.notiz = patch.notiz;
    });
  }

  function removeImpuls(id, nr, impulsId) {
    return inEpisode(id, nr, function (ep) {
      ep.impulse = ep.impulse.filter(function (imp) { return imp.id !== impulsId; });
      ep.architektur.gewaehlt = ep.architektur.gewaehlt.filter(function (x) { return x !== impulsId; });
      delete ep.architektur.weglassen[impulsId];
    });
  }

  // ---------- Architect: Gestaltungsarchitektur ----------

  function setArchitekturAuswahl(id, nr, impulsIds) {
    return inEpisode(id, nr, function (ep) {
      ep.architektur.gewaehlt = impulsIds;
    });
  }

  function setKohaerenzNotiz(id, nr, text) {
    return inEpisode(id, nr, function (ep) {
      ep.architektur.kohaerenzNotiz = text;
    });
  }

  function setWeglassNotiz(id, nr, impulsId, text) {
    return inEpisode(id, nr, function (ep) {
      ep.architektur.weglassen[impulsId] = text;
    });
  }

  // ---------- Gates ----------

  // Ein Gate ist nur durchlässig, wenn eine Begründung hinterlegt ist – das ist
  // die Schwelle aus dem Konzept, kein einfacher "Weiter"-Button.
  function setGate(id, nr, loopKey, offen, begruendung) {
    return inEpisode(id, nr, function (ep) {
      ep.gates[loopKey] = {
        offen: !!offen,
        begruendung: begruendung || "",
        entschiedenAm: offen ? now() : null
      };
    });
  }

  function gateOffen(episode, loopKey) {
    var g = episode.gates[loopKey];
    return !!(g && g.offen && g.begruendung && g.begruendung.trim());
  }

  // Bis zu welcher Schleife ist die Episode freigeschaltet? Eine Schleife ist
  // erreichbar, wenn alle davor liegenden Gates offen sind.
  function loopErreichbar(episode, loopKey) {
    var idx = LOOP_KEYS.indexOf(loopKey);
    for (var i = 0; i < idx; i++) {
      if (!gateOffen(episode, LOOP_KEYS[i])) return false;
    }
    return true;
  }

  function ersteOffeneSchleife(episode) {
    for (var i = 0; i < LOOP_KEYS.length; i++) {
      if (!gateOffen(episode, LOOP_KEYS[i])) return LOOP_KEYS[i];
    }
    return null;
  }

  // ---------- Notiz je Element und Schleife (Zwischenfazit) ----------

  function setLoopElementNote(id, nr, loopKey, elementKey, text) {
    return inEpisode(id, nr, function (ep) {
      ep.loops[loopKey].elemente[elementKey] = text;
    });
  }

  // ---------- Realisierung ----------

  function setStatusQuo(id, nr, text) {
    return inEpisode(id, nr, function (ep) {
      ep.statusQuo = text;
    });
  }

  function realizeEpisode(id, nr, notizText) {
    return inEpisode(id, nr, function (ep) {
      ep.realized = { at: now(), notiz: notizText || "" };
    });
  }

  function addMassnahme(id, nr, text) {
    var created = null;
    inEpisode(id, nr, function (ep) {
      if (!ep.massnahmen) ep.massnahmen = [];
      created = { id: uid("mn"), text: text || "", status: "offen" };
      ep.massnahmen.push(created);
    });
    return created;
  }

  function toggleMassnahme(id, nr, mnId) {
    return inEpisode(id, nr, function (ep) {
      var mn = (ep.massnahmen || []).find(function (m) { return m.id === mnId; });
      if (mn) mn.status = mn.status === "erledigt" ? "offen" : "erledigt";
    });
  }

  function removeMassnahme(id, nr, mnId) {
    return inEpisode(id, nr, function (ep) {
      ep.massnahmen = (ep.massnahmen || []).filter(function (m) { return m.id !== mnId; });
    });
  }

  // Die nächste Episode übernimmt den Status quo aus dem Realisierungs-Ergebnis
  // der Vorgänger-Episode – dort setzt das erneute Beobachten an.
  function startNextEpisode(id) {
    var created = null;
    update(id, function (v) {
      var last = v.episodes[v.episodes.length - 1];
      var statusQuo = last.realized && last.realized.notiz ? last.realized.notiz : "";
      created = emptyEpisode(last.nr + 1, statusQuo, last.nr);
      v.episodes.push(created);
      v.currentEpisodeNr = created.nr;
    });
    return created;
  }

  // ---------- Ableitungen fürs Veränderungsrad ----------

  // Wie weit ist ein Gestaltungselement in dieser Episode berührt? Gezählt wird
  // über die vier Schleifen hinweg: getaggte Beobachtung, Hypothese mit diesem
  // Element, Impuls dazu, und ob dieser Impuls in der Architektur steht.
  function elementLoopBeruehrt(episode, elementKey, loopKey) {
    if (!episode) return false;
    var notiz = episode.loops[loopKey] && episode.loops[loopKey].elemente[elementKey];
    if (notiz && notiz.trim()) return true;

    if (loopKey === "observe") {
      return episode.beobachtungen.some(function (b) { return b.element === elementKey; });
    }
    if (loopKey === "understand") {
      return episode.wirkmodell.hypothesen.some(function (h) { return h.element === elementKey; });
    }
    var hypIds = episode.wirkmodell.hypothesen
      .filter(function (h) { return h.element === elementKey; })
      .map(function (h) { return h.id; });
    if (loopKey === "design") {
      return episode.impulse.some(function (imp) { return imp.hypotheseId && hypIds.indexOf(imp.hypotheseId) !== -1; });
    }
    return episode.impulse.some(function (imp) {
      return imp.hypotheseId && hypIds.indexOf(imp.hypotheseId) !== -1 && episode.architektur.gewaehlt.indexOf(imp.id) !== -1;
    });
  }

  function deriveElementStatus(episode, elementKey) {
    if (!episode) return "offen";
    var count = LOOP_KEYS.filter(function (lk) {
      return elementLoopBeruehrt(episode, elementKey, lk);
    }).length;
    if (count === 0) return "offen";
    if (count === LOOP_KEYS.length) return "etabliert";
    return "in_arbeit";
  }

  function deriveIntentionStatus(v) {
    if (v.intention.text && v.intention.text.trim()) return "etabliert";
    var anyFilled = v.intention.erarbeiten.concat(v.intention.schaerfen).some(function (t) {
      return !!(t && t.trim());
    });
    return anyFilled ? "in_arbeit" : "offen";
  }

  // Kurzfassung des Wirkmodells einer Episode – geht als Kontext in die
  // Understand-KI-Funktion, statt der vollen Historie.
  function wirkmodellKurzfassung(episode) {
    if (!episode) return null;
    return {
      episodeNr: episode.nr,
      hebel: episode.wirkmodell.hebel.map(function (h) { return h.text; }).filter(Boolean),
      hypothesen: episode.wirkmodell.hypothesen.map(function (h) { return h.text; }).filter(Boolean)
    };
  }

  function exportJSON(id) {
    return JSON.stringify(get(id), null, 2);
  }

  function importJSON(jsonText) {
    var parsed = JSON.parse(jsonText);
    if (!parsed || !parsed.episodes) throw new Error("Ungültiges AVERA-Format.");
    var all = loadAll();
    parsed.id = uid("vorhaben");
    parsed.updatedAt = now();
    all.push(parsed);
    saveAll(all);
    return parsed;
  }

  global.AVERA_STORE = {
    LOOP_KEYS: LOOP_KEYS,
    list: list,
    get: get,
    create: create,
    update: update,
    remove: remove,
    rename: rename,
    getEpisode: getEpisode,
    currentEpisode: currentEpisode,
    setIntentionText: setIntentionText,
    setIntentionZielgruppe: setIntentionZielgruppe,
    setIntentionField: setIntentionField,
    addIntentionReflexion: addIntentionReflexion,
    addBeobachtung: addBeobachtung,
    updateBeobachtung: updateBeobachtung,
    removeBeobachtung: removeBeobachtung,
    addHebel: addHebel,
    updateHebel: updateHebel,
    removeHebel: removeHebel,
    addHypothese: addHypothese,
    updateHypothese: updateHypothese,
    removeHypothese: removeHypothese,
    addImpuls: addImpuls,
    updateImpuls: updateImpuls,
    removeImpuls: removeImpuls,
    setArchitekturAuswahl: setArchitekturAuswahl,
    setKohaerenzNotiz: setKohaerenzNotiz,
    setWeglassNotiz: setWeglassNotiz,
    setGate: setGate,
    gateOffen: gateOffen,
    loopErreichbar: loopErreichbar,
    ersteOffeneSchleife: ersteOffeneSchleife,
    setLoopElementNote: setLoopElementNote,
    setStatusQuo: setStatusQuo,
    realizeEpisode: realizeEpisode,
    addMassnahme: addMassnahme,
    toggleMassnahme: toggleMassnahme,
    removeMassnahme: removeMassnahme,
    startNextEpisode: startNextEpisode,
    elementLoopBeruehrt: elementLoopBeruehrt,
    deriveElementStatus: deriveElementStatus,
    deriveIntentionStatus: deriveIntentionStatus,
    wirkmodellKurzfassung: wirkmodellKurzfassung,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
})(window);

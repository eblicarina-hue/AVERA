/*
 * Persistenz für AVERA-Initiativen im Browser (localStorage).
 * Jede Initiative = ein Change-Vorhaben, das in Episoden (volle Drehungen im
 * Rad: Observe -> Understand -> Design -> Architect) bearbeitet wird.
 */
(function (global) {
  "use strict";

  var LS_KEY = "avera:initiatives:v2";

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function emptyLoop() {
    var elemente = {};
    AVERA_DATA.ELEMENTS.forEach(function (el) {
      elemente[el.key] = "";
    });
    return {
      general: { fokus: "", wirkgefuege: "", potenziale: "", pruefung: "" },
      gate: false,
      gateNotiz: "",
      elemente: elemente,
      impulse: [],
      ausgewaehlt: [],
      begruendung: ""
    };
  }

  function emptyEpisode(nr) {
    return {
      nr: nr,
      startedAt: new Date().toISOString(),
      statusQuoNotiz: "",
      loops: {
        observe: emptyLoop(),
        understand: emptyLoop(),
        design: emptyLoop(),
        architect: emptyLoop()
      },
      realized: null
    };
  }

  function emptyIntentionPhase(phaseKey) {
    var count = AVERA_DATA.INTENTION_PHASEN[phaseKey].fragen.length;
    var arr = [];
    for (var i = 0; i < count; i++) arr.push("");
    return arr;
  }

  function newInitiative(name, org) {
    return {
      id: uid("init"),
      name: name || "Neues Projekt",
      org: org || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      intention: {
        erarbeiten: emptyIntentionPhase("erarbeiten"),
        schaerfen: emptyIntentionPhase("schaerfen"),
        statement: "",
        reflexionen: []
      },
      episodes: [emptyEpisode(1)],
      currentEpisodeNr: 1
    };
  }

  function loadAll() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
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
    var init = newInitiative(name, org);
    all.push(init);
    saveAll(all);
    return init;
  }

  function update(id, mutateFn) {
    var all = loadAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) {
        mutateFn(all[i]);
        all[i].updatedAt = new Date().toISOString();
        saveAll(all);
        return all[i];
      }
    }
    return null;
  }

  function remove(id) {
    var all = loadAll().filter(function (init) {
      return init.id !== id;
    });
    saveAll(all);
  }

  function rename(id, name, org) {
    return update(id, function (init) {
      init.name = name;
      init.org = org;
    });
  }

  function getEpisode(init, nr) {
    for (var i = 0; i < init.episodes.length; i++) {
      if (init.episodes[i].nr === nr) return init.episodes[i];
    }
    return null;
  }

  function currentEpisode(init) {
    return getEpisode(init, init.currentEpisodeNr) || init.episodes[init.episodes.length - 1];
  }

  function setIntentionField(id, phase, index, text) {
    return update(id, function (init) {
      if (!init.intention[phase]) init.intention[phase] = emptyIntentionPhase(phase);
      init.intention[phase][index] = text;
    });
  }

  function setIntentionStatement(id, text) {
    return update(id, function (init) {
      init.intention.statement = text;
    });
  }

  function addIntentionReflexion(id, episodeNr, text) {
    return update(id, function (init) {
      init.intention.reflexionen.push({ episodeNr: episodeNr, text: text, datum: new Date().toISOString() });
    });
  }

  function setLoopGeneralNote(id, episodeNr, loopKey, fieldKey, text) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops[loopKey].general[fieldKey] = text;
    });
  }

  function setLoopGate(id, episodeNr, loopKey, value, notizText) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops[loopKey].gate = !!value;
      if (notizText !== undefined) ep.loops[loopKey].gateNotiz = notizText;
    });
  }

  function setLoopElementNote(id, episodeNr, loopKey, elementKey, text) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops[loopKey].elemente[elementKey] = text;
    });
  }

  function addImpuls(id, episodeNr, impuls) {
    var created = null;
    update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      created = {
        id: uid("impuls"),
        name: impuls.name || "Gestaltungsimpuls",
        objekte: impuls.objekte || [],
        notiz: impuls.notiz || ""
      };
      ep.loops.design.impulse.push(created);
    });
    return created;
  }

  function removeImpuls(id, episodeNr, impulsId) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops.design.impulse = ep.loops.design.impulse.filter(function (imp) {
        return imp.id !== impulsId;
      });
      ep.loops.architect.ausgewaehlt = ep.loops.architect.ausgewaehlt.filter(function (impId) {
        return impId !== impulsId;
      });
    });
  }

  function setArchitectSelection(id, episodeNr, impulsIds) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops.architect.ausgewaehlt = impulsIds;
    });
  }

  function setArchitectBegruendung(id, episodeNr, text) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.loops.architect.begruendung = text;
    });
  }

  function setStatusQuoNotiz(id, episodeNr, text) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.statusQuoNotiz = text;
    });
  }

  function realizeEpisode(id, episodeNr, notizText) {
    return update(id, function (init) {
      var ep = getEpisode(init, episodeNr);
      if (!ep) return;
      ep.realized = { at: new Date().toISOString(), notiz: notizText || "" };
    });
  }

  function startNextEpisode(id) {
    var created = null;
    update(id, function (init) {
      var last = init.episodes[init.episodes.length - 1];
      var nextNr = last.nr + 1;
      created = emptyEpisode(nextNr);
      init.episodes.push(created);
      init.currentEpisodeNr = nextNr;
    });
    return created;
  }

  // Für die Rad-Übersicht: grober Status je Element in der aktuellen Episode,
  // abgeleitet daraus, in wie vielen der vier Schleifen bereits Notizen stehen.
  function deriveElementStatus(episode, elementKey) {
    if (!episode) return "offen";
    var loopKeys = ["observe", "understand", "design", "architect"];
    var filled = loopKeys.filter(function (lk) {
      var text = episode.loops[lk].elemente[elementKey];
      return !!(text && text.trim());
    }).length;
    if (filled === 0) return "offen";
    if (filled === loopKeys.length) return "etabliert";
    return "in_arbeit";
  }

  function deriveIntentionStatus(init) {
    if (init.intention.statement && init.intention.statement.trim()) return "etabliert";
    var anyFilled = init.intention.erarbeiten.concat(init.intention.schaerfen).some(function (t) {
      return !!(t && t.trim());
    });
    return anyFilled ? "in_arbeit" : "offen";
  }

  function exportJSON(id) {
    var init = get(id);
    return JSON.stringify(init, null, 2);
  }

  function importJSON(jsonText) {
    var parsed = JSON.parse(jsonText);
    if (!parsed || !parsed.episodes) throw new Error("Ungültiges AVERA-Initiativen-Format.");
    var all = loadAll();
    parsed.id = uid("init");
    parsed.updatedAt = new Date().toISOString();
    all.push(parsed);
    saveAll(all);
    return parsed;
  }

  global.AVERA_STORE = {
    list: list,
    get: get,
    create: create,
    update: update,
    remove: remove,
    rename: rename,
    getEpisode: getEpisode,
    currentEpisode: currentEpisode,
    setIntentionField: setIntentionField,
    setIntentionStatement: setIntentionStatement,
    addIntentionReflexion: addIntentionReflexion,
    setLoopGeneralNote: setLoopGeneralNote,
    setLoopGate: setLoopGate,
    setLoopElementNote: setLoopElementNote,
    addImpuls: addImpuls,
    removeImpuls: removeImpuls,
    setArchitectSelection: setArchitectSelection,
    setArchitectBegruendung: setArchitectBegruendung,
    setStatusQuoNotiz: setStatusQuoNotiz,
    realizeEpisode: realizeEpisode,
    startNextEpisode: startNextEpisode,
    deriveElementStatus: deriveElementStatus,
    deriveIntentionStatus: deriveIntentionStatus,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
})(window);

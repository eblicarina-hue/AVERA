/*
 * Persistenz für AVERA-Initiativen im Browser (localStorage).
 * Jede Initiative = ein Change-Vorhaben eines Unternehmens/Teams.
 */
(function (global) {
  "use strict";

  var LS_KEY = "avera:initiatives:v1";

  function uid() {
    return "init_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  function emptyStationState() {
    return { status: "offen", checked: [], answers: {}, objekte: [], notiz: "" };
  }

  function newInitiative(name, org) {
    var stations = {};
    AVERA_DATA.STATIONS.forEach(function (s) {
      stations[s.key] = emptyStationState();
    });
    return {
      id: uid(),
      name: name || "Neue Veränderungsinitiative",
      org: org || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stations: stations
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

  function setStatus(id, stationKey, status) {
    return update(id, function (init) {
      if (!init.stations[stationKey]) init.stations[stationKey] = emptyStationState();
      init.stations[stationKey].status = status;
    });
  }

  function toggleChecklist(id, stationKey, index, checked) {
    return update(id, function (init) {
      var st = init.stations[stationKey] || (init.stations[stationKey] = emptyStationState());
      var set = new Set(st.checked || []);
      if (checked) set.add(index);
      else set.delete(index);
      st.checked = Array.from(set);
    });
  }

  function setAnswer(id, stationKey, index, text) {
    return update(id, function (init) {
      var st = init.stations[stationKey] || (init.stations[stationKey] = emptyStationState());
      st.answers[index] = text;
    });
  }

  function setNotiz(id, stationKey, text) {
    return update(id, function (init) {
      var st = init.stations[stationKey] || (init.stations[stationKey] = emptyStationState());
      st.notiz = text;
    });
  }

  function setObjekte(id, stationKey, objekte) {
    return update(id, function (init) {
      var st = init.stations[stationKey] || (init.stations[stationKey] = emptyStationState());
      st.objekte = objekte;
    });
  }

  function exportJSON(id) {
    var init = get(id);
    return JSON.stringify(init, null, 2);
  }

  function importJSON(jsonText) {
    var parsed = JSON.parse(jsonText);
    if (!parsed || !parsed.stations) throw new Error("Ungültiges AVERA-Initiativen-Format.");
    var all = loadAll();
    parsed.id = uid();
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
    setStatus: setStatus,
    toggleChecklist: toggleChecklist,
    setAnswer: setAnswer,
    setNotiz: setNotiz,
    setObjekte: setObjekte,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
})(window);

# AVERA Change-App

Eine schlanke Web-App, die Unternehmen dabei begleitet, Veränderungs- und
Lerninitiativen so aufzusetzen, wie es das **AVERA-Framework** (Admonter
Veränderungsrad) beschreibt: nicht bei der sichtbarsten Maßnahme beginnen,
sondern bei der Intention – und von dort aus Schritt für Schritt Bedeutung,
Möglichkeiten, Relevanz, Lernen, soziale Verstärkung und passende Methoden
gestalten, mit Raum & Zeit als Dreh- und Angelpunkt.

## Was die App macht

- **Rad-Ansicht:** Jede Veränderungsinitiative wird als AVERA-Rad
  dargestellt – Intention als Startpunkt, die sechs Gestaltungselemente
  (Story & Narrativ, Organisation & Kultur, Führung & Alltag, Entdecken &
  Aneignen, Peers & Resonanz, Methoden & Formate) im Kreis, Raum & Zeit im
  Zentrum.
- **Stationen bearbeiten:** Zu jedem Element gibt es die Kernfragen aus dem
  AVERA-Framework, eine Checkliste ("Was ist zu tun?"), typische Fallen,
  Beobachtungshinweise, Reflexionsfragen für das Team und eine Auswahl an
  Gestaltungsobjekten (konkrete Maßnahmen), die frei ergänzt werden können.
- **Geisterfahrt-Check:** Die App erkennt automatisch, wenn an einem
  Element bereits gearbeitet wird, während ein vorgelagertes Element im Rad
  noch komplett offen ist – genau das Muster, vor dem AVERA warnt
  ("Geisterfahrt": am sichtbaren Ende statt an der Ursache gestalten).
- **Balance-Dashboard:** Fortschritt je Dimension (Wollen / Dürfen /
  Können) macht sichtbar, ob eine Initiative einseitig auf Kommunikation,
  Struktur oder Methoden setzt.
- **Export:** Aus allen Eingaben entsteht eine druckbare/als Markdown
  exportierbare "Gestaltungsarchitektur" – das fertige Change-Konzept.
- Mehrere Initiativen (Unternehmen/Teams) lassen sich parallel anlegen und
  verwalten.

## Verwendung

Keine Installation, kein Build-Schritt nötig – reines HTML/CSS/JS.

```bash
# Variante 1: Datei direkt öffnen
open index.html          # macOS
# oder einfach index.html im Browser öffnen

# Variante 2: lokal servieren (empfohlen, z. B. für GitHub Pages)
npx serve .
# oder
python3 -m http.server 8000
```

Alle Daten werden ausschließlich lokal im Browser (`localStorage`)
gespeichert – es gibt kein Backend und keine externen Aufrufe.

## Deployment (optional)

Da die App vollständig statisch ist, lässt sie sich direkt über
**GitHub Pages** ausliefern (Settings → Pages → Branch wählen) oder auf
jedem beliebigen Static-Hosting-Dienst (Netlify, Vercel, etc.) bereitstellen.

## Projektstruktur

```
index.html
assets/
  css/style.css        # Styling (hell/dunkel automatisch)
  js/data.js            # AVERA-Framework-Inhalte (Elemente, Fragen, Fallen …)
  js/store.js            # Persistenz der Initiativen (localStorage)
  js/wheel.js             # SVG-Rad-Visualisierung
  js/export.js             # Export der Gestaltungsarchitektur als Markdown
  js/app.js                 # Views, Routing, Geisterfahrt-Check, Balance-Dashboard
```

## Quelle des Frameworks

Die inhaltliche Grundlage (Gestaltungselemente, Reflexionsfragen, Fallen,
Gestaltungsobjekte) basiert auf dem **AVERA White Paper 2.0** der
Corporate Learning Community Österreich (#CLCA), lizenziert unter
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

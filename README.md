# Power BI Theme Designer

[![CI](https://github.com/marlonetzel06/Power-Bi-JSON-Designer/actions/workflows/ci.yml/badge.svg)](https://github.com/marlonetzel06/Power-Bi-JSON-Designer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Deutsch** · [English](#english)

Ein Theme-Designer für Power BI im Stil von Power BI Desktop: Eine Berichtsseite mit allen Visuals nach Kategorie gruppiert in der Mitte, rechts die Bereiche **Visualisierungen** (Formatbereich mit *Visual | Allgemein*), **Design anpassen** und **JSON**. Jede Änderung ist sofort in der Vorschau sichtbar, wird gegen das offizielle Power-BI-Theme-Schema geprüft und als gültiges Theme-JSON exportiert.

## Funktionen

- **Vorschau ohne Anmeldung** – 43 Visualtypen als theme-getriebene SVG-Nachbildungen. Dargestellt werden u. a. Linienglättung und Stufen, Strichmuster, Markierungen, sekundäre Achsen, feste Achsenbereiche, Bezugslinien mit Schattierung und Beschriftung, Datenbeschriftungs-Positionen, Fehlerbalken, Anomalien, Prognose, Gesamtbeschriftungen, Lücken zwischen Säulen, Titelumbruch, innere Schatten, Unterüberschrift, Tabellen-Sparklines und Leerzeilen, Karte (neu) mit Referenzbeschriftungen und Kachelformen, KPI-Status, Datenschnitt-Zustände, Schaltflächen-Symbole, -Schatten und -Drehung.
- **Zustände wie in Power BI** – Umschalter „Zustand“ im Formatbereich (Standard, Beim Daraufzeigen, Beim Drücken, Deaktiviert; Datenschnitte zusätzlich Ausgewählt/Erweitert …), Filterkarten getrennt nach „Angewendet“ und „Verfügbar“, Matrix-Zwischensummen nach Zeilen/Spalten. Zustandswerte landen als `$id`-Einträge im JSON, die Vorschau zeigt den gewählten Zustand.
- **Live-Vorschau (optional)** – im Fokusmodus ein echter eingebetteter Power-BI-Report, der das aktuelle Theme per `applyTheme` übernimmt. Benötigt Azure-AD-App und veröffentlichten Beispielreport.
- **Formatbereich wie Power BI Desktop** – Karten pro Visual mit Umschalter im Kartenkopf, Suche, „Auf Standard zurücksetzen“ pro Karte und Visual, Übertragen auf ähnliche Visuals, Vererbungsanzeige (Visual → alle Visuals → Power-BI-Standard).
- **Design anpassen** – Designeinstellungen, Farben (Datenfarben, Struktur-, Stimmungs-, divergierende Farben, Paletten-Generator, Vorlagen), Text (alle 14 Textklassen; sie wirken auf Titel, Beschriftungen, Legendenwerte und Kopfzeilen der Vorschau, solange die Karte nichts anderes setzt), Visualeigenschaften, Seite, Filterbereich, Filterkarten.
- **Prüfung gegen das offizielle Schema** – `ajv` + `reportThemeSchema` (Version 2.144 / 5.65) plus Hinweise (Kontrast, fehlende Datenfarben); unbekannte Karten und Eigenschaften werden auch für `report`, `filter` und `group` gemeldet. Fehler mit Sprung zur betroffenen Karte. Jeder Export trägt `$schema` und behält `icons`.
- **Basisdesign wie Power BI** – Werte, die das eigene Design nicht setzt, kommen aus Microsofts Basisdesign *Classic 2026* (`CY26SU02`, aus der Beispiel-`.pbix` extrahiert), in derselben Reihenfolge wie in Power BI: eigenes Visual → Basis-Visual → eigenes „Alle Visuals“ → Basis „Alle Visuals“. Der Formatbereich zeigt die Herkunft jedes Werts.
- **Import** – Theme-JSON (inkl. Migration älterer Export-Formate) und PBIP-Projekte (`RegisteredResources`-Theme oder Extraktion aus den `visual.json`-Dateien).
- **Export** – vollständiges Theme oder nur die Änderungen (Delta) gegenüber dem geladenen Stand.
- **Rückgängig/Wiederholen**, lokale Persistenz, Deutsch/Englisch, Hell/Dunkel, Tastaturbedienung.

## Schnellstart

```bash
cd react-app
npm ci
npm run dev        # http://localhost:5173
```

Ohne weitere Konfiguration läuft die App vollständig mit der Mock-Vorschau. Die Live-Vorschau ist dann deaktiviert (Tooltip erklärt warum).

## Benutzung

1. Visual auf der Berichtsseite oder in der Galerie rechts anklicken. Die Seite zeigt alle Visuals nach Kategorie gruppiert; das Suchfeld oben filtert sie.
2. Im Formatbereich die Karten anpassen – Registerkarte **Visual** für visual-spezifische Karten, **Allgemein** für Titel, Effekte, Kopfzeilensymbole, QuickInfos.
3. Globale Einstellungen unter **Design anpassen** (Symbol in der Kopfzeile).
4. **Fokusmodus** (Doppelklick oder Symbol am ausgewählten Visual) zeigt ein Visual groß; mit Konfiguration auch **Live**.
5. **Design → Design exportieren**. In Power BI Desktop: *Ansicht → Designs → Nach Designs suchen*.

Tastatur: `Strg+Z` / `Strg+Y` Rückgängig/Wiederholen, `Esc` Auswahl aufheben bzw. Fokusmodus verlassen, Pfeiltasten am Bereichstrenner ändern die Breite.

## Live-Vorschau einrichten (optional)

1. `powerbi/All_visuals_template.pbix` in Power BI Desktop öffnen und in einen Arbeitsbereich veröffentlichen. Der Report enthält 31 Seiten mit je einem Visual (Seitenliste: `react-app/src/embed/pbixPages.fixture.json`, nach Änderungen mit `python3 react-app/scripts/pbix-pages.py` neu erzeugen). Zur Laufzeit werden die Seiten per API inspiziert; Visuals ohne Seite (z. B. KPI, Karte mit mehreren Zeilen, Zerlegungsstruktur, Schaltflächen, Textfeld, Form, Bild) fallen im Live-Modus auf die Mock-Vorschau zurück.
2. App-Registrierung in Entra ID (SPA, Redirect-URI = App-URL, delegierte Berechtigung `Power BI Service → Report.Read.All`).
3. `react-app/.env.example` nach `react-app/.env.local` kopieren und ausfüllen:

| Variable | Bedeutung |
|---|---|
| `VITE_MSAL_CLIENT_ID` | Anwendungs-ID der App-Registrierung |
| `VITE_MSAL_AUTHORITY` | `https://login.microsoftonline.com/<tenant-id>` |
| `VITE_MSAL_REDIRECT_URI` | URL der App (dev: `http://localhost:5173`) |
| `VITE_PBI_REPORT_ID` | Report-ID aus der Power-BI-URL |
| `VITE_PBI_WORKSPACE_ID` | Arbeitsbereichs-ID aus der Power-BI-URL |

Diese Werte sind öffentliche Client-Konfiguration, keine Geheimnisse. Für GitHub Pages werden sie als *Repository variables* gesetzt (siehe `.github/workflows/deploy-pages.yml`).

## Projektstruktur

```
react-app/
├─ schema/                  offizielles Power-BI-Theme-Schema (vendored)
├─ scripts/generate-pbi-catalog.ts   Schema → src/pbi/generated/{catalog,schemaKeys}.json
├─ src/pbi/                 Domäne: Typen, Kuration (Visuals, Karten, Labels, Defaults),
│                           Resolver, Builder (Export/Delta), Importer (JSON, PBIP), Validator
├─ src/store/               Zustand-Stores (Theme mit Undo/Persistenz, UI)
├─ src/preview/             SVG-Mock-Renderer pro Visualtyp
├─ src/embed/               MSAL-Statusmaschine und das eine Live-Embed
├─ src/ui/                  Radix-basierte Primitives mit M&M-Tokens
├─ src/features/            Shell, Canvas, Formatbereich, Design anpassen, JSON, Import/Export
├─ src/i18n/                de.ts / en.ts
└─ tests/                   Playwright-E2E-Tests (inkl. axe)
```

## Entwicklung

```bash
npm run check          # lint + typecheck + Unit-Tests + Build
npm run test:e2e       # Playwright (startet den Dev-Server selbst)
npm run generate:catalog   # nach einem Schema-Update neu erzeugen und committen
```

**Schema aktualisieren:** neue `reportThemeSchema-*.json` aus [microsoft/powerbi-desktop-samples](https://github.com/microsoft/powerbi-desktop-samples/tree/main/Report%20Theme%20JSON%20Schema) nach `react-app/schema/` legen, Dateinamen in `scripts/generate-pbi-catalog.ts` und `src/pbi/validate.ts` anpassen, `npm run generate:catalog` ausführen. Der Generator bricht ab, wenn eine kuratierte Karte oder Eigenschaft im Schema fehlt.

`archive/` enthält den ursprünglichen Single-File-HTML-Editor – nur Referenz, nicht gewartet.

## Bekannte Einschränkungen

- **Die Vorschau ist eine Nachbildung.** Geometrie, Beschriftungslogik und automatische Skalierung von Power BI werden angenähert, nicht reproduziert. Auf macOS und Linux fehlt Segoe UI, es wird mit IBM Plex Sans gerendert. Für die Abnahme eines Designs bleibt der Live-Modus oder Power BI Desktop der Referenzpunkt.
- **Live-Modus** ist implementiert und mit simuliertem MSAL getestet, aber nicht gegen einen echten Tenant verifiziert.
- **Bedingte Formatierung (`fillRule`), Bild-Objekte und Stilvorlagen (`stylePresets`)** werden beim Import erhalten, exportiert und schreibgeschützt angezeigt, aber nicht im Editor bearbeitet. `$id`-Zustände (Filterkarten „Angewendet/Verfügbar“, Schaltflächen-/Datenschnitt-Zustände, Matrix-Zwischensummen Zeilen/Spalten) sind editierbar und werden in der Vorschau dargestellt.
- Die Kuration deckt die sichtbaren Eigenschaften der 43 Visuals ab (ca. 5 300 Eigenschaften in 207 Kartendefinitionen, jede mit deutscher Beschriftung); ein Test belegt, dass alles Kuratierte schema-gültig ist. Nicht angeboten: Kleine Multiplikatoren (Layoutkarte vorhanden, keine Vorschau), Barrierefreiheits- und Spaltenbreiten-Karten, Daten-/Filter-Bindungen. Alles andere bleibt per JSON erreichbar.
- Das Basisdesign ist fest *Classic 2026*; andere Basisdesigns (Fluent 2, Classic 2018) müssten aus einer entsprechend gespeicherten `.pbix` extrahiert werden.
- `powerbi/All_visuals_template.pbix` enthält Tenant- und Arbeitsbereichs-IDs aus dem Ursprungsreport (keine Geheimnisse). Bereinigung nur mit Power BI Desktop möglich.
- Gemessene Bearbeitungslatenz im Produktions-Build: ca. 23 ms pro Änderung bei geöffnetem Formatbereich und 43 Visuals auf der Seite (Chromium, 1680 px). Im Dev-Server ist es wegen der React-Entwicklungsinstrumentierung ein Mehrfaches.

---

## English

A Power BI theme designer that mirrors Power BI Desktop: a report page with every visual in the centre, the **Visualizations** pane (format pane with *Visual | General*), **Customize theme** and **JSON** on the right. Every change is reflected in the preview immediately, validated against the official Power BI theme schema and exported as valid theme JSON.

### Features

- **Preview without sign-in** – 43 visual types as theme-driven SVG mocks: line smoothing and steps, dash patterns, markers, secondary axes, fixed axis ranges, reference lines with shading and labels, data label positions, error bars, anomalies, forecast, totals, clustered gaps, title wrap, inner shadows, subheader, table sparklines and blank rows, new card with reference labels and tile shapes, KPI status, slicer states, button icons/shadows/rotation.
- **States like Power BI** – a "State" switch in the format pane (default, hover, press, disabled; slicers also selected/expanded …), filter cards split into applied/available, matrix subtotals rows/columns. State values are written as `$id` entries; the preview renders the chosen state.
- **Live preview (optional)** – a real embedded Power BI report in focus mode, themed via `applyTheme`. Needs an Azure AD app and a published sample report.
- **Format pane like Power BI Desktop** – per-visual cards with header toggles, search, reset per card and per visual, copy to similar visuals, inheritance indicator (visual → all visuals → Power BI default).
- **Customize theme** – theme settings, colours (data, structural, sentiment, divergent, palette generator, presets), text (all 14 text classes), visual properties, page, filter pane, filter cards.
- **Validation against the official schema** – `ajv` + `reportThemeSchema` (2.144 / 5.65) plus semantic warnings, including unknown cards/properties under `report`, `filter` and `group`; issues link to the affected card. Exports carry `$schema` and keep `icons`.
- **Base theme like Power BI** – anything the custom theme does not set comes from Microsoft's *Classic 2026* base theme (`CY26SU02`, extracted from the sample `.pbix`), resolved in Power BI's order: custom visual → base visual → custom "all visuals" → base "all visuals".
- **Import** of theme JSON (with migration of older export formats) and PBIP projects; **export** of the full theme or the delta against the loaded baseline.
- Text classes feed the preview (title, labels, callout values, headers) unless a card overrides them.
- Undo/redo, local persistence, German/English, light/dark, keyboard operable.

### Quick start

```bash
cd react-app
npm ci
npm run dev        # http://localhost:5173
```

The app works fully with the mock preview and no configuration. To enable the live preview, publish `powerbi/All_visuals_template.pbix`, register an Entra ID SPA app with the delegated `Power BI Service → Report.Read.All` permission and fill `react-app/.env.local` (see the table above). These `VITE_*` values are public client configuration, not secrets.

### Known limitations

The preview is an approximation of Power BI's rendering (no Segoe UI on macOS/Linux); the live mode is tested with a simulated MSAL only; conditional formatting (`fillRule`), image objects and style presets are preserved and shown read-only but not editable, while `$id` states (filter cards applied/available, button and slicer states, matrix subtotals rows/columns) are editable with a state preview; the curation covers the visible properties of the 43 visuals (about 5,300 properties, all German-labelled, proven schema-valid by a test) but not small multiples, accessibility/column-width cards or data bindings; the base theme is fixed to *Classic 2026*; the sample `.pbix` still carries tenant and workspace IDs from the original report.

### Development

`npm run check` (lint, typecheck, unit tests, build), `npm run test:e2e` (Playwright incl. axe), `npm run generate:catalog` after a schema update. See [CONTRIBUTING.md](CONTRIBUTING.md).

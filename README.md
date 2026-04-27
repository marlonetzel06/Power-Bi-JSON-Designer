# Power BI JSON Designer

A web-based editor for creating and customizing Power BI theme files (`.json`). No installation required — open the HTML file in your browser and start designing.

> **Deutsch:** Ein webbasierter Editor zum Erstellen und Anpassen von Power BI Theme-Dateien (`.json`). Keine Installation nötig — einfach die HTML-Datei im Browser öffnen und loslegen.

---

## Features

- **Visual theme editor** — adjust colors, fonts, and styles through an intuitive UI
- **Live preview** — see changes reflected in real time
- **JSON export** — download the finished theme file ready for import into Power BI Desktop
- **Supports all common visuals** — bar charts, line charts, cards, tables, slicers, and more


### Funktionen

- **Visueller Theme-Editor** — Farben, Schriften und Stile über eine intuitive Oberfläche anpassen
- **Live-Vorschau** — Änderungen werden in Echtzeit angezeigt
- **JSON-Export** — fertiges Theme herunterladen und direkt in Power BI Desktop importieren
- **Unterstützt alle gängigen Visuals** — Balkendiagramme, Liniendiagramme, Karten, Tabellen, Slicer und mehr


---

## Getting Started

1. Clone or download this repository
2. Open `PowerBI_Theme/theme_editor.html` in any modern browser
3. Customize your theme using the editor
4. Click **Export** to download the `.json` file
5. In Power BI Desktop: **View → Themes → Browse for themes** → select your file

### Erste Schritte

1. Dieses Repository klonen oder herunterladen
2. `PowerBI_Theme/theme_editor.html` in einem modernen Browser öffnen
3. Theme nach Wunsch anpassen
4. Auf **Export** klicken, um die `.json`-Datei herunterzuladen
5. In Power BI Desktop: **Ansicht → Designs → Nach Designs suchen** → Datei auswählen

---

## Project Structure

```
PowerBI_Theme/
├── theme_editor.html         # Web-based editor UI (no build step needed)
├── Customer360_Theme.json    # Example Power BI theme (ready to import)
├── fix_schema.py             # Utility script for JSON schema validation
├── package.json              # Node.js config (used for Playwright tests)
├── playwright.config.js      # Playwright test configuration
└── tests/                    # End-to-end tests (Playwright)
    ├── agentic-features.spec.js
    ├── property-settings.spec.js
    ├── visual-rendering.spec.js
    └── visual-rendering-full.spec.js
```

### Projektstruktur

```
PowerBI_Theme/
├── theme_editor.html         # Webbasierter Editor (kein Build-Schritt nötig)
├── Customer360_Theme.json    # Beispiel-Theme für Power BI (direkt importierbar)
├── fix_schema.py             # Hilfsskript zur JSON-Schema-Validierung
├── package.json              # Node.js-Konfiguration (für Playwright-Tests)
├── playwright.config.js      # Playwright-Testkonfiguration
└── tests/                    # End-to-End-Tests (Playwright)
    ├── agentic-features.spec.js
    ├── property-settings.spec.js
    ├── visual-rendering.spec.js
    └── visual-rendering-full.spec.js
```

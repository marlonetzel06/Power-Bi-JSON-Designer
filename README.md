# Power BI JSON Theme Designer

A React-based web application for creating and customizing Power BI report themes with live preview. Design your theme visually, see changes in real time on an embedded Power BI report, and export the finished JSON.

> **Deutsch:** Eine React-Webanwendung zum Erstellen und Anpassen von Power BI Report-Themes mit Live-Vorschau. Theme visuell gestalten, Änderungen in Echtzeit auf einem eingebetteten Power BI Report sehen und fertiges JSON exportieren.

---

## Features

- **Visual theme editor** — adjust colors, fonts, and styles per visual type
- **Live Power BI preview** — see changes on a real embedded report
- **Palette generator** — generate harmonious color palettes with one click
- **JSON export** — download or copy the theme JSON, ready for Power BI Desktop
- **Dark mode** — comfortable editing in any lighting
- **Edit modal** — fine-tune individual visual properties with a dedicated editor

### Funktionen

- **Visueller Theme-Editor** — Farben, Schriften und Stile pro Visual-Typ anpassen
- **Live Power BI Vorschau** — Änderungen auf einem echten eingebetteten Report sehen
- **Paletten-Generator** — harmonische Farbpaletten per Klick erzeugen
- **JSON-Export** — Theme-JSON herunterladen oder kopieren, fertig für Power BI Desktop
- **Dark Mode** — komfortables Arbeiten bei jedem Licht
- **Edit-Modal** — einzelne Visual-Eigenschaften im Detail bearbeiten

---

## Prerequisites / Voraussetzungen

| Requirement | Details |
|-------------|---------|
| **Node.js** | v18+ (includes npm) |
| **Power BI Pro or PPU license** | Required to publish and embed the report |
| **Azure AD (Entra ID) App Registration** | For authentication with Power BI Service |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd "JSON Designer"

# 2. Install dependencies
cd react-app
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your values (see below)

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Schnellstart

```bash
# 1. Repository klonen
git clone <repo-url>
cd "JSON Designer"

# 2. Abhängigkeiten installieren
cd react-app
npm install

# 3. Umgebung konfigurieren
cp .env.example .env.local
# Werte eintragen (siehe unten)

# 4. Entwicklungsserver starten
npm run dev
```

Die App ist dann unter `http://localhost:5173` erreichbar.

---

## Power BI Setup

1. Open `powerbi/All_visuals_template.pbix` in **Power BI Desktop**
2. Click **Publish** → select your workspace
3. Open the published report in Power BI Service
4. Copy the **Report ID** and **Workspace ID** from the URL:
   ```
   https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/...
   ```
5. Paste them into `react-app/.env.local`:
   ```env
   VITE_PBI_REPORT_ID=your-report-id
   VITE_PBI_WORKSPACE_ID=your-workspace-id
   ```

### Power BI Einrichtung

1. `powerbi/All_visuals_template.pbix` in **Power BI Desktop** öffnen
2. **Veröffentlichen** klicken → Arbeitsbereich wählen
3. Veröffentlichten Report im Power BI Service öffnen
4. **Report-ID** und **Workspace-ID** aus der URL kopieren:
   ```
   https://app.powerbi.com/groups/{WORKSPACE_ID}/reports/{REPORT_ID}/...
   ```
5. In `react-app/.env.local` eintragen:
   ```env
   VITE_PBI_REPORT_ID=deine-report-id
   VITE_PBI_WORKSPACE_ID=deine-workspace-id
   ```

---

## Azure AD App Registration

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
   - Name: `PBI Theme Designer` (or any name)
   - Supported account types: choose based on your org
   - Redirect URI: `http://localhost:5173` (Single-page application)
3. Under **API permissions** → Add:
   - `Power BI Service` → `Report.Read.All` (Delegated)
4. Copy the **Application (client) ID** and **Directory (tenant) ID**
5. Add to `react-app/.env.local`:
   ```env
   VITE_MSAL_CLIENT_ID=your-client-id
   VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
   VITE_MSAL_REDIRECT_URI=http://localhost:5173
   ```

### Azure AD App-Registrierung

1. Im [Azure Portal → App-Registrierungen](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. **Neue Registrierung** klicken
   - Name: `PBI Theme Designer` (oder beliebig)
   - Unterstützte Kontotypen: je nach Organisation wählen
   - Umleitungs-URI: `http://localhost:5173` (Single-Page-Anwendung)
3. Unter **API-Berechtigungen** → Hinzufügen:
   - `Power BI Service` → `Report.Read.All` (Delegiert)
4. **Anwendungs-ID (Client-ID)** und **Verzeichnis-ID (Tenant-ID)** kopieren
5. In `react-app/.env.local` eintragen:
   ```env
   VITE_MSAL_CLIENT_ID=deine-client-id
   VITE_MSAL_AUTHORITY=https://login.microsoftonline.com/deine-tenant-id
   VITE_MSAL_REDIRECT_URI=http://localhost:5173
   ```

---

## Environment Variables

All environment variables are configured in `react-app/.env.local`. See `react-app/.env.example` for a template.

| Variable | Description |
|----------|-------------|
| `VITE_MSAL_CLIENT_ID` | Azure AD App client ID |
| `VITE_MSAL_AUTHORITY` | `https://login.microsoftonline.com/<tenant-id>` |
| `VITE_MSAL_REDIRECT_URI` | `http://localhost:5173` (dev) |
| `VITE_PBI_REPORT_ID` | Power BI report ID (from URL) |
| `VITE_PBI_WORKSPACE_ID` | Power BI workspace/group ID (from URL) |

---

## Project Structure / Projektstruktur

```
├── react-app/              # Main application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # UI components (Sidebar, Toolbar, EditModal, etc.)
│   │   ├── config/         # MSAL configuration
│   │   ├── constants/      # Visual definitions, property maps
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # Helper functions
│   ├── .env.example        # Environment variable template
│   ├── package.json
│   └── vite.config.js
├── powerbi/                # Power BI template file (.pbix)
├── archive/                # Legacy HTML-based editor (deprecated)
└── README.md               # This file
```

---

## Usage / Nutzung

1. **Sign in** with your Microsoft account (top-right)
2. The embedded Power BI report loads as live preview
3. Use the **Sidebar** to select visual types
4. Click a visual card to open the **Edit Modal**
5. Adjust colors, fonts, borders — changes reflect live
6. Use the **Palette Generator** to create color schemes
7. Open the **JSON Panel** to view/copy/download the theme file
8. Import the downloaded `.json` in Power BI Desktop: **View → Themes → Browse for themes**

---

## Archive

The `archive/` folder contains the original HTML-based single-file theme editor. It is kept for reference but is no longer maintained.

# Bewusste Abweichungen vom Rayfin-Standard (werden von `critique` nicht erneut geflaggt)

nav-sidebar — Keine linke Sidebar-Navigation. Die App bildet die Oberfläche von Power BI Desktop nach (Canvas = Berichtsseite, rechte Bereiche „Visualisierungen“ / „Design anpassen“ / „JSON“, Seitenregister unten), weil die Zielgruppe Power-BI-Entwickler sind und das Klickverhalten dem Format-/Theme-Bereich von Power BI entsprechen soll. Farben, Fonts, Radien, Motion und Fokusring bleiben M&M-Token.
nav-icon-only — Die Visual-Galerie ist ein Icon-Raster ohne Beschriftung (wie in Power BI Desktop). Jeder Eintrag hat `aria-label` und Tooltip; die Auswahl wird im Format-Bereich namentlich wiederholt.
data-density-pane — Format- und Theme-Bereich sind bewusst dicht (12–13 px, 28-px-Controls), weil sie den Power-BI-Formatbereich 1:1 nachbilden; Hit-Areas der Icon-Buttons sind per Pseudo-Element auf 44 px erweitert.

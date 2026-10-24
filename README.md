# Tesla TV

Browserbasierter IPTV-Player für Xtream-Codes-M3U-Playlists und M3U-Dateien.

## Start

GitHub Pages aktivieren: Repository → Settings → Pages → Deploy from a branch → main → /(root).

Danach ist die App unter https://jorgepnt-design.github.io/Tesla-tv/ erreichbar (nach erfolgreicher Veröffentlichung).

## Funktionen
- Xtream Server-URL + Benutzername + Passwort (holt eine M3U-Playlist über `get.php`)
- M3U/M3U8 Playlist-URL oder lokale M3U-Datei
- Live-Sender, Kategorien, Suche, Favoriten
- HTML5-Player mit hls.js-Unterstützung
- Optionales lokales Speichern der Zugangsdaten (im Browser, unverschlüsselt)

## Einschränkungen
- Bei GitHub Pages benötigen Remote-Playlists und Streams HTTPS sowie geeignete CORS-Freigaben.
- Manche IPTV-Dienste blockieren Browserabrufe, haben nicht unterstützte Codecs oder verlangen DRM.
- Die App enthält **keinen** CORS-Proxy und keinen Server, der Zugangsdaten empfängt.
- Kein Umgehen von Tesla-Fahrzeugsperren: Videowiedergabe nur im Stand.
- Nur Inhalte verwenden, für die Nutzungsrechte bestehen.

Kein kommerzieller IPTV-Dienst und keine Streams sind enthalten.

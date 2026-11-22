# HoloLith v3 — visual consistency + Photon Runner

Base: HoloLith redesign / Photon Runner v2. Copy this patch over the EXISTING v2 working tree (do not replace all site files).

- All interior pages inherit a light/dark glass panel and aligned card treatment through `hl-interior` body class. Hugo Blox content and page templates stay unchanged.
- Photon Runner embeds a much larger 16:9 play field. Its iframe reports its document height to the parent; a visible full-screen link is an alternative for small displays. The repeated game introduction has been collapsed into an optional `<details>` control. The university affiliation bar is hidden on `/play/` only, keeping site navbar/footer.
- People card uses the original `assets/media/welcome.jpg` group photo, processed with Hugo Pipes (image remains in its original location).
- Gallery, Play, Contact no longer have the left-hand action; their right-hand cards remain links.
- Animated background uses a bright translucent overlay in light mode and a dark overlay in dark mode, without changing the video asset.

Important: this is static integration, not a verified production rendering. Run `hugo server -D` then check `/`, `/play/`, `/people/`, `/projects/`, `/publication/`, `/post/`, `/event/`, `/gallery/`, `/contact/` in both themes. The mobile game has its own touch controls; test touch behaviour on a device.

# HoloLith homepage redesign + Photon Runner

## Scope
- Homepage now rendered by `layouts/partials/hololith/home.html`, invoked from the existing base template. It replaces the inconsistent block-by-block landing composition **on the home page only**.
- Menu and home order: People, Projects, Publications, News, Events, Gallery, Play, Contact.
- Section previews use one shared grid, aligned headers/actions, and direct links to the full site section.
- Previews of Projects, Publications, News and Events are automatically populated from Hugo content (with a fallback for empty sections). No demonstration content was invented.
- Restored visibility of the pre-existing `static/media/backgrounds/animated-bg.mp4`: keep that file in the repository! It is not duplicated in this patch (46 MB). Video is muted/autoplay/loop with a visible fallback and reduced-motion support.
- Integrated the uploaded Photon Runner game, kept its JS mechanics, CSS and HTML isolated at `static/game/`, and created a Hugo page at `/play/` that embeds it under the site's navigation.

## Applying
Apply these files to the ORIGINAL repository (not by replacing the repository with this zip). Keep existing theme assets, `static/media/backgrounds/animated-bg.mp4` and all contents. Create a branch and review the resulting diff.

## QA checklist before merge
1. Build `hugo --gc --minify` with the Hugo/Hugo Blox version pinned by your project.
2. Verify homepage preview links on desktop and mobile.
3. Check that `animated-bg.mp4` is present and plays in browser; measure loading impact (46 MB, consider optimizing with ffmpeg separately).
4. Open `/play/` on desktop and mobile, click Start Run, test keyboard/touch and restart.
5. Check light/dark modes and prefers-reduced-motion.
6. Check sample News/Events/Gallery content before public launch; some original content is demo material.
7. Note: keeping the 46MB video can impact mobile loading performance and repository/hosting transfer costs.

## Note on profile previews
The People snippet attempts to list up to four author regular pages; the People button always opens the complete People page. If your Hugo Blox author content is exposed only as headless pages, the preview will show a neutral fallback instead of inventing information.

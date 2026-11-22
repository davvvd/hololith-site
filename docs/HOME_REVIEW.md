# HoloLith — Homepage & visual audit

## Scope
This patch is based on the supplied `hololith-site-main.zip` (repository snapshot dated March 25, 2026). The live website was not accessible from the review environment. No changes were pushed to GitHub. The project remains Hugo Blox / Hugo / GitHub Pages.

## Information architecture
The navbar and the homepage now follow exactly the same editorial order:

1. People (`/people/`)
2. Projects (`/projects/`)
3. Publications (`/publication/`)
4. News (`/post/`)
5. Events (`/event/`)
6. Gallery (`/gallery/`)
7. Contact (`/contact/`)

The hero remains first but is not a menu destination. Each section includes a visible CTA to its complete page. Projects was missing from the old menu. Previously the homepage order was People, Projects, News, Latest Preprints, and it lacked Events, Gallery and Contact previews.

## Changes in this patch
- `config/_default/menus.yaml`: reorders navbar and adds Projects.
- `content/_index.md`: reorders previews, changes the "Latest Preprints" sample to a general Publications preview, adds Events / Gallery / Contact, and adds section CTAs.
- `assets/scss/template.scss`: CTA layout, readable narrow-screen links, visible focus outline.
- `assets/js/site-motion.js`: scroll reveals run once rather than disappearing on scroll-back; background video pauses when the page is hidden and does not autoplay for visitors who prefer reduced motion.

## Important content / UX findings for the next iteration
- `content/post/` contains two old Wowchemy demonstration posts (fictional award stories, 2020). They appear in the News preview as long as they remain published. Replace or unpublish them before launching the site.
- `content/event/example/` is a sample event. It may appear in the new Events preview. Replace or unpublish it before launch.
- `content/gallery/index.md` contains demonstration slider slides (e.g. "World-Class Semiconductor Lab", "Lunch & Learn"). Replace them with real images and captions; the new gallery teaser deliberately does not pretend these are genuine group photographs.
- Several project pages have very little descriptive text (for instance H-SPIE and SPID-IN). Complete the summaries to make project cards useful.
- `static/media/backgrounds/animated-bg.mp4` is roughly 46 MB, costly for first-page loads. Encode a much smaller video (e.g. webm/mp4), provide a poster, and consider serving only on the homepage.
- `assets/media/welcome.jpg` is ~15 MB. Make sure Hugo image processing is sizing it down appropriately; consider optimizing the source asset.
- The animations and hover outlines are visually prominent and should be checked with keyboard, touchscreen, dark theme and mobile devices.
- The contact page currently configures `provider: netlify` even though publication uses GitHub Pages. Verify whether the contact form works; an email address is already present as a fallback.

## Validation performed
- YAML parsed for the navbar and homepage.
- Script verified all seven menu entries correspond to homepage previews, contain their intended CTA URLs, and have matching content directories.
- JavaScript syntax verified with `node --check`.

## Not validated here
A full Hugo compilation and visual browser review could not be performed: Hugo is not installed in the runtime and release download is unavailable. Test with the repository's CI (`hugo 0.135.0 extended`), then verify the deployed page at desktop and mobile widths, including links, section layout and themes.

## How to apply
Create a feature branch from the latest GitHub `main`. Copy the four code files from the patch preserving paths. Review the changes and open a pull request; run Hugo locally or in CI. Do not replace the entire repository with this patch. Since the attached snapshot may be older than your current GitHub `main`, resolve conflicts manually before merge.

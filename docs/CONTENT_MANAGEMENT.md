# HoloLith content management roadmap

## Before merging

This patch is **based on the last local v4 snapshot supplied in the conversation**, not a verified current clone of GitHub. Review file differences on a branch. Do not replace newer files blindly.

## 1. Content clean-up (non-destructive)

- The two template News posts and `content/event/example/` are marked `draft: true` rather than deleted. Confirm with `hugo --environment production` that they disappear.
- The old Gallery YAML slider is archived in `docs/LEGACY_GALLERY.md`; gallery data is now in `data/gallery.yaml`, initially empty to avoid pretending demonstration images represent research.
- Read `docs/PUBLICATION_AUDIT.md`: matching DOI records are *not deleted*. Approve which records to keep before any cleanup.
- Projects with minimal descriptions are unchanged; these need researchers to provide real text.

## 2. Zotero (daily, read-only synchronization)

- Group ID: `6421238` (change workflow if group ID changes).
- Add `ZOTERO_API_KEY` under Settings > Secrets and variables > Actions if the group is not public. Key only needs Zotero read permission.
- Go to Settings > Actions > General > Workflow permissions and allow GitHub Actions to create PRs; workflows request `contents: write` and `pull-requests: write`.
- Run `Sync Zotero bibliography` manually first. It opens a PR editing only `publications.bib`; review its diff before merge.
- After merging, **the existing** `Import Publications From Bibtex` action fires and opens a second PR for `content/publication/`. Review and merge it.
- The script retrieves all top-level Zotero items with metadata pagination, then exports each to BibTeX by item key. It aborts on API failures, missing exports, or empty results and does not write partial output.
- Zotero group must contain only publications intended for display or use a dedicated publication collection/group. Personal notes and unrelated references must not be synchronized blindly. If the library contains broader reading lists, add Zotero collection filtering before first merge.
- The generated BibTeX can have different citation keys/formatting from the current `publications.bib`; inspect the initial diff carefully. The existing importer may create duplicate pages if IDs differ. Do not auto-merge until reconciled.

## 3. Gallery

- The new Gallery is grid-based and data-driven, with no sample photographs. Use `data/gallery.yaml` or the CMS gallery collection to add real photos and captions.
- CMS uploads go to `static/uploads/`; image values should be paths like `/uploads/photo.jpg`.
- The `content/gallery/index.md` page now uses a dedicated `layouts/gallery/single.html`; verify visually in local Hugo.

## 4. Web CMS — News, Events, Projects and Gallery

- Editor URL: `/admin/`.
- This version uses `publish_mode: editorial_workflow`. Saving a draft creates a PR; **you** publish it by merging on GitHub or from the editorial workflow.
- GitHub backend requires each editor to have repository write access. The menu only exposes the four collections; this does NOT stop trusted editors changing other repository files directly in GitHub.
- The OAuth proxy placeholder in `static/admin/config.yml` MUST be replaced with a secure GitHub OAuth provider; static GitHub Pages does not supply one. Never commit OAuth client secrets into the repository.
- For local UI checks you can temporarily use `local_backend: true` and `npx decap-server`; remove it before production deployment.
- **Branch protection:** if you require PRs and at least one approval, the maintainer must approve all content; do not enable auto-merge for these PRs. With `editorial_workflow`, edits do not write directly to `main`.
- Existing News, Events and Project markdown files have custom front matter, some fields of which are not exposed in the simplified CMS. Opening and saving them may remove or rewrite unsupported fields. Verify the diff on each PR, especially old Events with metadata such as `address`, `authors`, and `slides`.
- Content image uploads use bundle-local media, but Hugo Blox may require a `featured.jpg` filename to show thumbnails. This is NOT yet handled automatically in the editor. Use GitHub to upload `featured.jpg` to the content bundle when needed.

## Updating content without the editor

- **News:** add `content/post/<slug>/index.md` with `title`, `date`, and Markdown body.
- **Events:** add `content/event/<slug>/index.md` with `title`, start `date`, optional `date_end`, and body.
- **Projects:** add `content/projects/<slug>/index.md` with `title`, optional `date`, and body.
- **Gallery:** edit `data/gallery.yaml` adding items under `photos` with `title`, `image`, `alt`, and `caption`, and place images in `static/uploads/`.
- **Publications:** manage publications in Zotero only after reviewing the first sync; until then, use `publications.bib` and the existing import PR workflow.

## Smoke tests before release

1. Run Hugo build in production and verify News/Event templates are hidden.
2. Check `/gallery/` renders the empty state; add a test image on a branch and verify mobile grid and light/dark themes.
3. Open `/admin/` and verify the four collections, using local backend first.
4. Test saving a News draft creates a PR, and merging updates the homepage preview.
5. Test an Event with start/end dates and a Project whose existing front matter has additional fields.
6. Manually run Zotero sync and review the bibliography diff before merging anything.

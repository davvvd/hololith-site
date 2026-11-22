# Zotero synchronization — network hotfix

Replaces only `scripts/sync_zotero.py` in your existing HoloLith project.

The old importer sent one BibTeX request per item and did not catch connection-level failures (e.g. `RemoteDisconnected`). This version requests BibTeX in pages, retries transient HTTP/network errors, emits a progress line with the URL of the failed page (never prints the API key), and validates that the exported entry count matches bibliographic records returned by the API.

## Test from Git Bash

```bash
mkdir -p .tmp
python scripts/sync_zotero.py --group 6421238 --output .tmp/zotero-preview.bib
```

Use the same terminal where `ZOTERO_API_KEY` was exported. To see whether the key variable exists without revealing it:

```bash
[ -n "$ZOTERO_API_KEY" ] && echo 'Key available' || echo 'No key set'
```

If connections still close, run once with a smaller page size:

```bash
python scripts/sync_zotero.py --group 6421238 --page-size 10 --output .tmp/zotero-preview.bib
```

If you receive a failure, share the error and page URL but **never** the API key. Do not overwrite `publications.bib` until the preview has been reviewed.

`urllib.request` uses system proxy settings. Network filtering, VPNs, and temporary Zotero availability can also cause disconnects. The script cannot guarantee success if the underlying connection repeatedly fails.

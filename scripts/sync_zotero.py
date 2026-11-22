#!/usr/bin/env python3
"""Read-only, paginated Zotero group BibTeX export with defensive retries.

Never writes a partial export to the destination file.
"""
import argparse
import http.client
import os
import re
import socket
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API = 'https://api.zotero.org'
USER_AGENT = 'HoloLith-site-bibliography-sync/1.1'
ENTRY_RE = re.compile(r'(?m)^\s*@(?!comment\b|preamble\b|string\b)[A-Za-z][A-Za-z0-9_-]*\s*[{(]', re.I)
TRANSIENT_HTTP = {429, 500, 502, 503, 504}
TRANSIENT_NETWORK = (http.client.RemoteDisconnected, http.client.IncompleteRead,
                     ConnectionResetError, ConnectionAbortedError, TimeoutError,
                     socket.timeout, urllib.error.URLError)


def get(url, key, *, attempts=5):
    headers = {'User-Agent': USER_AGENT, 'Zotero-API-Version': '3', 'Accept': 'text/plain'}
    if key:
        headers['Zotero-API-Key'] = key
    safe_url = url  # Credentials are in headers, never in the URL or diagnostics.
    for attempt in range(1, attempts + 1):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=40) as response:
                payload = response.read().decode('utf-8-sig')
                backoff = response.headers.get('Backoff')
                if backoff:
                    try:
                        time.sleep(min(60, max(0, float(backoff))))
                    except ValueError:
                        pass
                return payload
        except urllib.error.HTTPError as exc:
            if exc.code in (401, 403):
                raise RuntimeError(f'Zotero HTTP {exc.code}: check group read permission for this API key') from exc
            if exc.code not in TRANSIENT_HTTP or attempt == attempts:
                raise RuntimeError(f'Zotero HTTP {exc.code} at {safe_url} (attempt {attempt}/{attempts})') from exc
            retry_after = exc.headers.get('Retry-After', '')
            try:
                wait = float(retry_after)
            except ValueError:
                wait = min(32, 2 ** attempt)
        except TRANSIENT_NETWORK as exc:
            if attempt == attempts:
                raise RuntimeError(f'Zotero network failure at {safe_url} after {attempts} attempts: {type(exc).__name__}: {exc}') from exc
            wait = min(32, 2 ** attempt)
        print(f'Zotero temporary failure; retry {attempt}/{attempts} in {wait:.0f}s: {safe_url}', file=sys.stderr)
        time.sleep(min(60, max(1, wait)))
    raise RuntimeError(f'Could not fetch {safe_url}')


def export(group_id, api_key, page_size=50):
    # Multi-item BibTeX export avoids one HTTP request per record.
    # Zotero's API requires limit for export formats and supports pagination.
    pages = []
    offset = 0
    for page_num in range(1, 202):
        qs = urllib.parse.urlencode({'format': 'bibtex', 'limit': page_size, 'start': offset})
        url = f'{API}/groups/{group_id}/items/top?{qs}'
        print(f'Fetching Zotero BibTeX page {page_num} (start={offset}, limit={page_size})...', file=sys.stderr)
        # Use JSON metadata to know the page length and expected item types.
        json_qs = urllib.parse.urlencode({'format': 'json', 'limit': page_size, 'start': offset})
        import json
        count_page = json.loads(get(f'{API}/groups/{group_id}/items/top?{json_qs}', api_key))
        if not isinstance(count_page, list):
            raise ValueError(f'Unexpected JSON on page {page_num}')
        if not count_page:
            break
        expected = sum(item.get('data', {}).get('itemType') not in
                       ('attachment', 'note', 'annotation') for item in count_page)
        page = get(url, api_key).strip()
        entries = len(ENTRY_RE.findall(page))
        if entries != expected:
            raise ValueError(f'Page {page_num} returned {entries} BibTeX entries for '
                             f'{expected} bibliographic items. Aborting to prevent loss.')
        if page:
            pages.append(page)
        offset += len(count_page)
        if len(count_page) < page_size:
            break
    else:
        raise ValueError('Exceeded Zotero pagination safety limit')
    if not pages:
        raise ValueError('No BibTeX entries exported; refusing to overwrite bibliography')
    result = '% HoloLith Zotero group export. Edit Zotero rather than this generated file.\n\n' + '\n\n'.join(pages) + '\n'
    print(f'Fetched {len(pages)} page(s), {len(ENTRY_RE.findall(result))} BibTeX entries.', file=sys.stderr)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--group', default=os.getenv('ZOTERO_GROUP_ID', '6421238'))
    parser.add_argument('--output', default='publications.bib')
    parser.add_argument('--page-size', type=int, default=50)
    args = parser.parse_args()
    if not args.group.isdecimal():
        parser.error('--group must be a numeric Zotero group ID')
    if not 1 <= args.page_size <= 100:
        parser.error('--page-size must be between 1 and 100')
    try:
        result = export(args.group, os.getenv('ZOTERO_API_KEY', ''), args.page_size)
        target = Path(args.output)
        target.parent.mkdir(parents=True, exist_ok=True)
        # Only after a complete successful export do we write the output.
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=target.parent,
                                         prefix='.zotero-', suffix='.tmp', delete=False) as tmp:
            tmp.write(result)
            tmp_path = Path(tmp.name)
        tmp_path.replace(target)
        print(f'Exported bibliography to {target}')
    except Exception as exc:
        print(f'Zotero sync aborted (existing bibliography preserved): {exc}', file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

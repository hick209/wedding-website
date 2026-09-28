# Photo pipeline

Turns 3,329 wedding photos into the gallery at `/photos/`: web derivatives,
face detection, clustering, a local labelling tool, and an index published to
R2.

**Scripts live here and are version-controlled. Their data does not.**
Everything they read and write is in `.photo-pipeline/` at the repo root,
which is gitignored and holds derivatives, face crops, embeddings, labels, the
guest list and the R2 token. Roughly 5GB, all of it regenerable from the
originals except `labels.json`, which represents hours of human work — back
that one up.

## Run it

Always use the venv interpreter. A bare `python3` on this machine is Meta's
build with no numpy or sklearn.

```bash
V=.photo-pipeline/venv/bin/python

$V tools/photo-pipeline/build.py    # derivatives, detection, clustering  (~35 min)
$V tools/photo-pipeline/label.py    # labelling UI at localhost:8787      (hours, human)
$V tools/photo-pipeline/upload.py   # thumb + display -> R2               (~4 min)
$V tools/photo-pipeline/large.py    # 2560px download copies -> R2        (~25 min)
$V tools/photo-pipeline/export.py   # labels -> index.json -> R2          (seconds)
```

`export.py` is safe to re-run at any time; the gallery picks up a new index
within five minutes (`max-age=300`). The others are resumable — they skip work
already done, so an interrupted run costs only a listing pass.

To add a package: `$V -m pip install <name>`. Not `.photo-pipeline/venv/bin/pip`
— that venv was copied from `/tmp` and its `pip` script still has the original
path in its shebang, so it installs to the wrong place.

## What each does

| Script | Does |
|---|---|
| `r2.py` | Shared R2 client. Reads `cloudflare_api_token.txt`, never prints it |
| `build.py` | vips derivatives, InsightFace detection + embeddings, agglomerative clustering |
| `label.py` | Local web UI: name clusters, split mixed ones, review people, hover for context |
| `upload.py` | Uploads thumb (400px) and display (1600px) under a random key prefix |
| `large.py` | 2560px copies for the Download button |
| `export.py` | Builds `index.json` — display names and photo→people — and puts it in R2 |

## Things that will bite

**Never commit anything from `.photo-pipeline/`.** It holds face embeddings
(biometric data), the full guest list, and an R2 write token. The `.gitignore`
entry is the only thing standing between those and a public repository.

**The key prefix is load-bearing.** Photo slugs are sequential
(`…-1.jpg` … `-2830.jpg`), so without the random prefix in `url_prefix.txt`
anyone holding one photo URL could walk the whole archive. Changing it means
re-uploading all 6,658 objects and re-running `export.py`.

**Only display names are published.** `export.py` shortens "Gabriel Paiva" to
"Gabriel P" — enough to be unique, no more. Full names stay in `labels.json`.

**Four settings live in the Cloudflare dashboard, not in this repo**, and
nothing here will tell you if they get switched off:

1. R2 bucket `wedding-10y-photos`, custom domain `photos.nivaldo-roberta.com`
2. CORS policy allowing `https://www.nivaldo-roberta.com` — without it the
   gallery fetches nothing and renders empty
3. Response Header Transform Rule setting `X-Robots-Tag: noindex` on that
   hostname — the only thing keeping 3,329 photos of guests out of Google
   Images, since `_headers` covers Pages and not R2
4. Cache purge, after replacing any object under an existing key

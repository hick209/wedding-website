"""
Upload web derivatives to R2.

Run:  .photo-pipeline/venv/bin/python .photo-pipeline/upload.py

Resumable: lists what is already in the bucket and skips it, so re-running
after an interruption costs one listing pass and nothing else.

Only the derivatives go up. The 23GB of originals stay on this machine, and
the embeddings never leave it.
"""
import json
import pathlib
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from r2 import client  # noqa: E402

# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"
DISPLAY = WORK / "display"
THUMB = WORK / "thumb"
BUCKET = "wedding-10y-photos"

# A random, stable path segment in front of every key. The slugs themselves are
# sequential (…-1.jpg … -2830.jpg), so without this anyone holding a single
# photo URL could walk the whole archive by changing the number. Generated once
# and kept, so re-runs do not orphan what is already uploaded.
PREFIX_FILE = WORK / "url_prefix.txt"
WORKERS = 16

# 30 days, matching the convention in _headers. Long enough to be worth
# caching, short enough that a bad re-derive heals itself within a month.
CACHE = "public, max-age=2592000"


def url_prefix():
    if PREFIX_FILE.exists():
        return PREFIX_FILE.read_text().strip()
    import secrets
    p = secrets.token_hex(5)
    PREFIX_FILE.write_text(p)
    return p


def slug(photo_id):
    """ceremony__Casamento Roberta e Nivaldo-1906 -> ceremony__Casamento-Roberta-e-Nivaldo-1906

    Spaces in object keys are legal but they have to be percent-encoded in
    every URL that references them, which is a bug waiting to happen across
    JSON, HTML and JS. Strip them once, here.
    """
    s = re.sub(r"\s+", "-", photo_id.strip())
    return re.sub(r"[^A-Za-z0-9._~-]", "-", s)


def existing_keys(cl):
    keys = set()
    token = None
    while True:
        kw = {"Bucket": BUCKET, "MaxKeys": 1000}
        if token:
            kw["ContinuationToken"] = token
        r = cl.list_objects_v2(**kw)
        for o in r.get("Contents", []):
            keys.add(o["Key"])
        if not r.get("IsTruncated"):
            return keys
        token = r["NextContinuationToken"]


def main():
    cl = client()
    print(f"listing {BUCKET} ...", flush=True)
    done = existing_keys(cl)
    print(f"  {len(done)} objects already there", flush=True)

    prefix = url_prefix()
    print(f"key prefix: {prefix}/")
    jobs = []
    manifest = {}
    for disp in sorted(DISPLAY.glob("*.jpg")):
        pid = disp.stem
        key_base = f"{prefix}/{slug(pid)}"
        thumb = THUMB / f"{pid}.webp"
        manifest[pid] = {"key": key_base}
        for path, key, ctype in (
            (disp, f"display/{key_base}.jpg", "image/jpeg"),
            (thumb, f"thumb/{key_base}.webp", "image/webp"),
        ):
            if path.exists() and key not in done:
                jobs.append((path, key, ctype))

    print(f"{len(manifest)} photos | {len(jobs)} objects to upload", flush=True)
    if not jobs:
        print("nothing to upload")
    else:
        total = len(jobs)
        counter = {"n": 0, "bytes": 0}
        lock = threading.Lock()
        t0 = time.time()

        def put(job):
            path, key, ctype = job
            cl.put_object(
                Bucket=BUCKET,
                Key=key,
                Body=path.read_bytes(),
                ContentType=ctype,
                CacheControl=CACHE,
            )
            with lock:
                counter["n"] += 1
                counter["bytes"] += path.stat().st_size
                n = counter["n"]
                if n % 250 == 0 or n == total:
                    el = time.time() - t0
                    mb = counter["bytes"] / 1e6
                    print(f"  {n}/{total}  {mb:.0f}MB  "
                          f"{mb/el:.1f}MB/s  ~{(total-n)/(n/el)/60:.1f} min left",
                          flush=True)

        errors = []
        with ThreadPoolExecutor(max_workers=WORKERS) as ex:
            futures = {ex.submit(put, j): j for j in jobs}
            for f in as_completed(futures):
                try:
                    f.result()
                except Exception as e:
                    errors.append((futures[f][1], f"{type(e).__name__}: {e}"))

        print(f"uploaded in {(time.time()-t0)/60:.1f} min")
        if errors:
            print(f"{len(errors)} FAILED:")
            for k, e in errors[:10]:
                print(f"   {k}  {e}")

    # dimensions for the gallery layout - reading the header only, not decoding
    print("reading dimensions ...", flush=True)
    for pid in manifest:
        try:
            with Image.open(DISPLAY / f"{pid}.jpg") as im:
                manifest[pid]["w"], manifest[pid]["h"] = im.size
        except Exception:
            pass
    (WORK / "manifest.json").write_text(json.dumps(manifest))
    print(f"manifest.json written ({len(manifest)} photos)")


if __name__ == "__main__":
    main()

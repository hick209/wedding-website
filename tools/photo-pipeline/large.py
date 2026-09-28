"""
Generate and upload the 2560px "large" derivative used by the gallery's
Download button.

Run:  .photo-pipeline/venv/bin/python .photo-pipeline/large.py

The 1600px display copy is sized for viewing on a screen; downloading it gives
people something they cannot print. 2560px is good to roughly A4 at 300dpi and
still fits the R2 free tier. The 6891x4594 originals stay on this machine -
23GB, and SmugMug already serves that purpose.

Resumable in both halves: files already generated are skipped, and so are
objects already in the bucket.
"""
import pathlib
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from r2 import client            # noqa: E402
from upload import slug, url_prefix, existing_keys, BUCKET, CACHE, WORKERS  # noqa: E402

SRC = pathlib.Path("/Users/nbondanca/wedding-photos")
# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"
LARGE = WORK / "large"
LARGE_PX = 2560
QUALITY = 82


def photo_id(p):
    return f"{p.parent.name}__{p.stem}"


def generate(paths):
    LARGE.mkdir(exist_ok=True)
    todo = [p for p in paths if not (LARGE / f"{photo_id(p)}.jpg").exists()]
    print(f"generate: {len(paths) - len(todo)} present, {len(todo)} to build", flush=True)
    t0 = time.time()
    for i, p in enumerate(todo, 1):
        subprocess.run(
            ["vips", "thumbnail", str(p),
             f"{LARGE / photo_id(p)}.jpg[Q={QUALITY}]",
             str(LARGE_PX), "--size", "down"],
            check=True, capture_output=True)
        if i % 250 == 0:
            rate = i / (time.time() - t0)
            print(f"   {i}/{len(todo)}  (~{(len(todo)-i)/rate/60:.0f} min left)", flush=True)
    if todo:
        print(f"generated in {(time.time()-t0)/60:.1f} min", flush=True)


def upload():
    cl = client()
    prefix = url_prefix()
    print("listing bucket ...", flush=True)
    done = existing_keys(cl)

    jobs = []
    for f in sorted(LARGE.glob("*.jpg")):
        key = f"large/{prefix}/{slug(f.stem)}.jpg"
        if key not in done:
            jobs.append((f, key))

    total_mb = sum(f.stat().st_size for f, _ in jobs) / 1e6
    print(f"upload: {len(jobs)} objects, {total_mb:.0f}MB", flush=True)
    if not jobs:
        return

    counter = {"n": 0, "bytes": 0}
    lock = threading.Lock()
    t0 = time.time()

    def put(job):
        path, key = job
        cl.put_object(Bucket=BUCKET, Key=key, Body=path.read_bytes(),
                      ContentType="image/jpeg", CacheControl=CACHE)
        with lock:
            counter["n"] += 1
            counter["bytes"] += path.stat().st_size
            n = counter["n"]
            if n % 250 == 0 or n == len(jobs):
                el = time.time() - t0
                mb = counter["bytes"] / 1e6
                print(f"   {n}/{len(jobs)}  {mb:.0f}MB  {mb/el:.1f}MB/s  "
                      f"~{(len(jobs)-n)/(n/el)/60:.1f} min left", flush=True)

    errors = []
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(put, j): j for j in jobs}
        for fut in as_completed(futures):
            try:
                fut.result()
            except Exception as e:
                errors.append((futures[fut][1], f"{type(e).__name__}: {e}"))

    print(f"uploaded in {(time.time()-t0)/60:.1f} min")
    if errors:
        print(f"{len(errors)} FAILED")
        for k, e in errors[:10]:
            print(f"   {k}  {e}")


if __name__ == "__main__":
    paths = sorted(SRC.rglob("*.jpg"))
    print(f"source: {len(paths)} photos")
    generate(paths)
    upload()
    n = len(list(LARGE.glob("*.jpg")))
    avg = sum(f.stat().st_size for f in LARGE.glob("*.jpg")) / max(n, 1) / 1024
    print(f"\n{n} large files, {avg:.0f}KB average")
    print("DONE")

"""
Full build: derivatives, face detection, embeddings, clustering.

Run:  .photo-pipeline/venv/bin/python .photo-pipeline/build.py

Resumable. Derivatives are skipped if present; detection checkpoints every
CHECKPOINT photos, so an interrupted run picks up where it left off.

The embeddings written here are biometric data. They stay in this directory,
which is gitignored, and are never published. Only name -> photo id mappings
ever reach the site.
"""
import json
import pathlib
import subprocess
import sys
import time

import cv2
import numpy as np
from insightface.app import FaceAnalysis
from sklearn.cluster import AgglomerativeClustering

SRC = pathlib.Path("/Users/nbondanca/wedding-photos")
# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"
DISPLAY = WORK / "display"
THUMB = WORK / "thumb"
CROPS = WORK / "crops"

DISPLAY_PX = 1600
THUMB_PX = 400
THUMB_Q = 72          # pilot came in at 43KB; trimming quality for the grid

MIN_FACE_PX = 48
MIN_DET_SCORE = 0.55
CLUSTER_DISTANCE = 0.45
CHECKPOINT = 250


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def photo_id(p):
    return f"{p.parent.name}__{p.stem}"


def build_derivatives(paths):
    DISPLAY.mkdir(exist_ok=True)
    THUMB.mkdir(exist_ok=True)
    todo = [p for p in paths if not (DISPLAY / f"{photo_id(p)}.jpg").exists()]
    log(f"derivatives: {len(paths) - len(todo)} already done, {len(todo)} to build")
    t0 = time.time()
    for i, p in enumerate(todo, 1):
        pid = photo_id(p)
        subprocess.run(["vips", "thumbnail", str(p), str(DISPLAY / f"{pid}.jpg"),
                        str(DISPLAY_PX), "--size", "down"], check=True, capture_output=True)
        subprocess.run(["vips", "thumbnail", str(p), f"{THUMB / pid}.webp[Q={THUMB_Q}]",
                        str(THUMB_PX), "--size", "down"], check=True, capture_output=True)
        if i % 200 == 0:
            rate = i / (time.time() - t0)
            log(f"   {i}/{len(todo)}  ({rate:.1f}/s, ~{(len(todo)-i)/rate/60:.0f} min left)")
    log(f"derivatives done in {(time.time()-t0)/60:.1f} min")


def load_checkpoint():
    f = WORK / "faces.npz"
    if not f.exists():
        return [], set()
    d = np.load(f, allow_pickle=True)
    recs = list(d["records"])
    done = set(d["done"].tolist())
    log(f"resuming: {len(recs)} faces from {len(done)} photos already processed")
    return recs, done


def save_checkpoint(records, done):
    np.savez_compressed(
        WORK / "faces.npz",
        records=np.array(records, dtype=object),
        done=np.array(sorted(done), dtype=object),
    )


def detect(paths):
    CROPS.mkdir(exist_ok=True)
    records, done = load_checkpoint()
    todo = [p for p in paths if photo_id(p) not in done]
    if not todo:
        log("detection: nothing to do")
        return records

    app = FaceAnalysis(name="buffalo_l", root=str(WORK / "insightface"),
                       providers=["CPUExecutionProvider"])
    app.prepare(ctx_id=-1, det_size=(1024, 1024))
    log(f"detection: {len(todo)} photos to process")

    t0 = time.time()
    for i, p in enumerate(todo, 1):
        pid = photo_id(p)
        img = cv2.imread(str(DISPLAY / f"{pid}.jpg"))
        if img is None:
            done.add(pid)
            continue
        for j, f in enumerate(app.get(img)):
            x1, y1, x2, y2 = f.bbox.astype(int)
            if (x2 - x1) < MIN_FACE_PX or f.det_score < MIN_DET_SCORE:
                continue
            fid = f"{pid}#{j}"
            pad = int((x2 - x1) * 0.25)
            h, w = img.shape[:2]
            crop = img[max(y1-pad, 0):min(y2+pad, h), max(x1-pad, 0):min(x2+pad, w)]
            if crop.size:
                cv2.imwrite(str(CROPS / f"{fid}.jpg"),
                            cv2.resize(crop, (160, 160)),
                            [cv2.IMWRITE_JPEG_QUALITY, 82])
            records.append({
                "face_id": fid,
                "photo": pid,
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "score": float(f.det_score),
                "emb": f.normed_embedding.astype(np.float32),
            })
        done.add(pid)
        if i % CHECKPOINT == 0:
            save_checkpoint(records, done)
            rate = i / (time.time() - t0)
            log(f"   {i}/{len(todo)}  {len(records)} faces  (~{(len(todo)-i)/rate/60:.0f} min left)")

    save_checkpoint(records, done)
    log(f"detection done in {(time.time()-t0)/60:.1f} min, {len(records)} faces")
    return records


def cluster(records):
    log(f"clustering {len(records)} faces (pairwise matrix ~"
        f"{len(records)**2 * 8 / 1e9:.1f}GB)")
    embs = np.vstack([r["emb"] for r in records])
    labels = AgglomerativeClustering(
        n_clusters=None, distance_threshold=CLUSTER_DISTANCE,
        metric="cosine", linkage="average",
    ).fit_predict(embs)

    by_cluster = {}
    for r, lab in zip(records, labels):
        r["cluster"] = int(lab)
        by_cluster.setdefault(int(lab), []).append(r)

    ordered = sorted(by_cluster.items(), key=lambda kv: -len(kv[1]))
    out = []
    for rank, (cid, members) in enumerate(ordered, 1):
        members = sorted(members, key=lambda m: -m["score"])
        out.append({
            "cluster": cid,
            "rank": rank,
            "size": len(members),
            "faces": [m["face_id"] for m in members],
            "photos": sorted({m["photo"] for m in members}),
        })
    (WORK / "clusters.json").write_text(json.dumps(out))

    sizes = [c["size"] for c in out]
    singles = sum(1 for s in sizes if s == 1)
    log(f"clusters: {len(out)} | largest {sizes[:12]}")
    log(f"singletons: {singles} ({singles/len(records)*100:.0f}% of faces)")
    log(f"clusters with >=3 faces: {sum(1 for s in sizes if s >= 3)}")
    return out


def main():
    paths = sorted(SRC.rglob("*.jpg"))
    log(f"source: {len(paths)} photos")
    build_derivatives(paths)
    records = detect(paths)
    if not records:
        log("no faces found - stopping")
        return
    cluster(records)
    log("BUILD COMPLETE")


if __name__ == "__main__":
    main()

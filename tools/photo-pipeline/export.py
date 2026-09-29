"""
Turn labels + manifest into the single index.json the gallery reads, and put
it in R2 next to the photos.

Run:  .photo-pipeline/venv/bin/python .photo-pipeline/export.py

Safe to re-run at any point during labelling - the gallery picks up whatever
has been named so far.

What ships: person names and which photos they appear in. What does not:
embeddings, bounding boxes, face crops, or anything else biometric. Those stay
in this gitignored directory.

The file lands at <prefix>/index.json in R2 rather than in the repo, because
the repo is public and the guest list is not.
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from r2 import client  # noqa: E402

# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"
BUCKET = "wedding-10y-photos"
BASE_URL = "https://photos.nivaldo-roberta.com"

# Short, so re-exports during labelling show up quickly. The photos themselves
# are cached for 30 days; only this index changes.
INDEX_CACHE = "public, max-age=300"


# What someone is actually called, when it is not their first name. Applied
# after the shortening below, and excluded from it - so removing "Maria Zita
# Silva" from the pool can let another Maria shorten further.
DISPLAY_OVERRIDES = {
    "Maria Zita Silva": "Zita",
}


# The two who get a role instead of a surname initial.
COUPLE = {
    "Nivaldo Henrique Bondança": "groom",
    "Roberta Paiva Bondança": "bride",
}


def read_json(p, default):
    p = WORK / p
    return json.loads(p.read_text()) if p.exists() else default


def display_names(names, pinned=(), reserved=()):
    """First names, with only as much surname as it takes to stay unique.

    'Gabriel' if he is the only one, 'Gabriel P' if there are several
    Gabriels, 'Gabriel Paiva' if two of them share an initial, and the full
    name if even that collides.

    Pinned names never grow - the couple keep their bare first name because
    the UI appends "(groom)" / "(bride)", which disambiguates them already.

    Doing this here rather than in the browser means the index ships
    'Gabriel P' and never the full name: less to publish, and the full names
    stay in labels.json on this machine.
    """
    def cand(n, lvl):
        parts = n.split()
        if len(parts) == 1 or lvl == 0:
            return parts[0]
        if lvl == 1:
            return f"{parts[0]} {parts[-1][0]}"
        if lvl == 2:
            return f"{parts[0]} {parts[-1]}"
        return n

    level = {n: 0 for n in names}
    for _ in range(4):
        # names handed to us already spoken for count as taken
        seen = {r: ["<reserved>"] for r in reserved}
        for n in names:
            seen.setdefault(cand(n, level[n]), []).append(n)
        clashes = [g for g in seen.values() if len(g) > 1]
        if not clashes:
            break
        for group in clashes:
            for n in group:
                if n not in pinned and level[n] < 3:
                    level[n] += 1
    return {n: cand(n, level[n]) for n in names}


def effective_groups():
    """Same view of the world the labelling tool has: base clusters, plus
    anything produced by splitting, minus what was superseded."""
    clusters = read_json("clusters.json", [])
    g = read_json("groups.json", {"derived": {}, "retired": []})
    retired = set(g.get("retired", []))
    out = {str(c["cluster"]): c["faces"] for c in clusters
           if str(c["cluster"]) not in retired}
    for gid, faces in g.get("derived", {}).items():
        if gid not in retired:
            out[gid] = faces
    return out


def main():
    manifest = read_json("manifest.json", {})
    labels = read_json("labels.json", {})
    groups = effective_groups()
    prefix = (WORK / "url_prefix.txt").read_text().strip()

    # photo -> set of person names, via the faces in each named group
    by_photo = {}
    for gid, faces in groups.items():
        name = labels.get(gid)
        if not name or name == "__skip__":
            continue
        for fid in faces:
            by_photo.setdefault(fid.rsplit("#", 1)[0], set()).add(name)

    counts = {}
    for names in by_photo.values():
        for n in names:
            counts[n] = counts.get(n, 0) + 1
    people = sorted(counts, key=lambda n: (-counts[n], n))
    pidx = {n: i for i, n in enumerate(people)}
    overridden = {n: DISPLAY_OVERRIDES[n] for n in people if n in DISPLAY_OVERRIDES}
    rest = [n for n in people if n not in overridden]
    shown = display_names(rest,
                          pinned=set(COUPLE) & set(rest),
                          reserved=set(overridden.values()))
    shown.update(overridden)

    def sort_key(pid):
        """welcome before ceremony, then by the photographer's numbering."""
        event, _, rest = pid.partition("__")
        tail = rest.rsplit("-", 1)[-1]
        return (0 if event == "welcome" else 1, int(tail) if tail.isdigit() else 0)

    photos = []
    for pid in sorted(manifest, key=sort_key):
        m = manifest[pid]
        photos.append([
            m["key"].split("/", 1)[1],          # key without the prefix
            m.get("w", 0),
            m.get("h", 0),
            0 if pid.startswith("welcome__") else 1,
            sorted(pidx[n] for n in by_photo.get(pid, ())),
        ])

    index = {
        "base": BASE_URL,
        "prefix": prefix,
        # [display name, photo count, role]. Full names deliberately stay out
        # of the published index - the UI only ever shows these.
        "people": [[shown[n], counts[n], COUPLE.get(n, "")] for n in people],
        "photos": photos,
        "stats": {
            "photos": len(photos),
            "with_people": sum(1 for p in photos if p[4]),
            "people": len(people),
        },
    }

    body = json.dumps(index, separators=(",", ":"), ensure_ascii=False).encode()
    out = WORK / "index.json"
    out.write_bytes(body)

    client().put_object(
        Bucket=BUCKET,
        Key=f"{prefix}/index.json",
        Body=body,
        ContentType="application/json; charset=utf-8",
        CacheControl=INDEX_CACHE,
    )

    s = index["stats"]
    print(f"photos      : {s['photos']}")
    print(f"  with a named person: {s['with_people']} ({s['with_people']/s['photos']*100:.0f}%)")
    print(f"people      : {s['people']}")
    print(f"index size  : {len(body)/1024:.0f}KB")
    print(f"uploaded to : {BASE_URL}/{prefix}/index.json")
    print("\ntop of the list (full name -> what the gallery shows):")
    for n in people[:10]:
        role = f" ({COUPLE[n]})" if n in COUPLE else ""
        print(f"   {n:30} -> {shown[n] + role:22} {counts[n]:4d} photos")

    collisions = {}
    for n in people:
        collisions.setdefault(shown[n], []).append(n)
    dupes = {k: v for k, v in collisions.items() if len(v) > 1}
    print(f"\nambiguous display names: {len(dupes)}")
    for k, v in list(dupes.items())[:5]:
        print(f"   {k!r} <- {v}")


if __name__ == "__main__":
    main()

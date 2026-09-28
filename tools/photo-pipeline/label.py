"""
Local face-labelling tool.

Run:  .photo-pipeline/venv/bin/python .photo-pipeline/label.py
Then: http://localhost:8787

IMPORTANT: use the venv python above. A bare `python3` on this machine is
Meta's build, which has no numpy or sklearn, and the failure would not show up
until you clicked Split. There is a startup check below so it fails loudly
instead.

Tabs
  To label   - the queue. Type a name, Enter, next.
  Skipped    - nothing is ever final; revisit and name them.
  Named      - pick a person and review every face filed under them, paged.
               Click faces and remove them if they are not that person.

Mixed cluster? Either click the odd faces to deselect and save the rest, or
hit Split to re-cluster that group at a tighter threshold.

Typing a name you have used before merges into that person - same name means
same person.

State, both gitignored:
  labels.json  {group_id: name | "__skip__"}
  groups.json  splits and exclusions
"""
import json
import pathlib
import re
import unicodedata
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import unquote, urlparse, parse_qs

# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"
CROPS = WORK / "crops"
DISPLAY = WORK / "display"
CLUSTERS = json.loads((WORK / "clusters.json").read_text())
LABELS_FILE = WORK / "labels.json"
GROUPS_FILE = WORK / "groups.json"
GUESTS_FILE = WORK / "guests.txt"

PORT = 8787
MIN_SIZE = 2
MAX_CROPS = 80
PAGE_SIZE = 120         # faces per page in the person review
SPLIT_DISTANCE = 0.32

BASE = {str(c["cluster"]): c["faces"] for c in CLUSTERS if c["size"] >= MIN_SIZE}
TOTAL_FACES = sum(c["size"] for c in CLUSTERS)

_emb_cache = None
_bbox_cache = None


def _records():
    import numpy as np
    return np.load(WORK / "faces.npz", allow_pickle=True)["records"]


def embeddings():
    global _emb_cache
    if _emb_cache is None:
        _emb_cache = {r["face_id"]: r["emb"] for r in _records()}
    return _emb_cache


def bboxes():
    """face_id -> (photo_id, [x1, y1, x2, y2]) in 1600px display coordinates,
    which is what detection ran against."""
    global _bbox_cache
    if _bbox_cache is None:
        _bbox_cache = {r["face_id"]: (r["photo"], [int(v) for v in r["bbox"]])
                       for r in _records()}
    return _bbox_cache


def read_json(path, default):
    return json.loads(path.read_text()) if path.exists() else default


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def load_groups():
    g = read_json(GROUPS_FILE, {"derived": {}, "retired": []})
    g.setdefault("derived", {})
    g.setdefault("retired", [])
    return g


def effective_groups():
    g = load_groups()
    retired = set(g["retired"])
    out = {gid: faces for gid, faces in BASE.items() if gid not in retired}
    for gid, faces in g["derived"].items():
        if gid not in retired:
            out[gid] = faces
    return dict(sorted(out.items(), key=lambda kv: -len(kv[1])))


def load_guests():
    if not GUESTS_FILE.exists():
        return []
    return [l.strip() for l in GUESTS_FILE.read_text().splitlines()
            if l.strip() and not l.startswith("#")]


def norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return " ".join(s.lower().split())


def guest_coverage(labels):
    guests = load_guests()
    named = {v for v in labels.values() if v and v != "__skip__"}
    named_n = {norm(v) for v in named}
    guest_n = {norm(g) for g in guests}
    return {
        "total": len(guests),
        "covered": sum(1 for g in guests if norm(g) in named_n),
        "missing": [g for g in guests if norm(g) not in named_n],
        "extras": sorted(v for v in named if norm(v) not in guest_n),
    }


def people_index(labels, groups):
    """name -> {faces, groups}. Faces ordered biggest-group-first so the
    clearest shots lead."""
    out = {}
    for gid, faces in groups.items():
        name = labels.get(gid)
        if not name or name == "__skip__":
            continue
        e = out.setdefault(name, {"faces": [], "groups": []})
        e["faces"].extend(faces)
        e["groups"].append(gid)
    return out


def split_group_faces(gid, faces_to_pull, label_for_rest=None):
    """Pull faces out of a group: retire it, keep the remainder under the same
    label, and hand the pulled faces back as an unlabelled group."""
    groups = load_groups()
    labels = read_json(LABELS_FILE, {})
    current = effective_groups().get(gid)
    if current is None:
        return
    pull = [f for f in current if f in faces_to_pull]
    keep = [f for f in current if f not in faces_to_pull]
    if not pull:
        return
    groups["retired"].append(gid)
    name = label_for_rest if label_for_rest is not None else labels.get(gid)
    labels.pop(gid, None)
    if keep:
        groups["derived"][f"{gid}.k"] = keep
        if name and name != "__skip__":
            labels[f"{gid}.k"] = name
    groups["derived"][f"{gid}.x"] = pull
    write_json(GROUPS_FILE, groups)
    write_json(LABELS_FILE, labels)


PAGE = r"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Label faces</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
       background:#1c1c1e;color:#eee}
  header{position:sticky;top:0;background:#26262a;padding:12px 20px;
         border-bottom:1px solid #3a3a3e;z-index:10}
  .row{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  h2{font-size:17px;margin:0;font-weight:600}
  .tabs{display:flex;gap:6px;margin-left:auto}
  .tabs button{padding:6px 12px;font-size:13px;border-radius:6px;border:1px solid #3a3a3e;
               background:transparent;color:#9a9a9f;cursor:pointer}
  .tabs button.on{background:#118DF0;border-color:#118DF0;color:#fff}
  .stats{font-size:13px;color:#9a9a9f;margin-top:8px}
  .bar{height:6px;background:#3a3a3e;border-radius:3px;overflow:hidden;margin-top:8px}
  .bar>div{height:100%;width:0;transition:width .3s}
  main{padding:20px;max-width:1150px;margin:0 auto}
  .grid{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}
  .grid img{width:104px;height:104px;object-fit:cover;border-radius:6px;background:#333;
            cursor:pointer;border:3px solid transparent}
  .grid img.out{opacity:.25;border-color:#c0392b}
  .controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px}
  input{flex:1;min-width:240px;padding:12px 14px;font-size:16px;border-radius:8px;
        border:1px solid #4a4a4f;background:#2c2c30;color:#fff}
  input:focus{outline:none;border-color:#118DF0}
  button.act{padding:12px 18px;font-size:15px;border-radius:8px;border:none;cursor:pointer}
  .save{background:#118DF0;color:#fff}
  .split{background:#6b4fa0;color:#fff}
  .skip{background:#3a3a3e;color:#ddd}
  .nav{background:#3a3a3e;color:#ddd}
  .danger{background:#c0392b;color:#fff}
  .back{background:transparent;color:#9a9a9f}
  .hint{font-size:12px;color:#7a7a7f;margin-top:10px;line-height:1.7}
  .done{text-align:center;padding:60px 20px;color:#9a9a9f}
  .known{margin-top:18px;font-size:12px;color:#7a7a7f;line-height:1.9}
  .known b{color:#bbb;font-weight:500}
  .cur{font-size:13px;color:#118DF0;margin-top:6px}
  .plist{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
  .plist button{padding:8px 13px;border-radius:20px;border:1px solid #3a3a3e;
                background:#2c2c30;color:#ddd;cursor:pointer;font-size:14px}
  .plist button:hover{border-color:#118DF0;color:#fff}
  .plist span{color:#7a7a7f;font-size:12px;margin-left:5px}
  /* hover preview: the whole photo a crop came from, face outlined */
  #peek{position:fixed;right:18px;bottom:18px;width:44vw;max-width:640px;z-index:50;
        background:#000;border:1px solid #4a4a4f;border-radius:10px;overflow:hidden;
        box-shadow:0 18px 50px rgba(0,0,0,.65);display:none}
  #peek.on{display:block}
  #peek .wrap{position:relative;line-height:0}
  #peek img{width:100%;height:auto;display:block}
  #peek .box{position:absolute;border:2px solid #2fd96b;border-radius:3px;
             box-shadow:0 0 0 9999px rgba(0,0,0,.45)}
  #peek .cap{padding:7px 10px;font-size:11px;color:#9a9a9f;line-height:1.5;
             background:#1c1c1e;word-break:break-all}
</style></head>
<body>
<header>
  <div class="row">
    <h2 id="heading">Loading...</h2>
    <div class="tabs">
      <button id="t-todo"    onclick="setTab('todo')">To label</button>
      <button id="t-skipped" onclick="setTab('skipped')">Skipped</button>
      <button id="t-named"   onclick="setTab('named')">Named</button>
    </div>
  </div>
  <div class="stats" id="stats"></div>
  <div class="bar"><div id="prog" style="background:#118DF0"></div></div>
  <div class="stats" id="gstats"></div>
  <div class="bar"><div id="gprog" style="background:#2fa84f"></div></div>
</header>
<main><div id="body"></div><div class="known" id="missing"></div></main>
<div id="peek"><div class="wrap"><img id="peek-img" alt=""><div class="box" id="peek-box"></div></div>
     <div class="cap" id="peek-cap"></div></div>
<datalist id="names"></datalist>
<script>
let state=null, idx=0, tab='todo', excluded=new Set();
let person=null, page=0, personData=null, picked=new Set();

async function load(){
  state = await (await fetch('/api/state')).json();
  document.getElementById('names').innerHTML =
    state.suggestions.map(n=>`<option value="${n.replace(/"/g,'&quot;')}">`).join('');
  render();
}

function queue(){
  const L=state.labels;
  if(tab==='todo')    return state.groups.filter(g=>!(g.id in L));
  if(tab==='skipped') return state.groups.filter(g=>L[g.id]==='__skip__');
  return [];
}

function setTab(t){
  tab=t; idx=0; excluded.clear(); person=null; page=0; personData=null; picked.clear();
  render();
}

function headerStats(){
  const L=state.labels;
  const namedFaces=state.groups.filter(g=>L[g.id]&&L[g.id]!=='__skip__')
                               .reduce((a,g)=>a+g.size,0);
  const pct=(namedFaces/state.total_faces*100).toFixed(1);
  document.getElementById('prog').style.width=pct+'%';

  const counts={todo:0,skipped:0,named:0};
  state.groups.forEach(g=>{const v=L[g.id];
    if(!v)counts.todo++; else if(v==='__skip__')counts.skipped++; else counts.named++;});
  document.getElementById('t-todo').textContent=`To label (${counts.todo})`;
  document.getElementById('t-skipped').textContent=`Skipped (${counts.skipped})`;
  document.getElementById('t-named').textContent=`People (${state.people.length})`;
  document.getElementById('stats').textContent=
    `${namedFaces} of ${state.total_faces} faces named (${pct}%)`;

  const gu=state.guests, gpct=(gu.covered/gu.total*100).toFixed(0);
  document.getElementById('gprog').style.width=gpct+'%';
  document.getElementById('gstats').textContent=
    `${gu.covered} of ${gu.total} guests have at least one photo (${gpct}%)`
    +(gu.extras.length?` · ${gu.extras.length} named who are not on the guest list`:'');
  document.getElementById('missing').innerHTML = gu.missing.length
    ? `<b>Still no photo for (${gu.missing.length}):</b> ${gu.missing.join(' · ')}`
    : '<b>Every guest on the list has at least one photo.</b>';
}

function render(){
  ['todo','skipped','named'].forEach(t=>
    document.getElementById('t-'+t).className=(t===tab?'on':''));
  headerStats();
  if(tab==='named') return renderNamed();
  renderQueue();
}

/* ---------- queue view (to label / skipped) ---------- */
function renderQueue(){
  const q=queue();
  if(idx>=q.length) idx=Math.max(0,q.length-1);
  if(!q.length){
    document.getElementById('heading').textContent='Nothing here';
    document.getElementById('body').innerHTML=
      `<div class="done"><h1>${tab==='todo'?'Nothing left to label':'No skipped groups'}</h1></div>`;
    return;
  }
  const g=q[idx];
  document.getElementById('heading').textContent=`${g.size} faces · ${idx+1} of ${q.length}`;
  const L=state.labels;
  const used=[...new Set(Object.values(L).filter(v=>v&&v!=='__skip__'))].sort();
  const current=L[g.id]&&L[g.id]!=='__skip__'?L[g.id]:'';

  document.getElementById('body').innerHTML=`
    ${current?`<div class="cur">Currently: ${current}</div>`:''}
    <div class="grid">${g.sample.map(f=>
      `<img loading="lazy" data-f="${f}" src="/crop/${encodeURIComponent(f)}"
            onclick="toggle(this)">`).join('')}</div>
    ${g.size>g.sample.length?`<div class="hint">showing ${g.sample.length} of ${g.size}</div>`:''}
    <div class="controls">
      <input id="name" list="names" autocomplete="off" value="${current.replace(/"/g,'&quot;')}"
             placeholder="Who is this? (Enter saves, Esc skips)">
      <button class="act save"  onclick="save()">Save</button>
      <button class="act split" onclick="split()">Split</button>
      <button class="act skip"  onclick="skip()">Skip</button>
    </div>
    <div class="controls">
      <button class="act nav"  onclick="step(-1)">&larr; Prev</button>
      <button class="act nav"  onclick="step(1)">Next &rarr;</button>
      <button class="act back" onclick="undoLast()">Undo last save</button>
    </div>
    <div class="hint">
      More than one person here? Click the faces that do not belong, then save -
      they come back as their own group. Or <b>Split</b> to re-cluster this group
      more strictly.<br>
      Prev/Next move without changing anything. Hover any face to see the whole photo it came from.
    </div>
    ${used.length?`<div class="known"><b>Named so far:</b> ${used.join(' · ')}</div>`:''}`;

  excluded.clear();
  const inp=document.getElementById('name');
  inp.focus(); inp.select();
  inp.onkeydown=e=>{
    if(e.key==='Enter'){e.preventDefault();save();}
    if(e.key==='Escape'){e.preventDefault();skip();}
  };
}

function step(d){
  const q=queue();
  idx=Math.min(Math.max(idx+d,0),Math.max(q.length-1,0));
  render();
}

function toggle(img){
  const f=img.dataset.f;
  if(excluded.has(f)){excluded.delete(f);img.classList.remove('out');}
  else{excluded.add(f);img.classList.add('out');}
}

/* ---------- people view ---------- */
async function renderNamed(){
  if(!person){
    document.getElementById('heading').textContent=`${state.people.length} people named`;
    document.getElementById('body').innerHTML=`
      <div class="hint">Pick a person to review every face filed under them.</div>
      <div class="plist">${state.people.map(p=>
        `<button onclick="openPerson(${JSON.stringify(p.name).replace(/"/g,'&quot;')})">
           ${p.name}<span>${p.faces}</span></button>`).join('')}</div>`;
    return;
  }
  if(!personData){
    personData = await (await fetch('/api/person?name='+encodeURIComponent(person))).json();
    page=0; picked.clear();
  }
  const pages=Math.max(1,Math.ceil(personData.faces.length/state.page_size));
  const slice=personData.faces.slice(page*state.page_size,(page+1)*state.page_size);
  document.getElementById('heading').textContent=
    `${person} · ${personData.faces.length} faces · page ${page+1} of ${pages}`;
  document.getElementById('body').innerHTML=`
    <div class="controls">
      <button class="act back" onclick="person=null;personData=null;render()">&larr; All people</button>
      <button class="act nav" onclick="turn(-1)">&larr; Prev page</button>
      <button class="act nav" onclick="turn(1)">Next page &rarr;</button>
      <button class="act danger" onclick="removePicked()">Remove selected from ${person}</button>
    </div>
    <div class="grid">${slice.map(f=>
      `<img loading="lazy" data-f="${f}" src="/crop/${encodeURIComponent(f)}"
            class="${picked.has(f)?'out':''}" onclick="pick(this)">`).join('')}</div>
    <div class="hint">Click any face that is not ${person}, then press Remove.
      Removed faces go back to the To label queue as their own group. Hover a face to see its full photo.<br>
      Spread across ${personData.groups.length} group(s).</div>`;
}

function openPerson(n){ person=n; personData=null; page=0; picked.clear(); render(); }
function turn(d){
  const pages=Math.ceil(personData.faces.length/state.page_size);
  page=Math.min(Math.max(page+d,0),pages-1); render();
}
function pick(img){
  const f=img.dataset.f;
  if(picked.has(f)){picked.delete(f);img.classList.remove('out');}
  else{picked.add(f);img.classList.add('out');}
}
async function removePicked(){
  if(!picked.size){alert('Click the faces to remove first.');return;}
  state=await post('/api/remove',{name:person,faces:[...picked]});
  personData=null; picked.clear(); render();
}

/* ---------- actions ---------- */
async function post(path,body){
  const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
                            body:JSON.stringify(body)});
  return r.json();
}
async function save(){
  const v=document.getElementById('name').value.trim();
  if(!v) return;
  state=await post('/api/label',{group:queue()[idx].id,name:v,excluded:[...excluded]});
  if(tab==='skipped') idx++;
  render();
}
async function skip(){
  state=await post('/api/label',{group:queue()[idx].id,name:'__skip__',excluded:[]});
  if(tab==='skipped') idx++;
  render();
}
async function split(){
  state=await post('/api/split',{group:queue()[idx].id});
  render();
}
async function undoLast(){
  const done=state.groups.filter(g=>g.id in state.labels);
  if(!done.length) return;
  state=await post('/api/label',{group:done[done.length-1].id,name:null,excluded:[]});
  render();
}
/* ---------- hover preview: the whole photo behind a crop ---------- */
let peekTimer=null, peekFor=null;

function hidePeek(){
  document.getElementById('peek').classList.remove('on');
  peekFor=null;
}

async function showPeek(fid){
  if(peekFor===fid) return;
  peekFor=fid;
  const r=await fetch('/api/face?id='+encodeURIComponent(fid));
  if(!r.ok) return;
  const d=await r.json();
  if(peekFor!==fid) return;              // pointer moved on while fetching
  const img=document.getElementById('peek-img');
  const box=document.getElementById('peek-box');
  const place=()=>{
    const W=img.naturalWidth||1, H=img.naturalHeight||1;
    const b=d.bbox;
    box.style.left  =(b[0]/W*100)+'%';
    box.style.top   =(b[1]/H*100)+'%';
    box.style.width =((b[2]-b[0])/W*100)+'%';
    box.style.height=((b[3]-b[1])/H*100)+'%';
  };
  img.onload=place;
  const src='/photo/'+encodeURIComponent(d.photo);
  if(img.getAttribute('src')!==src) img.src=src;
  if(img.complete && img.naturalWidth) place();
  document.getElementById('peek-cap').textContent=d.photo;
  document.getElementById('peek').classList.add('on');
}

document.addEventListener('mouseover',e=>{
  if(!e.target.closest) return;
  if(e.target.closest('#peek')){ clearTimeout(peekTimer); return; }
  const img=e.target.closest('img[data-f]');
  if(!img) return;
  clearTimeout(peekTimer);
  peekTimer=setTimeout(()=>showPeek(img.dataset.f),120);
});

document.addEventListener('mouseout',e=>{
  if(!e.target.closest) return;
  if(!e.target.closest('img[data-f]') && !e.target.closest('#peek')) return;
  clearTimeout(peekTimer);
  // grace period so the pointer can travel into the panel itself
  peekTimer=setTimeout(()=>{
    if(!document.querySelector('#peek:hover')) hidePeek();
  },300);
});

load();
</script></body></html>
"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _send(self, code, body, ctype):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _json(self, obj):
        self._send(200, json.dumps(obj).encode(), "application/json")

    def _state(self):
        labels = read_json(LABELS_FILE, {})
        groups = effective_groups()
        people = people_index(labels, groups)
        used = sorted(people.keys())
        return {
            "groups": [{"id": gid, "size": len(faces), "sample": faces[:MAX_CROPS]}
                       for gid, faces in groups.items()],
            "labels": labels,
            "suggestions": used + [g for g in load_guests() if g not in used],
            "total_faces": TOTAL_FACES,
            "guests": guest_coverage(labels),
            "page_size": PAGE_SIZE,
            "people": [{"name": n, "faces": len(v["faces"]), "groups": len(v["groups"])}
                       for n, v in sorted(people.items(), key=lambda kv: -len(kv[1]["faces"]))],
        }

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/":
            return self._send(200, PAGE.encode(), "text/html; charset=utf-8")
        if u.path == "/api/state":
            return self._json(self._state())
        if u.path == "/api/person":
            name = parse_qs(u.query).get("name", [""])[0]
            labels = read_json(LABELS_FILE, {})
            entry = people_index(labels, effective_groups()).get(name, {"faces": [], "groups": []})
            return self._json({"name": name, "faces": entry["faces"], "groups": entry["groups"]})
        if u.path == "/api/face":
            fid = parse_qs(u.query).get("id", [""])[0]
            hit = bboxes().get(fid)
            if not hit:
                return self._send(404, b"{}", "application/json")
            return self._json({"photo": hit[0], "bbox": hit[1]})

        m = re.match(r"^/crop/(.+)$", u.path)
        if m:
            p = (CROPS / f"{unquote(m.group(1))}.jpg").resolve()
            if p.is_file() and str(p).startswith(str(CROPS.resolve())):
                return self._send(200, p.read_bytes(), "image/jpeg")

        m = re.match(r"^/photo/(.+)$", u.path)
        if m:
            p = (DISPLAY / f"{unquote(m.group(1))}.jpg").resolve()
            if p.is_file() and str(p).startswith(str(DISPLAY.resolve())):
                return self._send(200, p.read_bytes(), "image/jpeg")

        self._send(404, b"no", "text/plain")

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(n)) if n else {}
        if self.path == "/api/label":
            self._label(data)
        elif self.path == "/api/split":
            self._split(data)
        elif self.path == "/api/remove":
            self._remove(data)
        else:
            return self._send(404, b"no", "text/plain")
        self._json(self._state())

    def _label(self, data):
        labels = read_json(LABELS_FILE, {})
        gid = str(data["group"])
        excluded = set(data.get("excluded") or [])
        if data.get("name") is None:
            labels.pop(gid, None)
            return write_json(LABELS_FILE, labels)
        if excluded:
            return split_group_faces(gid, excluded, label_for_rest=data["name"])
        labels[gid] = data["name"]
        write_json(LABELS_FILE, labels)

    def _remove(self, data):
        """Pull faces out of every group filed under this person."""
        name = data["name"]
        faces = set(data.get("faces") or [])
        if not faces:
            return
        labels = read_json(LABELS_FILE, {})
        for gid in [g for g, v in labels.items() if v == name]:
            if gid in effective_groups():
                split_group_faces(gid, faces)

    def _split(self, data):
        from sklearn.cluster import AgglomerativeClustering
        import numpy as np

        gid = str(data["group"])
        faces = effective_groups()[gid]
        if len(faces) < 2:
            return
        emb = embeddings()
        usable = [f for f in faces if f in emb]
        X = np.vstack([emb[f] for f in usable])
        labs = AgglomerativeClustering(
            n_clusters=None, distance_threshold=SPLIT_DISTANCE,
            metric="cosine", linkage="average").fit_predict(X)
        if len(set(labs)) < 2:
            labs = AgglomerativeClustering(
                n_clusters=2, metric="cosine", linkage="average").fit_predict(X)
        buckets = {}
        for f, l in zip(usable, labs):
            buckets.setdefault(int(l), []).append(f)
        groups = load_groups()
        for i, (_, members) in enumerate(sorted(buckets.items(), key=lambda kv: -len(kv[1]))):
            groups["derived"][f"{gid}.{i}"] = members
        groups["retired"].append(gid)
        write_json(GROUPS_FILE, groups)
        labels = read_json(LABELS_FILE, {})
        if labels.pop(gid, None) is not None:
            write_json(LABELS_FILE, labels)


def preflight():
    """Fail here rather than halfway through a click. A bare `python3` on this
    machine has none of these."""
    missing = []
    for mod in ("numpy", "sklearn"):
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    if missing:
        import sys
        print(f"ERROR: missing {', '.join(missing)} - running under {sys.executable}")
        print("\nUse the venv interpreter:")
        print("  .photo-pipeline/venv/bin/python .photo-pipeline/label.py\n")
        raise SystemExit(1)


if __name__ == "__main__":
    preflight()
    groups = effective_groups()
    labels = read_json(LABELS_FILE, {})
    todo = sum(1 for g in groups if g not in labels)
    print(f"{len(groups)} groups ({MIN_SIZE}+ faces), {TOTAL_FACES} faces total")
    print(f"{len(labels)} already decided, {todo} to go")
    print(f"\n  open http://localhost:{PORT}\n")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()

"""Shared R2 credentials + client. Reads cloudflare_api_token.txt, which is
gitignored. Never prints secrets."""
import pathlib, re
import boto3
from botocore.config import Config

# Scripts are version-controlled here; the data they read and write lives
# in .photo-pipeline/ at the repo root, which is gitignored: derivatives,
# face crops, embeddings, labels, the guest list and the R2 token.
WORK = pathlib.Path(__file__).resolve().parents[2] / ".photo-pipeline"


def creds():
    txt = (WORK / "cloudflare_api_token.txt").read_text()
    out, key = {}, None
    for line in txt.splitlines():
        line = line.strip()
        if line.startswith("#"):
            key = line.lstrip("# ").strip().lower().replace(" ", "_")
        elif line and key:
            out[key] = line
            key = None
    return out


def client():
    c = creds()
    return boto3.client(
        "s3",
        endpoint_url=c["endpoint"],
        aws_access_key_id=c["access_key"],
        aws_secret_access_key=c["secret_key"],
        config=Config(signature_version="s3v4", retries={"max_attempts": 5}),
        region_name="auto",
    )

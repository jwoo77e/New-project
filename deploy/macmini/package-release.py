#!/usr/bin/env python3
"""Package an already tested Vite build and all Node runtime modules, without secrets."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import tarfile

parser = argparse.ArgumentParser()
parser.add_argument("--output", required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
if not (root / "dist/index.html").is_file():
    raise SystemExit("Build first: npx tsc --noEmit && npx vite build")
files = [root / "server.mjs", root / "package.json"]
files += [p for p in (root / "scripts").rglob("*.mjs") if not p.name.endswith(".test.mjs")]
files += [p for d in ["dist", "public"] for p in (root / d).rglob("*") if p.is_file()]
files += [root / "deploy/macmini/kr.riskzero.aihub.plist"]
files = sorted(set(files))
for p in files:
    if p.is_symlink() or p.name.startswith(".env"):
        raise SystemExit(f"Refusing to package a symlink or environment file: {p}")
manifest = {str(p.relative_to(root)): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
with tarfile.open(output, "w:gz") as archive:
    for p in files:
        archive.add(p, arcname=str(p.relative_to(root)), recursive=False)
    data = (json.dumps(manifest, indent=2) + "\n").encode()
    info = tarfile.TarInfo("release-manifest.json")
    info.size = len(data)
    info.mode = 0o600
    archive.addfile(info, io.BytesIO(data))
print(json.dumps({"archive": str(output), "files": len(files), "sha256": hashlib.sha256(output.read_bytes()).hexdigest()}))
